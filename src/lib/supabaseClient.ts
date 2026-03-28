import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

/** Cliente anónimo (plano gratuito). Sem variáveis = null — a app continua só com dados em tempo real. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured || !url || !anon) return null;
  if (!client) client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
