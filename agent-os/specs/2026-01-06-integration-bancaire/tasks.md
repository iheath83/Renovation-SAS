# Tasks: Intégration Bancaire

## 1. Setup Bridge API & Backend Configuration
- [ ] Créer compte développeur Bridge API (https://dashboard.bridgeapi.io/)
- [ ] Générer clés API sandbox
- [ ] Ajouter variables d'environnement backend (.env)
- [ ] Installer package `@bridge-api/node`
- [ ] Créer service Bridge initial (`src/services/bridge.service.js`)
- [ ] Tester connexion API en sandbox

## 2. Modèle de données (CompteBancaire, TransactionBancaire)
- [ ] Créer enum StatutTransaction dans schema.prisma
- [ ] Créer modèle CompteBancaire
- [ ] Créer modèle TransactionBancaire
- [ ] Modifier modèle Depense (ajout relations)
- [ ] Générer et exécuter migration Prisma
- [ ] Vérifier les relations et index

## 3. Service Backend Bridge & Webhooks
- [ ] Implémenter `bridge.service.js` avec méthodes :
  - exchangeCode() - Échange code OAuth contre token
  - getTransactions() - Récupère transactions
  - disconnectAccount() - Révoque accès
- [ ] Créer validation signature webhook
- [ ] Créer controller `bridge.controller.js`
- [ ] Implémenter route POST /api/bridge/webhook
- [ ] Logger tous les événements webhook
- [ ] Gérer les erreurs et retry

## 4. API Routes Comptes Bancaires
- [ ] Créer `compteBancaire.controller.js`
- [ ] POST /api/bridge/callback - Enregistrer nouveau compte
- [ ] GET /api/projets/:id/comptes-bancaires - Lister comptes
- [ ] POST /api/comptes-bancaires/:id/sync - Forcer sync
- [ ] DELETE /api/comptes-bancaires/:id - Déconnexion
- [ ] Ajouter middleware auth et validation Zod
- [ ] Ajouter route dans `src/routes/index.js`

## 5. API Routes Transactions Bancaires
- [ ] Créer `transactionBancaire.controller.js`
- [ ] GET /api/projets/:id/transactions-bancaires - Liste + filtres
- [ ] POST /api/transactions-bancaires/:id/convert - Conversion
- [ ] PATCH /api/transactions-bancaires/:id/ignore - Ignorer
- [ ] GET /api/transactions-bancaires/stats - Statistiques
- [ ] Ajouter validation et gestion erreurs

## 6. Logique de Catégorisation Intelligente
- [ ] Créer `categorisation.service.js`
- [ ] Implémenter règles keywords (Leroy Merlin, etc.)
- [ ] Implémenter matching fournisseur → matériau
- [ ] Ajouter fonction de scoring de confiance
- [ ] Tester avec transactions réelles anonymisées

## 7. Frontend Hooks & API Client
- [ ] Ajouter méthodes dans `api.ts` :
  - getComptesBancaires()
  - connectCompteBancaire()
  - syncCompteBancaire()
  - disconnectCompteBancaire()
  - getTransactionsBancaires()
  - convertTransaction()
  - ignoreTransaction()
- [ ] Créer `useComptesBancaires.ts` (React Query)
- [ ] Créer `useTransactionsBancaires.ts`
- [ ] Créer types TypeScript dans `types/compteBancaire.ts`

## 8. Page Connexion Bancaire
- [ ] Installer package `@bridge-api/connect` frontend
- [ ] Créer page `frontend/src/pages/ComptesBancaires.tsx`
- [ ] Composant `BridgeConnectButton` avec widget
- [ ] Composant `CompteBancaireCard` (liste comptes)
- [ ] Implémenter sync manuel et déconnexion
- [ ] Empty state quand aucun compte
- [ ] Gestion des erreurs et loading states

## 9. Page Transactions & Modal Conversion
- [ ] Créer page `frontend/src/pages/TransactionsBancaires.tsx`
- [ ] Composant `TransactionCard` avec statut badges
- [ ] Filtres : date, montant, statut
- [ ] Créer `TransactionConversionModal.tsx`
- [ ] Pré-remplissage des champs depuis transaction
- [ ] Sélecteurs pièce/tâche/matériau
- [ ] Validation formulaire
- [ ] Animation lors de la conversion

## 10. Integration Dashboard & Notifications
- [ ] Ajouter widget "Transactions récentes" au Dashboard
- [ ] Badge notification dans Sidebar pour nouvelles transactions
- [ ] Invalider cache React Query après conversion
- [ ] Toast de succès/erreur
- [ ] Ajouter lien menu vers `/transactions`

## Bonus (si temps)
- [ ] Cron job automatique de synchronisation (toutes les 4h)
- [ ] Export CSV des transactions
- [ ] Graphique des dépenses par banque
- [ ] Paramètre pour activer/désactiver sync auto

