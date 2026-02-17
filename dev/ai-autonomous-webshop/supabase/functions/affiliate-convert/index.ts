// Supabase Edge Function: affiliate-convert
// Called after successful payment to create commission record
// Checks cookie/ref tracking, prevents self-referral, calculates commission

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { order_id, affiliate_code, click_id } = await req.json()
    if (!order_id) throw new Error('order_id required')

    // 1. Fetch order
    const { data: order, error: oErr } = await supabase
      .from('orders').select('*').eq('id', order_id).single()
    if (oErr || !order) throw new Error('Order not found')

    // 2. Determine affiliate (from order.affiliate_id or passed code)
    let affiliateId = order.affiliate_id
    let affiliate = null

    if (!affiliateId && affiliate_code) {
      const { data: ap } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('affiliate_code', affiliate_code)
        .eq('status', 'active')
        .single()
      if (ap) {
        affiliateId = ap.id
        affiliate = ap
      }
    } else if (affiliateId) {
      const { data: ap } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('id', affiliateId)
        .single()
      affiliate = ap
    }

    if (!affiliate || !affiliateId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No affiliate associated with this order'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 3. Self-referral check
    if (affiliate.email === order.customer_email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Self-referral detected – commission rejected'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 4. Duplicate check
    const { data: existing } = await supabase
      .from('affiliate_commissions')
      .select('id')
      .eq('order_id', order_id)
      .eq('affiliate_id', affiliateId)
      .single()

    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Commission already recorded for this order'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 5. Calculate commission
    const orderAmount = Number(order.total) - Number(order.shipping_cost || 0)
    const commissionRate = Number(affiliate.commission_rate)
    const commissionAmount = Math.round(orderAmount * commissionRate) / 100

    // 6. Create commission record
    const { data: commission, error: cErr } = await supabase
      .from('affiliate_commissions')
      .insert({
        order_id,
        affiliate_id: affiliateId,
        click_id: click_id || null,
        order_amount: orderAmount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        currency: order.currency,
        status: 'pending' // approved after 30-day hold
      })
      .select()
      .single()

    if (cErr) throw new Error(`Commission insert failed: ${cErr.message}`)

    // 7. Mark click as converted (if click_id provided)
    if (click_id) {
      await supabase.from('affiliate_clicks').update({
        converted: true,
        order_id
      }).eq('id', click_id)
    }

    // 8. Update order with affiliate reference
    await supabase.from('orders').update({
      affiliate_id: affiliateId
    }).eq('id', order_id)

    return new Response(JSON.stringify({
      success: true,
      commission_id: commission.id,
      commission_amount: commissionAmount,
      affiliate_code: affiliate.affiliate_code
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
