export interface IdeePinterest {
  id: string;
  projetId: string;
  url: string;
  titre?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  tags: string[];
  couleurs?: any; // JSON field
  materiaux?: any; // JSON field
  style?: string | null;
  notes?: string | null;
  moodboardIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIdeeInput {
  url: string;
  titre?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  couleurs?: any;
  materiaux?: any;
  style?: string;
  notes?: string;
}

export interface UpdateIdeeInput extends Partial<CreateIdeeInput> {
  moodboardIds?: string[];
}

export interface AIExtractionResult {
  titre: string;
  description: string;
  tags: string[];
  couleurs: string[];
  imageUrl: string;
}

