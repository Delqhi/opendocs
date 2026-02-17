import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminSupplier, Coupon, Product, ShopSettings, UserOrder, AdminProfile } from '../store/shopStore';
import { getSupabaseClient } from './supabaseClient';

export type SupabaseTableNames = {
  products: string;
  suppliers: string;
  coupons: string;
  orders: string;
};

export function isSupabaseConfigured(settings: ShopSettings) {
  return Boolean(settings.supabaseUrl?.trim() && settings.supabaseAnonKey?.trim());
}

export function getSupabaseFromSettings(settings: ShopSettings): SupabaseClient | null {
  return getSupabaseClient({ url: settings.supabaseUrl, anonKey: settings.supabaseAnonKey });
}

export function getSupabaseTables(settings: ShopSettings): SupabaseTableNames {
  return {
    products: settings.supabaseTableProducts?.trim() || 'nexus_products',
    suppliers: settings.supabaseTableSuppliers?.trim() || 'nexus_suppliers',
    coupons: settings.supabaseTableCoupons?.trim() || 'nexus_coupons',
    orders: settings.supabaseTableOrders?.trim() || 'nexus_orders',
  };
}

// In this frontend build we assume a simple schema: row has a `data` JSONB column.
// This keeps the UI flexible and avoids migrations for new fields.

type JsonRow = {
  id: string;
  data: unknown;
  updated_at?: string;
  created_at?: string;
};

async function fetchJsonRows<T>(client: SupabaseClient, table: string): Promise<T[]> {
  // Some tables may not have updated_at; try ordering first, then fallback.
  const ordered = await client.from(table).select('*').order('updated_at', { ascending: false });
  const res = ordered.error
    ? await client.from(table).select('*')
    : ordered;

  if (res.error) throw res.error;

  const rows = (res.data ?? []) as JsonRow[];
  return rows.map((r) => r.data).filter(Boolean) as T[];
}

async function upsertJsonRow<T extends { id: string }>(client: SupabaseClient, table: string, entity: T): Promise<void> {
  const row = { id: entity.id, data: entity };
  const { error } = await client.from(table).upsert(row);
  if (error) throw error;
}

async function deleteRow(client: SupabaseClient, table: string, id: string): Promise<void> {
  const { error } = await client.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function pullAllFromSupabase(settings: ShopSettings): Promise<{
  products?: Product[];
  suppliers?: AdminSupplier[];
  coupons?: Coupon[];
  orders?: UserOrder[];
  adminProfile?: AdminProfile;
}> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return {};
  const tables = getSupabaseTables(settings);

  const adminTable = settings.supabaseTableAdminProfile?.trim() || 'nexus_admin';

  const [products, suppliers, coupons, orders, adminProfile] = await Promise.all([
    fetchJsonRows<Product>(client, tables.products).catch(() => undefined),
    fetchJsonRows<AdminSupplier>(client, tables.suppliers).catch(() => undefined),
    fetchJsonRows<Coupon>(client, tables.coupons).catch(() => undefined),
    fetchJsonRows<UserOrder>(client, tables.orders).catch(() => undefined),
    fetchJsonRows<AdminProfile>(client, adminTable).catch(() => undefined),
  ]);

  return {
    products,
    suppliers,
    coupons,
    orders,
    adminProfile: adminProfile?.[0],
  };
}

export async function pushAdminProfile(settings: ShopSettings, profile: AdminProfile): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const table = settings.supabaseTableAdminProfile?.trim() || 'nexus_admin';
  await upsertJsonRow(client, table, { ...profile, id: 'singleton_admin' });
}

export async function testSupabaseConnection(settings: ShopSettings): Promise<{ ok: boolean; message: string }> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return { ok: false, message: 'Supabase not configured (missing URL or anon key).' };

  const tables = getSupabaseTables(settings);
  const adminTable = settings.supabaseTableAdminProfile?.trim() || 'nexus_admin';

  // Check that tables are reachable (RLS / permissions / table existence)
  const checks: Array<{ name: string; table: string }> = [
    { name: 'products', table: tables.products },
    { name: 'suppliers', table: tables.suppliers },
    { name: 'coupons', table: tables.coupons },
    { name: 'orders', table: tables.orders },
    { name: 'adminProfile', table: adminTable },
  ];

  for (const c of checks) {
    const { error } = await client.from(c.table).select('id').limit(1);
    if (error) {
      return {
        ok: false,
        message: `Supabase table check failed (${c.name} → ${c.table}): ${error.message}`,
      };
    }
  }

  return { ok: true, message: 'Supabase connection OK (tables readable with current anon key/RLS).' };
}

export async function pushProduct(settings: ShopSettings, product: Product): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const tables = getSupabaseTables(settings);
  await upsertJsonRow(client, tables.products, product);
}

export async function removeProduct(settings: ShopSettings, id: string): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const tables = getSupabaseTables(settings);
  await deleteRow(client, tables.products, id);
}

export async function pushSupplier(settings: ShopSettings, supplier: AdminSupplier): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const tables = getSupabaseTables(settings);
  await upsertJsonRow(client, tables.suppliers, supplier);
}

export async function removeSupplier(settings: ShopSettings, id: string): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const tables = getSupabaseTables(settings);
  await deleteRow(client, tables.suppliers, id);
}

export async function pushCoupon(settings: ShopSettings, coupon: Coupon): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const tables = getSupabaseTables(settings);
  await upsertJsonRow(client, tables.coupons, coupon);
}

export async function removeCoupon(settings: ShopSettings, id: string): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const tables = getSupabaseTables(settings);
  await deleteRow(client, tables.coupons, id);
}

export async function pushOrder(settings: ShopSettings, order: UserOrder): Promise<void> {
  const client = getSupabaseFromSettings(settings);
  if (!client) return;
  const tables = getSupabaseTables(settings);
  await upsertJsonRow(client, tables.orders, order);
}
