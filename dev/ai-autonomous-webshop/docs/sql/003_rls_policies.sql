-- NEXUS AI Shop – Row Level Security Policies
-- Run AFTER 001 + 002

-- Enable RLS on core tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PRODUCTS: Public read, admin write
-- ============================================================
CREATE POLICY "products_public_read" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "products_service_all" ON products
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- ORDERS: Customers see own, admin sees all
-- ============================================================
CREATE POLICY "orders_customer_read" ON orders
    FOR SELECT USING (customer_email = auth.jwt()->>'email');

CREATE POLICY "orders_service_all" ON orders
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SUPPLIERS: Admin only
-- ============================================================
CREATE POLICY "suppliers_service_all" ON suppliers
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- FULFILLMENT: Admin only
-- ============================================================
CREATE POLICY "fulfillment_service_all" ON fulfillment_queue
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- COUPONS: Public read active, admin write
-- ============================================================
CREATE POLICY "coupons_public_read" ON coupons
    FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "coupons_service_all" ON coupons
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- CUSTOMERS: Own data only
-- ============================================================
CREATE POLICY "customers_own_read" ON customers
    FOR SELECT USING (email = auth.jwt()->>'email');

CREATE POLICY "customers_service_all" ON customers
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- EMAIL LOG: Admin only
-- ============================================================
CREATE POLICY "email_service_all" ON email_log
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- ADMIN PROFILE: Admin only
-- ============================================================
CREATE POLICY "admin_service_all" ON admin_profile
    FOR ALL USING (auth.role() = 'service_role');
