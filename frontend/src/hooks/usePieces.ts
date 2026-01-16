import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Piece, CreatePieceInput, UpdatePieceInput, TypePiece, StatutPiece } from '@/types/piece';

// Données de fallback si l'API n'est pas disponible
const FALLBACK_PIECES: Piece[] = [];

interface UsePiecesOptions {
  type?: TypePiece;
  statut?: StatutPiece;
  etage?: number;
  search?: string;
}

function filterPieces(pieces: Piece[], options: UsePiecesOptions): Piece[] {
  let filtered = [...pieces];

  if (options.type) {
    filtered = filtered.filter(p => p.type === options.type);
  }
  if (options.statut) {
    filtered = filtered.filter(p => p.statut === options.statut);
  }
  if (options.etage !== undefined) {
    filtered = filtered.filter(p => p.etage === options.etage);
  }
  if (options.search) {
    const search = options.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.tags?.some(t => t.toLowerCase().includes(search))
    );
  }

  return filtered;
}

export function usePieces(options: UsePiecesOptions = {}) {
  const projetId = api.getProjetId();
  
  return useQuery({
    queryKey: ['pieces', projetId, options],
    queryFn: async () => {
      if (!projetId) {
        return FALLBACK_PIECES;
      }
      try {
        const result = await api.getPieces();
        if (result.success && result.data) {
          // Transformer les données API en format Piece
          const pieces = (result.data as Array<Record<string, unknown>>).map((p) => ({
            id: p.id as string,
            projetId: p.projetId as string,
            name: p.name as string,
            type: p.type as TypePiece,
            etage: p.etage as number | undefined,
            surface: p.surface as number | undefined,
            budget: p.budget as number | undefined,
            statut: p.statut as StatutPiece,
            images: p.images as string[] | null,
            tags: (p.tags as string[]) || [],
            createdAt: p.createdAt as string,
            updatedAt: p.updatedAt as string,
            _count: p._count as { taches: number; materiaux: number; depenses: number },
          })) as Piece[];
          return filterPieces(pieces, options);
        }
        return FALLBACK_PIECES;
      } catch (error) {
        console.error('Error fetching pieces:', error);
        return FALLBACK_PIECES;
      }
    },
    staleTime: 30000,
    refetchOnMount: 'always',
    enabled: !!projetId,
  });
}

export function usePiece(id: string) {
  return useQuery({
    queryKey: ['piece', id],
    queryFn: async () => {
      const result = await api.getPieces();
      if (result.success && result.data) {
        const pieces = result.data as unknown[];
        const piece = pieces.find((p: unknown) => (p as Record<string, unknown>).id === id);
        return piece as Piece | null;
      }
      return null;
    },
    enabled: !!id,
  });
}

export function usePieceDepense(_pieceId: string) {
  // TODO: Calculer depuis les vraies dépenses
  return 0;
}

export function useCreatePiece() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePieceInput) => {
      const result = await api.createPiece({
        name: data.name,
        type: data.type || 'AUTRE',
        etage: data.etage,
        surface: data.surface,
        budget: data.budget,
        statut: data.statut || 'A_FAIRE',
        tags: data.tags || [],
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création');
      }
      
      return result.data as Piece;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] });
    },
  });
}

export function useUpdatePiece() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePieceInput }) => {
      const result = await api.updatePiece(id, data);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la mise à jour');
      }
      
      return result.data as Piece;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] });
    },
  });
}

export function useDeletePiece() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deletePiece(id);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces'] });
    },
  });
}
