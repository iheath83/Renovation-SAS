import { useState, useEffect, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  projetId: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Vérifier si on est déjà connecté
    const checkAuth = async () => {
      if (api.isAuthenticated()) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            // Ignorer
          }
        }
        
        // Vérifier le projet actif
        const projetId = api.getProjetId();
        if (!projetId) {
          // Récupérer le premier projet
          const result = await api.getProjets();
          if (result.success && result.data && result.data.length > 0) {
            api.setProjetId(result.data[0].id);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await api.login(email, password);
    if (result.success && result.data) {
      const userData = result.data.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Récupérer le premier projet après connexion
      const projetsResult = await api.getProjets();
      if (projetsResult.success && projetsResult.data && projetsResult.data.length > 0) {
        api.setProjetId(projetsResult.data[0].id);
      }
      
      return true;
    }
    return false;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem('user');
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated: !!user && api.isAuthenticated(),
    isLoading,
    login,
    logout,
    projetId: api.getProjetId(),
  };
}

export { AuthContext };

