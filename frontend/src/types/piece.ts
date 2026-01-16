export type TypePiece = 
  | 'SALON' 
  | 'CUISINE' 
  | 'CHAMBRE' 
  | 'SDB' 
  | 'WC' 
  | 'BUREAU' 
  | 'COULOIR' 
  | 'GARAGE' 
  | 'EXTERIEUR' 
  | 'AUTRE';

export type StatutPiece = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

export interface Piece {
  id: string;
  projetId: string;
  name: string;
  type: TypePiece;
  etage?: number | null;
  surface?: number | null;
  budget?: number | null;
  statut: StatutPiece;
  images?: string[] | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    taches: number;
    materiaux: number;
    depenses: number;
  };
}

export interface CreatePieceInput {
  name: string;
  type?: TypePiece;
  etage?: number;
  surface?: number;
  budget?: number;
  statut?: StatutPiece;
  tags?: string[];
  images?: string[];
}

export interface UpdatePieceInput extends Partial<CreatePieceInput> {}

export const TYPE_PIECE_LABELS: Record<TypePiece, string> = {
  SALON: 'Salon',
  CUISINE: 'Cuisine',
  CHAMBRE: 'Chambre',
  SDB: 'Salle de bain',
  WC: 'WC',
  BUREAU: 'Bureau',
  COULOIR: 'Couloir',
  GARAGE: 'Garage',
  EXTERIEUR: 'Extérieur',
  AUTRE: 'Autre',
};

export const STATUT_PIECE_LABELS: Record<StatutPiece, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
};

export const TYPE_PIECE_ICONS: Record<TypePiece, string> = {
  SALON: '🛋️',
  CUISINE: '🍳',
  CHAMBRE: '🛏️',
  SDB: '🚿',
  WC: '🚽',
  BUREAU: '💼',
  COULOIR: '🚪',
  GARAGE: '🚗',
  EXTERIEUR: '🌳',
  AUTRE: '📦',
};

