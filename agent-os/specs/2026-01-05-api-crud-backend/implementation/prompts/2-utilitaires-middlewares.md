We're implementing API CRUD Backend - Task Group 2:

## Implement this task and its sub-tasks:

#### Task Group 2: Utilitaires et Middlewares
**Dependencies:** Task Group 1

- [ ] 2.0 Créer les helpers et middlewares de base
  - [ ] 2.1 Créer `src/lib/response.js`
    - `successResponse(data)` → `{ success: true, data }`
    - `listResponse(data, pagination)` → `{ success: true, data, pagination }`
    - `errorResponse(message, code, details)` → `{ success: false, error }`
  - [ ] 2.2 Créer `src/middlewares/errorHandler.js`
    - Catch toutes les erreurs async
    - Format standardisé des erreurs
    - Codes HTTP appropriés
  - [ ] 2.3 Créer `src/middlewares/auth.js`
    - Vérification header Authorization
    - Décodage JWT
    - Injection req.user
    - Gestion erreur 401
  - [ ] 2.4 Créer `src/middlewares/validate.js`
    - Middleware générique validate(schema)
    - Validation body, params, query
    - Format erreurs Zod

**Acceptance Criteria:**
- Helpers response fonctionnels
- Middlewares testables unitairement
- Auth middleware protège les routes

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/global/error-handling.md
@agent-os/standards/backend/api.md

