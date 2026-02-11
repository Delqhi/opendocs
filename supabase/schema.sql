-- ============================================================
-- SIMONE-WEBSHOP-01 - Complete Database Schema
-- Fully autonomous dropshipping with AI agents
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE payment_provider AS ENUM (
  'stripe',
  'paypal',
  'klarna',
  'manual'
);

CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed'
);

CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE agent_type AS ENUM (
  'supplier_research',
  'trend_analysis',
  'customer_support',
  'order_processing',
  'price_optimization',
  'social_media',
  'inventory_check'
);

CREATE TYPE agent_status AS ENUM (
  'idle',
  'running',
  'error',
  'disabled'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  shipping_address JSONB DEFAULT '{}',
  billing_address JSONB DEFAULT '{}',
  stripe_customer_id VARCHAR(255),
  paypal_customer_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers (Dropshipping partners)
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  website_url VARCHAR(500),
  api_url VARCHAR(500),
  api_key_encrypted TEXT,
  country VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'EUR',
  rating DECIMAL(3,2) DEFAULT 0,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  shipping_time_days INTEGER DEFAULT 7,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500),
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sku VARCHAR(100) UNIQUE,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Pricing
  price_purchase DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_sell DECIMAL(10,2) NOT NULL,
  price_compare DECIMAL(10,2),
  margin_percent DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN price_purchase > 0 
    THEN ((price_sell - price_purchase) / price_purchase * 100)
    ELSE 0 END
  ) STORED,
  currency VARCHAR(10) DEFAULT 'EUR',
  
  -- Media
  images JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,
  
  -- Attributes
  weight_kg DECIMAL(8,3),
  dimensions JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  attributes JSONB DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  -- Status & Analytics
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  trending_score INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- AI Generated
  ai_description TEXT,
  ai_generated_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Status
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  
  -- Financials
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'EUR',
  
  -- Payment
  payment_provider payment_provider,
  payment_id VARCHAR(255),
  
  -- Addresses
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Shipping
  shipping_method VARCHAR(100),
  tracking_number VARCHAR(255),
  tracking_url VARCHAR(500),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Emails
  confirmation_sent_at TIMESTAMPTZ,
  shipping_notification_sent_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot (in case product changes)
  product_name VARCHAR(500) NOT NULL,
  product_sku VARCHAR(100),
  product_image VARCHAR(500),
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Variant info
  variant_info JSONB DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Orders (Orders placed with suppliers)
CREATE TABLE supplier_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL NOT NULL,
  
  supplier_order_id VARCHAR(255),
  items JSONB NOT NULL DEFAULT '[]',
  
  status order_status DEFAULT 'pending',
  cost_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  tracking_number VARCHAR(255),
  tracking_url VARCHAR(500),
  
  placed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  provider payment_provider NOT NULL,
  provider_payment_id VARCHAR(255),
  provider_customer_id VARCHAR(255),
  
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  status payment_status DEFAULT 'pending',
  
  payment_method_type VARCHAR(100),
  last_four VARCHAR(4),
  
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refunded_at TIMESTAMPTZ,
  
  webhook_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_url VARCHAR(500),
  
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  
  verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  helpful_count INTEGER DEFAULT 0,
  
  images JSONB DEFAULT '[]',
  
  admin_response TEXT,
  admin_response_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS & TRENDS
-- ============================================================

-- Trend Analysis
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(500) NOT NULL,
  category VARCHAR(255),
  keywords TEXT[],
  
  search_volume INTEGER DEFAULT 0,
  trend_score INTEGER DEFAULT 0,
  growth_rate DECIMAL(5,2),
  
  source VARCHAR(100),
  source_url VARCHAR(500),
  
  competitor_prices JSONB DEFAULT '[]',
  suggested_price DECIMAL(10,2),
  
  data JSONB DEFAULT '{}',
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Logs
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  
  previous_stock INTEGER,
  new_stock INTEGER,
  change_amount INTEGER,
  change_type VARCHAR(50),
  reason TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER SUPPORT
-- ============================================================

-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'medium',
  
  category VARCHAR(100),
  
  assigned_to VARCHAR(255),
  
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Messages
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  
  sender_type VARCHAR(50) NOT NULL,
  sender_id UUID,
  sender_name VARCHAR(255),
  
  content TEXT NOT NULL,
  
  is_ai_generated BOOLEAN DEFAULT FALSE,
  
  attachments JSONB DEFAULT '[]',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOCIAL MEDIA
-- ============================================================

-- Social Posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  platform VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  
  media_urls JSONB DEFAULT '[]',
  hashtags TEXT[],
  
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  
  platform_post_id VARCHAR(255),
  platform_url VARCHAR(500),
  
  engagement JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0}',
  
  is_ai_generated BOOLEAN DEFAULT FALSE,
  
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI AGENTS
-- ============================================================

