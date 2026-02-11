import { NextRequest, NextResponse } from 'next/server'

// Sample orders data (in production, this would come from Supabase)
const sampleOrders = [
  {
    id: 'ord_001',
    customerId: 'cust_001',
    status: 'delivered',
    items: [
      { productId: 'prod_001', name: 'Premium Kopfhörer', quantity: 1, price: 199.99 },
    ],
    total: 199.99,
    shippingAddress: {
      firstName: 'Max',
      lastName: 'Mustermann',
      street: 'Musterstraße 123',
      city: 'Berlin',
      zip: '10115',
      country: 'Deutschland',
    },
    createdAt: new Date('2026-01-15'),
  },
]

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const orderId = searchParams.get('id')

    let orders = [...sampleOrders]

    // Filter by order ID
    if (orderId) {
      const order = orders.find((o) => o.id === orderId)
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ order })
    }

    // Filter by customer
    if (customerId) {
      orders = orders.filter((o) => o.customerId === customerId)
    }

    // Filter by status
    if (status) {
      orders = orders.filter((o) => o.status === status)
    }

    return NextResponse.json({
      orders,
      count: orders.length,
    })
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['items', 'shippingAddress', 'paymentMethod']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    // Calculate total
    const subtotal = body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )
    const shippingCost = subtotal >= 50 ? 0 : 4.99
    const total = subtotal + shippingCost

    // Create order
    const newOrder = {
      id: `ord_${Date.now()}`,
      customerId: body.customerId || null,
      customerEmail: body.email,
      status: 'pending',
      items: body.items,
      subtotal,
      shippingCost,
      total,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // In production:
    // 1. Save to Supabase
    // 2. Process payment via Stripe/PayPal/Klarna
    // 3. Trigger n8n workflow for order processing
    // 4. Send confirmation email via ClawdBot

    // Trigger n8n webhook (if configured)
    const n8nWebhookUrl = process.env.N8N_ORDER_WEBHOOK_URL
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch((err) => console.error('n8n webhook failed:', err))
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Bestellung erfolgreich erstellt',
    }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// PATCH /api/orders - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.orderId || !body.status) {
      return NextResponse.json(
        { error: 'orderId and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // In production: Update in Supabase
    // await supabase.from('orders').update({ status: body.status }).eq('id', body.orderId)

    return NextResponse.json({
      success: true,
      orderId: body.orderId,
      status: body.status,
      message: `Bestellstatus auf "${body.status}" geändert`,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
