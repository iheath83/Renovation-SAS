import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CompteBancaire } from '@/types/compteBancaire';

export function useComptesBancaires(projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['comptes-bancaires', pid],
    queryFn: async () => {
      const result = await api.getComptesBancaires(pid || undefined);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as CompteBancaire[];
    },
    enabled: !!pid,
  });
}

export function useSyncCompteBancaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (compteId: string) => api.syncCompteBancaire(compteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptes-bancaires'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-bancaires'] });
    },
  });
}

export function useDisconnectCompteBancaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (compteId: string) => api.disconnectCompteBancaire(compteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptes-bancaires'] });
    },
  });
}

