# Guide de configuration Powens

## 🎯 Objectif
Obtenir vos clés API Powens pour l'intégration bancaire dans RénoVision.

## 📝 Étapes détaillées

### 1. Création du compte Powens

1. **Accéder à la console** :
   - Allez sur https://console.powens.com/
   - Cliquez sur "S'inscrire" ou "Sign up"

2. **Remplir le formulaire d'inscription** :
   - Nom de l'entreprise : RénoVision (ou votre nom)
   - Email professionnel
   - Mot de passe sécurisé
   - Accepter les conditions d'utilisation

3. **Valider votre email** :
   - Vérifiez votre boîte mail
   - Cliquez sur le lien de confirmation
   - Connectez-vous à la console

### 2. Création d'un domaine (environnement)

Un domaine dans Powens correspond à un environnement (sandbox ou production).

1. **Créer un nouveau domaine** :
   - Dans la console, cliquez sur "Créer un domaine"
   - Nom du domaine : `renovision-sandbox`
   - Type : **Sandbox** (pour les tests)
   - Cliquez sur "Créer"

2. **Paramètres du domaine** :
   - Sélectionnez votre domaine
   - Notez l'**ID du domaine** (format : `dom_xxxxx`)

### 3. Création d'une application cliente

1. **Ajouter une application** :
   - Dans votre domaine, allez dans "Applications"
   - Cliquez sur "Créer une application"
   
2. **Configuration de l'application** :
   - Nom de l'application : `RénoVision Web`
   - Type d'application : **Server-side application**
   - Description : `Application web de gestion de rénovation`
   - Cliquez sur "Créer"

3. **Obtenir les identifiants** :
   - Une fois créée, vous verrez :
     - **Client ID** : `app_xxxxxxxxxxxxxxxxxx`
     - **Client Secret** : `sec_xxxxxxxxxxxxxxxxxx`
   - ⚠️ **IMPORTANT** : Copiez le Client Secret immédiatement, il ne sera plus affiché !

### 4. Configuration de l'URL de redirection

1. **Accéder aux paramètres de l'application** :
   - Dans votre application, allez dans "Paramètres"
   - Section "URLs de redirection"

2. **Ajouter l'URL** :
   - Cliquez sur "Ajouter une URL"
   - Entrez : `http://localhost:5173/comptes-bancaires/callback`
   - Cliquez sur "Enregistrer"

3. **Pour la production** (plus tard) :
   - Ajoutez également : `https://votre-domaine.com/comptes-bancaires/callback`

### 5. Configuration des webhooks

1. **Créer un webhook secret** :
   - Dans votre domaine, allez dans "Webhooks"
   - Cliquez sur "Générer un secret"
   - Notez le **Webhook Secret** : `whk_xxxxxxxxxxxxxxxxxx`

2. **Ajouter une URL webhook** (optionnel pour commencer) :
   - URL : `https://votre-domaine.com/api/bridge/webhook`
   - Pour le développement local, utilisez **ngrok** :
     ```bash
     ngrok http 3001
     # Utilisez l'URL HTTPS fournie par ngrok
     ```

3. **Sélectionner les événements** :
   - `item.connected` : Quand un compte bancaire est connecté
   - `item.error` : Erreur de synchronisation
   - `transactions.created` : Nouvelles transactions disponibles
   - `item.disconnected` : Compte déconnecté

### 6. Configuration du fichier .env

Maintenant que vous avez tous vos identifiants, configurez le fichier `.env` :

```bash
# Ouvrir le fichier .env
nano backend/.env
```

Remplacez les valeurs par vos vraies clés Powens :

```bash
# Powens API Configuration
BRIDGE_API_URL=https://sandbox.powens.com
BRIDGE_CLIENT_ID=app_votre_client_id_ici
BRIDGE_CLIENT_SECRET=sec_votre_client_secret_ici
BRIDGE_WEBHOOK_SECRET=whk_votre_webhook_secret_ici
BRIDGE_ENVIRONMENT=sandbox
BRIDGE_REDIRECT_URI=http://localhost:5173/comptes-bancaires/callback
```

**Exemple réel** :
```bash
BRIDGE_API_URL=https://sandbox.powens.com
BRIDGE_CLIENT_ID=app_7d3f9a2b8c1e5g4h
BRIDGE_CLIENT_SECRET=sec_k8m9n0p1q2r3s4t5
BRIDGE_WEBHOOK_SECRET=whk_u6v7w8x9y0z1a2b3
BRIDGE_ENVIRONMENT=sandbox
BRIDGE_REDIRECT_URI=http://localhost:5173/comptes-bancaires/callback
```

### 7. Tester la configuration

```bash
cd backend
node test-bridge.js
```

Vous devriez voir :
```
✅ Connect URL generated successfully
✅ Bridge API connection successful
✅ All credentials configured
```

## 🏦 Banques de test en Sandbox

Powens fournit des banques de test pour le développement :

| Banque | Identifiant | Mot de passe |
|--------|-------------|--------------|
| Test Bank | `12345678` | `1234` |
| Revolut Test | `user1` | `password1` |
| N26 Test | `user2` | `password2` |

**Note** : Les identifiants de test sont disponibles dans la documentation Powens.

## 🔒 Sécurité

### ⚠️ À NE JAMAIS FAIRE
- ❌ Commiter le fichier `.env` dans Git
- ❌ Partager vos secrets sur Slack/Discord/Email
- ❌ Utiliser les clés de production en développement
- ❌ Exposer les clés côté frontend

### ✅ Bonnes pratiques
- ✅ Utiliser des variables d'environnement
- ✅ Générer des secrets différents par environnement
- ✅ Rotations régulières des secrets en production
- ✅ Utiliser HTTPS en production
- ✅ Valider les signatures HMAC des webhooks

## 🐛 Dépannage

### Erreur : "Invalid client credentials"
- Vérifiez que `BRIDGE_CLIENT_ID` et `BRIDGE_CLIENT_SECRET` sont corrects
- Assurez-vous d'utiliser les clés du bon environnement (sandbox vs production)

### Erreur : "Redirect URI mismatch"
- Vérifiez que l'URL dans `.env` correspond exactement à celle configurée dans Powens
- Format exact : `http://localhost:5173/comptes-bancaires/callback`

### Webhooks non reçus
- En local, utilisez ngrok pour exposer votre serveur
- Vérifiez que l'URL webhook est accessible depuis l'extérieur
- Testez avec l'outil de test de webhooks dans la console Powens

### Erreur : "Bank not supported"
- En sandbox, utilisez uniquement les banques de test Powens
- Les vraies banques ne fonctionnent qu'en production

## 📊 Checklist finale

Avant de passer à l'étape suivante, vérifiez :

- [ ] Compte Powens créé et email validé
- [ ] Domaine sandbox créé
- [ ] Application cliente créée
- [ ] Client ID copié dans `.env`
- [ ] Client Secret copié dans `.env` (attention, affiché qu'une fois !)
- [ ] Webhook Secret généré et copié dans `.env`
- [ ] URL de redirection configurée dans Powens
- [ ] Fichier `.env` configuré avec toutes les bonnes valeurs
- [ ] Test `node test-bridge.js` réussi

## ✅ Prochaine étape

Une fois tous les éléments cochés, vous êtes prêt pour :
- Créer les modèles de données (CompteBancaire, TransactionBancaire)
- Implémenter les controllers et routes API
- Développer le frontend de connexion bancaire

## 🆘 Besoin d'aide ?

- Documentation Powens : https://docs.powens.com/
- Support Powens : https://www.powens.com/contact
- Centre d'aide : https://www.powens.com/fr/centre-daide/

