import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Tache, CreateTacheInput, UpdateTacheInput, StatutTache } from '@/types/tache';

interface UseTachesOptions {
  pieceId?: string;
  statut?: StatutTache;
  search?: string;
}

// Transformer les données API en format Tache
function transformApiTache(t: Record<string, unknown>): Tache {
  const sousTaches = (t.sousTaches as Array<Record<string, unknown>> || []).map(st => ({
    id: st.id as string,
    tacheId: st.tacheId as string,
    titre: st.title as string,
    fait: st.completed as boolean,
    ordre: st.ordre as number,
    createdAt: st.createdAt as string,
    updatedAt: st.updatedAt as string,
  }));

  return {
    id: t.id as string,
    projetId: t.projetId as string,
    pieceId: t.pieceId as string | null,
    pieceName: (t.piece as Record<string, unknown>)?.name as string || null,
    titre: t.title as string,
    description: t.description as string | undefined,
    statut: t.statut as StatutTache,
    priorite: t.priorite as Tache['priorite'],
    dateDebut: t.dateDebut ? (t.dateDebut as string).split('T')[0] : undefined,
    dateFin: t.dateFin ? (t.dateFin as string).split('T')[0] : undefined,
    coutEstime: t.coutEstime as number | undefined,
    coutReel: t.coutReel as number | undefined,
    ordre: 0,
    sousTaches,
    dependances: [],
    createdAt: t.createdAt as string,
    updatedAt: t.updatedAt as string,
  };
}

export function useTaches(options: UseTachesOptions = {}) {
  const projetId = api.getProjetId();
  
  return useQuery({
    queryKey: ['taches', projetId, options],
    queryFn: async () => {
      if (!projetId) return [];
      try {
        const result = await api.getTaches();
        if (result.success && result.data) {
          let taches = (result.data as unknown[]).map(t => transformApiTache(t as Record<string, unknown>));
          
          // Filtrer côté client
          if (options.pieceId) {
            taches = taches.filter(t => t.pieceId === options.pieceId);
          }
          if (options.statut) {
            taches = taches.filter(t => t.statut === options.statut);
          }
          if (options.search) {
            const search = options.search.toLowerCase();
            taches = taches.filter(t => 
              t.titre.toLowerCase().includes(search) ||
              t.description?.toLowerCase().includes(search)
            );
          }
          return taches;
        }
        return [];
      } catch (error) {
        console.error('Error fetching taches:', error);
        return [];
      }
    },
    staleTime: 30000,
    refetchOnMount: 'always',
    enabled: !!projetId,
  });
}

export function useTache(id: string) {
  return useQuery({
    queryKey: ['tache', id],
    queryFn: async () => {
      const result = await api.getTaches();
      if (result.success && result.data) {
        const taches = result.data as unknown[];
        const tache = taches.find((t: unknown) => (t as Record<string, unknown>).id === id);
        return tache ? transformApiTache(tache as Record<string, unknown>) : null;
      }
      return null;
    },
    enabled: !!id,
  });
}

export function useCreateTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTacheInput) => {
      const result = await api.createTache({
        title: data.titre,
        description: data.description,
        statut: data.statut || 'A_FAIRE',
        priorite: data.priorite || 'MOYENNE',
        dateDebut: data.dateDebut ? new Date(data.dateDebut).toISOString() : null,
        dateFin: data.dateFin ? new Date(data.dateFin).toISOString() : null,
        coutEstime: data.coutEstime,
        pieceId: data.pieceId,
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création');
      }
      
      return transformApiTache(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taches'] });
    },
  });
}

export function useUpdateTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTacheInput }) => {
      const apiData: Record<string, unknown> = {};
      if (data.titre !== undefined) apiData.title = data.titre;
      if (data.description !== undefined) apiData.description = data.description;
      if (data.statut !== undefined) apiData.statut = data.statut;
      if (data.priorite !== undefined) apiData.priorite = data.priorite;
      if (data.dateDebut !== undefined) apiData.dateDebut = data.dateDebut ? new Date(data.dateDebut).toISOString() : null;
      if (data.dateFin !== undefined) apiData.dateFin = data.dateFin ? new Date(data.dateFin).toISOString() : null;
      if (data.coutEstime !== undefined) apiData.coutEstime = data.coutEstime;
      if (data.pieceId !== undefined) apiData.pieceId = data.pieceId;

      const result = await api.updateTache(id, apiData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la mise à jour');
      }
      
      return transformApiTache(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taches'] });
    },
  });
}

export function useDeleteTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deleteTache(id);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taches'] });
    },
  });
}

export function useMoveTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      tacheId, 
      newStatut, 
    }: { 
      tacheId: string; 
      newStatut: StatutTache; 
      newOrdre: number;
    }) => {
      const result = await api.updateTache(tacheId, { statut: newStatut });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors du déplacement');
      }
      
      return transformApiTache(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taches'] });
    },
  });
}

export function useToggleSousTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tacheId, sousTacheId }: { tacheId: string; sousTacheId: string }) => {
      // Récupérer la sous-tâche actuelle pour connaître son état
      const tachesResult = await api.getTaches();
      if (!tachesResult.success || !tachesResult.data) {
        throw new Error('Erreur lors de la récupération des tâches');
      }
      
      const taches = tachesResult.data as Array<Record<string, unknown>>;
      const tache = taches.find(t => t.id === tacheId);
      if (!tache) throw new Error('Tâche non trouvée');
      
      const sousTaches = tache.sousTaches as Array<Record<string, unknown>>;
      const sousTache = sousTaches.find(st => st.id === sousTacheId);
      if (!sousTache) throw new Error('Sous-tâche non trouvée');
      
      const newCompleted = !sousTache.completed;
      
      const result = await api.updateSousTache(tacheId, sousTacheId, { completed: newCompleted });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la mise à jour');
      }
      
      // Refetch la tâche mise à jour
      return transformApiTache(tache as Record<string, unknown>);
    },
    onSuccess: (_, { tacheId }) => {
      queryClient.invalidateQueries({ queryKey: ['taches'] });
      queryClient.invalidateQueries({ queryKey: ['tache', tacheId] });
    },
  });
}

export function useAddSousTache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tacheId, titre }: { tacheId: string; titre: string }) => {
      const result = await api.createSousTache(tacheId, { title: titre });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création');
      }
      
      return result.data;
    },
    onSuccess: (_, { tacheId }) => {
      queryClient.invalidateQueries({ queryKey: ['taches'] });
      queryClient.invalidateQueries({ queryKey: ['tache', tacheId] });
    },
  });
}
