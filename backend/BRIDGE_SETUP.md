# Configuration de l'API d'Agrégation Bancaire

## 📋 Résumé du Setup

✅ **Service Bridge créé** : `src/services/bridge.service.js`  
✅ **Script de test créé** : `test-bridge.js`  
✅ **Dépendance installée** : `axios` pour les appels HTTP  
✅ **Test de connexion réussi** : L'API Bridge est accessible à `api.bridgeapi.io`

## 🎯 Prochaines étapes

### 1. Créer un compte chez Powens (anciennement Bankin'/Bridge)

**✅ Fournisseur sélectionné : Powens**

- 🌐 Site : https://www.powens.com/
- 📚 Documentation : https://docs.powens.com/
- 🖥️ Console développeur : https://console.powens.com/
- ✅ Service mature et fiable
- ✅ API REST complète
- ✅ Large couverture bancaire française
- 📧 Support : https://www.powens.com/contact

#### Étapes d'inscription Powens

1. **Créer un compte** : 
   - Allez sur https://console.powens.com/
   - Créez un compte développeur (gratuit)
   - Validez votre email

2. **Créer un domaine (environnement)** :
   - Dans la console, créez un nouveau domaine
   - Choisissez "Sandbox" pour le développement
   - Notez l'ID du domaine

3. **Enregistrer une application cliente** :
   - Dans votre domaine, créez une nouvelle application
   - Type : "Server-side application"
   - Notez le `Client ID` et le `Client Secret`

4. **Configurer l'URL de redirection** :
   - Dans les paramètres de l'application
   - Ajoutez : `http://localhost:5173/comptes-bancaires/callback`

### 2. Obtenir vos clés API Powens

