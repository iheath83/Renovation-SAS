# Prompt 1: Setup Bridge API & Backend Configuration

## Objectif
Configurer l'environnement pour l'intégration Bridge API : création du compte développeur, installation des dépendances et mise en place du service Bridge initial.

## Tâches

### 1. Configuration Bridge API
- Créer un compte développeur sur https://dashboard.bridgeapi.io/
- Générer les clés API en mode **sandbox** pour les tests
- Noter les informations suivantes :
  - CLIENT_ID
  - CLIENT_SECRET
  - WEBHOOK_SECRET

### 2. Variables d'environnement Backend
Ajouter dans `backend/.env` :
```bash
# Bridge API Configuration (Sandbox)
BRIDGE_API_URL=https://api.bridgeapi.io
BRIDGE_CLIENT_ID=your_client_id_here
BRIDGE_CLIENT_SECRET=your_client_secret_here
BRIDGE_WEBHOOK_SECRET=your_webhook_secret_here
BRIDGE_ENVIRONMENT=sandbox
BRIDGE_REDIRECT_URI=http://localhost:5173/comptes-bancaires/callback
```

### 3. Installation des dépendances
```bash
cd backend
npm install @bridgeapi/node
```

### 4. Créer le service Bridge initial
Créer `backend/src/services/bridge.service.js` :

```javascript
import { BridgeSDK } from '@bridgeapi/node';

const bridgeClient = new BridgeSDK({
  clientId: process.env.BRIDGE_CLIENT_ID,
  clientSecret: process.env.BRIDGE_CLIENT_SECRET,
  environment: process.env.BRIDGE_ENVIRONMENT || 'sandbox',
});

/**
 * Service de gestion de l'API Bridge
 */
export const BridgeService = {
  /**
   * Obtient l'URL de connexion Bridge pour un utilisateur
   */
  async getConnectUrl(userId, projetId) {
    try {
      const state = JSON.stringify({ userId, projetId });
      const connectUrl = bridgeClient.getConnectUrl({
        redirect_uri: process.env.BRIDGE_REDIRECT_URI,
        state,
      });
      return { success: true, url: connectUrl };
    } catch (error) {
      console.error('[BridgeService] Error getting connect URL:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Échange le code OAuth contre un access token
   */
  async exchangeCode(code) {
    try {
      const tokenData = await bridgeClient.exchangeCode(code);
      return { success: true, data: tokenData };
    } catch (error) {
      console.error('[BridgeService] Error exchanging code:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Récupère les comptes bancaires d'un item Bridge
   */
  async getAccounts(accessToken) {
    try {
      const accounts = await bridgeClient.getAccounts(accessToken);
      return { success: true, data: accounts };
    } catch (error) {
      console.error('[BridgeService] Error fetching accounts:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Récupère les transactions d'un compte
   */
  async getTransactions(accessToken, accountId, options = {}) {
    try {
      const { since, until, limit = 100 } = options;
      const transactions = await bridgeClient.getTransactions(accessToken, accountId, {
        since,
        until,
        limit,
      });
      return { success: true, data: transactions };
    } catch (error) {
      console.error('[BridgeService] Error fetching transactions:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Révoque l'accès à un item Bridge
   */
  async disconnectItem(accessToken, itemId) {
    try {
      await bridgeClient.deleteItem(accessToken, itemId);
      return { success: true };
    } catch (error) {
      console.error('[BridgeService] Error disconnecting item:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Valide la signature d'un webhook Bridge
   */
  validateWebhookSignature(payload, signature) {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.BRIDGE_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('[BridgeService] Error validating webhook signature:', error);
      return false;
    }
  },
};
```

### 5. Test du service
Créer un script de test temporaire `backend/test-bridge.js` :

```javascript
import { BridgeService } from './src/services/bridge.service.js';

async function testBridgeConnection() {
  console.log('🧪 Testing Bridge API connection...');
  
  // Test 1: Get connect URL
  const result = await BridgeService.getConnectUrl('test-user-id', 'test-projet-id');
  
  if (result.success) {
    console.log('✅ Bridge API connection successful!');
    console.log('📍 Connect URL:', result.url);
  } else {
    console.error('❌ Bridge API connection failed:', result.error);
  }
}

testBridgeConnection();
```

Exécuter le test :
```bash
node backend/test-bridge.js
```

### 6. Configuration webhook Bridge Dashboard
- Aller sur le dashboard Bridge : https://dashboard.bridgeapi.io/webhooks
- Ajouter une URL webhook : `https://votre-domaine.com/api/bridge/webhook`
- Pour le développement local, utiliser ngrok ou localtunnel
- Activer les événements :
  - `transaction.created`
  - `item.disconnected`

## Critères de validation
- [ ] Compte Bridge créé et clés API générées
- [ ] Variables d'environnement configurées dans backend/.env
- [ ] Package @bridgeapi/node installé
- [ ] Service BridgeService créé avec toutes les méthodes
- [ ] Test de connexion réussi (getConnectUrl retourne une URL valide)
- [ ] Webhook configuré sur le dashboard Bridge (pour plus tard)

## Notes importantes
- **NE JAMAIS** commiter les clés API dans Git
- Ajouter `backend/.env` dans `.gitignore` si ce n'est pas déjà fait
- Utiliser le mode **sandbox** jusqu'à la mise en production
- Les banques en sandbox sont des banques de test (pas de vraies données)

## Ressources
- Documentation Bridge API : https://docs.bridgeapi.io/
- SDK Node.js : https://github.com/bridgeapi/node-sdk
- Dashboard : https://dashboard.bridgeapi.io/

