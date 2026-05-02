create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'roast-images',
  'roast-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'roast_status') then
    create type public.roast_status as enum ('processing', 'public', 'hidden', 'failed', 'deleted');
  end if;

  if not exists (select 1 from pg_type where typname = 'share_status') then
    create type public.share_status as enum ('not_shared', 'link_ready', 'shared', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'capture_mode') then
    create type public.capture_mode as enum ('random', 'manual', 'demo_linkedin_link');
  end if;
end $$;

create or replace function public.generate_roast_id()
returns text
language sql
as $$
  select 'rst_' || encode(gen_random_bytes(8), 'hex');
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roasts (
  id text primary key default public.generate_roast_id(),
  status public.roast_status not null default 'processing',
  image_bucket text,
  image_path text,
  image_url text,
  caption text,
  source_host text,
  source_title text,
  capture_mode public.capture_mode not null,
  client_timestamp timestamptz,
  themes jsonb not null default '[]'::jsonb,
  share_status public.share_status not null default 'not_shared',
  error_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hidden_at timestamptz,
  deleted_at timestamptz,
  constraint public_roast_requires_public_assets
    check (
      status <> 'public'
      or (caption is not null and image_path is not null and image_url is not null)
    ),
  constraint hidden_requires_hidden_at
    check (status <> 'hidden' or hidden_at is not null),
  constraint deleted_requires_deleted_at
    check (status <> 'deleted' or deleted_at is not null)
);

create index if not exists roasts_public_created_at_idx
  on public.roasts (created_at desc)
  where status = 'public';

create index if not exists roasts_status_updated_at_idx
  on public.roasts (status, updated_at desc);

drop trigger if exists roasts_set_updated_at on public.roasts;
create trigger roasts_set_updated_at
before update on public.roasts
for each row
execute function public.set_updated_at();

create table if not exists public.roast_events (
  id uuid primary key default gen_random_uuid(),
  roast_id text not null references public.roasts(id) on delete cascade,
  event_type text not null,
  actor text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists roast_events_roast_id_created_at_idx
  on public.roast_events (roast_id, created_at desc);

create table if not exists public.upload_attempts (
  id uuid primary key default gen_random_uuid(),
  client_fingerprint text not null,
  capture_mode public.capture_mode not null,
  outcome text not null,
  roast_id text references public.roasts(id) on delete set null,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists upload_attempts_fingerprint_created_at_idx
  on public.upload_attempts (client_fingerprint, created_at desc);

alter table public.roasts enable row level security;
alter table public.roast_events enable row level security;
alter table public.upload_attempts enable row level security;

drop policy if exists "Public can read roast images" on storage.objects;
create policy "Public can read roast images"
on storage.objects
for select
using (bucket_id = 'roast-images');

drop policy if exists "Service role can manage roast images" on storage.objects;
create policy "Service role can manage roast images"
on storage.objects
for all
to service_role
using (bucket_id = 'roast-images')
with check (bucket_id = 'roast-images');

drop policy if exists "Public roasts are readable" on public.roasts;
create policy "Public roasts are readable"
on public.roasts
for select
using (status = 'public');

drop policy if exists "Roast events are service role only" on public.roast_events;
create policy "Roast events are service role only"
on public.roast_events
for all
using (false)
with check (false);

drop policy if exists "Upload attempts are service role only" on public.upload_attempts;
create policy "Upload attempts are service role only"
on public.upload_attempts
for all
using (false)
with check (false);
