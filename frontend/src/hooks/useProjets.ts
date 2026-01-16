import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Projet } from '@/types/projet';

export function useProjets() {
  return useQuery<Projet[]>({
    queryKey: ['projets'],
    queryFn: async () => {
      const result = await api.getProjets();
      if (!result.success) throw new Error(result.error?.message || 'Failed to fetch projects');
      return result.data || [];
    },
  });
}
