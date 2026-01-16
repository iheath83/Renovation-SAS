# Task Breakdown: Authentification

## Overview
Total Task Groups: 5
**Status: COMPLETED ✅**

## Task List

### Task Group 1: Schema Prisma & Dépendances
**Dependencies:** None
**Status:** ✅ Completed

- [x] 1.1 Installer bcrypt
- [x] 1.2 Ajouter champs password, resetToken, resetTokenExp au modèle User
- [x] 1.3 Créer modèle RefreshToken avec relation User
- [x] 1.4 Index sur email et expiresAt

### Task Group 2: Utilitaires Auth
**Dependencies:** Task Group 1
**Status:** ✅ Completed

- [x] 2.1 Créer `src/lib/password.js`
  - hashPassword(password)
  - comparePassword(password, hash)
- [x] 2.2 Créer `src/lib/tokens.js`
  - generateAccessToken(userId)
  - generateRefreshToken(userId)
  - verifyAccessToken(token)
  - verifyRefreshToken(token)
  - generateResetToken()
- [x] 2.3 Créer `src/validators/auth.validator.js`
  - registerSchema
  - loginSchema
  - refreshSchema
  - forgotPasswordSchema
  - resetPasswordSchema

### Task Group 3: Controller Auth
**Dependencies:** Task Group 2
**Status:** ✅ Completed

- [x] 3.1 Créer `src/controllers/auth.controller.js`
  - register: création user + tokens
  - login: vérification + tokens
  - refresh: nouveau access token
  - logout: suppression refresh token
  - forgotPassword: génération reset token
  - resetPassword: update password

### Task Group 4: Routes Auth
**Dependencies:** Task Group 3
**Status:** ✅ Completed

- [x] 4.1 Créer `src/routes/auth.routes.js`
  - POST /register
  - POST /login
  - POST /refresh
  - POST /logout (protected)
  - POST /forgot-password
  - POST /reset-password
- [x] 4.2 Monter les routes dans index.js

### Task Group 5: Nettoyage & Finalisation
**Dependencies:** Task Group 4
**Status:** ✅ Completed

- [x] 5.1 Créer job cleanup des refresh tokens expirés
- [x] 5.2 Mettre à jour le middleware auth pour utiliser verifyAccessToken
- [x] 5.3 Vérifier que register/login excluent le password de la réponse

## API Endpoints

### Auth (Public)
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Reset password

### Auth (Protected)
- `POST /api/auth/logout` - Déconnexion

## Configuration requise

Variables d'environnement:
- `ACCESS_TOKEN_SECRET` - Secret pour les access tokens
- `REFRESH_TOKEN_SECRET` - Secret pour les refresh tokens
- `DATABASE_URL` - URL de connexion PostgreSQL

## Fichiers créés

- `src/lib/password.js` - Utilitaires bcrypt
- `src/lib/tokens.js` - Utilitaires JWT
- `src/lib/cleanupTokens.js` - Nettoyage tokens expirés
- `src/validators/auth.validator.js` - Schemas Zod
- `src/controllers/auth.controller.js` - Logique auth
- `src/routes/auth.routes.js` - Routes Express
