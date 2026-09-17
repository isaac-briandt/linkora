export type Profile = {
  id: string;
  username: string;
  full_name?: string | null;
  title: string;
  company: string;
  bio: string;
  avatar_url: string;
  cover_image_url: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  x_url: string;
  tiktok: string;
  github: string;
  whatsapp: string;
};
export type Organization = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
};
export type NfcCard = {
  id: string;
  card_uid: string;
  status: string;
  label: string | null;
  destination_type: string;
  profile_id: string | null;
  organization_id: string | null;
  person_id: string | null;
};
