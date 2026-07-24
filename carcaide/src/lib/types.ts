// User roles
export type UserRole = 'admin' | 'ondernemer' | 'particulier' | 'werkzoekende';

// Post categories
export type PostCategory = 
  | 'vacatures'
  | 'ondernemers'
  | 'vraag_aanbod'
  | 'evenementen'
  | 'samen_reizen'
  | 'diensten';

// Subcategories for vraag_aanbod
export type SubCategory = 
  | 'auto'
  | 'meubels'
  | 'kleding'
  | 'computers'
  | 'telefoons'
  | 'tv'
  | 'speelgoed'
  | 'kinder_baby';

// Post type
export interface Post {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: PostCategory;
  subcategory?: SubCategory;
  price?: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  user?: {
    name: string;
    profile_picture?: string;
    phone?: string;
  };
  media?: Media[];
}

// Media type
export interface Media {
  id: string;
  post_id: string;
  url: string;
  type: 'image' | 'video';
}

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  website?: string;
  social_media?: string;
  profile_picture?: string;
  is_approved: boolean;
  created_at: string;
}

// Business profile type
export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  cover_photo_url?: string;
  website?: string;
  phone?: string;
  social_media?: string;
}

// Business ad type
export interface BusinessAd {
  id: string;
  business_profile_id: string;
  title: string;
  description?: string;
  media_url: string;
  is_active: boolean;
}

// Comment type
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    name: string;
    profile_picture?: string;
  };
}

// Category configuration
export const categories: { value: PostCategory; label: string; icon: string; subcategories?: { value: SubCategory; label: string }[] }[] = [
  {
    value: 'vacatures',
    label: 'Vacatures',
    icon: '💼',
  },
  {
    value: 'ondernemers',
    label: 'Ondernemers',
    icon: '🏢',
  },
  {
    value: 'vraag_aanbod',
    label: 'Vraag & Aanbod',
    icon: '🛍️',
    subcategories: [
      { value: 'auto', label: 'Auto\'s' },
      { value: 'meubels', label: 'Meubels' },
      { value: 'kleding', label: 'Kleding' },
      { value: 'computers', label: 'Computers' },
      { value: 'telefoons', label: 'Telefoons' },
      { value: 'tv', label: 'TV\'s' },
      { value: 'speelgoed', label: 'Speelgoed' },
      { value: 'kinder_baby', label: 'Kinder & Baby' },
    ],
  },
  {
    value: 'evenementen',
    label: 'Evenementen',
    icon: '🎉',
  },
  {
    value: 'samen_reizen',
    label: 'Samen Reizen',
    icon: '🚗',
  },
];

// Admin-only category
export const adminOnlyCategory: PostCategory = 'diensten';

// Admin services subcategories
export const adminServices: { value: string; label: string }[] = [
  { value: 'financiering', label: 'Financiering' },
  { value: 'woning_aankoop', label: 'Woning Aankoop' },
  { value: 'woning_verkoop', label: 'Woning Verkoop' },
  { value: 'vakantiewoning_verhuur', label: 'Verhuur Vakantiewoningen' },
];
