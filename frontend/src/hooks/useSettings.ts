import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UserSettings, ProjetSettings, CategorieCustom } from '@/types/settings';

// === USER SETTINGS ===

export function useUserSettings() {
  return useQuery({
    queryKey: ['settings', 'user'],
    queryFn: async () => {
      const result = await api.getUserSettings();
      if (!result.success) throw new Error(result.error?.message);
      return result.data as UserSettings;
    },
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const result = await api.updateUserSettings(data);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'user'] });
    },
  });
}

// === PROJET SETTINGS ===

export function useProjetSettings(projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['settings', 'projet', pid],
    queryFn: async () => {
      const result = await api.getProjetSettings(pid || undefined);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as ProjetSettings;
    },
    enabled: !!pid,
  });
}

export function useUpdateProjetSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ProjetSettings> & { id: string }) => {
      const { id, ...updateData } = data;
      const result = await api.updateProjetSettings(id, updateData);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'projet', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['projets'] });
    },
  });
}

// === APP SETTINGS (garde en localStorage pour les préférences UI) ===

const DEFAULT_APP_SETTINGS = {
  theme: 'dark' as const,
  devise: '€',
  langue: 'fr',
  notifications: {
    email: true,
    push: true,
    alertesBudget: true,
    rappelsTaches: true,
  },
};

function getAppSettings() {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS;
  const stored = localStorage.getItem('renovision_app_settings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }
  return DEFAULT_APP_SETTINGS;
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['settings', 'app'],
    queryFn: () => getAppSettings(),
    initialData: getAppSettings(),
  });
}

export function useUpdateAppSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const current = getAppSettings();
      const updated = { ...current, ...data };
      if (typeof window !== 'undefined') {
        localStorage.setItem('renovision_app_settings', JSON.stringify(updated));
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'app'] });
    },
  });
}

// === CATEGORIES CUSTOM ===

export function useCategories(type: 'depense' | 'materiau' | 'piece', projetId?: string) {
  const pid = projetId || api.getProjetId();
  
  return useQuery({
    queryKey: ['settings', 'categories', type, pid],
    queryFn: async () => {
      const result = await api.getCategories(pid || undefined, type);
      if (!result.success) throw new Error(result.error?.message);
      return result.data as CategorieCustom[];
    },
    enabled: !!pid,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { type: string; nom: string; icon?: string; color?: string }) => {
      const projetId = api.getProjetId();
      if (!projetId) throw new Error('No project selected');
      const result = await api.createCategory(projetId, data);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategorieCustom> }) => {
      const result = await api.updateCategory(id, data);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deleteCategory(id);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'categories'] });
    },
  });
}
