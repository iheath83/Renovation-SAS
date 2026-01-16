# Spec Requirements: Modèle de données & Prisma

## Initial Description
Modèle de données & Prisma — Créer les 8 entités (Piece, Tache, Materiau, Depense, Credit, Deblocage, IdeePinterest, Moodboard, User) avec leurs relations et migrations Prisma.

## Requirements Discussion

### First Round Questions

**Q1:** Multi-utilisateur — J'assume que chaque utilisateur a son propre projet de rénovation isolé (les pièces, tâches, etc. appartiennent à un seul User). C'est correct, ou un projet peut être partagé entre plusieurs utilisateurs ?
**Answer:** Oui c'est exact, et un projet peut avoir plusieurs utilisateurs.

**Q2:** Relations Pièce ↔ Tâche — J'assume qu'une tâche est toujours liée à une pièce (relation obligatoire). Ou peut-on avoir des tâches "globales" sans pièce assignée ?
**Answer:** On peut avoir des tâches globales sans pièce assignée.

**Q3:** Dépendances entre tâches — J'assume une relation many-to-many (une tâche peut dépendre de plusieurs tâches, et être prérequis de plusieurs autres). C'est bien ça ?
**Answer:** Oui.

**Q4:** Matériaux ↔ Pièces — J'assume qu'un matériau peut être utilisé dans plusieurs pièces. Faut-il tracker la quantité par pièce séparément ?
**Answer:** Oui.

**Q5:** Dépenses ↔ Entités — Dans instructions.txt, les dépenses ont des "associations". À quelles entités peuvent-elles être liées ?
**Answer:** Tâches, matériaux, et pièces (les trois).

**Q6:** Déblocages ↔ Dépenses — L'indicateur "passé dans crédit" sur les dépenses signifie-t-il qu'une dépense peut être liée à un déblocage spécifique ?
**Answer:** Oui.

**Q7:** IdeePinterest ↔ Moodboard — J'assume qu'une idée peut appartenir à plusieurs moodboards (many-to-many). Correct ?
**Answer:** Oui, et j'aimerais avoir un système de recherche Pinterest intégré.

**Q8:** Soft delete ou hard delete — Faut-il implémenter un système de suppression logique (soft delete avec deletedAt) pour les entités principales ?
**Answer:** Oui.

### Follow-up Questions

**Follow-up 1:** Recherche Pinterest intégrée — Est-ce une intégration API Pinterest ou simplement un champ URL avec extraction de métadonnées ?
**Answer:** URL Pinterest et extraction de données.

**Follow-up 2:** Y a-t-il un projet backend Node.js/Prisma existant à référencer ?
**Answer:** Non, on part de zéro.

### Existing Code to Reference
No similar existing features identified for reference. Starting from scratch.

## Visual Assets
No visual assets provided.

## Requirements Summary

### Functional Requirements

#### Entités à créer (9 entités)
1. **User** - Utilisateur avec budget_max_projet, rôle (admin/user)
2. **Projet** - Projet de rénovation (implicite, pour multi-utilisateur)
3. **Piece** - Zone de rénovation avec budget, statut, étage, type, surface
4. **Tache** - Gestion Kanban avec dépendances, sous-tâches, deadlines, coûts (pièce optionnelle)
5. **Materiau** - Catalogue avec prix, quantités, références, fournisseurs
6. **Depense** - Suivi financier avec factures, catégories, associations multiples
7. **Credit** - Crédits travaux avec montant total et banque
8. **Deblocage** - Versements de crédit avec justificatifs
9. **IdeePinterest** - Inspirations avec extraction IA de métadonnées (via URL)
10. **Moodboard** - Collections visuelles avec palettes de couleurs

#### Relations clés
- User ↔ Projet : many-to-many (un projet peut avoir plusieurs utilisateurs)
- Projet → Piece/Tache/Materiau/etc. : one-to-many
- Piece → Tache : one-to-many (optionnel côté Tache)
- Tache ↔ Tache : many-to-many (dépendances)
- Materiau ↔ Piece : many-to-many avec quantité par pièce (table pivot)
- Depense → Tache/Materiau/Piece : relations optionnelles multiples
- Depense → Deblocage : many-to-one (optionnel)
- Credit → Deblocage : one-to-many
- IdeePinterest ↔ Moodboard : many-to-many
- Moodboard → Piece : many-to-one (optionnel)

#### Fonctionnalités transverses
- Soft delete (deletedAt) sur toutes les entités principales
- Timestamps (createdAt, updatedAt) automatiques
- Extraction métadonnées Pinterest via URL (pour IdeePinterest)

### Scope Boundaries

**In Scope:**
- Schéma Prisma complet avec toutes les entités et relations
- Migrations Prisma initiales
- Types et enums nécessaires (statuts, catégories, unités)
- Configuration de la connexion PostgreSQL
- Soft delete pattern

**Out of Scope:**
- API REST endpoints (roadmap item #2)
- Authentification (roadmap item #3)
- Logique d'extraction Pinterest/IA (sera dans le module Idées)
- Upload de fichiers (roadmap item #15)

### Technical Considerations
- ORM: Prisma avec PostgreSQL
- Pattern soft delete avec champ `deletedAt: DateTime?`
- Tables pivot explicites pour relations many-to-many avec données additionnelles
- Enums Prisma pour les statuts et types
- Index sur les champs fréquemment requêtés (userId, projetId, deletedAt)

