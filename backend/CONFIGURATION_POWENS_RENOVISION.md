# 🎯 Configuration Powens pour RénoVision

## ✅ Votre environnement Powens est prêt !

Vous disposez déjà d'une URL sandbox personnalisée :
```
https://renovision-sandbox.biapi.pro
```

**Note** : `biapi.pro` est l'infrastructure technique de Powens (anciennement Budget Insight, racheté par Powens).

## 🔑 Étape 1 : Récupérer vos clés API

### Dans la console Powens

1. **Connectez-vous à la console** :
   - URL : https://console.powens.com/
   - Ou accédez directement à votre domaine sandbox

2. **Accédez à votre application** :
   - Sélectionnez le domaine `renovision-sandbox`
   - Cliquez sur votre application

3. **Copiez vos identifiants** :
   Vous aurez besoin de 3 clés :
   
   - ✅ **Client ID** (format : `app_xxxxxxxxxx`)
   - ✅ **Client Secret** (format : `sec_xxxxxxxxxx`)
   - ✅ **Webhook Secret** (format : `whk_xxxxxxxxxx`)

⚠️ **Important** : Le Client Secret n'est affiché qu'une seule fois lors de la création !

## 🛠️ Étape 2 : Configurer le fichier .env

### Option A : Copier le template

```bash
cd backend
cp .env.local .env
```

### Option B : Éditer manuellement

Ouvrez `backend/.env` et ajoutez/modifiez ces lignes :

```bash
# Powens API Configuration
BRIDGE_API_URL=https://renovision-sandbox.biapi.pro
BRIDGE_CLIENT_ID=votre_client_id_powens
BRIDGE_CLIENT_SECRET=votre_client_secret_powens
BRIDGE_WEBHOOK_SECRET=votre_webhook_secret_powens
BRIDGE_ENVIRONMENT=sandbox
BRIDGE_REDIRECT_URI=http://localhost:5173/comptes-bancaires/callback
```

### Exemple avec vraies valeurs

```bash
# Exemple (REMPLACEZ par vos vraies clés !)
BRIDGE_API_URL=https://renovision-sandbox.biapi.pro
BRIDGE_CLIENT_ID=app_a1b2c3d4e5f6g7h8
BRIDGE_CLIENT_SECRET=sec_x9y8z7w6v5u4t3s2
BRIDGE_WEBHOOK_SECRET=whk_r1q2p3o4n5m6l7k8
BRIDGE_ENVIRONMENT=sandbox
BRIDGE_REDIRECT_URI=http://localhost:5173/comptes-bancaires/callback
```

## ✅ Étape 3 : Tester la connexion

Une fois vos clés configurées :

```bash
cd backend
node test-bridge.js
```

### Résultat attendu

```
🧪 Testing Bridge API Service...

Configuration:
- API URL: https://renovision-sandbox.biapi.pro ✓
- Client ID: ✓ Set
- Client Secret: ✓ Set
- Webhook Secret: ✓ Set
- Environment: sandbox
- Redirect URI: http://localhost:5173/comptes-bancaires/callback ✓

============================================================

Test 1: Getting connect URL...
✅ Connect URL generated successfully
📍 URL: https://renovision-sandbox.biapi.pro/v2/connect?...

------------------------------------------------------------

Test 2: Testing API connection...
✅ Bridge API connection successful

------------------------------------------------------------

Test 3: Testing webhook signature validation...
✅ Signature validation working

============================================================

📋 Summary:
✅ Bridge API service is ready to use!
```

## 🔧 Configuration de l'URL de redirection dans Powens

### Important pour le flux OAuth

1. **Accédez aux paramètres de l'application** dans la console Powens
2. **Section "URLs de redirection"**
3. **Ajoutez** :
   ```
   http://localhost:5173/comptes-bancaires/callback
   ```
4. **Enregistrez**

### Pour la production (plus tard)

Ajoutez également votre URL de production :
```
https://app.renovision.fr/comptes-bancaires/callback
```

## 🏦 Banques de test en sandbox

Powens fournit des banques de test pour le développement :

### Banque "Test"
- Identifiant : `12345678`
- Mot de passe : `1234`

### Comptes disponibles
- Compte courant avec transactions
- Compte épargne
- Carte bancaire avec opérations

**Note** : Les transactions sont générées automatiquement pour simuler un compte réel.

