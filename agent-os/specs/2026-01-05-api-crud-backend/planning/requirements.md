# Spec Requirements: API CRUD Backend

## Initial Description
API CRUD Backend — Implémenter les endpoints REST pour toutes les entités avec validation et gestion d'erreurs.

## Requirements Discussion

### First Round Questions

**Q1:** Framework API — Express.js ou Fastify ?
**Answer:** Express.js

**Q2:** Structure des routes — Routes imbriquées par projet ou routes plates ?
**Answer:** Routes imbriquées par projet

**Q3:** Validation — Utilisation de Zod ?
**Answer:** Oui

**Q4:** Format réponses API — `{ success, data/error }` ?
**Answer:** Oui

**Q5:** Pagination — Offset-based ou cursor-based ?
**Answer:** Cursor-based

**Q6:** Soft delete — Comportement des endpoints DELETE ?
**Answer:** Soft delete (set deletedAt)

**Q7:** Filtrage — Quels filtres nécessaires ?
**Answer:** Tout ce qui est jugé nécessaire (à définir par entité)

**Q8:** Protection des routes — Inclure middleware auth ?
**Answer:** Oui, inclure la protection des routes

### Existing Code to Reference
- Schéma Prisma : `backend/prisma/schema.prisma`
- Client Prisma généré : `node_modules/@prisma/client`

## Visual Assets
No visual assets provided.

## Requirements Summary

### Functional Requirements

#### Structure API
- Framework : Express.js
- Routes imbriquées : `/api/projets/:projetId/pieces`, `/api/projets/:projetId/taches`, etc.
- Validation : Zod pour tous les inputs
- Format réponse : `{ success: boolean, data?: T, error?: { message, code } }`

#### Endpoints par entité

**User** (`/api/users`)
- GET `/api/users` - Liste des utilisateurs (admin only)
- GET `/api/users/:id` - Détail utilisateur
- PUT `/api/users/:id` - Mise à jour profil
- DELETE `/api/users/:id` - Soft delete

**Projet** (`/api/projets`)
- GET `/api/projets` - Liste des projets de l'utilisateur
- POST `/api/projets` - Créer un projet
- GET `/api/projets/:id` - Détail projet
- PUT `/api/projets/:id` - Mise à jour projet
- DELETE `/api/projets/:id` - Soft delete projet

**Piece** (`/api/projets/:projetId/pieces`)
- CRUD complet imbriqué sous projet
- Filtres : type, statut, etage

**Tache** (`/api/projets/:projetId/taches`)
- CRUD complet imbriqué sous projet
- Filtres : statut, priorite, pieceId
- Endpoints additionnels : gestion dépendances, sous-tâches

**Materiau** (`/api/projets/:projetId/materiaux`)
- CRUD complet imbriqué sous projet
- Filtres : categorie, unite

**Depense** (`/api/projets/:projetId/depenses`)
- CRUD complet imbriqué sous projet
- Filtres : categorie, pieceId, tacheId, passeDansCredit

**Credit** (`/api/projets/:projetId/credits`)
- CRUD complet imbriqué sous projet

**Deblocage** (`/api/projets/:projetId/credits/:creditId/deblocages`)
- CRUD complet imbriqué sous credit

**IdeePinterest** (`/api/projets/:projetId/idees`)
- CRUD complet imbriqué sous projet
- Filtres : style, tags

**Moodboard** (`/api/projets/:projetId/moodboards`)
- CRUD complet imbriqué sous projet
- Filtres : pieceId
- Endpoints additionnels : gestion des idées dans moodboard

#### Pagination cursor-based
- Format : `?cursor=xxx&limit=20`
- Réponse : `{ data: [], nextCursor: string | null, hasMore: boolean }`

#### Gestion d'erreurs
- Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)
- Format erreur : `{ success: false, error: { message, code, details? } }`

#### Middleware
- Auth middleware pour protection des routes
- Validation middleware avec Zod
- Error handler global

### Scope Boundaries

**In Scope:**
- Tous les endpoints CRUD pour les 10 entités principales
- Validation Zod des inputs
- Pagination cursor-based
- Soft delete
- Middleware auth (vérification token)
- Gestion d'erreurs standardisée
- Filtres sur endpoints list

**Out of Scope:**
- Implémentation complète de l'authentification (login, register, etc.) - spec #3
- Upload de fichiers - spec #15
- Logique métier complexe (calculs budget, extraction IA)
- Tests automatisés
- Documentation Swagger/OpenAPI

### Technical Considerations
- Express.js avec structure modulaire (routes, controllers, middlewares)
- Prisma Client pour les requêtes DB
- Zod pour validation
- Gestion des erreurs async avec try/catch ou middleware
- Soft delete : filtrer automatiquement les entités avec deletedAt != null

