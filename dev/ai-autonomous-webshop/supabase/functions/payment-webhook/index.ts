// Supabase Edge Function: payment-webhook
// Handles Stripe webhooks (checkout.session.completed, charge.refunded)
// Handles PayPal webhooks (CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const provider = url.searchParams.get('provider') || 'stripe'
    const body = await req.text()

    // ==================== STRIPE WEBHOOK ====================
    if (provider === 'stripe') {
      // Verify signature in production
      const sig = req.headers.get('stripe-signature')
      if (STRIPE_WEBHOOK_SECRET && sig) {
        // In production: verify with Stripe SDK
        // For now: parse event directly
      }

      const event = JSON.parse(body)

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const orderId = session.metadata?.order_id

        if (orderId) {
          // Update order payment status
          await supabase.from('orders').update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_intent_id: session.payment_intent || session.id
          }).eq('id', orderId)

          // Trigger fulfillment
          await supabase.functions.invoke('fulfill-order', {
            body: { order_id: orderId }
          })

          // Track affiliate conversion
          await supabase.functions.invoke('affiliate-convert', {
            body: { order_id: orderId }
          })
        }
      }

      if (event.type === 'charge.refunded') {
        const charge = event.data.object
        // Find order by payment_intent
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('payment_intent_id', charge.payment_intent)
          .single()

        if (order) {
          const isFullRefund = charge.amount_refunded >= charge.amount
          await supabase.from('orders').update({
            payment_status: isFullRefund ? 'refunded' : 'partial_refund',
            status: isFullRefund ? 'refunded' : 'confirmed'
          }).eq('id', order.id)

          // Reject affiliate commission
          if (isFullRefund) {
            await supabase.from('affiliate_commissions').update({
              status: 'rejected',
              rejection_reason: 'Order refunded'
            }).eq('order_id', order.id)
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // ==================== PAYPAL WEBHOOK ====================
    if (provider === 'paypal') {
      const event = JSON.parse(body)

      if (event.event_type === 'CHECKOUT.ORDER.APPROVED' ||
          event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const ppOrderId = event.resource?.id || event.resource?.supplementary_data?.related_ids?.order_id

        if (ppOrderId) {
          const { data: order } = await supabase
            .from('orders')
            .select('id')
            .eq('payment_intent_id', ppOrderId)
            .single()

          if (order) {
            await supabase.from('orders').update({
              payment_status: 'paid',
              status: 'confirmed'
            }).eq('id', order.id)

            await supabase.functions.invoke('fulfill-order', {
              body: { order_id: order.id }
            })

            await supabase.functions.invoke('affiliate-convert', {
              body: { order_id: order.id }
            })
          }
        }
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Unknown provider', { status: 400 })

  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
