create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  severity text not null check (severity in ('Low', 'Medium', 'High')),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  description text not null,
  user_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.incidents add column if not exists user_id uuid references auth.users(id) default auth.uid();

alter table public.incidents enable row level security;

drop policy if exists "Anyone can read incidents" on public.incidents;
drop policy if exists "Anyone can publish incidents" on public.incidents;
drop policy if exists "Authenticated users can publish incidents" on public.incidents;

create policy "Anyone can read incidents"
  on public.incidents for select
  using (true);

create policy "Authenticated users can publish incidents"
  on public.incidents for insert
  to authenticated
  with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'incidents'
  ) then
    alter publication supabase_realtime add table public.incidents;
  end if;
end $$;
