alter table public.stages
  add column closed_at     timestamptz,
  add column closing_notes text;

create index if not exists idx_stages_closed_at on public.stages(closed_at);
