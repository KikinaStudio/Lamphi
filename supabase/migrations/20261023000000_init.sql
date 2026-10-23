-- =============================================================================
-- L'Amphi — schéma initial
-- Membres, candidatures, contenus (décryptages, La Plume, actus, agenda),
-- événements (dîners), inscriptions, partenaires, stockage des médias.
--
-- À exécuter une seule fois dans Supabase : SQL Editor > New query > coller > Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Utilitaires
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profils membres (1 ligne par compte, liée à auth.users)
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  email text not null,
  first_name text not null default '' check (char_length(first_name) <= 100),
  last_name text not null default '' check (char_length(last_name) <= 100),
  job_title text check (char_length(job_title) <= 200),
  company text check (char_length(company) <= 200),
  sector text check (char_length(sector) <= 100),
  bio text check (char_length(bio) <= 3000),
  photo_url text,
  linkedin_url text,
  website_url text,
  phone text check (char_length(phone) <= 40),
  show_email boolean not null default true,
  show_phone boolean not null default false,
  role text not null default 'member' check (role in ('member', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Fonctions d'autorisation (security definer : lisent profiles sans repasser par la RLS)
create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and status = 'active' and role = 'admin'
  );
$$;

grant execute on function public.is_active_member() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Un membre ne peut modifier que ses informations publiques : ni le rôle, ni le
-- statut, ni le slug, ni l'e-mail. Ces champs passent par le back-office (clé secrète).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (
  first_name, last_name, job_title, company, sector, bio, photo_url,
  linkedin_url, website_url, phone, show_email, show_phone
) on public.profiles to authenticated;

-- Annuaire : uniquement pour les membres actifs, coordonnées masquées selon les préférences.
create view public.member_directory as
  select
    id, slug, first_name, last_name, job_title, company, sector, bio,
    photo_url, linkedin_url, website_url,
    case when show_email then email end as email,
    case when show_phone then phone end as phone,
    created_at
  from public.profiles
  where status = 'active' and public.is_active_member();

revoke all on public.member_directory from anon, authenticated;
grant select on public.member_directory to authenticated;

-- -----------------------------------------------------------------------------
-- Candidatures (formulaire « Devenir membre »)
-- -----------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 320),
  phone text check (char_length(phone) <= 40),
  company text not null check (char_length(company) between 1 and 200),
  job_title text not null check (char_length(job_title) between 1 and 200),
  organization_type text check (char_length(organization_type) <= 100),
  sector text check (char_length(sector) <= 100),
  linkedin_url text check (char_length(linkedin_url) <= 500),
  motivation text check (char_length(motivation) <= 5000),
  referral text check (char_length(referral) <= 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index applications_status_idx on public.applications (status, created_at desc);

alter table public.applications enable row level security;

-- Tout le monde peut déposer une candidature, personne ne peut la relire sauf les admins.
create policy "applications_insert_public" on public.applications
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and admin_notes is null
    and reviewed_at is null
    and reviewed_by is null
    and profile_id is null
  );

create policy "applications_admin_all" on public.applications
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.applications from anon, authenticated;
grant insert on public.applications to anon, authenticated;
grant select, update, delete on public.applications to authenticated;

