export interface CompteBancaire {
  id: string;
  projetId: string;
  userId: string;
  powensItemId: string;
  banque: string;
  derniereSynchronisation: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  transactions?: TransactionBancaire[];
  _count?: {
    transactions: number;
  };
}

export interface TransactionBancaire {
  id: string;
  compteBancaireId: string;
  powensTransactionId: string;
  montant: number;
  description: string;
  dateTransaction: string;
  categorie: string | null;
  estDepenseRenovation: boolean;
  depenseId: string | null;
  statut: 'NOUVEAU' | 'IGNORE' | 'CONVERTI';
  metadata: any;
  createdAt: string;
  updatedAt: string;
  compteBancaire?: {
    id: string;
    banque: string;
    projetId: string;
  };
  depense?: {
    id: string;
    montant: number;
    description: string | null;
    categorie: string | null;
  };
  suggestion?: {
    categorie: string | null;
    confidence: number;
  };
}

export interface CreateDepenseFromTransactionInput {
  categorie?: string;
  pieceId?: string;
  tacheId?: string;
  materiauId?: string;
  passeDansCredit?: boolean;
}

export interface TransactionStats {
  NOUVEAU: {
    count: number;
    total: number;
  };
  IGNORE: {
    count: number;
    total: number;
  };
  CONVERTI: {
    count: number;
    total: number;
  };
}

