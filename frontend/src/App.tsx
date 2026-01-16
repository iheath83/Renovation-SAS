import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Pieces } from '@/pages/Pieces';
import { PieceDetail } from '@/pages/PieceDetail';
import { TachesPage } from '@/pages/TachesPage';
import { Materiaux } from '@/pages/Materiaux';
import { BudgetPage } from '@/pages/BudgetPage';
import { BanquePage } from '@/pages/BanquePage';
import { Inspiration } from '@/pages/Inspiration';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { api } from '@/lib/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Créer un nouveau QueryClient à chaque fois qu'on est prêt
  // Cela garantit un cache vide après l'authentification
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }), [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[App] checkAuth started');
      if (api.isAuthenticated()) {
        console.log('[App] User has token, verifying...');
        // Vérifier que le token est toujours valide en appelant /auth/me
        const meResult = await api.getMe();
        
        if (!meResult.success) {
          // Token invalide ou expiré, déconnecter
          console.log('[App] Token invalid, clearing');
          api.clearTokens();
          setIsAuthenticated(false);
          setIsReady(true);
          return;
        }
        
        // Token valide, vérifier le projetId
        let projetId = api.getProjetId();
        console.log('[App] Current projetId:', projetId);
        if (!projetId) {
          console.log('[App] No projetId, fetching projects...');
          const result = await api.getProjets();
          console.log('[App] Projects result:', result);
          if (result.success && result.data && result.data.length > 0) {
            projetId = result.data[0].id;
            api.setProjetId(projetId);
            console.log('[App] Set projetId:', projetId);
          } else {
            console.log('[App] No projects found, clearing tokens');
            api.clearTokens();
            setIsAuthenticated(false);
            setIsReady(true);
            return;
          }
        }
        console.log('[App] Auth successful!');
        setIsAuthenticated(true);
        setIsReady(true);
        
        // Si on est sur une page d'auth, rediriger vers /
        const currentPath = window.location.pathname;
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password') {
          console.log('[App] Authenticated but on auth page, redirecting to /');
          window.location.href = '/';
        }
      } else {
        console.log('[App] No token, user not authenticated');
        setIsAuthenticated(false);
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = useCallback(async () => {
    console.log('[App] handleLoginSuccess called');
    // Récupérer le premier projet
    const result = await api.getProjets();
    console.log('[App] Projects after login:', result);
    if (result.success && result.data && result.data.length > 0) {
      api.setProjetId(result.data[0].id);
      console.log('[App] Set projetId:', result.data[0].id);
    }
    
    console.log('[App] Setting authenticated and ready');
    setIsAuthenticated(true);
    setIsReady(true);
    
    // Rediriger vers la home
    window.location.href = '/';
  }, []);

  console.log('[App] Render - isAuthenticated:', isAuthenticated, 'isReady:', isReady);

  // Loading state - ne pas afficher l'app tant que pas prêt
  if (isAuthenticated === null || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="text-tertiary">Chargement...</div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login onSuccess={handleLoginSuccess} />} />
              <Route path="/register" element={<Register onSuccess={handleLoginSuccess} />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Login onSuccess={handleLoginSuccess} />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pieces" element={<Pieces />} />
              <Route path="pieces/:id" element={<PieceDetail />} />
              <Route path="taches" element={<TachesPage />} />
              <Route path="materiaux" element={<Materiaux />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="banque" element={<BanquePage />} />
              <Route path="inspiration" element={<Inspiration />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
