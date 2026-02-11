import { NextRequest, NextResponse } from 'next/server'

// ClawdBot webhook handler
// ClawdBot handles all external integrations: Gmail, WhatsApp, Telegram, Twitter, Instagram, TikTok, eBay

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { event, channel, data, timestamp } = body

    if (!event || !channel) {
      return NextResponse.json(
        { error: 'event and channel are required' },
        { status: 400 }
      )
    }

    console.log(`[ClawdBot Webhook] ${channel}:${event}`, { timestamp, data })

    // Handle different events by channel
    switch (channel) {
      case 'gmail':
        await handleEmailEvent(event, data)
        break
      case 'whatsapp':
        await handleWhatsAppEvent(event, data)
        break
      case 'telegram':
        await handleTelegramEvent(event, data)
        break
      case 'instagram':
      case 'tiktok':
      case 'twitter':
        await handleSocialEvent(channel, event, data)
        break
      case 'ebay':
        await handleEbayEvent(event, data)
        break
      default:
        console.warn(`Unknown channel: ${channel}`)
    }

    return NextResponse.json({
      success: true,
      received: { event, channel, timestamp },
    })
  } catch (error) {
    console.error('ClawdBot webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Email event handler
async function handleEmailEvent(event: string, data: unknown) {
  switch (event) {
    case 'order_confirmation_sent':
      console.log('Order confirmation email sent:', data)
      break
    case 'shipping_notification_sent':
      console.log('Shipping notification sent:', data)
      break
    case 'customer_inquiry':
      console.log('New customer inquiry received:', data)
      // Could trigger AI response via OpenCode Zen
      break
    default:
      console.log(`Unhandled email event: ${event}`)
  }
}

// WhatsApp event handler
async function handleWhatsAppEvent(event: string, data: unknown) {
  switch (event) {
    case 'message_received':
      console.log('WhatsApp message received:', data)
      // Process with AI and respond
      break
    case 'order_update_sent':
      console.log('Order update sent via WhatsApp:', data)
      break
    default:
      console.log(`Unhandled WhatsApp event: ${event}`)
  }
}

// Telegram event handler
async function handleTelegramEvent(event: string, data: unknown) {
  switch (event) {
    case 'command':
      console.log('Telegram command received:', data)
      break
    case 'notification_sent':
      console.log('Telegram notification sent:', data)
      break
    default:
      console.log(`Unhandled Telegram event: ${event}`)
  }
}

// Social media event handler (Instagram, TikTok, Twitter)
async function handleSocialEvent(channel: string, event: string, data: unknown) {
  switch (event) {
    case 'mention':
      console.log(`${channel} mention:`, data)
      break
    case 'dm_received':
      console.log(`${channel} DM received:`, data)
      break
    case 'post_published':
      console.log(`${channel} post published:`, data)
      break
    default:
      console.log(`Unhandled ${channel} event: ${event}`)
  }
}

// eBay event handler
async function handleEbayEvent(event: string, data: unknown) {
  switch (event) {
    case 'order_created':
      console.log('eBay order created:', data)
      // Sync to main order system
      break
    case 'listing_updated':
      console.log('eBay listing updated:', data)
      break
    case 'message_received':
      console.log('eBay message received:', data)
      break
    default:
      console.log(`Unhandled eBay event: ${event}`)
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'ClawdBot Webhook',
    channels: ['gmail', 'whatsapp', 'telegram', 'instagram', 'tiktok', 'twitter', 'ebay'],
  })
}