## 📡 Configuration des webhooks (optionnel)

### Pour recevoir les notifications en temps réel

1. **Dans la console Powens** :
   - Allez dans "Webhooks"
   - Cliquez sur "Ajouter une URL"

2. **Pour le développement local** :
   Utilisez **ngrok** pour exposer votre serveur :
   
   ```bash
   # Installer ngrok
   brew install ngrok
   
   # Lancer ngrok sur le port 3001
   ngrok http 3001
   ```
   
   Copiez l'URL HTTPS fournie (ex: `https://abc123.ngrok.io`)

3. **Configurez l'URL webhook** :
   ```
   https://abc123.ngrok.io/api/bridge/webhook
   ```

4. **Sélectionnez les événements** :
   - ✅ `item.connected` - Compte bancaire connecté
   - ✅ `transactions.created` - Nouvelles transactions
   - ✅ `item.error` - Erreur de synchronisation
   - ✅ `item.disconnected` - Compte déconnecté

### En production

URL webhook directe (pas besoin de ngrok) :
```
https://api.renovision.fr/api/bridge/webhook
```

## 🔒 Sécurité

### ✅ Checklist de sécurité

- [x] URL sandbox personnalisée configurée
- [ ] Clés API copiées dans `.env`
- [ ] Fichier `.env` dans `.gitignore` (déjà fait ✓)
- [ ] URL de redirection configurée dans Powens
- [ ] Test de connexion réussi

### ⚠️ À NE JAMAIS FAIRE

- ❌ Commiter le fichier `.env` dans Git
- ❌ Partager vos secrets
- ❌ Utiliser les clés de production en développement
- ❌ Exposer les clés côté frontend/JavaScript

## 🐛 Dépannage

### Erreur : "Client authentication failed"

**Cause** : Client ID ou Client Secret incorrect

**Solution** :
1. Vérifiez que vous avez copié les bonnes clés depuis la console Powens
2. Assurez-vous qu'il n'y a pas d'espace avant/après les clés
3. Vérifiez que vous utilisez les clés du domaine sandbox

### Erreur : "Invalid redirect_uri"

**Cause** : L'URL de redirection n'est pas configurée dans Powens

**Solution** :
1. Allez dans la console Powens → Paramètres de l'application
2. Ajoutez exactement : `http://localhost:5173/comptes-bancaires/callback`
3. Enregistrez et réessayez

### Erreur : "Domain not found"

**Cause** : L'URL sandbox n'est pas accessible

**Solution** :
1. Vérifiez votre connexion internet
2. Vérifiez que l'URL est exactement : `https://renovision-sandbox.biapi.pro`
3. Contactez le support Powens si le problème persiste

### Les webhooks ne sont pas reçus

**Cause** : L'URL webhook n'est pas accessible depuis l'extérieur

**Solution** :
1. En local, utilisez ngrok : `ngrok http 3001`
2. Testez l'URL webhook avec l'outil de test dans la console Powens
3. Vérifiez les logs de votre serveur backend

## 📊 Endpoints Powens configurés

Le service `bridge.service.js` utilise les endpoints suivants :

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/v2/connect` | GET | URL de connexion bancaire |
| `/v2/token` | POST | Échange code → token |
| `/v2/accounts` | GET | Liste des comptes |
| `/v2/accounts/:id/transactions` | GET | Transactions d'un compte |
| `/v2/accounts/:id/sync` | POST | Synchronisation forcée |
| `/v2/items/:id` | DELETE | Déconnexion |

**Base URL** : `https://renovision-sandbox.biapi.pro`

## 🚀 Prochaines étapes

Une fois la configuration testée avec succès :

1. ✅ **Créer les modèles de données** (CompteBancaire, TransactionBancaire)
2. ✅ **Implémenter les controllers** pour les routes API
3. ✅ **Créer le frontend** avec le widget de connexion
4. ✅ **Tester avec une banque de test** en sandbox
5. ✅ **Passer en production** quand tout fonctionne

## 📚 Ressources

- 📖 Documentation Powens : https://docs.powens.com/
- 🖥️ Console : https://console.powens.com/
- 🆘 Support : https://www.powens.com/contact
- 🔗 Votre sandbox : https://renovision-sandbox.biapi.pro

---

**Besoin d'aide ?** N'hésite pas à demander !

