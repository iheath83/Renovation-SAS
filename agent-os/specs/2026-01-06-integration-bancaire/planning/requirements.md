# Requirements: Intégration Bancaire

## User Flows

### Flow 1: Première connexion bancaire
1. Utilisateur accède à `/comptes-bancaires`
2. Clique sur "Connecter un compte bancaire"
3. Modal Bridge Widget s'ouvre
4. Utilisateur sélectionne sa banque et s'authentifie
5. Callback de succès reçu, compte enregistré
6. Synchronisation initiale des transactions (30 derniers jours)
7. Badge "X nouvelles transactions" apparaît

### Flow 2: Conversion d'une transaction en dépense
1. Utilisateur accède à `/transactions`
2. Voit liste des transactions non traitées
3. Clique sur "Créer une dépense" pour une transaction
4. Modal s'ouvre avec champs pré-remplis
5. Sélectionne pièce/tâche/matériau (optionnel)
6. Choisit catégorie (suggestion affichée)
7. Valide → transaction marquée CONVERTI, dépense créée

### Flow 3: Synchronisation périodique
1. Cron job backend (toutes les 4h) ou webhook Bridge
2. Backend récupère nouvelles transactions
3. Vérifie doublons via bridgeTransactionId
4. Sauvegarde nouvelles transactions avec statut NOUVEAU
5. Frontend reçoit notification via React Query invalidation
6. Badge mis à jour automatiquement

### Flow 4: Déconnexion d'un compte
1. Utilisateur clique "Déconnecter" sur un compte
2. Modal de confirmation
3. Backend révoque l'accès Bridge API
4. Compte marqué actif=false (soft delete)
5. Transactions associées conservées mais plus de sync

## Data Model Extensions

### Nouvelle table: CompteBancaire
```prisma
model CompteBancaire {
  id                      String   @id @default(cuid())
  projetId                String
  userId                  String
  bridgeItemId            String   @unique
  banque                  String
  derniereSynchronisation DateTime?
  actif                   Boolean  @default(true)
  
  projet                  Projet   @relation(fields: [projetId], references: [id], onDelete: Cascade)
  user                    User     @relation(fields: [userId], references: [id])
  transactions            TransactionBancaire[]
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  deletedAt               DateTime?
  
  @@index([projetId])
  @@index([userId])
}
```

### Nouvelle table: TransactionBancaire
```prisma
enum StatutTransaction {
  NOUVEAU
  IGNORE
  CONVERTI
}

model TransactionBancaire {
  id                    String              @id @default(cuid())
  compteBancaireId      String
  bridgeTransactionId   String              @unique
  montant               Float
  description           String
  dateTransaction       DateTime
  categorie             String?
  estDepenseRenovation  Boolean             @default(false)
  depenseId             String?             @unique
  statut                StatutTransaction   @default(NOUVEAU)
  metadata              Json?
  
  compteBancaire        CompteBancaire      @relation(fields: [compteBancaireId], references: [id], onDelete: Cascade)
  depense               Depense?            @relation(fields: [depenseId], references: [id])
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@index([compteBancaireId])
  @@index([statut])
  @@index([dateTransaction])
}
```

### Modification table Depense
```prisma
model Depense {
  // ... champs existants ...
  transactionBancaireId  String?              @unique
  importeAutomatiquement Boolean              @default(false)
  
  transactionBancaire    TransactionBancaire?
}
```

## API Endpoints

### Backend Routes

**Comptes Bancaires**
- `POST /api/bridge/callback` - Callback après connexion Bridge Widget
- `POST /api/bridge/webhook` - Webhook pour nouvelles transactions
- `GET /api/projets/:id/comptes-bancaires` - Liste des comptes du projet
- `POST /api/projets/:id/comptes-bancaires/:compteId/sync` - Force synchronisation
- `DELETE /api/comptes-bancaires/:id` - Déconnexion

**Transactions Bancaires**
- `GET /api/projets/:id/transactions-bancaires?statut=NOUVEAU` - Liste transactions
- `POST /api/transactions-bancaires/:id/convert` - Convertir en dépense
- `PATCH /api/transactions-bancaires/:id/ignore` - Marquer comme ignorée
- `GET /api/transactions-bancaires/stats` - Statistiques (count par statut)

## Security Considerations

1. **Variables d'environnement sensibles**
   - BRIDGE_API_KEY
   - BRIDGE_API_SECRET
   - BRIDGE_WEBHOOK_SECRET
   - Ne jamais exposer côté frontend

2. **Validation webhook**
   - Vérifier signature HMAC de chaque webhook Bridge
   - Rejeter les requêtes non authentifiées

3. **Permissions utilisateur**
   - Seul le propriétaire du compte bancaire peut le déconnecter
   - Seuls les membres du projet peuvent voir les transactions

4. **Données sensibles**
   - Ne pas stocker de numéro de compte complet
   - Logger uniquement les IDs Bridge, jamais les tokens
   - HTTPS obligatoire en production

## Edge Cases

1. **Transaction en double**
   - Bridge peut renvoyer la même transaction
   - Utiliser bridgeTransactionId unique pour détecter

2. **Synchronisation échouée**
   - Si Bridge API down, logger l'erreur
   - Retry automatique après 1h
   - Notifier l'utilisateur si échec > 24h

3. **Compte bancaire fermé**
   - Bridge webhook notifie la déconnexion
   - Marquer compte actif=false
   - Informer l'utilisateur

4. **Transaction avec montant 0**
   - Ignorer automatiquement (virements internes)

5. **Transaction en devise étrangère**
   - Bridge convertit automatiquement en EUR
   - Stocker le montant converti uniquement

## Catégorisation Intelligente

### Règles de suggestion (MVP)

**Matériaux de construction**
- Keywords: "LEROY MERLIN", "CASTORAMA", "BRICO DEPOT", "POINT P"
- Catégorie suggérée: "Matériaux"

**Services d'artisans**
- Keywords: "ELECTRICIEN", "PLOMBIER", "PEINTRE", "MENUISIER"
- Catégorie suggérée: "Main d'œuvre"

**Meubles et décoration**
- Keywords: "IKEA", "CONFORAMA", "MAISONS DU MONDE"
- Catégorie suggérée: "Mobilier"

**Outillage**
- Keywords: "OUTILLAGE", "MAKITA", "BOSCH"
- Catégorie suggérée: "Équipement"

### Matching avec matériaux existants
- Si fournisseur de la transaction matche un materiau.fournisseur
- Suggérer d'associer à ce matériau

## Testing Strategy

**Backend Tests**
- Test webhook signature validation
- Test gestion des doublons de transactions
- Test conversion transaction → dépense
- Mock Bridge API responses

**Frontend Tests**
- Test Bridge Widget integration
- Test liste transactions et filtres
- Test modal de conversion

**Integration Tests**
- Test flow complet connexion → sync → conversion
- Test déconnexion et cleanup

## Migration Plan

1. **Phase 1: Database Migration**
   - Créer tables CompteBancaire et TransactionBancaire
   - Ajouter colonnes à Depense

2. **Phase 2: Backend Implementation**
   - Service Bridge API
   - Webhooks
   - API routes

3. **Phase 3: Frontend Implementation**
   - Pages et composants
   - Integration Bridge Widget

4. **Phase 4: Testing**
   - Tests unitaires et integration
   - Test en sandbox Bridge

5. **Phase 5: Production Rollout**
   - Migration prod database
   - Activation Bridge API production
   - Monitoring première semaine

