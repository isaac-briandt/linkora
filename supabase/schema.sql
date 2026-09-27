create extension if not exists "pgcrypto";

-- Core people / personal identity
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null default '', title text default '', company text default '', bio text default '', avatar_url text default '', cover_image_url text default '',
  phone text default '', email text default '', website text default '', linkedin text default '', instagram text default '', facebook text default '',
  x_url text default '', tiktok text default '', github text default '', whatsapp text default '', link_items jsonb not null default '[]'::jsonb,
  role text not null default 'user' check (role in ('user','platform_admin','super_admin')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Existing projects may already have the profiles table, so add the visual field safely.
alter table public.profiles add column if not exists cover_image_url text default '';

-- Public profile imagery. Users can only write inside their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists profile_media_public_read on storage.objects;
drop policy if exists profile_media_owner_insert on storage.objects;
drop policy if exists profile_media_owner_update on storage.objects;
drop policy if exists profile_media_owner_delete on storage.objects;
create policy profile_media_public_read on storage.objects for select using (bucket_id = 'profile-media');
create policy profile_media_owner_insert on storage.objects for insert to authenticated with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy profile_media_owner_update on storage.objects for update to authenticated using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy profile_media_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = auth.uid()::text);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
  type text not null check (type in ('company','school','restaurant','hotel','event','church','ngo','other')),
  description text, logo_url text, created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade, person_id uuid, role text not null default 'member' check (role in ('owner','admin','manager','member')),
  created_at timestamptz not null default now(), unique(organization_id, profile_id)
);
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null, external_id text, username text, full_name text not null, title text, company text, bio text,
  email text, phone text, whatsapp text, website text, linkedin text, instagram text, facebook text, x_url text, tiktok text, github text,
  avatar_url text, cover_image_url text, link_items jsonb not null default '[]'::jsonb,
  engagement_share_token text default encode(gen_random_bytes(24), 'hex'),
  metadata jsonb not null default '{}'::jsonb, status text not null default 'active' check(status in ('active','inactive')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.people add column if not exists username text;
alter table public.people add column if not exists company text;
alter table public.people add column if not exists bio text;
alter table public.people add column if not exists whatsapp text;
alter table public.people add column if not exists website text;
alter table public.people add column if not exists linkedin text;
alter table public.people add column if not exists instagram text;
alter table public.people add column if not exists facebook text;
alter table public.people add column if not exists x_url text;
alter table public.people add column if not exists tiktok text;
alter table public.people add column if not exists github text;
alter table public.people add column if not exists avatar_url text;
alter table public.people add column if not exists cover_image_url text;
alter table public.profiles add column if not exists link_items jsonb not null default '[]'::jsonb;
alter table public.people add column if not exists link_items jsonb not null default '[]'::jsonb;
alter table public.people add column if not exists engagement_share_token text default encode(gen_random_bytes(24), 'hex');
create unique index if not exists people_username_unique on public.people(username) where username is not null;
create unique index if not exists people_engagement_share_token_unique on public.people(engagement_share_token) where engagement_share_token is not null;
do $$ begin alter table public.organization_members drop constraint if exists organization_members_person_fk; alter table public.organization_members add constraint organization_members_person_fk foreign key (person_id) references public.people(id) on delete cascade; exception when duplicate_object then null; end $$;

-- Physical/digital cards
create table if not exists public.nfc_cards (
  id uuid primary key default gen_random_uuid(), card_uid text unique not null, label text,
  status text not null default 'active' check(status in ('active','inactive','lost','unassigned')),
  destination_type text not null default 'profile' check(destination_type in ('profile','organization','menu','event','attendance','custom')),
  destination_url text, profile_id uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null, person_id uuid references public.people(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Generic analytics
create table if not exists public.engagement_events (
  id uuid primary key default gen_random_uuid(), event_type text not null,
  profile_id uuid references public.profiles(id) on delete cascade, organization_id uuid references public.organizations(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade, card_id uuid references public.nfc_cards(id) on delete cascade, target text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.engagement_events add column if not exists person_id uuid references public.people(id) on delete cascade;
create table if not exists public.profile_events (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check(event_type in ('view','link_click','contact_save')), target text, created_at timestamptz not null default now()
);

-- Attendance
create table if not exists public.attendance_points (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, location_text text, card_uid text, active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade, card_id uuid references public.nfc_cards(id) on delete set null,
  attendance_point_id uuid references public.attendance_points(id) on delete set null, type text not null check(type in ('check_in','check_out')),
  scanned_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb
);

-- Menus
create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, slug text unique not null, description text, menu_file_url text, menu_file_name text, menu_external_url text, active boolean not null default true, created_at timestamptz not null default now()
);
alter table public.menus add column if not exists menu_file_url text;
alter table public.menus add column if not exists menu_file_name text;
alter table public.menus add column if not exists menu_external_url text;
create table if not exists public.menu_sections (
  id uuid primary key default gen_random_uuid(), menu_id uuid not null references public.menus(id) on delete cascade,
  name text not null, sort_order int not null default 0
);
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(), section_id uuid not null references public.menu_sections(id) on delete cascade,
  name text not null, description text, price numeric(12,2), image_url text, available boolean not null default true, sort_order int not null default 0
);

-- Platform administration
create table if not exists public.platform_admins (
  profile_id uuid primary key references public.profiles(id) on delete cascade, created_at timestamptz not null default now()
);

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.platform_admins where profile_id = auth.uid())
      or exists(select 1 from public.profiles where id = auth.uid() and role in ('platform_admin','super_admin'));
$$;
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.organization_members where organization_id=org and profile_id=auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.people enable row level security;
alter table public.nfc_cards enable row level security;
alter table public.engagement_events enable row level security;
alter table public.profile_events enable row level security;
alter table public.attendance_points enable row level security;
alter table public.attendance_records enable row level security;
alter table public.menus enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_items enable row level security;
alter table public.platform_admins enable row level security;

-- Recreate policies safely
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname='public' AND tablename IN ('profiles','organizations','organization_members','people','nfc_cards','engagement_events','profile_events','attendance_points','attendance_records','menus','menu_sections','menu_items','platform_admins') LOOP
    EXECUTE format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

create policy profiles_public_select on public.profiles for select using (true);
create policy profiles_self_insert on public.profiles for insert with check(auth.uid()=id);
create policy profiles_self_update on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
create policy profiles_admin_all on public.profiles for all using(public.is_platform_admin()) with check(public.is_platform_admin());

create policy org_select on public.organizations for select using(created_by=auth.uid() or public.is_org_member(id) or public.is_platform_admin());
create policy org_insert on public.organizations for insert with check(created_by=auth.uid());
create policy org_update on public.organizations for update using(created_by=auth.uid() or public.is_org_member(id) or public.is_platform_admin()) with check(created_by=auth.uid() or public.is_org_member(id) or public.is_platform_admin());
create policy org_admin_delete on public.organizations for delete using(created_by=auth.uid() or public.is_platform_admin());

create policy members_select on public.organization_members for select using(profile_id=auth.uid() or public.is_org_member(organization_id) or public.is_platform_admin());
create policy members_insert on public.organization_members for insert with check(public.is_org_member(organization_id) or public.is_platform_admin() or exists(select 1 from public.organizations o where o.id=organization_id and o.created_by=auth.uid()));
create policy members_update on public.organization_members for update using(public.is_org_member(organization_id) or public.is_platform_admin());
create policy members_delete on public.organization_members for delete using(public.is_org_member(organization_id) or public.is_platform_admin());

create policy people_select on public.people for select using(status='active' or public.is_org_member(organization_id) or public.is_platform_admin());
create policy people_insert on public.people for insert with check(public.is_org_member(organization_id) or public.is_platform_admin());
create policy people_update on public.people for update using(public.is_org_member(organization_id) or public.is_platform_admin());
create policy people_delete on public.people for delete using(public.is_org_member(organization_id) or public.is_platform_admin());

create policy cards_public_select on public.nfc_cards for select using(status='active');
create policy cards_org_manage on public.nfc_cards for all using(public.is_org_member(organization_id) or public.is_platform_admin()) with check(public.is_org_member(organization_id) or public.is_platform_admin());
create policy cards_self_manage on public.nfc_cards for all using(profile_id=auth.uid() or public.is_platform_admin()) with check(profile_id=auth.uid() or public.is_platform_admin());

create policy engagement_insert_public on public.engagement_events for insert with check(true);
create policy engagement_select_own on public.engagement_events for select using(profile_id=auth.uid() or public.is_org_member(organization_id) or public.is_platform_admin());
create policy profile_events_insert_public on public.profile_events for insert with check(true);
create policy profile_events_select_own on public.profile_events for select using(auth.uid()=profile_id or public.is_platform_admin());

create policy attendance_points_org on public.attendance_points for all using(public.is_org_member(organization_id) or public.is_platform_admin()) with check(public.is_org_member(organization_id) or public.is_platform_admin());
create policy attendance_records_select on public.attendance_records for select using(public.is_org_member(organization_id) or public.is_platform_admin());
create policy attendance_records_insert on public.attendance_records for insert with check(true);

create policy menus_public_select on public.menus for select using(active=true or public.is_org_member(organization_id) or public.is_platform_admin());
create policy menus_manage on public.menus for all using(public.is_org_member(organization_id) or public.is_platform_admin()) with check(public.is_org_member(organization_id) or public.is_platform_admin());
create policy sections_public_select on public.menu_sections for select using(exists(select 1 from public.menus m where m.id=menu_id and (m.active=true or public.is_org_member(m.organization_id) or public.is_platform_admin())));
create policy sections_manage on public.menu_sections for all using(exists(select 1 from public.menus m where m.id=menu_id and (public.is_org_member(m.organization_id) or public.is_platform_admin()))) with check(exists(select 1 from public.menus m where m.id=menu_id and (public.is_org_member(m.organization_id) or public.is_platform_admin())));
create policy items_public_select on public.menu_items for select using(exists(select 1 from public.menu_sections s join public.menus m on m.id=s.menu_id where s.id=section_id and (m.active=true or public.is_org_member(m.organization_id) or public.is_platform_admin())));
create policy items_manage on public.menu_items for all using(exists(select 1 from public.menu_sections s join public.menus m on m.id=s.menu_id where s.id=section_id and (public.is_org_member(m.organization_id) or public.is_platform_admin()))) with check(exists(select 1 from public.menu_sections s join public.menus m on m.id=s.menu_id where s.id=section_id and (public.is_org_member(m.organization_id) or public.is_platform_admin())));

create policy platform_admin_select on public.platform_admins for select using(auth.uid()=profile_id or public.is_platform_admin());

create or replace function public.get_public_person_engagement(share_token text)
returns jsonb language sql security definer set search_path=public as $$
  select jsonb_build_object(
    'person', jsonb_build_object('full_name', p.full_name, 'title', p.title, 'company', p.company),
    'events', coalesce(jsonb_agg(jsonb_build_object('event_type', e.event_type, 'target', e.target, 'created_at', e.created_at, 'metadata', e.metadata) order by e.created_at desc) filter (where e.id is not null), '[]'::jsonb)
  )
  from public.people p
  left join public.engagement_events e on e.person_id = p.id
  where p.engagement_share_token = share_token and p.status = 'active'
  group by p.id, p.full_name, p.title, p.company;
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,username,full_name) values(new.id, lower(regexp_replace(split_part(coalesce(new.email,'user'),'@',1),'[^a-zA-Z0-9_]+','-','g'))||'-'||substring(new.id::text,1,6), coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists profiles_updated_at on public.profiles; create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.touch_updated_at();
create or replace function public.protect_profile_role() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.role is distinct from old.role and not public.is_platform_admin() then
    raise exception 'Only a platform administrator can change profile roles';
  end if;
  return new;
end; $$;
drop trigger if exists profiles_role_protection on public.profiles;
create trigger profiles_role_protection before update on public.profiles for each row execute procedure public.protect_profile_role();

drop trigger if exists organizations_updated_at on public.organizations; create trigger organizations_updated_at before update on public.organizations for each row execute procedure public.touch_updated_at();
drop trigger if exists people_updated_at on public.people; create trigger people_updated_at before update on public.people for each row execute procedure public.touch_updated_at();
drop trigger if exists nfc_cards_updated_at on public.nfc_cards; create trigger nfc_cards_updated_at before update on public.nfc_cards for each row execute procedure public.touch_updated_at();
