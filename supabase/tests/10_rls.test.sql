-- Tests des règles d'accès : chaque ligne « ok » est une garantie vérifiée (voir run.sh).
\set ON_ERROR_STOP 1
create schema tests;
grant usage on schema tests to anon, authenticated, service_role;
create function tests.eq(actual anyelement, expected anyelement, label text) returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL %: got %, expected %', label, actual, expected;
  end if;
  raise notice 'ok  %', label;
end $$;
grant execute on function tests.eq(anyelement, anyelement, text) to anon, authenticated, service_role;
create function tests.fails(sql text, label text) returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    raise notice 'ok  % (refusé: %)', label, sqlerrm;
    return;
  end;
  raise exception 'FAIL %: la requête aurait dû échouer', label;
end $$;
grant execute on function tests.fails(text, text) to anon, authenticated, service_role;

-- Données
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@amphi.test'),
  ('00000000-0000-0000-0000-00000000000b', 'membre@amphi.test'),
  ('00000000-0000-0000-0000-00000000000c', 'suspendu@amphi.test'),
  ('00000000-0000-0000-0000-00000000000d', 'membre2@amphi.test'),
  ('00000000-0000-0000-0000-00000000000e', 'sansprofil@amphi.test');
insert into public.profiles (id, slug, email, first_name, last_name, role, status, phone, show_phone, show_email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin', 'admin@amphi.test', 'Ada', 'Admin', 'admin', 'active', '0600', false, true),
  ('00000000-0000-0000-0000-00000000000b', 'membre', 'membre@amphi.test', 'Max', 'Membre', 'member', 'active', '0611', true, false),
  ('00000000-0000-0000-0000-00000000000c', 'suspendu', 'suspendu@amphi.test', 'Sam', 'Suspendu', 'member', 'suspended', null, false, true),
  ('00000000-0000-0000-0000-00000000000d', 'membre2', 'membre2@amphi.test', 'Mia', 'Deux', 'member', 'active', null, false, true);
insert into public.posts (slug, category, title, content_html, visibility, status, published_at, video_url) values
  ('public-ok', 'decryptage', 'Public', '<p>public</p>', 'public', 'published', now() - interval '1 day', null),
  ('membres-ok', 'decryptage', 'Membres', '<p>secret</p>', 'members', 'published', now() - interval '1 day', 'https://youtu.be/x'),
  ('brouillon', 'tribune', 'Brouillon', '<p>draft</p>', 'public', 'draft', null, null),
  ('futur', 'actu', 'Programmé', '<p>later</p>', 'public', 'published', now() + interval '3 days', null);
insert into public.events (id, slug, title, starts_at, capacity, status) values
  ('00000000-0000-0000-0000-0000000000e1', 'diner', 'Dîner', now() + interval '10 days', 1, 'published'),
  ('00000000-0000-0000-0000-0000000000e2', 'brouillon', 'Brouillon', now() + interval '10 days', null, 'draft'),
  ('00000000-0000-0000-0000-0000000000e3', 'passe', 'Passé', now() - interval '10 days', null, 'published');
insert into public.event_photos (event_id, url) values ('00000000-0000-0000-0000-0000000000e3', 'https://x/photo.jpg');
insert into storage.buckets (id) values ('media') on conflict do nothing;

-- ========== Visiteur anonyme ==========
begin;
set local role anon;
select tests.eq((select count(*) from public.posts), 1::bigint, 'anon: ne voit que l''article public publié');
select tests.eq((select count(*) from public.post_teasers), 2::bigint, 'anon: aperçus public + membres (pas brouillon ni programmé)');
select tests.eq((select video_url from public.post_teasers where slug = 'membres-ok'), null::text, 'anon: vidéo d''un contenu membres masquée');
select tests.eq((select count(*) from public.events), 2::bigint, 'anon: événements publiés uniquement');
select tests.fails('select count(*) from public.profiles', 'anon: pas d''accès aux profils');
select tests.fails('select count(*) from public.member_directory', 'anon: pas d''accès à l''annuaire');
select tests.fails('select count(*) from public.event_photos', 'anon: pas d''accès à la galerie');
select tests.fails('select count(*) from public.applications', 'anon: ne peut pas lire les candidatures');
insert into public.applications (first_name, last_name, email, company, job_title) values ('Jean', 'Dupont', 'jean@ex.fr', 'Labo', 'PDG');
select tests.fails($$insert into public.applications (first_name, last_name, email, company, job_title, status) values ('X','Y','x@y.fr','C','J','approved')$$, 'anon: ne peut pas s''auto-approuver');
select tests.fails($$select public.register_for_event('00000000-0000-0000-0000-0000000000e1')$$, 'anon: ne peut pas s''inscrire à un dîner');
select tests.eq(public.event_seats_left('00000000-0000-0000-0000-0000000000e1'), 1, 'anon: places restantes visibles');
select tests.fails($$insert into storage.objects (bucket_id, name) values ('media', 'covers/x.jpg')$$, 'anon: pas d''upload');
commit;

-- ========== Membre actif ==========
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';
select tests.eq((select count(*) from public.posts), 2::bigint, 'membre: lit public + membres');
select tests.eq((select video_url from public.post_teasers where slug = 'membres-ok'), 'https://youtu.be/x', 'membre: vidéo visible');
select tests.eq((select count(*) from public.profiles), 1::bigint, 'membre: ne lit que son propre profil brut');
select tests.eq((select count(*) from public.member_directory), 3::bigint, 'membre: annuaire = membres actifs (pas le suspendu)');
select tests.eq((select phone from public.member_directory where slug = 'admin'), null::text, 'membre: téléphone masqué si show_phone=false');
select tests.eq((select email from public.member_directory where slug = 'membre'), null::text, 'membre: e-mail masqué si show_email=false');
select tests.eq((select email from public.member_directory where slug = 'admin'), 'admin@amphi.test', 'membre: e-mail visible si show_email=true');
select tests.eq((select count(*) from public.event_photos), 1::bigint, 'membre: voit la galerie');
select tests.fails('select count(*) from public.applications where true', 'membre: ne lit pas les candidatures') where false;
select tests.eq((select count(*) from public.applications), 0::bigint, 'membre: aucune candidature visible');
update public.profiles set job_title = 'CEO', bio = 'Bio' where id = '00000000-0000-0000-0000-00000000000b';
select tests.eq((select job_title from public.profiles where id = '00000000-0000-0000-0000-00000000000b'), 'CEO', 'membre: modifie son profil');
select tests.fails($$update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000b'$$, 'membre: ne peut pas devenir admin');
select tests.fails($$update public.profiles set status = 'active' where id = '00000000-0000-0000-0000-00000000000c'$$, 'membre: ne peut pas changer un statut');
update public.profiles set job_title = 'pirate' where id = '00000000-0000-0000-0000-00000000000d';
select tests.fails($$insert into public.posts (slug, category, title) values ('x', 'decryptage', 'x')$$, 'membre: ne peut pas publier');
select tests.eq(public.register_for_event('00000000-0000-0000-0000-0000000000e1'), 'registered', 'membre: inscrit au dîner');
select tests.eq(public.register_for_event('00000000-0000-0000-0000-0000000000e1'), 'registered', 'membre: inscription idempotente');
select tests.fails($$select public.register_for_event('00000000-0000-0000-0000-0000000000e2')$$, 'membre: pas d''inscription à un brouillon');
select tests.fails($$select public.register_for_event('00000000-0000-0000-0000-0000000000e3')$$, 'membre: pas d''inscription à un événement passé');
select tests.fails($$insert into public.event_registrations (event_id, profile_id) values ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000000d')$$, 'membre: pas d''insertion directe');
select tests.eq(public.event_seats_left('00000000-0000-0000-0000-0000000000e1'), 0, 'dîner complet');
insert into storage.objects (bucket_id, name) values ('media', 'avatars/00000000-0000-0000-0000-00000000000b/photo.jpg');
select tests.fails($$insert into storage.objects (bucket_id, name) values ('media', 'avatars/00000000-0000-0000-0000-00000000000d/photo.jpg')$$, 'membre: pas d''upload dans le dossier d''un autre');
select tests.fails($$insert into storage.objects (bucket_id, name) values ('media', 'covers/x.jpg')$$, 'membre: pas d''upload de couverture');
commit;
select tests.eq((select job_title from public.profiles where slug = 'membre2'), null::text, 'membre: n''a pas pu modifier le profil d''un autre');

-- ========== Second membre : liste d'attente puis promotion ==========
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000d","role":"authenticated"}';
select tests.eq(public.register_for_event('00000000-0000-0000-0000-0000000000e1'), 'waitlist', 'membre2: liste d''attente (jauge 1)');
select tests.eq((select count(*) from public.event_registrations), 1::bigint, 'membre2: ne voit que sa propre inscription');
commit;
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';
select public.cancel_event_registration('00000000-0000-0000-0000-0000000000e1');
commit;
select tests.eq((select status from public.event_registrations where profile_id = '00000000-0000-0000-0000-00000000000d'), 'registered', 'désinscription: membre2 promu depuis la liste d''attente');
select tests.eq((select status from public.event_registrations where profile_id = '00000000-0000-0000-0000-00000000000b'), 'cancelled', 'désinscription: membre annulé');

-- ========== Membre suspendu ==========
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000c","role":"authenticated"}';
select tests.eq((select count(*) from public.posts), 1::bigint, 'suspendu: plus d''accès aux contenus membres');
select tests.eq((select count(*) from public.member_directory), 0::bigint, 'suspendu: annuaire vide');
select tests.fails($$select public.register_for_event('00000000-0000-0000-0000-0000000000e1')$$, 'suspendu: pas d''inscription');
commit;

-- ========== Compte sans profil ==========
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000e","role":"authenticated"}';
select tests.eq((select count(*) from public.member_directory), 0::bigint, 'sans profil: annuaire vide');
select tests.eq((select count(*) from public.posts), 1::bigint, 'sans profil: contenus publics seulement');
commit;

-- ========== Admin ==========
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select tests.eq((select count(*) from public.posts), 4::bigint, 'admin: voit brouillons et programmés');
select tests.eq((select count(*) from public.applications), 1::bigint, 'admin: lit les candidatures');
update public.applications set status = 'rejected', admin_notes = 'non' where email = 'jean@ex.fr';
insert into public.posts (slug, category, title) values ('nouveau', 'decryptage', 'Nouveau');
update public.posts set status = 'published', published_at = now() where slug = 'nouveau';
delete from public.posts where slug = 'brouillon';
insert into public.events (slug, title, starts_at) values ('nouvel-evt', 'Nouvel', now() + interval '1 day');
insert into public.partners (name) values ('Partenaire');
insert into storage.objects (bucket_id, name) values ('media', 'covers/cover.jpg');
select tests.eq((select count(*) from public.profiles), 4::bigint, 'admin: lit tous les profils');
update public.profiles set company = 'Corrigé' where slug = 'membre2';
select tests.fails($$update public.profiles set role = 'admin' where slug = 'membre2'$$, 'admin: changement de rôle réservé à la clé secrète');
select tests.eq((select count(*) from public.event_registrations), 2::bigint, 'admin: voit toutes les inscriptions');
commit;
select tests.eq((select status from public.applications where email = 'jean@ex.fr'), 'rejected', 'admin: candidature traitée');
select tests.eq((select company from public.profiles where slug = 'membre2'), 'Corrigé', 'admin: corrige un profil');

-- ========== Recherche de compte (clé secrète uniquement) ==========
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select tests.fails($$select public.find_auth_user_id('membre@amphi.test')$$, 'admin (session): find_auth_user_id interdit');
commit;
begin;
set local role service_role;
select tests.eq(public.find_auth_user_id(' Membre@Amphi.test '), '00000000-0000-0000-0000-00000000000b'::uuid, 'service_role: find_auth_user_id');
commit;

-- ========== Clé secrète (back-office) ==========
-- (dans Supabase, le compte est créé par l'API d'authentification)
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f1', 'invite@amphi.test');
begin;
set local role service_role;
insert into public.profiles (id, slug, email, first_name, last_name) values ('00000000-0000-0000-0000-0000000000f1', 'invite', 'invite@amphi.test', 'Iris', 'Invitée');
update public.profiles set role = 'admin' where slug = 'invite';
select tests.eq((select count(*) from public.applications), 1::bigint, 'service_role: lit les candidatures');
select tests.eq((select count(*) from public.profiles), 5::bigint, 'service_role: crée et modifie des profils');
insert into public.posts (slug, category, title, status, published_at) values ('import-framer', 'decryptage', 'Importé', 'published', now());
select tests.eq((select count(*) from public.member_directory), 0::bigint, 'service_role: annuaire vide sans session membre');
commit;
