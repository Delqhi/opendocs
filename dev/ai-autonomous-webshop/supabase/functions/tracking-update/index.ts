// Supabase Edge Function: tracking-update
// Updates order tracking info and notifies customer
// Can be called by supplier webhook or admin manually

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { order_id, tracking_number, carrier, status, estimated_delivery, message } = await req.json()
    if (!order_id) throw new Error('order_id required')

    // 1. Update order
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (tracking_number) updates.tracking_number = tracking_number
    if (carrier) updates.carrier = carrier
    if (estimated_delivery) updates.estimated_delivery = estimated_delivery

    if (status === 'shipped') {
      updates.status = 'shipped'
      updates.shipped_at = new Date().toISOString()
    } else if (status === 'delivered') {
      updates.status = 'delivered'
      updates.delivered_at = new Date().toISOString()
    } else if (status) {
      updates.status = status
    }

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order_id)
      .select()
      .single()

    if (oErr) throw new Error(`Order update failed: ${oErr.message}`)

    // 2. Update fulfillment queue
    if (tracking_number) {
      await supabase.from('fulfillment_queue').update({
        supplier_tracking: tracking_number,
        status: status === 'shipped' ? 'shipped' : status === 'delivered' ? 'delivered' : 'shipped',
        shipped_at: new Date().toISOString()
      }).eq('order_id', order_id)
    }

    // 3. Send notification email
    const template = status === 'shipped' ? 'shipping_update' : 'tracking_update'

    await supabase.functions.invoke('send-email', {
      body: {
        to: order.customer_email,
        template,
        data: {
          order_number: order.order_number,
          tracking_number: tracking_number || order.tracking_number,
          carrier: carrier || order.carrier,
          estimated_delivery: estimated_delivery || order.estimated_delivery,
          status: status || order.status,
          message
        }
      }
    })

    return new Response(JSON.stringify({
      success: true,
      order_id,
      status: order.status,
      tracking_number: order.tracking_number
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