-- -----------------------------------------------------------------------------
-- Contenus : décryptages, tribunes / interviews (La Plume), actus vidéo, agenda
-- -----------------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 1 and 200),
  category text not null check (category in ('decryptage', 'tribune', 'interview', 'actu', 'agenda')),
  title text not null check (char_length(title) between 1 and 300),
  excerpt text check (char_length(excerpt) <= 1000),
  content_html text not null default '',
  cover_url text,
  video_url text,
  author_name text,
  author_title text,
  event_date date,
  location text,
  external_url text,
  visibility text not null default 'public' check (visibility in ('public', 'members')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_listing_idx on public.posts (category, status, published_at desc);

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- Le contenu complet d'un article « membres » n'est lisible que par les membres actifs.
create policy "posts_select_published" on public.posts
  for select to anon, authenticated
  using (
    (
      status = 'published'
      and published_at <= now()
      and (visibility = 'public' or public.is_active_member())
    )
    or public.is_admin()
  );

create policy "posts_admin_insert" on public.posts
  for insert to authenticated with check (public.is_admin());
create policy "posts_admin_update" on public.posts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "posts_admin_delete" on public.posts
  for delete to authenticated using (public.is_admin());

revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;

-- Aperçus publics (titre, chapô, visuel) — y compris des articles réservés aux membres,
-- pour pouvoir les afficher dans les listes avec un cadenas. Jamais le contenu.
create view public.post_teasers as
  select
    id, slug, category, title, excerpt, cover_url,
    case when visibility = 'public' or public.is_active_member() then video_url end as video_url,
    author_name, author_title, event_date, location, external_url,
    visibility, published_at
  from public.posts
  where status = 'published' and published_at <= now();

revoke all on public.post_teasers from anon, authenticated;
grant select on public.post_teasers to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Événements de l'Amphi (dîners, soirées) + galerie photos + inscriptions
-- -----------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 1 and 200),
  title text not null check (char_length(title) between 1 and 300),
  excerpt text check (char_length(excerpt) <= 1000),
  content_html text not null default '',
  cover_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  address text,
  capacity integer check (capacity is null or capacity > 0),
  registration_open boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events (status, starts_at);

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;

create policy "events_select_published" on public.events
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy "events_admin_insert" on public.events
  for insert to authenticated with check (public.is_admin());
create policy "events_admin_update" on public.events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "events_admin_delete" on public.events
  for delete to authenticated using (public.is_admin());

revoke all on public.events from anon, authenticated;
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;

create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  url text not null,
  caption text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index event_photos_event_idx on public.event_photos (event_id, position);

alter table public.event_photos enable row level security;

create policy "event_photos_select_members" on public.event_photos
  for select to authenticated
  using (public.is_active_member());
create policy "event_photos_admin_insert" on public.event_photos
  for insert to authenticated with check (public.is_admin());
create policy "event_photos_admin_update" on public.event_photos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "event_photos_admin_delete" on public.event_photos
  for delete to authenticated using (public.is_admin());

