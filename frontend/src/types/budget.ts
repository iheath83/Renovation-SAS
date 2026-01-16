export interface BudgetProjet {
  budgetMax: number;
  totalDepense: number;
  totalPrevu: number;
  totalRestant: number;
  pourcentageUtilise: number;
  dansCredit: number;
  horsCredit: number;
}

export interface BudgetPiece {
  pieceId: string;
  pieceName: string;
  budgetAlloue: number;
  depense: number;
  prevu: number;
  restant: number;
  pourcentage: number;
  variance: number;
  isOverBudget: boolean;
}

export interface BudgetCategorie {
  categorie: string;
  label: string;
  montant: number;
  pourcentage: number;
  color: string;
  [key: string]: string | number;
}

export interface AlerteBudget {
  id: string;
  type: 'DEPASSEMENT' | 'ATTENTION' | 'INFO';
  message: string;
  pieceId?: string;
  pieceName?: string;
  montant?: number;
}

export const ALERT_COLORS: Record<AlerteBudget['type'], string> = {
  DEPASSEMENT: 'bg-red-500/20 border-red-500/30 text-red-400',
  ATTENTION: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
  INFO: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
};

export const ALERT_ICONS: Record<AlerteBudget['type'], string> = {
  DEPASSEMENT: '🚨',
  ATTENTION: '⚠️',
  INFO: 'ℹ️',
};

