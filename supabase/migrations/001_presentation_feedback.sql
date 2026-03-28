-- Sentrix MVP — plano gratuito Supabase
-- Execute no SQL Editor do projeto ou via CLI: supabase db push
-- Objetivo: registo opcional de interações da demo (investidores), sem expor dados sensíveis.

create table if not exists public.presentation_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lang text not null,
  module text,
  note text,
  constraint presentation_feedback_lang_check check (lang in ('pt', 'en', 'es', 'fr'))
);

comment on table public.presentation_feedback is 'Eventos opcionais da demo (MVP); RLS: insert público, leitura só no dashboard Supabase.';

alter table public.presentation_feedback enable row level security;

create policy "allow_anon_insert_presentation_feedback"
  on public.presentation_feedback
  for insert
  to anon
  with check (true);

-- Leitura apenas com service_role / dashboard — anon não consulta linhas
create policy "deny_anon_select_presentation_feedback"
  on public.presentation_feedback
  for select
  to anon
  using (false);
