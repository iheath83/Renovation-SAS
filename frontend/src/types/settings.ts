export interface UserSettings {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  avatar?: string;
  telephone?: string;
}

export interface ProjetSettings {
  id: string;
  nom: string;
  adresse?: string;
  budgetMax: number;
  dateDebut?: string;
  dateFin?: string;
  description?: string;
}

export interface CategorieCustom {
  id: string;
  nom: string;
  icon: string;
  color: string;
  type: 'depense' | 'materiau' | 'piece';
  isDefault?: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'auto';
  devise: string;
  langue: 'fr' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    alertesBudget: boolean;
    rappelsTaches: boolean;
  };
}

export const DEFAULT_USER: UserSettings = {
  id: 'user-1',
  nom: 'Arnaud',
  prenom: 'Jonathan',
  email: 'jonathan@renovation-sas.fr',
  telephone: '06 12 34 56 78',
};

export const DEFAULT_PROJET: ProjetSettings = {
  id: 'proj-1',
  nom: 'Rénovation Maison',
  adresse: '123 Rue de la Rénovation, 75000 Paris',
  budgetMax: 50000,
  dateDebut: '2024-01-01',
  dateFin: '2024-06-30',
  description: 'Rénovation complète de la maison principale',
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  devise: '€',
  langue: 'fr',
  notifications: {
    email: true,
    push: true,
    alertesBudget: true,
    rappelsTaches: true,
  },
};

export const ICONS_DISPONIBLES = [
  '📦', '👷', '🔧', '🚚', '📐', '📋', '🏠', '🛠️', '💡', '🎨', 
  '🪑', '🚿', '🍳', '🛏️', '🚽', '🪴', '🧱', '🪟', '🚪', '💧',
];

export const COLORS_DISPONIBLES = [
  { name: 'Bleu', value: 'blue' },
  { name: 'Vert', value: 'green' },
  { name: 'Orange', value: 'orange' },
  { name: 'Rouge', value: 'red' },
  { name: 'Violet', value: 'purple' },
  { name: 'Rose', value: 'pink' },
  { name: 'Teal', value: 'teal' },
  { name: 'Jaune', value: 'amber' },
  { name: 'Gris', value: 'slate' },
];

