import { type UserRole, type PostCategory, type SubCategory } from './types';

// Check if user is admin
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

// Check if user is ondernemer
export function isOndernemer(role: UserRole): boolean {
  return role === 'ondernemer';
}

// Check if user is werkzoekende
export function isWerkzoekende(role: UserRole): boolean {
  return role === 'werkzoekende';
}

// Check if user is particulier
export function isParticulier(role: UserRole): boolean {
  return role === 'particulier';
}

// Check if category is admin-only
export function isAdminOnlyCategory(category: PostCategory): boolean {
  return category === 'diensten';
}

// Get allowed categories for a user role
export function getAllowedCategories(role: UserRole): PostCategory[] {
  const allCategories: PostCategory[] = [
    'vacatures',
    'ondernemers',
    'vraag_aanbod',
    'evenementen',
    'samen_reizen',
    'diensten',
  ];

  if (role === 'admin') {
    return allCategories;
  }

  if (role === 'ondernemer') {
    return ['vacatures', 'ondernemers'];
  }

  if (role === 'particulier') {
    return ['vraag_aanbod', 'evenementen', 'samen_reizen'];
  }

  if (role === 'werkzoekende') {
    return ['vraag_aanbod', 'evenementen', 'samen_reizen'];
  }

  return [];
}

// Get allowed subcategories for a category
export function getAllowedSubcategories(category: PostCategory): SubCategory[] {
  if (category === 'vraag_aanbod') {
    return [
      'auto',
      'meubels',
      'kleding',
      'computers',
      'telefoons',
      'tv',
      'speelgoed',
      'kinder_baby',
    ];
  }
  return [];
}

// Format price
export function formatPrice(price?: number): string {
  if (price === undefined || price === null) return 'Prijs op aanvraag';
  return `€${price.toFixed(2)}`;
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
