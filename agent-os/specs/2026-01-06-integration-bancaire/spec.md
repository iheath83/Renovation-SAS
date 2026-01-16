# Specification: Intégration Bancaire

## Goal
Implémenter la connexion bancaire sécurisée via Bridge API pour récupérer automatiquement les transactions bancaires et les transformer en dépenses dans RénoVision, avec catégorisation intelligente et rapprochement manuel.

## User Stories
- As a propriétaire en rénovation, I want to connecter mon compte bancaire so that mes dépenses de rénovation soient automatiquement importées dans l'application
- As a utilisateur, I want to voir mes transactions bancaires non catégorisées so that je peux les associer à des pièces, tâches ou matériaux de mon projet
- As a utilisateur, I want to recevoir des suggestions de catégorisation so that je gagne du temps dans le tri de mes transactions
- As a utilisateur, I want to déconnecter mon compte bancaire so that je contrôle l'accès à mes données financières

## Specific Requirements

### Backend Requirements

**Nouvelle entité CompteBancaire**
- Champs : id, projetId, userId, bridgeItemId, banque, derniereSynchronisation, actif, createdAt, updatedAt, deletedAt
- Relation many-to-one vers Projet et User
- Stockage sécurisé du bridgeItemId pour les appels API ultérieurs

**Nouvelle entité TransactionBancaire**
- Champs : id, compteBancaireId, bridgeTransactionId, montant, description, dateTransaction, categorie, estDepenseRenovation (boolean), depenseId (nullable), statut (enum: NOUVEAU, IGNORE, CONVERTI), metadata (Json), createdAt, updatedAt
- Enum StatutTransaction : NOUVEAU, IGNORE, CONVERTI
- Relation many-to-one vers CompteBancaire
- Relation optionnelle vers Depense (quand convertie)
- Index sur bridgeTransactionId (unique) pour éviter les doublons

**Modification de l'entité Depense**
- Ajout champ transactionBancaireId (nullable) pour lien vers transaction source
- Ajout champ importeAutomatiquement (boolean, default false)

**API Bridge Integration**
- Service backend pour gérer les webhooks Bridge API
- Endpoint POST /api/bridge/webhook pour recevoir les notifications de nouvelles transactions
- Endpoint POST /api/comptes-bancaires/connect pour initier la connexion Bridge
- Endpoint GET /api/comptes-bancaires pour lister les comptes connectés
- Endpoint DELETE /api/comptes-bancaires/:id pour déconnecter un compte
- Endpoint POST /api/comptes-bancaires/:id/sync pour forcer une synchronisation
- Endpoint GET /api/transactions-bancaires pour lister les transactions non traitées
- Endpoint POST /api/transactions-bancaires/:id/convert pour convertir en dépense
- Endpoint POST /api/transactions-bancaires/:id/ignore pour marquer comme ignorée

**Logique de catégorisation intelligente**
- Analyse des descriptions de transactions avec mots-clés (Leroy Merlin, Castorama, etc.)
- Suggestion automatique de catégorie de dépense
- Matching avec matériaux existants dans le catalogue (par nom de fournisseur)

**Sécurité**
- Stockage sécurisé des tokens Bridge API (variables d'environnement)
- Validation des signatures de webhook Bridge
- Logs d'audit pour toutes les connexions/déconnexions bancaires
- Rate limiting sur les endpoints de synchronisation

### Frontend Requirements

**Page Connexion Bancaire (/comptes-bancaires)**
- Bouton "Connecter un compte bancaire" qui ouvre le Bridge Widget
- Liste des comptes bancaires connectés avec :
  - Logo de la banque
  - Nom du compte
  - Date de dernière synchronisation
  - Bouton "Synchroniser maintenant"
  - Bouton "Déconnecter"
- Section "Transactions à traiter" avec compteur

**Page Transactions Bancaires (/transactions)**
- Liste des transactions non traitées (statut NOUVEAU)
- Chaque transaction affiche :
  - Date, montant, description
  - Badge de suggestion de catégorie (si détectée)
  - Actions : "Créer une dépense" ou "Ignorer"
- Filtres : date, montant, statut
- Modal de conversion en dépense :
  - Pré-remplissage du montant et description
  - Sélection de pièce, tâche, matériau
  - Sélection de catégorie
  - Upload de facture (optionnel)
  - Case "Passé dans crédit"

**Integration dans Dashboard**
- Widget "Transactions récentes" avec lien vers page complète
- Badge de notification sur menu "Transactions" si nouvelles transactions

**Configuration Bridge API**
- Variables d'environnement :
  - BRIDGE_API_KEY
  - BRIDGE_API_SECRET
  - BRIDGE_WEBHOOK_SECRET
  - BRIDGE_ENVIRONMENT (sandbox/production)

## Visual Design

**Page Connexion Bancaire**
- Design glassmorphism cohérent avec le reste de l'app
- Animation de loading pendant la synchronisation
- Empty state avec illustration quand aucun compte connecté

**Modal Bridge Widget**
- Integration du Bridge Connect Widget en modal
- Design centré, overlay avec blur
- Messages d'erreur clairs si la connexion échoue

**Liste Transactions**
- Cards avec badge coloré selon statut
- Animation smooth lors de la conversion/ignore
- Indication visuelle des suggestions IA (icône étoile)

## Existing Code to Leverage

**Backend**
- Structure API existante dans `backend/src/routes/`
- Middlewares de validation avec Zod
- Client Prisma dans `backend/src/lib/prisma.js`

**Frontend**
- Hooks React Query existants dans `frontend/src/hooks/`
- Composants UI réutilisables (Button, Card, Modal)
- Layout glassmorphism existant

## Out of Scope

- Support de multiples API bancaires (uniquement Bridge API pour MVP)
- Catégorisation automatique par machine learning avancé
- Rapprochement automatique 100% sans intervention humaine
- Gestion des comptes bancaires professionnels multi-devises
- Prédiction budgétaire basée sur l'historique bancaire
- Export des transactions vers des logiciels de comptabilité
- Support des paiements récurrents (abonnements)
- Détection de fraude ou anomalies

## Technical Dependencies

**NPM Packages Backend**
- `@bridge-api/node` : SDK officiel Bridge API
- `crypto` : Validation des signatures webhook (natif Node.js)

**NPM Packages Frontend**
- `@bridge-api/connect` : Widget de connexion Bridge

**Bridge API Setup**
- Création compte développeur sur https://dashboard.bridgeapi.io/
- Configuration du webhook URL
- Génération des clés API (sandbox puis production)
- Whitelist du domaine frontend pour le widget

## Success Metrics
- Temps moyen de saisie d'une dépense réduit de 80%
- Au moins 70% des transactions pertinentes correctement suggérées
- 0 erreur de synchronisation après 1 mois d'utilisation
- Taux de connexion bancaire réussie > 95%

