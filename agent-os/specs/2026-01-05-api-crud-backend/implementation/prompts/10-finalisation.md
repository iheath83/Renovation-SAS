We're implementing API CRUD Backend - Task Group 10:

## Implement this task and its sub-tasks:

#### Task Group 10: Montage routes & Tests manuels
**Dependencies:** Task Groups 3-9

- [ ] 10.0 Finaliser l'API
  - [ ] 10.1 Monter toutes les routes dans index.js
    - Import et use de toutes les routes
    - Ordre correct des middlewares
  - [ ] 10.2 Ajouter route health check
    - GET /api/health → { status: 'ok' }
  - [ ] 10.3 Vérifier soft delete global
    - Tous les GET filtrent deletedAt: null
    - Tous les DELETE font soft delete
  - [ ] 10.4 Tester manuellement les endpoints
    - Vérifier format réponses
    - Vérifier pagination
    - Vérifier filtres

**Acceptance Criteria:**
- Toutes les routes montées
- API fonctionnelle end-to-end
- Format réponses cohérent

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md