revoke all on public.event_photos from anon, authenticated;
grant select, insert, update, delete on public.event_photos to authenticated;

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'registered' check (status in ('registered', 'waitlist', 'cancelled')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create index event_registrations_event_idx on public.event_registrations (event_id, status, created_at);

create trigger event_registrations_updated_at
  before update on public.event_registrations
  for each row execute function public.set_updated_at();

alter table public.event_registrations enable row level security;

-- Les membres voient leurs inscriptions ; ils s'inscrivent / se désinscrivent via les fonctions ci-dessous.
create policy "event_registrations_select_self_or_admin" on public.event_registrations
  for select to authenticated
  using (profile_id = (select auth.uid()) or public.is_admin());
create policy "event_registrations_admin_update" on public.event_registrations
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "event_registrations_admin_delete" on public.event_registrations
  for delete to authenticated using (public.is_admin());

revoke all on public.event_registrations from anon, authenticated;
grant select, update, delete on public.event_registrations to authenticated;

-- Inscription : place confirmée tant qu'il reste de la place, sinon liste d'attente.
create or replace function public.register_for_event(p_event_id uuid, p_note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_event public.events%rowtype;
  v_current text;
  v_taken integer;
  v_status text;
begin
  if v_uid is null or not public.is_active_member() then
    raise exception 'Inscription réservée aux membres actifs' using errcode = '42501';
  end if;

  -- Verrouille l'événement pour que deux inscriptions simultanées ne dépassent pas la jauge.
  select * into v_event from public.events
    where id = p_event_id and status = 'published'
    for update;
  if not found then
    raise exception 'Événement introuvable' using errcode = 'P0002';
  end if;
  if not v_event.registration_open or v_event.starts_at < now() then
    raise exception 'Les inscriptions sont closes pour cet événement' using errcode = 'P0001';
  end if;

  select status into v_current from public.event_registrations
    where event_id = p_event_id and profile_id = v_uid;
  if v_current in ('registered', 'waitlist') then
    return v_current;
  end if;

  select count(*) into v_taken from public.event_registrations
    where event_id = p_event_id and status = 'registered';

  v_status := case
    when v_event.capacity is not null and v_taken >= v_event.capacity then 'waitlist'
    else 'registered'
  end;

  insert into public.event_registrations (event_id, profile_id, status, note)
    values (p_event_id, v_uid, v_status, left(p_note, 500))
    on conflict (event_id, profile_id)
    -- created_at remis à zéro : une réinscription repasse en fin de liste d'attente.
    do update set status = excluded.status, note = excluded.note, created_at = now();

  return v_status;
end;
$$;

-- Désinscription : libère la place et fait monter la première personne en liste d'attente.
create or replace function public.cancel_event_registration(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_previous text;
begin
  if v_uid is null then
    raise exception 'Connexion requise' using errcode = '42501';
  end if;

  perform 1 from public.events where id = p_event_id for update;

  select status into v_previous from public.event_registrations
    where event_id = p_event_id and profile_id = v_uid;
  if v_previous is null or v_previous = 'cancelled' then
    return;
  end if;

  update public.event_registrations set status = 'cancelled'
    where event_id = p_event_id and profile_id = v_uid;

  if v_previous = 'registered' then
    update public.event_registrations set status = 'registered'
      where id = (
        select id from public.event_registrations
        where event_id = p_event_id and status = 'waitlist'
        order by created_at
        limit 1
      );
  end if;
end;
$$;

-- Places restantes (null = jauge illimitée).
create or replace function public.event_seats_left(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when e.capacity is null then null
    else greatest(e.capacity - (
      select count(*) from public.event_registrations r
      where r.event_id = e.id and r.status = 'registered'
    ), 0)::integer
  end
  from public.events e
  where e.id = p_event_id and e.status = 'published';
$$;

revoke execute on function public.register_for_event(uuid, text) from public, anon;
revoke execute on function public.cancel_event_registration(uuid) from public, anon;
grant execute on function public.register_for_event(uuid, text) to authenticated;
grant execute on function public.cancel_event_registration(uuid) to authenticated;
grant execute on function public.event_seats_left(uuid) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Partenaires (logos de la page d'accueil)
-- -----------------------------------------------------------------------------

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  logo_url text,
  website_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.partners enable row level security;

create policy "partners_select_all" on public.partners
  for select to anon, authenticated using (true);
create policy "partners_admin_insert" on public.partners
  for insert to authenticated with check (public.is_admin());
create policy "partners_admin_update" on public.partners
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "partners_admin_delete" on public.partners
  for delete to authenticated using (public.is_admin());

revoke all on public.partners from anon, authenticated;
grant select on public.partners to anon, authenticated;
grant insert, update, delete on public.partners to authenticated;

-- -----------------------------------------------------------------------------
-- Stockage des images (bucket public « media »)
--   covers/…, events/…, partners/…  → admins
--   avatars/<id du membre>/…        → le membre lui-même
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "media_member_avatar_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and public.is_active_member()
  );
create policy "media_member_avatar_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- -----------------------------------------------------------------------------
-- Back-office : retrouver un compte existant à partir de son e-mail
-- (clé secrète uniquement, utilisé lors de la validation d'une candidature)
-- -----------------------------------------------------------------------------

create or replace function public.find_auth_user_id(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke execute on function public.find_auth_user_id(text) from public, anon, authenticated;
grant execute on function public.find_auth_user_id(text) to service_role;

-- -----------------------------------------------------------------------------
-- Droits explicites pour la clé secrète (back-office, scripts d'import).
-- Les projets Supabase récents n'accordent plus ces droits automatiquement.
-- -----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant execute on all functions in schema public to service_role;
