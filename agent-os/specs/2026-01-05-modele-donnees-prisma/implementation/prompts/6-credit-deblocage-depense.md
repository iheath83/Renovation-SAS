We're continuing our implementation of Modèle de données & Prisma by implementing task group number 6:

## Implement this task and its sub-tasks:

#### Task Group 6: Credit, Deblocage, Depense
**Dependencies:** Task Group 5

- [ ] 6.0 Créer les modèles financiers
  - [ ] 6.1 Modèle Credit
    - id, projetId, banque, montantTotal (Float)
    - tauxInteret (Float?), duree (Int?), notes
    - createdAt, updatedAt, deletedAt
    - Relation vers Projet, Deblocage[]
  - [ ] 6.2 Modèle Deblocage
    - id, creditId, montant (Float), dateDeblocage
    - justificatifs (Json), notes
    - createdAt, updatedAt, deletedAt
    - Relations vers Credit, Depense[]
  - [ ] 6.3 Modèle Depense
    - id, projetId, montant (Float), description, categorie
    - dateDepense, factures (Json), passeDansCredit (Boolean @default(false))
    - pieceId?, tacheId?, materiauId?, deblocageId? (tous optionnels)
    - createdAt, updatedAt, deletedAt
    - Relations optionnelles vers Piece, Tache, Materiau, Deblocage

**Acceptance Criteria:**
- Chaîne Credit → Deblocage → Depense fonctionnelle
- Dépenses liables à plusieurs entités (Piece, Tache, Materiau)
- Flag passeDansCredit pour le suivi

## Understand the context

Read @agent-os/specs/2026-01-05-modele-donnees-prisma/spec.md to understand the context for this spec and where the current task fits into it.

Also read these further context and reference:
- @agent-os/specs/2026-01-05-modele-donnees-prisma/planning/requirements.md
- @agent-os/specs/2026-01-05-modele-donnees-prisma/planning/visuals

## Perform the implementation

Implement all tasks assigned to you and ONLY those task(s) that have been assigned to you.

## Implementation process:

1. Analyze the provided spec.md, requirements.md, and visuals (if any)
2. Analyze patterns in the codebase according to its built-in workflow
3. Implement the assigned task group according to requirements and standards
4. Update `agent-os/specs/2026-01-05-modele-donnees-prisma/tasks.md` to update the tasks you've implemented to mark that as done by updating their checkbox to checked state: `- [x]`

## Guide your implementation using:
- **The existing patterns** that you've found and analyzed in the codebase.
- **Specific notes provided in requirements.md, spec.md AND/OR tasks.md**
- **Visuals provided (if any)** which would be located in `agent-os/specs/2026-01-05-modele-donnees-prisma/planning/visuals/`
- **User Standards & Preferences** which are defined below.

## Self-verify and test your work by:
- Running ONLY the tests you've written (if any) and ensuring those tests pass.
- IF your task involves user-facing UI, and IF you have access to browser testing tools, open a browser and use the feature you've implemented as if you are a user to ensure a user can use the feature in the intended way.
  - Take screenshots of the views and UI elements you've tested and store those in `agent-os/specs/2026-01-05-modele-donnees-prisma/verification/screenshots/`. Do not store screenshots anywhere else in the codebase other than this location.
  - Analyze the screenshot(s) you've taken to check them against your current requirements.


## User Standards & Preferences Compliance

IMPORTANT: Ensure that your implementation work is ALIGNED and DOES NOT CONFLICT with the user's preferences and standards as detailed in the following files:

@agent-os/standards/global/coding-style.md
@agent-os/standards/global/commenting.md
@agent-os/standards/global/conventions.md
@agent-os/standards/global/error-handling.md
@agent-os/standards/global/tech-stack.md
@agent-os/standards/global/validation.md
@agent-os/standards/backend/api.md
@agent-os/standards/backend/migrations.md
@agent-os/standards/backend/models.md
@agent-os/standards/backend/queries.md
@agent-os/standards/frontend/accessibility.md
@agent-os/standards/frontend/components.md
@agent-os/standards/frontend/css.md
@agent-os/standards/frontend/responsive.md
@agent-os/standards/testing/test-writing.md