Dans la console Powens (https://console.powens.com/) :

1. **Accéder à votre application** :
   - Sélectionnez votre domaine sandbox
   - Cliquez sur votre application

2. **Copier les identifiants** :
   - `Client ID` : ID de votre application
   - `Client Secret` : Secret de votre application (affiché une seule fois !)
   - `Webhook Secret` : Généré dans la section Webhooks

3. **URL de l'API Powens** :
   - Sandbox : `https://sandbox.powens.com`
   - Production : `https://api.powens.com`

### 3. Configurer le fichier .env avec Powens

Créez ou modifiez le fichier `backend/.env` avec vos identifiants Powens :

```bash
# Powens API Configuration
BRIDGE_API_URL=https://sandbox.powens.com
BRIDGE_CLIENT_ID=votre_client_id_powens
BRIDGE_CLIENT_SECRET=votre_client_secret_powens
BRIDGE_WEBHOOK_SECRET=votre_webhook_secret_powens
BRIDGE_ENVIRONMENT=sandbox
BRIDGE_REDIRECT_URI=http://localhost:5173/comptes-bancaires/callback
```

**Exemple avec vraies valeurs Powens :**
```bash
# Powens API Configuration (Sandbox)
BRIDGE_API_URL=https://sandbox.powens.com
BRIDGE_CLIENT_ID=app_a1b2c3d4e5f6
BRIDGE_CLIENT_SECRET=sec_x7y8z9w0v1u2
BRIDGE_WEBHOOK_SECRET=whk_k5l6m7n8o9p0
BRIDGE_ENVIRONMENT=sandbox
BRIDGE_REDIRECT_URI=http://localhost:5173/comptes-bancaires/callback
```

**⚠️ Important :** 
- Ne commitez JAMAIS ce fichier dans Git (déjà dans `.gitignore`)
- Changez `BRIDGE_ENVIRONMENT=production` et l'URL seulement en production
- En production, utilisez `BRIDGE_API_URL=https://api.powens.com`

### 4. Tester la connexion

Une fois configuré, relancez le script de test :

```bash
cd backend
node test-bridge.js
```

Vous devriez voir :
- ✅ URL de connexion générée
- ✅ Connexion API réussie
- ✅ Toutes les credentials configurées

### 5. Endpoints Powens (déjà configurés)

Le service `bridge.service.js` est déjà configuré pour utiliser les endpoints Powens standards :

```javascript
// Endpoints Powens utilisés par le service :
✅ POST /v2/token           // Authentification OAuth2
✅ GET  /v2/accounts        // Liste des comptes bancaires
✅ GET  /v2/accounts/:id/transactions  // Transactions d'un compte
✅ POST /v2/accounts/:id/sync  // Synchronisation forcée
✅ DELETE /v2/items/:id    // Déconnexion d'un item bancaire
```

**Documentation complète :** https://docs.powens.com/documentation/api-reference

## 📚 Structure du Service

Le service `bridge.service.js` fournit les méthodes suivantes :

| Méthode | Description |
|---------|-------------|
| `getConnectUrl()` | Génère l'URL pour connecter un compte bancaire |
| `exchangeCode()` | Échange le code OAuth contre un access token |
| `getAccounts()` | Récupère la liste des comptes bancaires |
| `getTransactions()` | Récupère les transactions d'un compte |
| `syncAccount()` | Force une synchronisation des données |
| `disconnectItem()` | Révoque l'accès à un compte |
| `validateWebhookSignature()` | Valide les webhooks entrants (sécurité) |
| `testConnection()` | Teste la connexion à l'API |

## 🔒 Sécurité

- ✅ Authentification Basic Auth (Client ID + Secret)
- ✅ Validation HMAC des webhooks
- ✅ HTTPS obligatoire
- ✅ Variables d'environnement pour les secrets
- ✅ Timeout de 30 secondes sur les requêtes

## 🐛 Troubleshooting

### Erreur 401 Unauthorized
- Vérifiez que `BRIDGE_CLIENT_ID` et `BRIDGE_CLIENT_SECRET` sont corrects
- Vérifiez que vous utilisez le bon environnement (sandbox vs production)

### Erreur 404 Not Found
- Vérifiez l'URL de base (`BRIDGE_API_URL`)
- Consultez la documentation de votre fournisseur pour les bons endpoints

### Erreur de CORS
- Configurez les origines autorisées dans le dashboard de votre fournisseur
- Ajoutez `http://localhost:5173` pour le développement

### Webhook non reçu
- En développement local, utilisez **ngrok** ou **localtunnel** pour exposer votre serveur
- Configurez l'URL webhook dans le dashboard du fournisseur
- Vérifiez que `BRIDGE_WEBHOOK_SECRET` est correct

## 📖 Ressources Powens

### Documentation officielle
- 🏠 Page développeurs : https://www.powens.com/fr/developpeurs/
- 📚 Documentation API : https://docs.powens.com/documentation
- 🚀 Quick Start : https://docs.powens.com/documentation/integration-guides/quick-start
- 📡 Webhooks : https://docs.powens.com/documentation/integration-guides/webhooks
- 🔐 Authentification : https://docs.powens.com/documentation/api-reference/authentication
- 🖥️ Console : https://console.powens.com/

### Guides d'intégration
- Connexion bancaire (Webview) : https://docs.powens.com/documentation/integration-guides/connect
- Récupération des comptes : https://docs.powens.com/documentation/integration-guides/accounts
- Récupération des transactions : https://docs.powens.com/documentation/integration-guides/transactions

### Support
- Centre d'aide : https://www.powens.com/fr/centre-daide/
- Contact : https://www.powens.com/contact

### DSP2 (Directive sur les Services de Paiement)
- Guide : https://acpr.banque-france.fr/dsp2
- La réglementation européenne qui rend l'agrégation bancaire possible

## ✅ Checklist de validation

Avant de passer à l'étape suivante :

- [ ] Compte créé chez un fournisseur d'agrégation bancaire
- [ ] Clés API obtenues (sandbox)
- [ ] Fichier `.env` configuré avec les bonnes valeurs
- [ ] Script `test-bridge.js` exécuté avec succès
- [ ] URL de redirection configurée dans le dashboard du fournisseur
- [ ] Webhooks configurés (optionnel pour commencer)

## 🚀 Prochaines étapes

Une fois la configuration terminée, vous pourrez :

1. **Créer les modèles de données** (CompteBancaire, TransactionBancaire)
2. **Implémenter les controllers** pour les routes API
3. **Créer le frontend** avec le widget de connexion
4. **Tester en conditions réelles** avec votre compte bancaire en sandbox

---

**Besoin d'aide ?** Consultez les documentation des fournisseurs ou ouvrez une issue sur le projet.

