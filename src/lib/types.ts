// Types des tables Supabase (voir supabase/migrations).

export type MemberRole = "member" | "admin";
export type MemberStatus = "active" | "suspended";

export type Profile = {
  id: string;
  slug: string;
  email: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  company: string | null;
  sector: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  phone: string | null;
  show_email: boolean;
  show_phone: boolean;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
};

// Vue public.member_directory : coordonnées déjà masquées selon les préférences du membre.
export type DirectoryMember = Pick<
  Profile,
  | "id"
  | "slug"
  | "first_name"
  | "last_name"
  | "job_title"
  | "company"
  | "sector"
  | "bio"
  | "photo_url"
  | "linkedin_url"
  | "website_url"
  | "created_at"
> & { email: string | null; phone: string | null };

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company: string;
  job_title: string;
  organization_type: string | null;
  sector: string | null;
  linkedin_url: string | null;
  motivation: string | null;
  referral: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profile_id: string | null;
  created_at: string;
};

export type PostCategory = "decryptage" | "tribune" | "interview" | "actu" | "agenda";
export type PostVisibility = "public" | "members";
export type PublishStatus = "draft" | "published";

export type Post = {
  id: string;
  slug: string;
  category: PostCategory;
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_url: string | null;
  video_url: string | null;
  author_name: string | null;
  author_title: string | null;
  event_date: string | null;
  location: string | null;
  external_url: string | null;
  visibility: PostVisibility;
  status: PublishStatus;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

// Vue public.post_teasers : tout sauf le contenu, visible par tous.
export type PostTeaser = Pick<
  Post,
  | "id"
  | "slug"
  | "category"
  | "title"
  | "excerpt"
  | "cover_url"
  | "video_url"
  | "author_name"
  | "author_title"
  | "event_date"
  | "location"
  | "external_url"
  | "visibility"
  | "published_at"
>;

export type ClubEvent = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_url: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  address: string | null;
  capacity: number | null;
  registration_open: boolean;
  status: PublishStatus;
  created_at: string;
  updated_at: string;
};

export type EventPhoto = {
  id: string;
  event_id: string;
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
};

export type RegistrationStatus = "registered" | "waitlist" | "cancelled";

export type EventRegistration = {
  id: string;
  event_id: string;
  profile_id: string;
  status: RegistrationStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  position: number;
  created_at: string;
};

// État renvoyé par les formulaires (useActionState).
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  // Valeurs saisies, pour ré-afficher le formulaire après une erreur.
  values?: Record<string, string>;
} | null;
