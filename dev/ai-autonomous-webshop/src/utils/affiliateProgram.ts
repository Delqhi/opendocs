import { getSupabaseClient } from './supabaseClient';
import type { ShopSettings } from '../store/shopStore';

export type AffiliatePartnerRow = {
  id: string;
  user_id: string;
  affiliate_code: string;
  commission_rate: number;
  status: 'pending' | 'active' | 'suspended';
  payout_details?: string | null;
  created_at?: string | null;
};

export type AffiliateClickInsert = {
  affiliate_id: string;
  click_id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  referer_url?: string | null;
};

export type AffiliateCommissionRow = {
  id: string;
  order_id: string;
  affiliate_id: string;
  total_order_amount: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  payout_date?: string | null;
  created_at?: string | null;
};

const COOKIE_AFFILIATE_ID = 'shop_affiliate_id';
const COOKIE_CLICK_ID = 'shop_affiliate_click';

const defaultTableNames = {
  partners: 'affiliate_partners',
  clicks: 'affiliate_clicks',
  commissions: 'affiliate_commissions',
} as const;

export function getAffiliateTables(settings: ShopSettings) {
  return {
    partners: (settings as any).supabaseTableAffiliatePartners?.trim() || defaultTableNames.partners,
    clicks: (settings as any).supabaseTableAffiliateClicks?.trim() || defaultTableNames.clicks,
    commissions: (settings as any).supabaseTableAffiliateCommissions?.trim() || defaultTableNames.commissions,
  };
}

function safeRandomId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const maxAge = Math.floor(days * 24 * 60 * 60);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  // SameSite=Lax to allow typical affiliate flows.
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const key = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';').map((c) => c.trim());
  for (const p of parts) {
    if (p.startsWith(key)) return decodeURIComponent(p.slice(key.length));
  }
  return null;
}

export function clearAffiliateCookies() {
  setCookie(COOKIE_AFFILIATE_ID, '', -1);
  setCookie(COOKIE_CLICK_ID, '', -1);
}

export function readAffiliateAttribution(): { affiliateId?: string; clickId?: string } {
  const affiliateId = getCookie(COOKIE_AFFILIATE_ID) ?? undefined;
  const clickId = getCookie(COOKIE_CLICK_ID) ?? undefined;
  return { affiliateId, clickId };
}

export function stripRefFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('ref')) return;
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // ignore
  }
}

export async function captureAffiliateInbound(args: {
  settings: ShopSettings;
  affiliateCode: string;
  cookieDays?: number;
}): Promise<{ ok: boolean; partnerId?: string; clickId?: string; reason?: string }> {
  const { settings, affiliateCode } = args;
  const code = affiliateCode.trim();
  if (!code) return { ok: false, reason: 'missing_code' };

  const supabase = getSupabaseClient({ url: settings.supabaseUrl, anonKey: settings.supabaseAnonKey });
  if (!supabase) return { ok: false, reason: 'supabase_not_configured' };

  const tables = getAffiliateTables(settings);

  const { data: partner, error } = await supabase
    .from(tables.partners)
    .select('*')
    .eq('affiliate_code', code)
    .limit(1)
    .maybeSingle();

  if (error || !partner) return { ok: false, reason: 'invalid_code' };
  if (partner.status !== 'active') return { ok: false, reason: 'partner_not_active' };

  const clickId = safeRandomId('clk');

  const insert: AffiliateClickInsert = {
    affiliate_id: String(partner.id),
    click_id: clickId,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    referer_url: typeof document !== 'undefined' ? document.referrer : undefined,
  };

  // Best-effort click insert (RLS may prevent insert if not configured)
  try {
    const { error: clickError } = await supabase.from(tables.clicks).insert(insert);
    if (clickError) {
      // ignore
    }
  } catch {
    // ignore
  }

  const days = typeof args.cookieDays === 'number' ? args.cookieDays : 30;
  setCookie(COOKIE_AFFILIATE_ID, String(partner.id), days);
  setCookie(COOKIE_CLICK_ID, clickId, days);

  return { ok: true, partnerId: String(partner.id), clickId };
}

export async function recordAffiliateConversion(args: {
  settings: ShopSettings;
  orderId: string;
  totalOrderAmount: number;
  buyerUserId?: string;
}): Promise<{ ok: boolean; reason?: string; commissionId?: string }> {
  const { settings, orderId, totalOrderAmount, buyerUserId } = args;
  const { affiliateId } = readAffiliateAttribution();
  if (!affiliateId) return { ok: false, reason: 'no_attribution_cookie' };

  const supabase = getSupabaseClient({ url: settings.supabaseUrl, anonKey: settings.supabaseAnonKey });
  if (!supabase) return { ok: false, reason: 'supabase_not_configured' };

  const tables = getAffiliateTables(settings);

  // Check existing commission (avoid duplicate booking)
  const existing = await supabase
    .from(tables.commissions)
    .select('id')
    .eq('order_id', orderId)
    .eq('affiliate_id', affiliateId)
    .limit(1)
    .maybeSingle();

  if (existing.data?.id) return { ok: true, commissionId: String(existing.data.id) };

  // Fetch partner for rate + self-referral check
  const partnerRes = await supabase
    .from(tables.partners)
    .select('*')
    .eq('id', affiliateId)
    .limit(1)
    .maybeSingle();

  const partner = partnerRes.data as AffiliatePartnerRow | null;
  if (!partner) return { ok: false, reason: 'partner_not_found' };
  if (partner.status !== 'active') return { ok: false, reason: 'partner_not_active' };
  if (buyerUserId && String(partner.user_id) === String(buyerUserId)) return { ok: false, reason: 'self_referral' };

  const rate = typeof partner.commission_rate === 'number' ? partner.commission_rate : 10;
  const commissionAmount = Math.max(0, (totalOrderAmount * rate) / 100);

  const { data, error } = await supabase.from(tables.commissions).insert({
    order_id: orderId,
    affiliate_id: affiliateId,
    total_order_amount: totalOrderAmount,
    commission_amount: commissionAmount,
    status: 'pending',
  } as Partial<AffiliateCommissionRow>);

  if (error) return { ok: false, reason: `insert_failed:${error.message}` };

  // Best-effort: return id if the table returns it; otherwise ok.
  const insertedId = Array.isArray(data) && data[0] && (data[0] as any).id ? String((data[0] as any).id) : undefined;
  return { ok: true, commissionId: insertedId };
}
