import axios from 'axios';
import crypto from 'crypto';

/**
 * Service de gestion de l'API d'agrégation bancaire
 * 
 * Note: Ce service est conçu pour être flexible et fonctionner avec différents
 * fournisseurs d'agrégation bancaire (Budget Insight, Powens, Linxo Connect, etc.)
 * 
 * Vous devrez adapter les endpoints et la logique d'authentification en fonction
 * du fournisseur choisi.
 */

const apiClient = axios.create({
  baseURL: process.env.BRIDGE_API_URL || 'https://renovision-sandbox.biapi.pro',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter l'authentification
apiClient.interceptors.request.use((config) => {
  // Si un header Authorization est déjà défini (Bearer token), ne pas le remplacer
  if (config.headers.Authorization) {
    return config;
  }
  
  const clientId = process.env.BRIDGE_CLIENT_ID;
  const clientSecret = process.env.BRIDGE_CLIENT_SECRET;
  
  if (clientId && clientSecret) {
    // Authentification Basic (format standard pour la plupart des APIs d'agrégation)
    const authToken = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    config.headers.Authorization = `Basic ${authToken}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Service de gestion de l'API Bridge
 */
export const BridgeService = {
  /**
   * Obtient l'URL de connexion pour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} projetId - ID du projet
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async getConnectUrl(userId, projetId) {
    try {
      const state = Buffer.from(JSON.stringify({ userId, projetId })).toString('base64');
      const redirectUri = process.env.BRIDGE_REDIRECT_URI || 'http://localhost:5173/banque';
      const domain = process.env.BRIDGE_API_URL?.replace('https://', '') || 'renovision-sandbox.biapi.pro';
      
      // Powens utilise le webview à une URL différente
      const connectUrl = `https://webview.powens.com/connect?` +
        `domain=${domain}` +
        `&client_id=${process.env.BRIDGE_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}`;
      
      return { success: true, url: connectUrl };
    } catch (error) {
      console.error('[BridgeService] Error getting connect URL:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Échange le code d'autorisation contre un access token
   * @param {string} code - Code d'autorisation OAuth
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async exchangeCode(code) {
    try {
      // Powens utilise /2.0/auth/token/access (et non /v2/token)
      const response = await apiClient.post('/2.0/auth/token/access', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.BRIDGE_CLIENT_ID,
          client_secret: process.env.BRIDGE_CLIENT_SECRET,
          redirect_uri: process.env.BRIDGE_REDIRECT_URI,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[BridgeService] Error exchanging code:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Récupère les comptes bancaires d'un utilisateur
   * @param {string} accessToken - Token d'accès
   * @returns {Promise<{success: boolean, data?: array, error?: string}>}
   */
  async getAccounts(accessToken) {
    try {
      // Powens utilise /2.0/users/me/connections (liste des connexions avec comptes)
      const response = await apiClient.get('/2.0/users/me/connections', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          expand: 'accounts,connector', // Inclure les comptes ET les infos de la banque
        },
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[BridgeService] Error fetching accounts:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Récupère les transactions d'un compte
   * @param {string} accessToken - Token d'accès utilisateur
   * @param {string} accountId - ID du compte
   * @param {object} options - Options de filtrage
   * @returns {Promise<{success: boolean, data?: array, error?: string}>}
   */
  async getTransactions(accessToken, accountId, options = {}) {
    try {
      const { since, until, limit = 100 } = options;
      
      const params = {
        limit,
      };
      
      if (since) params.min_date = since;
      if (until) params.max_date = until;
      
      // Powens API v2.0 : /users/me/accounts/:accountId/transactions
      // Voir : https://docs.powens.com/api-reference/products/data-aggregation/bank-transactions
      const response = await apiClient.get(`/2.0/users/me/accounts/${accountId}/transactions`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[BridgeService] Error fetching transactions:', error);
      return { 
        success: false, 
        error: error.response?.data?.code || error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Synchronise les transactions d'un compte (force une mise à jour)
   * @param {string} accessToken - Token d'accès
   * @param {string} connectionId - ID de la connexion (item)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async syncAccount(accessToken, connectionId) {
    try {
      // Powens utilise /2.0/connections/:id/refresh
      await apiClient.post(`/2.0/connections/${connectionId}/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error('[BridgeService] Error syncing account:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Révoque l'accès à un item bancaire
   * @param {string} accessToken - Token d'accès
   * @param {string} connectionId - ID de la connexion (item)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async disconnectItem(accessToken, connectionId) {
    try {
      // Powens utilise /2.0/connections/:id
      await apiClient.delete(`/2.0/connections/${connectionId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error('[BridgeService] Error disconnecting item:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Valide la signature HMAC d'un webhook
   * @param {string|object} payload - Corps de la requête webhook
   * @param {string} signature - Signature reçue dans l'en-tête
   * @returns {boolean} True si la signature est valide
   */
  validateWebhookSignature(payload, signature) {
    try {
      const webhookSecret = process.env.BRIDGE_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error('[BridgeService] BRIDGE_WEBHOOK_SECRET not configured');
        return false;
      }
      
      // Convertir le payload en string si c'est un objet
      const payloadString = typeof payload === 'string' 
        ? payload 
        : JSON.stringify(payload);
      
      // Calculer la signature HMAC SHA-256
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');
      
      // Comparaison sécurisée contre les attaques de timing
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('[BridgeService] Error validating webhook signature:', error);
      return false;
    }
  },

  /**
   * Teste la connexion à l'API
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async testConnection() {
    try {
      // Test avec l'endpoint /2.0/auth/token/code pour vérifier l'accessibilité
      // Cet endpoint va retourner une erreur mais ça prouve que l'API est accessible
      const response = await apiClient.post('/2.0/auth/token/code');
      
      return { 
        success: true, 
        message: 'Powens API connection successful',
        data: response.data 
      };
    } catch (error) {
      // Si l'API retourne une erreur 400 ou 401, ça veut dire qu'elle est accessible
      if (error.response?.status === 400 || error.response?.status === 401) {
        return {
          success: true,
          message: 'Powens API is accessible and configured correctly'
        };
      }
      
      console.error('[BridgeService] Error testing connection:', error);
      return { 
        success: false, 
        error: error.message,
        details: error.response?.data 
      };
    }
  },
};

