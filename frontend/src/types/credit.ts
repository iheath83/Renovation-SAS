export interface Deblocage {
  id: string;
  creditId: string;
  montant: number;
  dateDeblocage: string;
  description?: string | null;
  justificatifs: string[]; // URLs des fichiers
  createdAt: string;
  updatedAt: string;
}

export interface Credit {
  id: string;
  projetId: string;
  nom: string;
  organisme: string;
  montantTotal: number;
  tauxInteret?: number;
  dureeRemboursement?: number; // en mois
  dateDebut?: string | null;
  mensualite?: number | null;
  deblocages: Deblocage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditInput {
  nom: string;
  organisme: string;
  montantTotal: number;
  tauxInteret: number;
  dureeRemboursement: number;
  dateDebut?: string;
  mensualite?: number;
}

export interface UpdateCreditInput extends Partial<CreateCreditInput> {}

export interface CreateDeblocageInput {
  montant: number;
  dateDeblocage: string;
  description?: string;
  justificatifs?: string[];
}

export interface CreditStats {
  totalCredits: number;
  totalDebloque: number;
  totalRestantADebloquer: number;
  totalMensualites: number;
  nombreCredits: number;
}