-- AI Agents Configuration
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type agent_type NOT NULL,
  
  status agent_status DEFAULT 'idle',
  
  schedule VARCHAR(100),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  
  config JSONB DEFAULT '{}',
  
  stats JSONB DEFAULT '{"total_runs": 0, "successful_runs": 0, "failed_runs": 0}',
  
  is_enabled BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Logs
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE NOT NULL,
  
  action VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  error TEXT,
  
  duration_ms INTEGER,
  tokens_used INTEGER,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SETTINGS & CONFIG
-- ============================================================

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  variables JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop Settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  value_json JSONB,
  category VARCHAR(100),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_trending ON products(trending_score DESC);
CREATE INDEX idx_products_price ON products(price_sell);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('german', name || ' ' || COALESCE(description, '')));

-- Orders
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Suppliers
CREATE INDEX idx_suppliers_approved ON suppliers(approved);
CREATE INDEX idx_suppliers_slug ON suppliers(slug);

-- Categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Reviews
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Trends
CREATE INDEX idx_trends_score ON trends(trend_score DESC);
CREATE INDEX idx_trends_analyzed ON trends(analyzed_at DESC);

-- Support Tickets
CREATE INDEX idx_tickets_customer ON support_tickets(customer_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_number ON support_tickets(ticket_number);

-- Agent Logs
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_created ON agent_logs(created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON supplier_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update product stats after review
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating_average = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_reviews AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();

-- ============================================================
-- INITIAL DATA
-- ============================================================

-- Default Admin User (password: simone2026)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('simone@example.com', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'Simone Schulze', 'owner');

-- Default Categories
INSERT INTO categories (name, slug, sort_order) VALUES
('Elektronik', 'elektronik', 1),
('Mode', 'mode', 2),
('Haus & Garten', 'haus-garten', 3),
('Sport & Freizeit', 'sport-freizeit', 4),
('Gesundheit & Beauty', 'gesundheit-beauty', 5),
('Spielzeug', 'spielzeug', 6);

-- Default AI Agents
INSERT INTO ai_agents (name, type, schedule, is_enabled, config) VALUES
('Lieferanten-Recherche', 'supplier_research', '0 6 * * *', TRUE, '{"sources": ["alibaba", "aliexpress", "cj-dropshipping"]}'),
('Trend-Analyse', 'trend_analysis', '0 * * * *', TRUE, '{"sources": ["google_trends", "amazon", "ebay"]}'),
('Kundenservice-Bot', 'customer_support', NULL, TRUE, '{"auto_respond": true, "escalation_threshold": 0.7}'),
('Bestellverarbeitung', 'order_processing', NULL, TRUE, '{"auto_place_supplier_orders": true}'),
('Preis-Optimierung', 'price_optimization', '0 3 * * *', TRUE, '{"margin_min": 20, "margin_max": 50}'),
('Social Media Bot', 'social_media', '0 9,15,20 * * *', TRUE, '{"platforms": ["instagram", "tiktok", "twitter"]}'),
('Lagerbestand-Check', 'inventory_check', '0 */4 * * *', TRUE, '{"low_stock_alert": true}');

-- Default Email Templates
INSERT INTO email_templates (name, subject, body_html, variables) VALUES
('order_confirmation', 'Bestellbestätigung - Bestellung #{order_number}', '<h1>Vielen Dank für Ihre Bestellung!</h1><p>Ihre Bestellnummer: {order_number}</p>', '["order_number", "customer_name", "order_total", "items"]'),
('shipping_notification', 'Ihre Bestellung ist unterwegs! #{order_number}', '<h1>Gute Neuigkeiten!</h1><p>Ihre Bestellung wurde versandt. Tracking: {tracking_number}</p>', '["order_number", "tracking_number", "tracking_url"]'),
('review_request', 'Wie war Ihre Bestellung?', '<h1>Ihre Meinung zählt!</h1><p>Bewerten Sie Ihre Produkte und helfen Sie anderen Kunden.</p>', '["customer_name", "products"]');

-- Default Settings
INSERT INTO settings (key, value, category, is_public) VALUES
('shop_name', 'Simone''s Shop', 'general', TRUE),
('shop_currency', 'EUR', 'general', TRUE),
('shop_locale', 'de-DE', 'general', TRUE),
('shipping_free_threshold', '50', 'shipping', TRUE),
('shipping_default_cost', '4.99', 'shipping', TRUE),
('tax_rate', '19', 'tax', FALSE),
('order_number_prefix', 'SS', 'orders', FALSE),
('ai_auto_respond', 'true', 'ai', FALSE),
('social_auto_post', 'true', 'social', FALSE);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY customers_own_data ON customers FOR ALL USING (id = auth.uid());
CREATE POLICY orders_own_data ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY order_items_own_data ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);
CREATE POLICY reviews_own_data ON reviews FOR ALL USING (customer_id = auth.uid());
CREATE POLICY tickets_own_data ON support_tickets FOR ALL USING (customer_id = auth.uid());

-- Public read for products and categories
CREATE POLICY products_public_read ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY categories_public_read ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY reviews_public_read ON reviews FOR SELECT USING (is_approved = TRUE);

-- ============================================================
-- DONE!
-- ============================================================
