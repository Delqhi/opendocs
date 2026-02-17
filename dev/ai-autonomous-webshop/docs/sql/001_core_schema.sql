-- NEXUS AI Shop – Core Database Schema
-- Run this FIRST in Supabase SQL Editor

-- ============================================================
-- 1. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    stock INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    sold_count INT DEFAULT 0,
    source_type VARCHAR(20) DEFAULT 'dropship' CHECK (source_type IN ('dropship','affiliate','own')),
    affiliate_url TEXT,
    affiliate_network_id UUID,
    supplier_id UUID,
    supplier_sku VARCHAR(100),
    supplier_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    is_trending BOOLEAN DEFAULT false,
    ai_score DECIMAL(3,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_source ON products(source_type);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_trending ON products(is_trending);

-- ============================================================
-- 2. SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    website VARCHAR(500),
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT,
    catalog_feed_url VARCHAR(500),
    catalog_feed_format VARCHAR(20) DEFAULT 'json',
    catalog_feed_auth TEXT,
    country VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0,
    reliability DECIMAL(5,2) DEFAULT 0,
    avg_shipping_days INT DEFAULT 7,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. ORDERS
-- ============================================================
CREATE TYPE order_status AS ENUM (
    'pending','confirmed','processing','shipped','delivered','cancelled','refunded','failed'
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    items JSONB NOT NULL, -- [{productId, name, price, qty, supplierId, supplierSku}]
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status order_status DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded','partial_refund')),
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255), -- Stripe/PayPal reference
    coupon_code VARCHAR(50),
    affiliate_id UUID,
    tracking_number VARCHAR(255),
    carrier VARCHAR(100),
    estimated_delivery DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- 4. FULFILLMENT QUEUE
-- ============================================================
CREATE TYPE fulfillment_status AS ENUM (
    'queued','processing','ordered','shipped','delivered','failed','cancelled','retry'
);

CREATE TABLE IF NOT EXISTS fulfillment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    items JSONB NOT NULL,
    status fulfillment_status DEFAULT 'queued',
    supplier_order_id VARCHAR(255),
    supplier_tracking VARCHAR(255),
    supplier_cost DECIMAL(10,2),
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fulfillment_order ON fulfillment_queue(order_id);
CREATE INDEX idx_fulfillment_status ON fulfillment_queue(status);
CREATE INDEX idx_fulfillment_retry ON fulfillment_queue(next_retry_at) WHERE status = 'retry';

-- ============================================================
-- 5. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    min_order DECIMAL(10,2) DEFAULT 0,
    max_uses INT,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    addresses JSONB DEFAULT '[]',
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    loyalty_points INT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_email ON customers(email);

-- ============================================================
-- 7. EMAIL LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255) NOT NULL,
    template VARCHAR(100) NOT NULL,
    subject VARCHAR(500),
    body_preview TEXT,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','bounced')),
    provider_message_id VARCHAR(255),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ
);

CREATE INDEX idx_email_status ON email_log(status);
CREATE INDEX idx_email_recipient ON email_log(recipient);

-- ============================================================
-- 8. ADMIN PROFILE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'owner',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fulfillment_updated BEFORE UPDATE ON fulfillment_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
