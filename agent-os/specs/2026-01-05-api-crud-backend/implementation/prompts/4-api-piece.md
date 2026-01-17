We're implementing API CRUD Backend - Task Group 4:

## Implement this task and its sub-tasks:

#### Task Group 4: API Piece
**Dependencies:** Task Group 3

- [ ] 4.0 Implémenter les routes Piece
  - [ ] 4.1 Créer `src/validators/piece.validator.js`
    - createPieceSchema, updatePieceSchema
    - queryPieceSchema (type, statut, etage)
  - [ ] 4.2 Créer `src/controllers/piece.controller.js`
    - CRUD avec filtres
    - Include stats (count taches, budget)
  - [ ] 4.3 Créer `src/routes/piece.routes.js`
    - Routes imbriquées sous /api/projets/:projetId/pieces

**Acceptance Criteria:**
- CRUD Piece fonctionnel
- Filtres par type, statut, etage
- Stats incluses dans réponse

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/queries.md

