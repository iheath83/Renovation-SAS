import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Moodboard, CreateMoodboardInput, UpdateMoodboardInput } from '@/types/moodboard';

export function useMoodboards(projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['moodboards', pid],
    queryFn: async () => {
      const result = await api.getMoodboards(pid || undefined);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as Moodboard[];
    },
    enabled: !!pid,
  });
}

export function useMoodboard(id: string, projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['moodboard', id],
    queryFn: async () => {
      const result = await api.getMoodboard(id, pid || undefined);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as Moodboard;
    },
    enabled: !!id && !!pid,
  });
}

export function useCreateMoodboard() {
  const queryClient = useQueryClient();
  const projetId = api.getProjetId();

  return useMutation({
    mutationFn: async (data: CreateMoodboardInput) => {
      if (!projetId) throw new Error("Projet ID is missing.");
      const result = await api.createMoodboard(data, projetId);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as Moodboard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodboards', projetId] });
    },
  });
}

export function useUpdateMoodboard() {
  const queryClient = useQueryClient();
  const projetId = api.getProjetId();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMoodboardInput }) => {
      if (!projetId) throw new Error("Projet ID is missing.");
      const result = await api.updateMoodboard(id, data, projetId);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as Moodboard;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['moodboards', projetId] });
      queryClient.invalidateQueries({ queryKey: ['moodboard', variables.id] });
    },
  });
}

export function useDeleteMoodboard() {
  const queryClient = useQueryClient();
  const projetId = api.getProjetId();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!projetId) throw new Error("Projet ID is missing.");
      const result = await api.deleteMoodboard(id, projetId);
      if (!result.success) throw new Error(result.error?.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodboards', projetId] });
    },
  });
}
