import type { Lang } from "../types";
import { getSupabase } from "../lib/supabaseClient";

/** Grava um evento opcional da demo (ex.: módulo aberto). Falha silenciosamente se Supabase não estiver configurado. */
export async function logPresentationEvent(module: string, lang: Lang, note?: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from("presentation_feedback").insert({ lang, module, note: note ?? null });
  if (error) console.warn("[Sentrix] presentation_feedback:", error.message);
}
