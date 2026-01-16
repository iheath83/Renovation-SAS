import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { IdeePinterest, CreateIdeePinterestInput, UpdateIdeePinterestInput } from '@/types/idee';

export function useIdees(projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['idees', pid],
    queryFn: async () => {
      const result = await api.getIdees(pid || undefined);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as IdeePinterest[];
    },
    enabled: !!pid,
  });
}

export function useIdee(id: string, projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['idee', id],
    queryFn: async () => {
      const result = await api.getIdee(id, pid || undefined);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as IdeePinterest;
    },
    enabled: !!id && !!pid,
  });
}

export function useCreateIdee() {
  const queryClient = useQueryClient();
  const projetId = api.getProjetId();

  return useMutation({
    mutationFn: async (data: CreateIdeePinterestInput) => {
      if (!projetId) throw new Error("Projet ID is missing.");
      const result = await api.createIdee(data, projetId);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as IdeePinterest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idees', projetId] });
    },
  });
}

export function useUpdateIdee() {
  const queryClient = useQueryClient();
  const projetId = api.getProjetId();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateIdeePinterestInput }) => {
      if (!projetId) throw new Error("Projet ID is missing.");
      const result = await api.updateIdee(id, data, projetId);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as IdeePinterest;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['idees', projetId] });
      queryClient.invalidateQueries({ queryKey: ['idee', variables.id] });
    },
  });
}

export function useDeleteIdee() {
  const queryClient = useQueryClient();
  const projetId = api.getProjetId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!projetId) throw new Error("Projet ID is missing.");
      const result = await api.deleteIdee(id, projetId);
      if (!result.success) throw new Error(result.error?.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idees', projetId] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const projetId = api.getProjetId();

  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      if (!projetId) throw new Error("Projet ID is missing.");
      const result = await api.updateIdee(id, { isFavorite }, projetId);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as IdeePinterest;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['idees', projetId] });
      queryClient.invalidateQueries({ queryKey: ['idee', variables.id] });
    },
  });
}
