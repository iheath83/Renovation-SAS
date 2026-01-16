import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TransactionBancaire, TransactionStats, CreateDepenseFromTransactionInput } from '@/types/compteBancaire';

export function useTransactionsBancaires(
  projetId?: string,
  params?: { statut?: string; limit?: number; offset?: number }
) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['transactions-bancaires', pid, params],
    queryFn: async () => {
      const result = await api.getTransactionsBancaires(pid || undefined, params);
      if (!result.success) throw new Error(result.error?.message);
      return {
        transactions: result.data as TransactionBancaire[],
        pagination: result.pagination,
      };
    },
    enabled: !!pid,
  });
}

export function useTransactionsBancairesStats(projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['transactions-bancaires-stats', pid],
    queryFn: async () => {
      const result = await api.getTransactionsBancairesStats(pid || undefined);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as TransactionStats;
    },
    enabled: !!pid,
  });
}

export function useConvertTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      transactionId, 
      data 
    }: { 
      transactionId: string; 
      data: CreateDepenseFromTransactionInput 
    }) => api.convertTransactionToDepense(transactionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions-bancaires'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-bancaires-stats'] });
      queryClient.invalidateQueries({ queryKey: ['depenses'] });
    },
  });
}

export function useIgnoreTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => api.ignoreTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions-bancaires'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-bancaires-stats'] });
    },
  });
}

