# Frontend Dockerfile pour RénoVision
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copier le code source
COPY . .

# Arguments de build
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build de l'application
RUN npm run build

# Stage de production avec nginx
FROM nginx:alpine

# Installer wget pour le healthcheck
RUN apk add --no-cache wget

# Copier le build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
