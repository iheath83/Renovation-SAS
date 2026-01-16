import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Projet {
  id: string;
  name: string;
  description: string | null;
}

interface AuthContextType {
  user: User | null;
  projet: Projet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setCurrentProjet: (projet: Projet) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [projet, setProjet] = useState<Projet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification au chargement
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        try {
          const result = await api.getMe();
          if (result.success && result.data) {
            setUser(result.data);
            
            // Charger le projet actif
            const projetId = api.getProjetId();
            if (projetId) {
              const projetResult = await api.getProjet(projetId);
              if (projetResult.success && projetResult.data) {
                setProjet(projetResult.data);
              }
            } else {
              // Charger le premier projet disponible
              const projetsResult = await api.getProjets();
              if (projetsResult.success && projetsResult.data && projetsResult.data.length > 0) {
                const firstProjet = projetsResult.data[0];
                api.setProjetId(firstProjet.id);
                setProjet(firstProjet);
              }
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    
    if (result.success && result.data) {
      setUser(result.data.user);
      
      // Charger le premier projet
      const projetsResult = await api.getProjets();
      if (projetsResult.success && projetsResult.data && projetsResult.data.length > 0) {
        const firstProjet = projetsResult.data[0];
        api.setProjetId(firstProjet.id);
        setProjet(firstProjet);
      }
      
      return { success: true };
    }
    
    return { success: false, error: result.error?.message || 'Erreur de connexion' };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setProjet(null);
  };

  const setCurrentProjet = (p: Projet) => {
    api.setProjetId(p.id);
    setProjet(p);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        projet,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setCurrentProjet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

