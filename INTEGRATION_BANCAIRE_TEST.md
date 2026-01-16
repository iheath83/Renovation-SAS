# 🧪 Test de l'intégration bancaire

## ✅ Étapes de test

### 1. Connecter un compte Powens

1. Va sur `http://localhost:5173/banque`
2. Clique sur **"Connecter un compte"**
3. Tu seras redirigé vers Powens
4. Connecte-toi avec tes identifiants bancaires (sandbox)
5. Tu seras redirigé vers `/banque` avec le compte enregistré

### 2. Vérifier le compte

Le compte devrait apparaître dans la liste avec :
- ✅ Nom de la banque
- ✅ Statut "Actif"
- ✅ Date de dernière synchronisation
- ✅ Boutons "Synchroniser" et "Déconnecter"

### 3. Attendre la synchronisation Powens

⏳ **IMPORTANT** : Powens synchronise les données en arrière-plan.

**Temps d'attente** : 2-5 minutes après la première connexion

Tu peux vérifier l'état sur la console Powens :
- https://console.powens.com

### 4. Synchroniser les transactions

Une fois que Powens a terminé (statut "OK" dans la console) :

1. Clique sur **"Synchroniser"** dans `/banque`
2. Attends quelques secondes
3. Va sur `/transactions`
4. Les transactions devraient apparaître !

### 5. Convertir une transaction en dépense

1. Va sur `/transactions`
2. Clique sur **"Convertir"** sur une transaction
3. Choisis :
   - Catégorie (ex: "Matériaux")
   - Pièce (optionnel)
   - Tâche (optionnel)
   - Matériau (optionnel)
   - Cocher "Passé dans un crédit" si applicable
4. Valide
5. La transaction devient une dépense dans `/depenses` !

---

## 🐛 Problèmes connus

### Token Powens expiré

**Symptôme** : 0 transactions après synchronisation

**Cause** : Les tokens OAuth2 expirent rapidement (quelques minutes)

**Solution** :
1. Supprime le compte dans la DB :
   ```sql
   DELETE FROM "CompteBancaire" WHERE "powensItemId" = '6';
   ```
2. Reconnecte-toi depuis `/banque`

### Compte pas encore synchronisé

**Symptôme** : 0 transactions juste après connexion

**Cause** : Powens synchronise en arrière-plan (2-5 min)

**Solution** : Attends et réessaie plus tard

---

## ✅ Vérifications manuelles

### Vérifier le compte dans la DB

```sql
SELECT id, banque, "powensItemId", actif, "derniereSynchronisation" 
FROM "CompteBancaire";
```

### Vérifier les transactions

```sql
SELECT COUNT(*) FROM "TransactionBancaire";
```

### Tester l'API manuellement

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jonathan@renovation-sas.fr","password":"password123"}' \
  | jq -r '.data.accessToken')

# Lister les comptes
curl -s "http://localhost:3001/api/comptes-bancaires/projets/cmk1jysdp0001r0pg57hdkfzi/comptes-bancaires" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Synchroniser
curl -s -X POST "http://localhost:3001/api/comptes-bancaires/<COMPTE_ID>/sync" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Lister les transactions
curl -s "http://localhost:3001/api/transactions-bancaires/projets/cmk1jysdp0001r0pg57hdkfzi/transactions" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 🎯 Prochaines étapes

1. ✅ Connexion Powens fonctionnelle
2. ✅ Enregistrement du compte
3. ⏳ Import des transactions (attente Powens)
4. ⏳ Conversion en dépenses
5. ⏳ Catégorisation automatique
6. ⏳ Dashboard avec stats bancaires

**Pour continuer le test, reconnecte un compte depuis `/banque` !** 🚀

