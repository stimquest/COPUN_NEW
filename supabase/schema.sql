-- Enable necessary extensions if needed (e.g., for UUIDs)
create extension if not exists "uuid-ossp";

-- 1. Stages
create table stages (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  activity text not null, 
  level text not null,
  dates text not null, -- Changed to text for simpler handling of strings like "14 - 18 Juillet"
  selected_content text[] default '{}', -- Changed to text[] to match our pedagogical IDs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Sessions (A day or half-day within a stage)
create table sessions (
  id uuid default uuid_generate_v4() primary key,
  stage_id uuid references stages(id) on delete cascade not null,
  title text not null,
  session_order integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Session Structure (Steps within a session)
create table session_structure (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  step_title text not null,
  step_duration_minutes integer,
  step_description text,
  step_order integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Pedagogical Content (The "Fiche Notion")
create table pedagogical_content (
  id text primary key, -- Changed to text to support IDs like '1', '2' etc. from CSV
  niveau integer check (niveau in (1, 2, 3)),
  dimension text not null check (dimension in ('COMPRENDRE', 'OBSERVER', 'PROTÉGER')),
  question text not null,
  objectif text not null,
  tip text,
  tags_theme text[] default '{}',
  tags_filtre text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Link Table
create table session_step_pedagogical_links (
  session_step_id uuid references session_structure(id) on delete cascade not null,
  pedagogical_content_id text references pedagogical_content(id) on delete cascade not null, -- Changed ref to text
  primary key (session_step_id, pedagogical_content_id)
);

-- 6. Exploits
create table exploits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid,
  content_id text references pedagogical_content(id), -- Changed ref to text
  description text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS (Row Level Security) and add basic policies
alter table stages enable row level security;
alter table sessions enable row level security;
alter table session_structure enable row level security;
alter table pedagogical_content enable row level security;
alter table session_step_pedagogical_links enable row level security;
alter table exploits enable row level security;

-- Simple "Allow all" policies for development (WARNING: Not for production)
create policy "Enable access for all" on stages for all using (true) with check (true);
create policy "Enable access for all" on sessions for all using (true) with check (true);
create policy "Enable access for all" on session_structure for all using (true) with check (true);
create policy "Enable access for all" on pedagogical_content for all using (true) with check (true);
create policy "Enable access for all" on session_step_pedagogical_links for all using (true) with check (true);
create policy "Enable access for all" on exploits for all using (true) with check (true);
