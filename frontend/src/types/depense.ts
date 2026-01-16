export type CategorieDepense = 
  | 'MATERIAU'
  | 'MAIN_OEUVRE'
  | 'OUTIL'
  | 'LIVRAISON'
  | 'ETUDE'
  | 'AUTRE';

export interface Depense {
  id: string;
  projetId: string;
  pieceId?: string | null;
  pieceName?: string | null;
  tacheId?: string | null;
  tacheName?: string | null;
  description: string;
  montant: number;
  categorie: CategorieDepense;
  dateDepense: string; // Date prévue ou réalisée
  datePrevue?: string | null; // Date prévue initiale (pour les dépenses prévues)
  factures: string[]; // URLs des factures
  fournisseur?: string | null;
  passeDansCredit: boolean;
  creditId?: string | null;
  estPrevue: boolean; // true = dépense prévue, false = dépense réalisée
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepenseInput {
  pieceId?: string | null;
  tacheId?: string | null;
  description: string;
  montant: number;
  categorie: CategorieDepense;
  dateDepense: string;
  fournisseur?: string;
  passeDansCredit?: boolean;
  creditId?: string;
  factures?: string[];
  estPrevue?: boolean;
}

export interface UpdateDepenseInput extends Partial<CreateDepenseInput> {}

export const CATEGORIE_DEPENSE_LABELS: Record<CategorieDepense, string> = {
  MATERIAU: 'Matériau',
  MAIN_OEUVRE: 'Main d\'œuvre',
  OUTIL: 'Outil / Location',
  LIVRAISON: 'Livraison',
  ETUDE: 'Étude / Plan',
  AUTRE: 'Autre',
};

export const CATEGORIE_DEPENSE_ICONS: Record<CategorieDepense, string> = {
  MATERIAU: '📦',
  MAIN_OEUVRE: '👷',
  OUTIL: '🔧',
  LIVRAISON: '🚚',
  ETUDE: '📐',
  AUTRE: '📋',
};

export const CATEGORIE_DEPENSE_COLORS: Record<CategorieDepense, string> = {
  MATERIAU: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MAIN_OEUVRE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  OUTIL: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  LIVRAISON: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ETUDE: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  AUTRE: 'bg-surface-500/20 text-tertiary border-surface-500/30',
};

