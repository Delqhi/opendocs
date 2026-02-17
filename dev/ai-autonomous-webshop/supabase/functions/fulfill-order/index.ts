// Supabase Edge Function: fulfill-order
// Triggered after payment confirmation
// Splits order by supplier, creates fulfillment queue entries, attempts supplier API orders

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { order_id } = await req.json()
    if (!order_id) throw new Error('order_id required')

    // 1. Fetch order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderErr || !order) throw new Error(`Order not found: ${order_id}`)

    // 2. Update order status
    await supabase.from('orders').update({ status: 'processing' }).eq('id', order_id)

    // 3. Group items by supplier
    const items = order.items as Array<{
      productId: string; name: string; price: number; qty: number;
      supplierId?: string; supplierSku?: string; sourceType?: string
    }>

    const supplierGroups: Record<string, typeof items> = {}
    for (const item of items) {
      if (item.sourceType === 'affiliate') continue // skip affiliate items
      const sid = item.supplierId || 'unknown'
      if (!supplierGroups[sid]) supplierGroups[sid] = []
      supplierGroups[sid].push(item)
    }

    // 4. Create fulfillment queue entries per supplier
    const results = []
    for (const [supplierId, supplierItems] of Object.entries(supplierGroups)) {
      const { data: fulfillment, error: fErr } = await supabase
        .from('fulfillment_queue')
        .insert({
          order_id,
          supplier_id: supplierId === 'unknown' ? null : supplierId,
          items: supplierItems,
          status: 'queued',
          attempt_count: 0,
          max_attempts: 3
        })
        .select()
        .single()

      if (fErr) {
        results.push({ supplierId, error: fErr.message })
        continue
      }

      // 5. Attempt supplier order (if supplier has API)
      if (supplierId !== 'unknown') {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('*')
          .eq('id', supplierId)
          .single()

        if (supplier?.api_endpoint) {
          try {
            const supplierResp = await fetch(supplier.api_endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supplier.api_key_encrypted || ''}`
              },
              body: JSON.stringify({
                order_reference: order.order_number,
                shipping_address: order.shipping_address,
                items: supplierItems.map(i => ({
                  sku: i.supplierSku || i.productId,
                  quantity: i.qty
                }))
              })
            })

            if (supplierResp.ok) {
              const supplierData = await supplierResp.json()
              await supabase.from('fulfillment_queue').update({
                status: 'ordered',
                supplier_order_id: supplierData.order_id || supplierData.reference || null,
                supplier_cost: supplierData.total || null,
                processed_at: new Date().toISOString()
              }).eq('id', fulfillment.id)

              results.push({ supplierId, status: 'ordered', supplierOrderId: supplierData.order_id })
            } else {
              const errText = await supplierResp.text()
              await supabase.from('fulfillment_queue').update({
                status: 'retry',
                attempt_count: 1,
                last_error: `Supplier API ${supplierResp.status}: ${errText}`,
                next_retry_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
              }).eq('id', fulfillment.id)

              results.push({ supplierId, status: 'retry', error: errText })
            }
          } catch (apiErr) {
            await supabase.from('fulfillment_queue').update({
              status: 'retry',
              attempt_count: 1,
              last_error: `Network error: ${apiErr.message}`,
              next_retry_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            }).eq('id', fulfillment.id)

            results.push({ supplierId, status: 'retry', error: apiErr.message })
          }
        } else {
          // No API – manual fulfillment needed
          await supabase.from('fulfillment_queue').update({
            status: 'processing',
            last_error: 'No supplier API configured – manual fulfillment required'
          }).eq('id', fulfillment.id)

          results.push({ supplierId, status: 'manual' })
        }
      }
    }

    // 6. Send confirmation email
    await supabase.functions.invoke('send-email', {
      body: {
        to: order.customer_email,
        template: 'order_confirmation',
        data: {
          order_number: order.order_number,
          customer_name: order.customer_name,
          items: order.items,
          total: order.total,
          shipping_address: order.shipping_address
        }
      }
    })

    return new Response(JSON.stringify({
      success: true,
      order_id,
      fulfillment_results: results
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
