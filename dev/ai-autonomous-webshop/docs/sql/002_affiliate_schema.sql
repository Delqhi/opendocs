-- NEXUS AI Shop – Affiliate Tracking Schema
-- Run AFTER 001_core_schema.sql

-- ============================================================
-- 1. AFFILIATE PARTNERS
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- optional link to customers table
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    cookie_days INT DEFAULT 30,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','rejected')),
    payout_method VARCHAR(50) DEFAULT 'paypal' CHECK (payout_method IN ('paypal','bank_transfer','crypto')),
    payout_details JSONB DEFAULT '{}', -- {paypal_email, iban, btc_address}
    total_clicks INT DEFAULT 0,
    total_conversions INT DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0,
    total_paid DECIMAL(10,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_affiliate_code ON affiliate_partners(affiliate_code);
CREATE INDEX idx_affiliate_status ON affiliate_partners(status);
CREATE INDEX idx_affiliate_email ON affiliate_partners(email);

-- ============================================================
-- 2. AFFILIATE CLICKS
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    click_id VARCHAR(100) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer_url TEXT,
    landing_page TEXT,
    country VARCHAR(2),
    device_type VARCHAR(20),
    converted BOOLEAN DEFAULT false,
    order_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_clicks_created ON affiliate_clicks(created_at DESC);
CREATE INDEX idx_clicks_converted ON affiliate_clicks(converted) WHERE converted = false;

-- ============================================================
-- 3. AFFILIATE COMMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    affiliate_id UUID NOT NULL REFERENCES affiliate_partners(id) ON DELETE CASCADE,
    click_id UUID REFERENCES affiliate_clicks(id),
    order_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
    rejection_reason TEXT,
    payout_batch_id VARCHAR(100),
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(order_id, affiliate_id) -- prevent double commission
);

CREATE INDEX idx_commission_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_commission_status ON affiliate_commissions(status);
CREATE INDEX idx_commission_payout ON affiliate_commissions(status) WHERE status = 'approved';

-- ============================================================
-- 4. AFFILIATE PAYOUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliate_partners(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    method VARCHAR(50) NOT NULL,
    reference VARCHAR(255),
    commission_ids UUID[] NOT NULL,
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing','completed','failed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- ============================================================
-- 5. RLS POLICIES (Row Level Security)
-- ============================================================
ALTER TABLE affiliate_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "service_all_affiliate_partners" ON affiliate_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_affiliate_clicks" ON affiliate_clicks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_affiliate_commissions" ON affiliate_commissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_affiliate_payouts" ON affiliate_payouts FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER trg_affiliate_partners_updated BEFORE UPDATE ON affiliate_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_affiliate_commissions_updated BEFORE UPDATE ON affiliate_commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: Update affiliate stats on commission change
-- ============================================================
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliate_partners SET
        total_conversions = (SELECT COUNT(*) FROM affiliate_commissions WHERE affiliate_id = NEW.affiliate_id),
        total_revenue = COALESCE((SELECT SUM(order_amount) FROM affiliate_commissions WHERE affiliate_id = NEW.affiliate_id), 0),
        total_commission = COALESCE((SELECT SUM(commission_amount) FROM affiliate_commissions WHERE affiliate_id = NEW.affiliate_id AND status != 'rejected'), 0),
        total_paid = COALESCE((SELECT SUM(commission_amount) FROM affiliate_commissions WHERE affiliate_id = NEW.affiliate_id AND status = 'paid'), 0)
    WHERE id = NEW.affiliate_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_affiliate_stats
AFTER INSERT OR UPDATE ON affiliate_commissions
FOR EACH ROW EXECUTE FUNCTION update_affiliate_stats();

-- FUNCTION: Update click count
CREATE OR REPLACE FUNCTION update_affiliate_clicks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliate_partners SET
        total_clicks = (SELECT COUNT(*) FROM affiliate_clicks WHERE affiliate_id = NEW.affiliate_id)
    WHERE id = NEW.affiliate_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_affiliate_clicks
AFTER INSERT ON affiliate_clicks
FOR EACH ROW EXECUTE FUNCTION update_affiliate_clicks_count();
