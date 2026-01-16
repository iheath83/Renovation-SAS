# Backend Dockerfile pour RénoVision
FROM node:20-alpine AS base

# Installation de wget pour le healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Installation des dépendances en production
RUN npm ci --only=production

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src ./src

# Exposer le port
EXPOSE 3000

# Créer un script d'entrypoint pour les migrations
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "Running Prisma migrations..."' >> /app/entrypoint.sh && \
    echo 'npx prisma migrate deploy' >> /app/entrypoint.sh && \
    echo 'echo "Starting application..."' >> /app/entrypoint.sh && \
    echo 'exec node src/server.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
