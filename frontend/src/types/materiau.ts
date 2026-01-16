export type CategorieMateriau = 
  | 'PEINTURE'
  | 'CARRELAGE'
  | 'PARQUET'
  | 'PLOMBERIE'
  | 'ELECTRICITE'
  | 'MENUISERIE'
  | 'ISOLATION'
  | 'QUINCAILLERIE'
  | 'DECORATION'
  | 'AUTRE';

export type Unite = 'UNITE' | 'M2' | 'ML' | 'L' | 'KG' | 'ROULEAU' | 'PACK' | 'LOT';

export interface Materiau {
  id: string;
  projetId: string;
  nom: string;
  description?: string | null;
  categorie: CategorieMateriau;
  marque?: string | null;
  reference?: string | null;
  prixUnitaire?: number;
  unite: Unite;
  quantite?: number;
  lienMarchand?: string | null;
  image?: string | null;
  pieceIds?: string[];
  pieceNames?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMateriauInput {
  nom: string;
  description?: string;
  categorie: CategorieMateriau;
  marque?: string;
  reference?: string;
  prixUnitaire: number;
  unite: Unite;
  quantite: number;
  lienMarchand?: string;
  pieceIds?: string[];
}

export interface UpdateMateriauInput extends Partial<CreateMateriauInput> {}

export const CATEGORIE_LABELS: Record<CategorieMateriau, string> = {
  PEINTURE: 'Peinture',
  CARRELAGE: 'Carrelage',
  PARQUET: 'Parquet',
  PLOMBERIE: 'Plomberie',
  ELECTRICITE: 'Électricité',
  MENUISERIE: 'Menuiserie',
  ISOLATION: 'Isolation',
  QUINCAILLERIE: 'Quincaillerie',
  DECORATION: 'Décoration',
  AUTRE: 'Autre',
};

export const CATEGORIE_ICONS: Record<CategorieMateriau, string> = {
  PEINTURE: '🎨',
  CARRELAGE: '🧱',
  PARQUET: '🪵',
  PLOMBERIE: '🚿',
  ELECTRICITE: '⚡',
  MENUISERIE: '🚪',
  ISOLATION: '🧤',
  QUINCAILLERIE: '🔩',
  DECORATION: '🖼️',
  AUTRE: '📦',
};

export const CATEGORIE_COLORS: Record<CategorieMateriau, string> = {
  PEINTURE: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CARRELAGE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PARQUET: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  PLOMBERIE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ELECTRICITE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  MENUISERIE: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  ISOLATION: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  QUINCAILLERIE: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  DECORATION: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  AUTRE: 'bg-surface-500/20 text-tertiary border-surface-500/30',
};

export const UNITE_LABELS: Record<Unite, string> = {
  UNITE: 'unité',
  M2: 'm²',
  ML: 'ml',
  L: 'L',
  KG: 'kg',
  ROULEAU: 'rouleau',
  PACK: 'pack',
  LOT: 'lot',
};

