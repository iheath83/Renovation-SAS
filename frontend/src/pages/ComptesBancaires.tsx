import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, RefreshCw, Unplug, ExternalLink, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useComptesBancaires, useSyncCompteBancaire, useDisconnectCompteBancaire } from '@/hooks/useComptesBancaires';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ComptesBancaires() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { data: comptes = [], isLoading, refetch } = useComptesBancaires();
  const syncMutation = useSyncCompteBancaire();
  const disconnectMutation = useDisconnectCompteBancaire();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const callbackProcessedRef = useRef(false); // Empêcher le double appel en dev mode

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  // Gérer le callback Powens après la connexion
  useEffect(() => {
    const handlePowensCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      // Empêcher le double appel en dev mode (React Strict Mode)
      if (code && state && !callbackProcessedRef.current) {
        callbackProcessedRef.current = true;
        console.log('[ComptesBancaires] Callback Powens détecté', { code: code.substring(0, 20) + '...', state });
        setIsProcessingCallback(true);

        try {
          // Appeler le backend pour enregistrer le compte
          const API_URL = 'http://localhost:3001/api';
          const response = await fetch(`${API_URL}/comptes-bancaires/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          
          const result = await response.json();

          if (result.success) {
            console.log('[ComptesBancaires] Compte bancaire enregistré avec succès', result.data);
            // Recharger la liste des comptes
            await refetch();
            // Nettoyer les paramètres URL
            navigate('/banque', { replace: true });
          } else {
            console.error('[ComptesBancaires] Erreur lors de l\'enregistrement', result.error);
            alert(`Erreur : ${result.error?.message || 'Impossible de connecter le compte'}`);
            navigate('/banque', { replace: true });
          }
        } catch (error) {
          console.error('[ComptesBancaires] Erreur callback', error);
          alert('Erreur lors de la connexion du compte bancaire');
          navigate('/banque', { replace: true });
        } finally {
          setIsProcessingCallback(false);
        }
      }
    };

    handlePowensCallback();
  }, [searchParams, navigate, refetch]);

  const handleSync = async (compteId: string) => {
    setSyncingId(compteId);
    try {
      const result = await syncMutation.mutateAsync(compteId);
      
      if (result.success) {
        if (result.tokenExpired) {
          alert('⚠️ Token expiré ! Veuillez déconnecter et reconnecter ce compte.');
        } else if (result.count && result.count > 0) {
          alert(`✅ ${result.message}`);
        } else {
          alert('ℹ️ Aucune nouvelle transaction.\n\nPowens synchronise peut-être encore les données depuis votre banque.\n\nRéessayez dans 2-3 minutes.');
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Erreur lors de la synchronisation');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (compteId: string, banque: string) => {
    if (confirm(`Êtes-vous sûr de vouloir déconnecter le compte ${banque} ?`)) {
      await disconnectMutation.mutateAsync(compteId);
    }
  };

  const handleConnect = () => {
    // Rediriger vers l'URL de connexion Powens
    if (userId) {
      const projetId = api.getProjetId();
      const connectUrl = `https://webview.powens.com/connect?domain=renovision-sandbox.biapi.pro&client_id=23114821&redirect_uri=${encodeURIComponent('http://localhost:5173/banque')}&state=${btoa(JSON.stringify({ userId, projetId }))}`;
      window.location.href = connectUrl;
    }
  };

  if (isLoading || isProcessingCallback) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-2" />
          <p className="text-tertiary">
            {isProcessingCallback ? 'Connexion de votre compte bancaire...' : 'Chargement des comptes...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-primary flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary-400" />
            Comptes Bancaires
          </h1>
          <p className="text-tertiary mt-1">
            Connectez vos comptes pour importer automatiquement vos dépenses
          </p>
        </div>
        <Button onClick={handleConnect}>
          <ExternalLink className="w-4 h-4" />
          Connecter un compte
        </Button>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={item}>
        <Card className="p-4 bg-primary-500/10 border-primary-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary mb-1">Connexion sécurisée via Powens</h3>
              <p className="text-sm text-secondary">
                Vos identifiants bancaires ne transitent jamais par nos serveurs. 
                La connexion est établie directement avec votre banque via un prestataire agréé.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Liste des comptes */}
      {comptes.length === 0 ? (
        <motion.div variants={item} className="text-center py-12 glass rounded-xl">
          <Building2 className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary mb-2">Aucun compte connecté</h3>
          <p className="text-tertiary mb-6">
            Connectez votre premier compte bancaire pour commencer à importer vos transactions
          </p>
          <Button onClick={handleConnect}>
            <ExternalLink className="w-4 h-4" />
            Connecter un compte
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {comptes.map((compte) => (
            <motion.div key={compte.id} variants={item}>
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-500/20">
                      <Building2 className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{compte.banque}</h3>
                      {compte.actif ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Inactif</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-tertiary">Transactions</span>
                    <span className="font-medium text-primary">
                      {compte._count?.transactions || 0}
                    </span>
                  </div>
                  {compte.derniereSynchronisation && (
                    <div className="flex justify-between text-sm">
                      <span className="text-tertiary">Dernière synchro</span>
                      <span className="text-secondary">
                        {formatDistanceToNow(new Date(compte.derniereSynchronisation), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Nouvelles transactions */}
                {compte.transactions && compte.transactions.length > 0 && (
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-500/20 text-accent-400 text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
                      {compte.transactions.length} nouvelle{compte.transactions.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSync(compte.id)}
                    disabled={syncingId === compte.id || !compte.actif}
                    className="flex-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingId === compte.id ? 'animate-spin' : ''}`} />
                    Synchroniser
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(compte.id, compte.banque)}
                    disabled={!compte.actif}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Unplug className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

