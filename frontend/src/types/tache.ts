export type StatutTache = 'A_FAIRE' | 'EN_COURS' | 'EN_ATTENTE' | 'TERMINE';
export type Priorite = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';

export interface SousTache {
  id: string;
  tacheId: string;
  titre: string;
  fait: boolean;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tache {
  id: string;
  projetId: string;
  pieceId?: string | null;
  pieceName?: string | null;
  titre: string;
  description?: string | null;
  statut: StatutTache;
  priorite: Priorite;
  dateDebut?: string | null;
  dateFin?: string | null;
  coutEstime?: number | null;
  coutReel?: number | null;
  ordre: number;
  sousTaches: SousTache[];
  dependances?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateTacheInput {
  pieceId?: string | null;
  titre: string;
  description?: string;
  statut?: StatutTache;
  priorite?: Priorite;
  dateDebut?: string;
  dateFin?: string;
  coutEstime?: number;
}

export interface UpdateTacheInput extends Partial<CreateTacheInput> {
  ordre?: number;
  coutReel?: number;
}

export const STATUT_TACHE_LABELS: Record<StatutTache, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  EN_ATTENTE: 'En attente',
  TERMINE: 'Terminé',
};

export const STATUT_TACHE_COLORS: Record<StatutTache, string> = {
  A_FAIRE: 'surface',
  EN_COURS: 'primary',
  EN_ATTENTE: 'accent',
  TERMINE: 'green',
};

export const PRIORITE_LABELS: Record<Priorite, string> = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  URGENTE: 'Urgente',
};

export const PRIORITE_COLORS: Record<Priorite, string> = {
  BASSE: 'text-tertiary',
  MOYENNE: 'text-blue-400',
  HAUTE: 'text-orange-400',
  URGENTE: 'text-red-400',
};

export const KANBAN_COLUMNS: StatutTache[] = ['A_FAIRE', 'EN_COURS', 'EN_ATTENTE', 'TERMINE'];

