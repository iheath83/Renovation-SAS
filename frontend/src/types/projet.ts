export interface Projet {
  id: string;
  name: string;
  description: string | null;
  adresse?: string | null;
  budgetMax?: number | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  users: {
    role: string;
  }[];
  _count: {
    pieces: number;
    taches: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjetInput {
  name: string;
  description?: string;
  adresse?: string;
  budgetMax?: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface UpdateProjetInput extends Partial<CreateProjetInput> {}
