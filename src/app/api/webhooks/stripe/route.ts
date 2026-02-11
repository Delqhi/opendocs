import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe (only if key is available)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' }) : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !webhookSecret) {
      console.warn('Stripe not configured, skipping webhook')
      return NextResponse.json({ received: true, warning: 'Stripe not configured' })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: unknown) {
      const error = err as Error
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    console.log(`[Stripe Webhook] ${event.type}`, { id: event.id })

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(paymentIntent)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(event.type, subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice paid:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice payment failed:', invoice.id)
        // Notify customer
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, type: event.type })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)

  const orderId = paymentIntent.metadata?.orderId

  if (orderId) {
    // Update order status in database
    // await supabase.from('orders').update({ 
    //   status: 'paid', 
    //   paymentId: paymentIntent.id 
    // }).eq('id', orderId)

    // Trigger n8n workflow for order processing
    const n8nWebhookUrl = process.env.N8N_PAYMENT_WEBHOOK_URL
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment_success',
          orderId,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        }),
      }).catch((err) => console.error('n8n webhook failed:', err))
    }
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)

  const orderId = paymentIntent.metadata?.orderId

  if (orderId) {
    // Update order status
    // await supabase.from('orders').update({ status: 'payment_failed' }).eq('id', orderId)

    // Notify customer via ClawdBot
    const clawdbotWebhook = process.env.CLAWDBOT_NOTIFICATION_URL
    if (clawdbotWebhook) {
      fetch(clawdbotWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'email',
          event: 'payment_failed',
          data: { orderId, paymentIntentId: paymentIntent.id },
        }),
      }).catch((err) => console.error('ClawdBot notification failed:', err))
    }
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)

  // Create order from checkout session
  const orderId = session.metadata?.orderId
  const customerEmail = session.customer_email

  console.log('Order created:', { orderId, customerEmail })
}

async function handleSubscriptionChange(
  eventType: string,
  subscription: Stripe.Subscription
) {
  console.log(`Subscription ${eventType}:`, subscription.id)

  // Handle subscription logic if needed for the shop
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Stripe Webhook',
    configured: !!stripe,
  })
}
