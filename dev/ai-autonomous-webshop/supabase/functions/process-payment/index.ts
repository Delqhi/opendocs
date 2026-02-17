// Supabase Edge Function: process-payment
// Handles Stripe Checkout Session creation + PayPal order creation
// Returns checkout URL for redirect

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox'
const SHOP_URL = Deno.env.get('SHOP_URL') || 'https://nexusai.shop'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { order_id, provider, return_url } = await req.json()
    if (!order_id || !provider) throw new Error('order_id and provider required')

    // Fetch order
    const { data: order, error: oErr } = await supabase
      .from('orders').select('*').eq('id', order_id).single()
    if (oErr || !order) throw new Error('Order not found')

    const successUrl = `${return_url || SHOP_URL}/checkout/success?order=${order.order_number}`
    const cancelUrl = `${return_url || SHOP_URL}/checkout/cancel?order=${order.order_number}`

    // ==================== STRIPE ====================
    if (provider === 'stripe') {
      if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured')

      const items = (order.items as Array<{name:string;price:number;qty:number}>).map(item => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.qty
      }))

      // Add shipping as line item
      if (order.shipping_cost > 0) {
        items.push({
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: { name: 'Shipping' },
            unit_amount: Math.round(order.shipping_cost * 100)
          },
          quantity: 1
        })
      }

      const stripeResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': successUrl,
          'cancel_url': cancelUrl,
          'customer_email': order.customer_email,
          'metadata[order_id]': order.id,
          'metadata[order_number]': order.order_number,
          ...items.reduce((acc: Record<string,string>, item, i) => {
            acc[`line_items[${i}][price_data][currency]`] = item.price_data.currency
            acc[`line_items[${i}][price_data][product_data][name]`] = item.price_data.product_data.name
            acc[`line_items[${i}][price_data][unit_amount]`] = String(item.price_data.unit_amount)
            acc[`line_items[${i}][quantity]`] = String(item.quantity)
            return acc
          }, {})
        })
      })

      if (!stripeResp.ok) {
        const err = await stripeResp.text()
        throw new Error(`Stripe error: ${err}`)
      }

      const session = await stripeResp.json()

      // Update order with payment reference
      await supabase.from('orders').update({
        payment_method: 'stripe',
        payment_intent_id: session.id
      }).eq('id', order_id)

      return new Response(JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ==================== PAYPAL ====================
    if (provider === 'paypal') {
      if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) throw new Error('PayPal credentials not configured')

      const baseUrl = PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com'

      // Get access token
      const authResp = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })

      const { access_token } = await authResp.json()

      // Create order
      const ppResp = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: order.order_number,
            amount: {
              currency_code: order.currency,
              value: order.total.toFixed(2)
            }
          }],
          application_context: {
            return_url: successUrl,
            cancel_url: cancelUrl
          }
        })
      })

      const ppOrder = await ppResp.json()
      const approveLink = ppOrder.links?.find((l: {rel:string;href:string}) => l.rel === 'approve')

      await supabase.from('orders').update({
        payment_method: 'paypal',
        payment_intent_id: ppOrder.id
      }).eq('id', order_id)

      return new Response(JSON.stringify({
        success: true,
        checkout_url: approveLink?.href,
        paypal_order_id: ppOrder.id
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error(`Unsupported provider: ${provider}`)

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
