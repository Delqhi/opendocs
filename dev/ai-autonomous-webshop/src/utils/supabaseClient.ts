import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(args: { url?: string; anonKey?: string }): SupabaseClient | null {
  const url = (args.url ?? '').trim();
  const anonKey = (args.anonKey ?? '').trim();

  if (!url || !anonKey) return null;

  if (cached && cachedUrl === url && cachedKey === anonKey) return cached;

  cachedUrl = url;
  cachedKey = anonKey;
  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'nexus-ai-commerce/2026',
      },
    },
  });

  return cached;
}
