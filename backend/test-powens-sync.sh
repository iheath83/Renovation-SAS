#!/bin/bash
# Script pour tester manuellement la synchronisation Powens

# Récupérer le token du dernier compte
TOKEN=$(psql -d renovision -t -c "SELECT \"powensAccessToken\" FROM \"CompteBancaire\" WHERE \"deletedAt\" IS NULL ORDER BY \"createdAt\" DESC LIMIT 1;" | xargs)

if [ -z "$TOKEN" ]; then
  echo "❌ Aucun compte bancaire trouvé"
  exit 1
fi

echo "🔑 Token trouvé: ${TOKEN:0:30}..."
echo ""

echo "=== État de la connexion ==="
curl -s "https://renovision-sandbox.biapi.pro/2.0/users/me/connections?expand=accounts,connector" \
  -H "Authorization: Bearer $TOKEN" | jq '.connections[0] | {id, connector: .connector.name, active, last_update, state, error, accounts: [.accounts[] | {id, name}]}'

echo ""
echo "=== Test de récupération des transactions ==="
ACCOUNT_ID=$(curl -s "https://renovision-sandbox.biapi.pro/2.0/users/me/connections?expand=accounts" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.connections[0].accounts[0].id')

if [ "$ACCOUNT_ID" != "null" ] && [ -n "$ACCOUNT_ID" ]; then
  echo "📊 Compte ID: $ACCOUNT_ID"
  RESPONSE=$(curl -s "https://renovision-sandbox.biapi.pro/2.0/users/me/accounts/$ACCOUNT_ID/transactions?limit=5" \
    -H "Authorization: Bearer $TOKEN")
  
  # Vérifier si c'est une erreur notFound
  if echo "$RESPONSE" | jq -e '.code == "notFound"' > /dev/null 2>&1; then
    echo "⏳ Transactions pas encore disponibles (Powens synchronise actuellement)"
    echo "🕐 Réessaye dans 2-3 minutes..."
  else
    echo "$RESPONSE" | jq '{total: .pagination.total_entries, first_3_transactions: [.transactions[0:3] | .[] | {date, description: .original_wording, amount}]}'
    echo ""
    echo "✅ PRÊT ! Clique sur 'Synchroniser' dans l'application !"
  fi
else
  echo "❌ Aucun compte trouvé"
fi

