import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Credit, Deblocage, CreateCreditInput, UpdateCreditInput, CreateDeblocageInput, CreditStats } from '@/types/credit';

function transformApiDeblocage(d: Record<string, unknown>): Deblocage {
  return {
    id: d.id as string,
    creditId: d.creditId as string,
    montant: d.montant as number,
    dateDeblocage: (d.dateDeblocage as string)?.split('T')[0] || '',
    description: d.notes as string | undefined,
    justificatifs: (d.justificatifs as string[]) || [],
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
  };
}

function transformApiCredit(c: Record<string, unknown>): Credit {
  const deblocages = (c.deblocages as Array<Record<string, unknown>> || []).map(transformApiDeblocage);
  
  return {
    id: c.id as string,
    projetId: c.projetId as string,
    nom: c.banque as string,
    organisme: c.banque as string,
    montantTotal: c.montantTotal as number,
    tauxInteret: c.tauxInteret as number | undefined,
    dureeRemboursement: c.duree as number | undefined,
    dateDebut: undefined,
    mensualite: undefined,
    deblocages,
    createdAt: c.createdAt as string,
    updatedAt: c.updatedAt as string,
  };
}

export function useCredits() {
  const projetId = api.getProjetId();
  
  return useQuery({
    queryKey: ['credits', projetId],
    queryFn: async () => {
      if (!projetId) return [];
      try {
        const result = await api.getCredits();
        if (result.success && result.data) {
          return (result.data as unknown[]).map(c => transformApiCredit(c as Record<string, unknown>));
        }
        return [];
      } catch (error) {
        console.error('Error fetching credits:', error);
        return [];
      }
    },
    staleTime: 30000,
    refetchOnMount: 'always',
    enabled: !!projetId,
  });
}

export function useCredit(id: string) {
  return useQuery({
    queryKey: ['credit', id],
    queryFn: async () => {
      const result = await api.getCredits();
      if (result.success && result.data) {
        const credits = result.data as unknown[];
        const credit = credits.find((c: unknown) => (c as Record<string, unknown>).id === id);
        return credit ? transformApiCredit(credit as Record<string, unknown>) : null;
      }
      return null;
    },
    enabled: !!id,
  });
}

export function useCreateCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCreditInput) => {
      const result = await api.createCredit({
        banque: data.organisme,
        montantTotal: data.montantTotal,
        tauxInteret: data.tauxInteret,
        duree: data.dureeRemboursement,
        notes: data.nom,
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création');
      }
      
      return transformApiCredit(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}

export function useUpdateCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCreditInput }) => {
      const apiData: Record<string, unknown> = {};
      if (data.organisme !== undefined) apiData.banque = data.organisme;
      if (data.montantTotal !== undefined) apiData.montantTotal = data.montantTotal;
      if (data.tauxInteret !== undefined) apiData.tauxInteret = data.tauxInteret;
      if (data.dureeRemboursement !== undefined) apiData.duree = data.dureeRemboursement;

      const result = await api.updateCredit(id, apiData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la mise à jour');
      }
      
      return transformApiCredit(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}

export function useDeleteCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deleteCredit(id);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}

export function useCreateDeblocage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creditId, data }: { creditId: string; data: CreateDeblocageInput }) => {
      const result = await api.createDeblocage(creditId, {
        montant: data.montant,
        dateDeblocage: new Date(data.dateDeblocage).toISOString(),
        notes: data.description,
        justificatifs: data.justificatifs,
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la création');
      }
      
      return transformApiDeblocage(result.data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}

interface SingleCreditStats {
  montantTotal: number;
  montantDebloque: number;
  montantRestant: number;
  pourcentageDebloque: number;
  nombreDeblocages: number;
}

// Stats pour un crédit individuel
export function useCreditStats(credit?: Credit): SingleCreditStats {
  if (!credit) {
    return {
      montantTotal: 0,
      montantDebloque: 0,
      montantRestant: 0,
      pourcentageDebloque: 0,
      nombreDeblocages: 0,
    };
  }

  const montantTotal = credit.montantTotal;
  const montantDebloque = credit.deblocages.reduce((sum, d) => sum + d.montant, 0);
  const montantRestant = montantTotal - montantDebloque;
  const pourcentageDebloque = montantTotal > 0 ? Math.round((montantDebloque / montantTotal) * 100) : 0;
  const nombreDeblocages = credit.deblocages.length;

  return {
    montantTotal,
    montantDebloque,
    montantRestant,
    pourcentageDebloque,
    nombreDeblocages,
  };
}

// Stats globales pour tous les crédits
export function useGlobalCreditsStats(): CreditStats {
  const { data: credits = [] } = useCredits();

  const totalCredits = credits.reduce((sum, c) => sum + c.montantTotal, 0);
  const totalDebloque = credits.reduce((sum, c) => {
    return sum + c.deblocages.reduce((s, d) => s + d.montant, 0);
  }, 0);
  const totalRestantADebloquer = totalCredits - totalDebloque;
  const totalMensualites = credits.reduce((sum, c) => sum + (c.mensualite || 0), 0);

  return {
    totalCredits,
    totalDebloque,
    totalRestantADebloquer,
    totalMensualites,
    nombreCredits: credits.length,
  };
}

// Alias pour la compatibilité
export const useGlobalCreditStats = useGlobalCreditsStats;

export function useAddDeblocage() {
  return useCreateDeblocage();
}

export function useDeleteDeblocage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creditId, deblocageId }: { creditId: string; deblocageId: string }) => {
      const result = await api.deleteDeblocage(creditId, deblocageId);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
  });
}
