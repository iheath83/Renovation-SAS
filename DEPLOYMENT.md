# 🐳 Déploiement Docker avec Dokploy

Configuration Docker Compose pour déployer RénoVision en production via Dokploy avec Traefik.

## 📋 Prérequis

- Dokploy installé et configuré
- Traefik configuré dans Dokploy
- Base de données PostgreSQL créée dans Dokploy
- Nom de domaine pointant vers votre serveur

## 🚀 Déploiement

### 1. Configuration des variables d'environnement

Créer un fichier `.env` à partir du `.env.example` :

```bash
cp .env.example .env
```

Remplir les valeurs :

```env
# Domaine
DOMAIN=votre-domaine.com

# Base de données (fournie par Dokploy)
DATABASE_URL=postgresql://user:password@postgres-host:5432/database_name?schema=public

# JWT Secrets (générer avec: openssl rand -base64 32)
JWT_SECRET=secret_jwt_tres_securise
JWT_REFRESH_SECRET=secret_refresh_tres_securise

# APIs optionnelles
PINTEREST_API_KEY=votre_cle_api_pinterest
POWENS_CLIENT_ID=votre_client_id_powens
POWENS_CLIENT_SECRET=votre_client_secret_powens
POWENS_REDIRECT_URI=https://votre-domaine.com/api/bank/callback
```

### 2. Lancer les services

```bash
docker-compose up -d
```

### 3. Vérifier les logs

```bash
# Tous les services
docker-compose logs -f

# Backend uniquement
docker-compose logs -f backend

# Frontend uniquement
docker-compose logs -f frontend

# Base de données
docker-compose logs -f postgres
```

## 🏗️ Architecture

```
┌─────────────────┐
│     Traefik     │ (géré par Dokploy)
│  Reverse Proxy  │
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         │ HTTPS (443)                      │ HTTPS (443)
         │ votre-domaine.com                │ votre-domaine.com/api
         │                                  │
    ┌────▼────┐                        ┌────▼────┐
    │Frontend │                        │ Backend │
    │ (Nginx) │                        │ (Node)  │
    │  :80    │                        │ :3000   │
    └─────────┘                        └────┬────┘
                                            │
                                            │ DATABASE_URL
                                            │
                                       ┌────▼────┐
                                       │Postgres │ (Dokploy)
                                       └─────────┘
```

## 🔧 Services

### Frontend
- **Image** : nginx:alpine
- **Port** : 80
- **Route** : `https://votre-domaine.com`
- **Healthcheck** : HTTP GET sur `/`

### Backend
- **Image** : node:20-alpine
- **Port** : 3000
- **Route** : `https://votre-domaine.com/api`
- **Healthcheck** : HTTP GET sur `/health`
- **Migrations** : Automatiques au démarrage via Prisma

### PostgreSQL
- **Géré par** : Dokploy
- **Connexion** : Via `DATABASE_URL` fournie par Dokploy

## 🔍 Points importants

### Reverse Proxy
Le backend est accessible via `/api` sur le domaine principal :
- `https://votre-domaine.com` → Frontend
- `https://votre-domaine.com/api` → Backend (le préfixe `/api` est retiré par Traefik)

### Healthchecks
- **Backend** : `wget http://127.0.0.1:3000/health`
- **Frontend** : `wget http://127.0.0.1:80/`
- **Postgres** : `pg_isready`

### Migrations Prisma
Les migrations sont exécutées automatiquement au démarrage du backend via le script `entrypoint.sh`.

### SSL/TLS
Géré automatiquement par Traefik via Let's Encrypt (configuré dans Dokploy).

## 🛠️ Commandes utiles

```bash
# Arrêter les services
docker-compose down

# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build

# Reconstruire et redémarrer
docker-compose up -d --build

# Voir les logs en temps réel
docker-compose logs -f

# Accéder au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec frontend sh

# Exécuter les migrations manuellement
docker-compose exec backend npx prisma migrate deploy

# Voir l'état des services
docker-compose ps
```

## 🔐 Sécurité

- ✅ Helmet.js activé pour le backend
- ✅ CORS configuré
- ✅ Secrets JWT sécurisés
- ✅ Base de données gérée par Dokploy
- ✅ HTTPS via Let's Encrypt (Traefik)
- ✅ Healthchecks pour tous les services

## 📊 Monitoring

Les healthchecks permettent à Docker et Dokploy de surveiller l'état des services :
- **Interval** : 30s
- **Timeout** : 10s
- **Retries** : 3
- **Start period** : 40s (backend), 10s (frontend)

## 🔄 Mise à jour

```bash
# Pull les dernières modifications
git pull

# Reconstruire et redéployer
docker-compose up -d --build

# Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f
```

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
docker-compose logs backend
# Vérifier la connexion à la base de données
docker-compose exec backend npx prisma db push
```

### Le frontend n'est pas accessible
```bash
docker-compose logs frontend
# Vérifier les labels Traefik
docker-compose config
```

### La base de données ne répond pas
```bash
# Vérifier la DATABASE_URL dans Dokploy
# Tester la connexion depuis le backend
docker-compose exec backend sh
# Puis dans le conteneur :
# npx prisma db push
```

## 📝 Notes

- Le fichier `.env` ne doit jamais être commité
- La base de données PostgreSQL est gérée directement par Dokploy
- Récupérer la `DATABASE_URL` depuis l'interface Dokploy
- Traefik gère automatiquement le renouvellement des certificats SSL
- Le middleware `stripprefix` retire `/api` avant de transmettre au backend

## 🗄️ Configuration de la base de données dans Dokploy

1. Créer une base de données PostgreSQL dans Dokploy
2. Récupérer l'URL de connexion fournie par Dokploy
3. L'ajouter dans les variables d'environnement de votre projet :
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   ```
