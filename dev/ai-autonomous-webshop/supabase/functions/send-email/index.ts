// Supabase Edge Function: send-email
// Sends transactional emails via Resend/SendGrid/SMTP
// Templates: order_confirmation, shipping_update, tracking_update, welcome, password_reset

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@nexusai.shop'
const SHOP_NAME = Deno.env.get('SHOP_NAME') || 'NEXUS'

interface EmailRequest {
  to: string
  template: string
  subject?: string
  data?: Record<string, unknown>
}

const templates: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
  order_confirmation: (d) => ({
    subject: `Order Confirmed – #${d.order_number}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#111">Thank you for your order!</h1>
        <p style="color:#666">Hi ${d.customer_name || 'there'},</p>
        <p style="color:#666">Your order <strong>#${d.order_number}</strong> has been confirmed and is being processed.</p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:24px 0">
          <h3 style="margin:0 0 12px;color:#111">Order Summary</h3>
          ${(d.items as Array<{name:string;price:number;qty:number}>|| []).map(i =>
            `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb">
              <span style="color:#333">${i.name} × ${i.qty}</span>
              <span style="color:#111;font-weight:600">$${(i.price * i.qty).toFixed(2)}</span>
            </div>`
          ).join('')}
          <div style="display:flex;justify-content:space-between;padding:12px 0;margin-top:8px">
            <strong style="color:#111">Total</strong>
            <strong style="color:#111;font-size:18px">$${Number(d.total).toFixed(2)}</strong>
          </div>
        </div>
        <p style="color:#666">We'll send you a tracking number once your order ships.</p>
        <p style="color:#999;font-size:12px;margin-top:40px">${SHOP_NAME} – AI-Powered Shopping</p>
      </div>
    `
  }),

  shipping_update: (d) => ({
    subject: `Your order #${d.order_number} has shipped!`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#111">Your order is on its way! 🚚</h1>
        <p style="color:#666">Great news! Order <strong>#${d.order_number}</strong> has been shipped.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0">
          <p style="margin:0;color:#166534"><strong>Tracking Number:</strong> ${d.tracking_number}</p>
          <p style="margin:8px 0 0;color:#166534"><strong>Carrier:</strong> ${d.carrier || 'Standard Shipping'}</p>
          ${d.estimated_delivery ? `<p style="margin:8px 0 0;color:#166534"><strong>Est. Delivery:</strong> ${d.estimated_delivery}</p>` : ''}
        </div>
        ${d.tracking_url ? `<a href="${d.tracking_url}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600">Track Your Package</a>` : ''}
        <p style="color:#999;font-size:12px;margin-top:40px">${SHOP_NAME} – AI-Powered Shopping</p>
      </div>
    `
  }),

  tracking_update: (d) => ({
    subject: `Tracking Update – Order #${d.order_number}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#111">Delivery Update</h1>
        <p style="color:#666">Your order <strong>#${d.order_number}</strong> status: <strong>${d.status}</strong></p>
        ${d.message ? `<p style="color:#666">${d.message}</p>` : ''}
        <p style="color:#999;font-size:12px;margin-top:40px">${SHOP_NAME}</p>
      </div>
    `
  }),

      welcome: (d) => ({
    subject: `Welcome to ${SHOP_NAME}!`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#111">Welcome, ${d.name || 'there'}!</h1>
        <p style="color:#666">Thanks for joining ${SHOP_NAME}. Discover AI-curated products at the best prices.</p>
        <a href="${d.shop_url || '#'}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Start Shopping</a>
        <p style="color:#999;font-size:12px;margin-top:40px">${SHOP_NAME}</p>
      </div>
    `
  }),

  password_reset: (d) => ({
    subject: `Reset your ${SHOP_NAME} password`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
        <h1 style="font-size:24px;color:#111">Password Reset</h1>
        <p style="color:#666">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${d.reset_url}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">Reset Password</a>
        <p style="color:#999;font-size:12px;margin-top:40px">If you didn't request this, please ignore this email.</p>
      </div>
    `
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { to, template, subject, data = {} } = await req.json() as EmailRequest

    if (!to || !template) throw new Error('to and template required')

    // Generate email content
    const templateFn = templates[template]
    if (!templateFn) throw new Error(`Unknown template: ${template}`)

    const email = templateFn(data)
    const finalSubject = subject || email.subject

    // Log email attempt
    const { data: logEntry } = await supabase.from('email_log').insert({
      recipient: to,
      template,
      subject: finalSubject,
      body_preview: email.html.substring(0, 200),
      status: 'queued'
    }).select().single()

    // Send via Resend
    if (RESEND_API_KEY) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: finalSubject,
          html: email.html
        })
      })

      if (resp.ok) {
        const result = await resp.json()
        if (logEntry) {
          await supabase.from('email_log').update({
            status: 'sent',
            provider_message_id: result.id,
            sent_at: new Date().toISOString()
          }).eq('id', logEntry.id)
        }
        return new Response(JSON.stringify({ success: true, message_id: result.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        const errText = await resp.text()
        if (logEntry) {
          await supabase.from('email_log').update({
            status: 'failed',
            error_message: errText
          }).eq('id', logEntry.id)
        }
        throw new Error(`Resend API error: ${errText}`)
      }
    } else {
      // No email provider configured – log only
      if (logEntry) {
        await supabase.from('email_log').update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          error_message: 'DEV MODE: No RESEND_API_KEY configured'
        }).eq('id', logEntry.id)
      }
      return new Response(JSON.stringify({
        success: true,
        dev_mode: true,
        message: 'Email logged but not sent (no RESEND_API_KEY)'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
