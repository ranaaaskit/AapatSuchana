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
alter table public.incidents add column if not exists status text not null default 'New' check (status in ('New', 'Investigating', 'Resolved'));
alter table public.incidents add column if not exists verified boolean not null default false;

alter table public.incidents enable row level security;

drop policy if exists "Anyone can read incidents" on public.incidents;
drop policy if exists "Anyone can publish incidents" on public.incidents;
drop policy if exists "Authenticated users can publish incidents" on public.incidents;
drop policy if exists "Authenticated users can update incidents" on public.incidents;

create policy "Anyone can read incidents"
  on public.incidents for select
  using (true);

create policy "Authenticated users can publish incidents"
  on public.incidents for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Authenticated users can update incidents"
  on public.incidents for update
  to authenticated
  using (true)
  with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'incidents'
  ) then
    alter publication supabase_realtime add table public.incidents;
  end if;
end $$;

create table if not exists public.employee_accounts (
  email text primary key check (email = lower(email)),
  display_name text not null default 'Operations staff',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.employee_accounts enable row level security;

drop policy if exists "Employees can read their own access" on public.employee_accounts;
create policy "Employees can read their own access"
  on public.employee_accounts for select
  to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

-- Add approved employee emails here from the Supabase SQL Editor.
-- Example: insert into public.employee_accounts (email, display_name)
-- values ('employee@your-org.com', 'Field Operations');
