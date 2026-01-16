# Spec: Authentification

## Goal
Implémenter un système d'authentification complet avec inscription, connexion, gestion de sessions JWT, rôles utilisateurs et protection des routes API.

## User Stories

1. **En tant qu'utilisateur**, je peux m'inscrire avec mon email et mot de passe
2. **En tant qu'utilisateur**, je peux me connecter et recevoir un token JWT
3. **En tant qu'utilisateur**, je peux me déconnecter
4. **En tant qu'utilisateur**, je peux rafraîchir mon token avant expiration
5. **En tant qu'admin**, j'ai accès aux routes d'administration

## Requirements

### 1. Inscription (Register)
- POST /api/auth/register
- Body: { email, password, name }
- Validation:
  - Email unique et format valide
  - Password: min 8 caractères, 1 majuscule, 1 chiffre
  - Name: min 2 caractères
- Hash du password avec bcrypt (12 rounds)
- Retourne le user (sans password) + tokens

### 2. Connexion (Login)
- POST /api/auth/login
- Body: { email, password }
- Vérifie que le user existe et n'est pas soft-deleted
- Compare le password hashé
- Génère access token (15min) + refresh token (7 jours)
- Retourne user + tokens

### 3. Refresh Token
- POST /api/auth/refresh
- Body: { refreshToken }
- Vérifie la validité du refresh token
- Génère nouveaux access + refresh tokens
- Invalide l'ancien refresh token

### 4. Déconnexion (Logout)
- POST /api/auth/logout
- Header: Authorization Bearer token
- Invalide le refresh token courant

### 5. Mot de passe oublié
- POST /api/auth/forgot-password
- Body: { email }
- Génère un token de reset (1h validité)
- Retourne succès (pas d'info si email existe ou non)

### 6. Reset Password
- POST /api/auth/reset-password
- Body: { token, newPassword }
- Vérifie validité du token
- Met à jour le password
- Invalide tous les refresh tokens de l'utilisateur

### 7. Modèle RefreshToken
Ajouter au schema Prisma:
```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiresAt])
}
```

### 8. Champ password sur User
Ajouter au modèle User:
```prisma
model User {
  // ... existing fields
  password      String
  resetToken    String?
  resetTokenExp DateTime?
  
  refreshTokens RefreshToken[]
}
```

### 9. Configuration JWT
- ACCESS_TOKEN_SECRET (env)
- REFRESH_TOKEN_SECRET (env)
- ACCESS_TOKEN_EXPIRY: 15m
- REFRESH_TOKEN_EXPIRY: 7d

### 10. Middleware auth existant
- Garder le middleware actuel
- Vérifier que le token n'est pas expiré
- Injecter req.user

## Out of Scope
- OAuth (Google, GitHub)
- 2FA
- Rate limiting (sera dans une spec sécurité dédiée)
- Email sending (logs en console pour dev)

## Technical Notes
- Utiliser bcrypt pour le hashing
- jsonwebtoken pour JWT
- Stocker les refresh tokens en base pour pouvoir les invalider

