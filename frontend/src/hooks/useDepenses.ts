import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Depense, CreateDepenseInput, UpdateDepenseInput, CategorieDepense } from '@/types/depense';

interface UseDepensesOptions {
  categorie?: CategorieDepense;
  pieceId?: string;
  passeDansCredit?: boolean;
  search?: string;
  estPrevue?: boolean;
}

function transformApiDepense(d: Record<string, unknown>): Depense {
  return {
    id: d.id as string,
    projetId: d.projetId as string,
    pieceId: d.pieceId as string | null || null,
    pieceName: (d.piece as Record<string, unknown> | null)?.name as string || null,
    tacheId: d.tacheId as string | null || null,
    tacheName: (d.tache as Record<string, unknown> | null)?.title as string || null,
    description: d.description as string || '',
    montant: d.montant as number,
    categorie: d.categorie as CategorieDepense,
    dateDepense: (d.dateDepense as string)?.split('T')[0] || '',
    factures: (d.factures as string[]) || [],
    fournisseur: d.fournisseur as string | null || null,
    passeDansCredit: d.passeDansCredit as boolean,
    creditId: d.deblocageId as string | undefined,
    estPrevue: (d.estPrevue as boolean) || false,
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
  };
}

export function useDepenses(options: UseDepensesOptions = {}) {
  const projetId = api.getProjetId();
  
  return useQuery({
    queryKey: ['depenses', projetId, options],
    queryFn: async () => {
      if (!projetId) return [];
      try {
        const result = await api.getDepenses();
        if (result.success && result.data) {
          let depenses = (result.data as unknown[]).map(d => transformApiDepense(d as Record<string, unknown>));
          
          // Filtrer côté client
          if (options.categorie) {
            depenses = depenses.filter(d => d.categorie === options.categorie);
          }
          if (options.pieceId) {
            depenses = depenses.filter(d => d.pieceId === options.pieceId);
          }
          if (options.passeDansCredit !== undefined) {
            depenses = depenses.filter(d => d.passeDansCredit === options.passeDansCredit);
          }
          if (options.estPrevue !== undefined) {
            depenses = depenses.filter(d => d.estPrevue === options.estPrevue);
          }
          if (options.search) {
            const search = options.search.toLowerCase();
            depenses = depenses.filter(d =>
              d.description.toLowerCase().includes(search) ||
              d.fournisseur?.toLowerCase().includes(search) ||
              d.pieceName?.toLowerCase().includes(search)
            );
          }
          
          return depenses.sort((a, b) => new Date(b.dateDepense).getTime() - new Date(a.dateDepense).getTime());
        }
        return [];
      } catch (error) {
        console.error('Error fetching depenses:', error);
        return [];
      }
    },
    staleTime: 30000,
    refetchOnMount: 'always',
    enabled: !!projetId,
  });
}

export function useCreateDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDepenseInput) => {
      const result = await api.createDepense({
        description: data.description,
        montant: data.montant,
        categorie: data.categorie,
        dateDepense: new Date(data.dateDepense).toISOString(),
        passeDansCredit: data.passeDansCredit || false,
        estPrevue: data.estPrevue || false,
        pieceId: data.pieceId,
        tacheId: data.tacheId,
        factures: data.factures,
        fournisseur: data.fournisseur,
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création');
      }
      
      return transformApiDepense(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
    },
  });
}

export function useUpdateDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDepenseInput }) => {
      const apiData: Record<string, unknown> = {};
      if (data.description !== undefined) apiData.description = data.description;
      if (data.montant !== undefined) apiData.montant = data.montant;
      if (data.categorie !== undefined) apiData.categorie = data.categorie;
      if (data.dateDepense !== undefined) apiData.dateDepense = new Date(data.dateDepense).toISOString();
      if (data.passeDansCredit !== undefined) apiData.passeDansCredit = data.passeDansCredit;
      if (data.estPrevue !== undefined) apiData.estPrevue = data.estPrevue;
      if (data.pieceId !== undefined) apiData.pieceId = data.pieceId;
      if (data.tacheId !== undefined) apiData.tacheId = data.tacheId;
      if (data.factures !== undefined) apiData.factures = data.factures;
      if (data.fournisseur !== undefined) apiData.fournisseur = data.fournisseur;

      const result = await api.updateDepense(id, apiData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la mise à jour');
      }
      
      return transformApiDepense(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
    },
  });
}

export function useDeleteDepense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deleteDepense(id);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
    },
  });
}

export function useDepensesStats() {
  const { data: depensesRealisees = [] } = useDepenses({ estPrevue: false });
  const { data: depensesPrevues = [] } = useDepenses({ estPrevue: true });

  const totalRealisees = depensesRealisees.reduce((sum, d) => sum + d.montant, 0);
  const totalPrevues = depensesPrevues.reduce((sum, d) => sum + d.montant, 0);

  const dansCredit = depensesRealisees.filter(d => d.passeDansCredit).reduce((sum, d) => sum + d.montant, 0);
  const horsCredit = totalRealisees - dansCredit;

  const byCategorieRealisees = depensesRealisees.reduce((acc, d) => {
    acc[d.categorie] = (acc[d.categorie] || 0) + d.montant;
    return acc;
  }, {} as Record<CategorieDepense, number>);

  const byCategoriePrevues = depensesPrevues.reduce((acc, d) => {
    acc[d.categorie] = (acc[d.categorie] || 0) + d.montant;
    return acc;
  }, {} as Record<CategorieDepense, number>);

  return {
    countRealisees: depensesRealisees.length,
    countPrevues: depensesPrevues.length,
    totalRealisees,
    totalPrevues,
    totalGlobal: totalRealisees + totalPrevues,
    dansCredit,
    horsCredit,
    byCategorieRealisees,
    byCategoriePrevues,
  };
}
