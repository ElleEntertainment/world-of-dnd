# Fase 1: Build dell'app Angular
FROM node:24.9.0-bullseye-slim AS build-stage

WORKDIR /app

# Copia i file necessari per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto del codice sorgente
COPY . .

# Compila l'app Angular per la produzione
RUN npm run build -- --configuration production

# Fase 2: Configurazione di Nginx per servire l'app
FROM nginx:1.25.1

WORKDIR /world-of-dnd-frontend

# Installa strumenti utili per il debugging (opzionale)
USER 0
RUN apt-get update -y && apt-get install tcpdump iputils-ping telnet curl -y

# Copia la build Angular dalla fase precedente
COPY --from=build-stage /app/dist /world-of-dnd-frontend

# Imposta i permessi corretti
RUN chown -R 1000:1000 /world-of-dnd-frontend/ && chmod -R 755 /world-of-dnd-frontend

USER 1000
