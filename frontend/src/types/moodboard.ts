export interface Moodboard {
  id: string;
  projetId: string;
  nom: string;
  description?: string | null;
  pieceIds: string[];
  ideeIds: string[];
  materiauIds: string[];
  palette: string[]; // Hex colors
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoodboardInput {
  nom: string;
  description?: string;
  pieceIds?: string[];
  ideeIds?: string[];
  materiauIds?: string[];
  palette?: string[];
  coverImage?: string;
}

export interface UpdateMoodboardInput extends Partial<CreateMoodboardInput> {}

export interface MoodboardStats {
  total: number;
  totalIdees: number;
  totalMateriaux: number;
  uniqueColors: number;
}

