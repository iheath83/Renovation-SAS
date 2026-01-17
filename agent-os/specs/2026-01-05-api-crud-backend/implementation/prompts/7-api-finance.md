We're implementing API CRUD Backend - Task Group 7:

## Implement this task and its sub-tasks:

#### Task Group 7: API Credit, Deblocage, Depense
**Dependencies:** Task Group 5

- [ ] 7.0 Implémenter les routes financières
  - [ ] 7.1 Créer validators pour Credit, Deblocage, Depense
    - Schemas création/update
    - Filtres depense : categorie, pieceId, passeDansCredit
  - [ ] 7.2 Créer `src/controllers/credit.controller.js`
    - CRUD Credit
  - [ ] 7.3 Créer `src/controllers/deblocage.controller.js`
    - CRUD Deblocage imbriqué sous Credit
  - [ ] 7.4 Créer `src/controllers/depense.controller.js`
    - CRUD Depense avec associations optionnelles
  - [ ] 7.5 Créer routes financières
    - /api/projets/:projetId/credits
    - /api/projets/:projetId/credits/:creditId/deblocages
    - /api/projets/:projetId/depenses

**Acceptance Criteria:**
- Chaîne Credit → Deblocage fonctionnelle
- Depense liable à piece/tache/materiau/deblocage

## Context

Read @agent-os/specs/2026-01-05-api-crud-backend/spec.md for full context.

## Implementation

1. Implement assigned tasks only
2. Update tasks.md to mark completed: `- [x]`

## Standards

@agent-os/standards/global/coding-style.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/queries.md

