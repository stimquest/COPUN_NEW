-- Step todos: preparation checklist for each session step
create table if not exists step_todos (
  id uuid primary key default gen_random_uuid(),
  session_step_id uuid not null references session_structure(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  todo_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index step_todos_step_id_idx on step_todos(session_step_id);

alter table step_todos enable row level security;

-- Inherit access from parent session_structure → sessions → stages
create policy "Users can manage todos for their stage steps"
  on step_todos
  for all
  using (
    exists (
      select 1
      from session_structure ss
      join sessions s on s.id = ss.session_id
      join stages st on st.id = s.stage_id
      where ss.id = step_todos.session_step_id
        and st.owner_id = auth.uid()
    )
  );
