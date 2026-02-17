// Supabase Edge Function: affiliate-approve-cron
// Run daily via Supabase CRON or external scheduler
// Approves pending commissions after 30-day hold period
// Rejects commissions for cancelled/refunded orders

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const results = { approved: 0, rejected: 0, errors: [] as string[] }

    // 1. Get all pending commissions older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: pendingCommissions, error: pcErr } = await supabase
      .from('affiliate_commissions')
      .select('*, orders!inner(status, payment_status)')
      .eq('status', 'pending')
      .lt('created_at', thirtyDaysAgo)

    if (pcErr) throw new Error(`Query failed: ${pcErr.message}`)

    if (!pendingCommissions || pendingCommissions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending commissions to process',
        ...results
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    for (const commission of pendingCommissions) {
      try {
        const order = (commission as any).orders
        const orderStatus = order?.status
        const paymentStatus = order?.payment_status

        // Check if order was cancelled or refunded
        if (['cancelled', 'refunded', 'failed'].includes(orderStatus) ||
            ['refunded'].includes(paymentStatus)) {
          // Reject commission
          await supabase.from('affiliate_commissions').update({
            status: 'rejected',
            rejection_reason: `Order ${orderStatus} / Payment ${paymentStatus}`,
            updated_at: new Date().toISOString()
          }).eq('id', commission.id)

          results.rejected++
        } else if (['delivered', 'shipped', 'confirmed'].includes(orderStatus) &&
                   paymentStatus === 'paid') {
          // Approve commission
          await supabase.from('affiliate_commissions').update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }).eq('id', commission.id)

          results.approved++
        }
        // else: order still processing, skip for now
      } catch (err) {
        results.errors.push(`Commission ${commission.id}: ${err.message}`)
      }
    }

    // 2. Also retry failed fulfillments
    const { data: retryQueue } = await supabase
      .from('fulfillment_queue')
      .select('*')
      .eq('status', 'retry')
      .lt('next_retry_at', new Date().toISOString())
      .lt('attempt_count', 3) // max 3 attempts

    if (retryQueue && retryQueue.length > 0) {
      for (const item of retryQueue) {
        try {
          await supabase.functions.invoke('fulfill-order', {
            body: { order_id: item.order_id, retry_fulfillment_id: item.id }
          })
        } catch (err) {
          results.errors.push(`Retry ${item.id}: ${err.message}`)
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: pendingCommissions.length,
      ...results,
      retries_triggered: retryQueue?.length || 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
