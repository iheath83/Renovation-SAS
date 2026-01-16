import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProjets() {
  return useQuery({
    queryKey: ['projets'],
    queryFn: async () => {
      const result = await api.getProjets();
      if (!result.success) throw new Error(result.error?.message || 'Failed to fetch projects');
      return result.data || [];
    },
  });
}
