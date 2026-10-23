# L'Amphi — site du club des leaders en santé

Refonte de [amphi-sante.com](https://www.amphi-sante.com) (anciennement sur Framer) en site autonome :

- **Site public** : accueil, Le Club, À propos, Décryptages, La Plume (tribunes, interviews, agenda), Actus du club (vidéos), Événements de l'Amphi.
  Les adresses reprennent celles du site Framer (`/decryptage-list/…`, `/la-plume`, `/videos-club-list`, `/agenda-list/…`, `/evenements-de-amphi/…`, `/annuaire-des-membres/…`) pour conserver le référencement et les liens déjà partagés.
- **Adhésion** : formulaire « Devenir membre » → examen par le comité dans le back-office → en un clic, le compte est créé et le membre reçoit une invitation pour choisir son mot de passe.
- **Espace membre** : tableau de bord, annuaire des membres (recherche, filtre par secteur), fiche membre, modification de son profil (photo, coordonnées, visibilité e-mail / téléphone), inscription aux dîners avec jauge et liste d'attente, galerie photos des soirées, contenus réservés aux membres.
- **Back-office** (`/admin`) : candidatures, membres (invitation directe, suspension, droits admin, renvoi du lien de mot de passe), articles avec éditeur de texte (copier-coller depuis Word ou Google Docs, images, vidéos YouTube / Vimeo, brouillon, publication programmée, réservé aux membres), événements (inscrits, export Excel, photos), partenaires.

## Coûts

| Service | Rôle | Offre gratuite |
| --- | --- | --- |
| [Supabase](https://supabase.com) | Base de données, comptes membres, images | 500 Mo de données, 1 Go d'images, 50 000 utilisateurs actifs / mois |
| [Resend](https://resend.com) | Envoi des e-mails (invitations, mots de passe) | 3 000 e-mails / mois, 100 / jour |
| Hébergement du site | Next.js | Voir ci-dessous |

**Hébergement.** L'offre gratuite de Vercel (Hobby) est réservée à un usage **non commercial** ; un club professionnel relève plutôt de l'offre Pro (20 $/mois). Alternatives compatibles Next.js : [Netlify](https://www.netlify.com), dont l'offre gratuite n'est pas limitée à l'usage personnel (vérifiez leurs conditions du moment), ou un petit serveur (`npm run build && npm start`). Le code ne dépend d'aucun hébergeur.

**À savoir.** Un projet Supabase gratuit est mis en pause après 7 jours sans aucune activité (il suffit de le relancer depuis le tableau de bord). Les visites régulières du site suffisent à l'éviter.

## Mise en ligne, pas à pas

### 1. Supabase (base de données et comptes)

1. Créez un compte sur [supabase.com](https://supabase.com), puis un projet (région **Europe**, par exemple Paris ou Francfort).
2. **SQL Editor** → *New query* → collez le contenu de [`supabase/migrations/20261023000000_init.sql`](supabase/migrations/20261023000000_init.sql) → *Run*.
3. **Authentication → Sign In / Providers** : désactivez *Allow new users to sign up* (les comptes ne sont créés que par invitation).
4. **Authentication → URL Configuration** :
   - *Site URL* : `https://www.amphi-sante.com`
   - *Redirect URLs* : ajoutez `https://www.amphi-sante.com/**` (et `http://localhost:3000/**` pour travailler en local).
5. **Authentication → Emails → SMTP Settings** : branchez Resend (étape 2). **Obligatoire** : sans SMTP personnalisé, Supabase n'envoie des e-mails qu'aux membres de votre équipe Supabase, 2 par heure.
6. **Authentication → Emails → Templates** : remplacez les modèles par ceux du dossier [`supabase/templates`](supabase/templates) (invitation, réinitialisation du mot de passe, lien de connexion). Ils sont en français et protègent les liens contre les antivirus de messagerie (Outlook, Defender…) qui les « cliquent » avant le destinataire.
7. **Project Settings → API Keys** : notez l'URL du projet, la clé *publishable* et la clé *secret*.

### 2. Resend (e-mails)

1. Créez un compte sur [resend.com](https://resend.com) et ajoutez le domaine `amphi-sante.com` (quelques enregistrements DNS à copier chez votre registrar).
2. Créez une clé d'API.
3. Dans Supabase → *SMTP Settings* : hôte `smtp.resend.com`, port `465`, utilisateur `resend`, mot de passe = la clé d'API, expéditeur `contact@amphi-sante.com`, nom `L'Amphi`.
4. La même clé dans `RESEND_API_KEY` active les notifications du site (nouvelle candidature pour l'équipe, accusé de réception au candidat, e-mail de refus facultatif).

### 3. Hébergement

Importez le dépôt GitHub chez l'hébergeur (Vercel ou Netlify : *Add new project* → choisir le dépôt), puis renseignez les variables d'environnement décrites dans [`.env.example`](.env.example) :

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clé *publishable* |
| `SUPABASE_SECRET_KEY` | clé *secret* (ne jamais la diffuser) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.amphi-sante.com` |
| `RESEND_API_KEY` | clé Resend (facultatif mais conseillé) |
| `EMAIL_FROM` | `L'Amphi <contact@amphi-sante.com>` |
| `ADMIN_NOTIFICATION_EMAIL` | adresse(s) prévenue(s) à chaque candidature, séparées par des virgules |

Enfin, reliez le domaine `amphi-sante.com` au projet (section *Domains* de l'hébergeur) et retirez-le de Framer.

### 4. Premier administrateur

**Le plus simple (sans rien installer)** : Supabase → *Authentication → Users → Add user → Send invitation*, saisissez votre e-mail, puis dans *SQL Editor* :

```sql
insert into public.profiles (id, slug, email, first_name, last_name, role)
select id, 'prenom-nom', email, 'Prénom', 'Nom', 'admin'
from auth.users where email = 'vous@amphi-sante.com';
```

Cliquez sur le lien reçu par e-mail, choisissez votre mot de passe : le back-office est accessible sur `/admin` (lien « Back-office » dans l'espace membre).

**En ligne de commande** : `npm run create-admin -- --email vous@amphi-sante.com --first-name Prénom --last-name Nom`

### 5. Reprendre les contenus et les membres de Framer

Dans Framer : **CMS** → ouvrez une collection (Décryptages, Annuaire des membres…) → menu **…** → **Export CSV**.

```bash
npm install
cp .env.example .env.local   # puis renseignez les clés Supabase

# Aperçu (n'écrit rien) : vérifiez les colonnes reconnues
npm run import:framer -- --file decryptages.csv --type posts --category decryptage

# Import réel, en recopiant les images hébergées chez Framer dans Supabase
npm run import:framer -- --file decryptages.csv --type posts --category decryptage --apply --copy-images
```

- `--category` : `decryptage`, `tribune`, `interview`, `actu` (vidéos) ou `agenda`.
- Si une colonne n'est pas reconnue : `--map title=Titre,content=Corps de texte`.
- `--visibility members` réserve tous les contenus importés aux membres.
- Les adresses (slugs) Framer sont conservées ; relancer l'import met à jour les contenus existants.

Membres :

```bash
npm run import:framer -- --file membres.csv --type members                 # aperçu
npm run import:framer -- --file membres.csv --type members --apply --copy-images
```

Les comptes sont créés sans mot de passe et sans e-mail. Pour les prévenir, ajoutez `--send-links` (chaque membre reçoit un lien pour choisir son mot de passe ; attention au plafond de 100 e-mails / jour de Resend gratuit), ou laissez-les utiliser « Mot de passe oublié ». Les mots de passe Framer ne peuvent pas être repris.

## Au quotidien

**Publier un article** : Back-office → *Articles* → *+ Nouvel article* → choisir la rubrique → titre, chapô, image de couverture, texte (copier-coller possible depuis Word / Google Docs ; boutons pour titres, listes, citations, liens, images) → *Publié* → *Enregistrer*. Une date de publication future programme la mise en ligne ; « Réservé aux membres » affiche un cadenas aux visiteurs.

**Valider une candidature** : un e-mail prévient l'équipe → Back-office → *Candidatures* → *Accepter* : le compte est créé et l'invitation envoyée. *Refuser* peut envoyer un message courtois au candidat.

**Organiser un dîner** : *Événements* → *+ Nouvel événement* (date, lieu, nombre de places). Les membres s'inscrivent depuis la page de l'événement ; au-delà de la jauge, ils passent en liste d'attente et sont promus automatiquement si une place se libère. Liste des inscrits exportable pour Excel ; les photos ajoutées après la soirée forment la galerie réservée aux membres.

**Textes fixes** (équipe, avantages, critères d'adhésion, adresse de contact) : [`src/content/site.ts`](src/content/site.ts).
**Couleurs et polices** : en tête de [`src/app/globals.css`](src/app/globals.css).
**Logo** : déposez `public/logo.svg` et suivez l'indication dans [`src/components/logo.tsx`](src/components/logo.tsx).
**Mentions légales** : complétez les informations entre crochets dans `src/app/(site)/mentions-legales/page.tsx`.

## Développement

```bash
npm install
npm run dev        # http://localhost:3000
```

Sans variables Supabase, le site démarre en **mode démonstration** (contenus d'exemple, sans comptes) : pratique pour retoucher le design.

| Commande | Rôle |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript |
| `npm run build` | Build de production |
| `./supabase/tests/run.sh` | Tests des règles d'accès sur un PostgreSQL local (`PGHOST`, `PGUSER`…) |

### Architecture

- **Next.js 16** (App Router, Server Actions), **Tailwind CSS 4**, éditeur **Tiptap**.
- **Supabase** : authentification (invitation, mot de passe, lien magique), PostgreSQL, stockage des images.
- **Sécurité dans la base** (Row Level Security), pas seulement dans l'interface : un visiteur ne peut ni lire l'annuaire ni le contenu d'un article réservé ; un membre ne peut modifier que son propre profil (jamais son rôle) ; seuls les admins publient ; les coordonnées masquées par un membre ne sortent jamais de la base. Ces règles sont couvertes par `supabase/tests`.

```
src/app/(site)/          pages publiques et espace membre
src/app/(site)/(membre)/ espace membre, annuaire (connexion requise)
src/app/admin/           back-office
src/app/auth/            liens reçus par e-mail, déconnexion
src/lib/                 accès aux données, sécurité, utilitaires
src/content/site.ts      textes fixes du site
supabase/                schéma SQL, modèles d'e-mails, tests
scripts/                 import Framer, création d'un admin
```
