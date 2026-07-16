# Imagen base para Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar solo package.json primero para aprovechar cache de Docker
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Instalar dependencias (usando --omit=dev para producción o normal para dev)
RUN npm install
RUN cd frontend && npm install

# Copiar el resto del código
COPY . .

# Exponer puertos
EXPOSE 3000 3001

# Script de inicio en modo desarrollo (más rápido, sin build de producción)
CMD ["sh", "-c", "npm run dev & (cd frontend && npm run dev -- --host 0.0.0.0 --port 3001)"]
