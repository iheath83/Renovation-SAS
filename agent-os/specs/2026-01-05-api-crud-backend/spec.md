# Specification: API CRUD Backend

## Goal
Implémenter une API REST complète avec Express.js pour toutes les entités RénoVision, incluant validation Zod, pagination cursor-based, soft delete et protection des routes.

## User Stories
- As a développeur frontend, I want to avoir des endpoints REST standardisés so that je peux construire l'interface utilisateur
- As a utilisateur, I want to que mes données soient accessibles via API so that je peux gérer mon projet de rénovation

## Specific Requirements

**Structure Express.js**
- Point d'entrée : `src/index.js` avec configuration Express
- Structure modulaire : `src/routes/`, `src/controllers/`, `src/middlewares/`, `src/validators/`
- Prisma Client singleton dans `src/lib/prisma.js`
- Variables d'environnement : PORT, DATABASE_URL, JWT_SECRET

**Format de réponse standardisé**
- Succès : `{ success: true, data: T }`
- Succès liste : `{ success: true, data: T[], pagination: { nextCursor, hasMore } }`
- Erreur : `{ success: false, error: { message: string, code: string, details?: any } }`
- Helper functions dans `src/lib/response.js`

**Middleware Auth**
- Vérification du header `Authorization: Bearer <token>`
- Extraction de l'userId du token JWT
- Injection de `req.user` avec les infos utilisateur
- Protection de toutes les routes sauf health check

**Middleware Validation Zod**
- Schémas Zod dans `src/validators/` par entité
- Middleware générique `validate(schema)` pour body, params, query
- Messages d'erreur formatés en français

**Routes Projet** (`/api/projets`)
- GET `/` - Liste projets de l'utilisateur (cursor pagination)
- POST `/` - Créer projet (user devient OWNER)
- GET `/:projetId` - Détail avec stats
- PUT `/:projetId` - Mise à jour
- DELETE `/:projetId` - Soft delete
- Middleware : vérifier que l'utilisateur est membre du projet

**Routes Piece** (`/api/projets/:projetId/pieces`)
- CRUD complet avec filtres : `?type=CUISINE&statut=EN_COURS&etage=1`
- Include : count taches, budget consommé

**Routes Tache** (`/api/projets/:projetId/taches`)
- CRUD complet avec filtres : `?statut=EN_COURS&priorite=HAUTE&pieceId=xxx`
- POST `/:tacheId/sous-taches` - Ajouter sous-tâche
- PUT `/:tacheId/sous-taches/:id` - Modifier sous-tâche
- DELETE `/:tacheId/sous-taches/:id` - Supprimer sous-tâche
- POST `/:tacheId/dependances` - Ajouter dépendance
- DELETE `/:tacheId/dependances/:depId` - Retirer dépendance

**Routes Materiau** (`/api/projets/:projetId/materiaux`)
- CRUD complet avec filtres : `?categorie=PEINTURE&unite=LITRE`
- POST `/:materiauId/pieces` - Associer à une pièce avec quantité
- DELETE `/:materiauId/pieces/:pieceId` - Dissocier d'une pièce

**Routes Depense** (`/api/projets/:projetId/depenses`)
- CRUD complet avec filtres : `?categorie=xxx&pieceId=xxx&passeDansCredit=true`
- Associations optionnelles : pieceId, tacheId, materiauId, deblocageId

**Routes Credit & Deblocage** (`/api/projets/:projetId/credits`)
- CRUD Credit
- Routes imbriquées : `/credits/:creditId/deblocages` pour CRUD Deblocage

**Routes Idées & Moodboards** (`/api/projets/:projetId/idees`, `/moodboards`)
- CRUD IdeePinterest avec filtres : `?style=xxx&tags=tag1,tag2`
- CRUD Moodboard avec filtres : `?pieceId=xxx`
- POST `/moodboards/:id/idees` - Ajouter idée au moodboard
- DELETE `/moodboards/:id/idees/:ideeId` - Retirer idée

**Soft Delete Pattern**
- DELETE endpoints : set `deletedAt = now()`
- Tous les GET : filtrer `where: { deletedAt: null }`
- Option `?includeDeleted=true` pour admin

**Pagination Cursor-based**
- Query params : `?cursor=xxx&limit=20` (limit max 100, default 20)
- Cursor = ID de la dernière entité
- Réponse : `{ data, pagination: { nextCursor, hasMore, total? } }`

## Visual Design
No visual assets provided.

## Existing Code to Leverage
- `backend/prisma/schema.prisma` — Schéma de données complet
- `backend/prisma.config.ts` — Configuration Prisma
- `backend/package.json` — Dépendances de base

## Out of Scope
- Login, register, forgot password (spec #3 Authentification)
- Upload de fichiers images/factures (spec #15)
- Extraction IA métadonnées Pinterest
- Tests automatisés
- Documentation Swagger/OpenAPI
- Rate limiting
- Logging avancé

