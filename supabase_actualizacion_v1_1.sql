-- GLOW BY ANTHO V1.1
-- Ejecutar una sola vez en Supabase → SQL Editor → New query → Run

-- Las preguntas respondidas y marcadas como públicas pueden leerse en la web.
drop policy if exists "Preguntas publicas respondidas" on public.questions;
create policy "Preguntas publicas respondidas"
on public.questions
for select
to anon, authenticated
using (is_public = true and status = 'respondida');

-- Comentarios públicos asociados a preguntas.
create table if not exists public.question_comments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  name text not null,
  comment text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.question_comments enable row level security;

drop policy if exists "Personas pueden enviar comentarios" on public.question_comments;
create policy "Personas pueden enviar comentarios"
on public.question_comments
for insert
to anon, authenticated
with check (char_length(name) between 1 and 80 and char_length(comment) between 1 and 1000);

drop policy if exists "Comentarios aprobados visibles" on public.question_comments;
create policy "Comentarios aprobados visibles"
on public.question_comments
for select
to anon, authenticated
using (approved = true);

drop policy if exists "Antho administra comentarios" on public.question_comments;
create policy "Antho administra comentarios"
on public.question_comments
for all
to authenticated
using (public.is_glow_admin())
with check (public.is_glow_admin());
