import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';

interface ProjetContextType {
  projetId: string | null;
  setProjetId: (id: string) => void;
  clearProjetId: () => void;
}

const ProjetContext = createContext<ProjetContextType | null>(null);

export function ProjetProvider({ children }: { children: ReactNode }) {
  const [projetId, setProjetIdState] = useState<string | null>(() => api.getProjetId());

  const setProjetId = useCallback((id: string) => {
    api.setProjetId(id);
    setProjetIdState(id);
  }, []);

  const clearProjetId = useCallback(() => {
    setProjetIdState(null);
  }, []);

  return (
    <ProjetContext.Provider value={{ projetId, setProjetId, clearProjetId }}>
      {children}
    </ProjetContext.Provider>
  );
}

export function useProjetId() {
  const context = useContext(ProjetContext);
  if (!context) {
    // Fallback si le contexte n'est pas disponible (pour la compatibilité)
    return api.getProjetId();
  }
  return context.projetId;
}

export function useProjetContext() {
  const context = useContext(ProjetContext);
  if (!context) {
    throw new Error('useProjetContext must be used within a ProjetProvider');
  }
  return context;
}

