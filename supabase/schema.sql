create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  severity text not null check (severity in ('Low', 'Medium', 'High')),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  description text not null,
  created_at timestamptz not null default now()
);

alter table public.incidents enable row level security;

create policy "Anyone can read incidents"
  on public.incidents for select
  using (true);

create policy "Anyone can publish incidents"
  on public.incidents for insert
  with check (true);

alter publication supabase_realtime add table public.incidents;
