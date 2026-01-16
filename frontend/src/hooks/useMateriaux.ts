import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Materiau, CreateMateriauInput, UpdateMateriauInput, CategorieMateriau } from '@/types/materiau';

interface UseMateriauOptions {
  categorie?: CategorieMateriau;
  pieceId?: string;
  search?: string;
}

function transformApiMateriau(m: Record<string, unknown>): Materiau {
  const pieces = (m.pieces as Array<Record<string, unknown>>) || [];
  
  return {
    id: m.id as string,
    projetId: m.projetId as string,
    nom: m.name as string,
    description: m.notes as string | undefined,
    categorie: m.categorie as CategorieMateriau,
    marque: m.fournisseur as string | undefined,
    reference: m.reference as string | undefined,
    prixUnitaire: m.prixUnitaire as number | undefined,
    unite: m.unite as Materiau['unite'],
    quantite: 1, // TODO: récupérer depuis MateriauPiece
    lienMarchand: m.lienMarchand as string | undefined,
    image: m.image as string | null,
    pieceIds: pieces.map(p => (p.piece as Record<string, unknown>)?.id as string),
    pieceNames: pieces.map(p => (p.piece as Record<string, unknown>)?.name as string),
    createdAt: m.createdAt as string,
    updatedAt: m.updatedAt as string,
  };
}

export function useMateriaux(options: UseMateriauOptions = {}) {
  const projetId = api.getProjetId();
  
  return useQuery({
    queryKey: ['materiaux', projetId, options],
    queryFn: async () => {
      if (!projetId) return [];
      try {
        const result = await api.getMateriaux();
        if (result.success && result.data) {
          let materiaux = (result.data as unknown[]).map(m => transformApiMateriau(m as Record<string, unknown>));
          
          // Filtrer côté client
          if (options.categorie) {
            materiaux = materiaux.filter(m => m.categorie === options.categorie);
          }
          if (options.pieceId) {
            materiaux = materiaux.filter(m => m.pieceIds?.includes(options.pieceId!));
          }
          if (options.search) {
            const search = options.search.toLowerCase();
            materiaux = materiaux.filter(m =>
              m.nom.toLowerCase().includes(search) ||
              m.description?.toLowerCase().includes(search) ||
              m.reference?.toLowerCase().includes(search)
            );
          }
          
          return materiaux;
        }
        return [];
      } catch (error) {
        console.error('Error fetching materiaux:', error);
        return [];
      }
    },
    staleTime: 30000,
    refetchOnMount: 'always',
    enabled: !!projetId,
  });
}

export function useMateriau(id: string) {
  return useQuery({
    queryKey: ['materiau', id],
    queryFn: async () => {
      const result = await api.getMateriaux();
      if (result.success && result.data) {
        const materiaux = result.data as unknown[];
        const materiau = materiaux.find((m: unknown) => (m as Record<string, unknown>).id === id);
        return materiau ? transformApiMateriau(materiau as Record<string, unknown>) : null;
      }
      return null;
    },
    enabled: !!id,
  });
}

export function useCreateMateriau() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMateriauInput) => {
      const result = await api.createMateriau({
        name: data.nom,
        notes: data.description,
        categorie: data.categorie,
        fournisseur: data.marque,
        reference: data.reference,
        prixUnitaire: data.prixUnitaire,
        unite: data.unite,
        lienMarchand: data.lienMarchand,
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création');
      }
      
      return transformApiMateriau(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiaux'] });
    },
  });
}

export function useUpdateMateriau() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMateriauInput }) => {
      const apiData: Record<string, unknown> = {};
      if (data.nom !== undefined) apiData.name = data.nom;
      if (data.description !== undefined) apiData.notes = data.description;
      if (data.categorie !== undefined) apiData.categorie = data.categorie;
      if (data.marque !== undefined) apiData.fournisseur = data.marque;
      if (data.reference !== undefined) apiData.reference = data.reference;
      if (data.prixUnitaire !== undefined) apiData.prixUnitaire = data.prixUnitaire;
      if (data.unite !== undefined) apiData.unite = data.unite;
      if (data.lienMarchand !== undefined) apiData.lienMarchand = data.lienMarchand;

      const result = await api.updateMateriau(id, apiData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la mise à jour');
      }
      
      return transformApiMateriau(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiaux'] });
    },
  });
}

export function useDeleteMateriau() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deleteMateriau(id);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiaux'] });
    },
  });
}

export function useMateriauStats() {
  const { data: materiaux = [] } = useMateriaux();

  const totalCout = materiaux.reduce((sum, m) => {
    return sum + (m.prixUnitaire || 0) * (m.quantite || 1);
  }, 0);

  const byCategorie = materiaux.reduce((acc, m) => {
    acc[m.categorie] = (acc[m.categorie] || 0) + 1;
    return acc;
  }, {} as Record<CategorieMateriau, number>);

  return {
    count: materiaux.length,
    totalCout,
    byCategorie,
  };
}
