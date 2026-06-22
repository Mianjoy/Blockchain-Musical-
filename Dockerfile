# Imagen base para Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json del backend y frontend
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Instalar dependencias del backend
RUN npm install --production

# Instalar dependencias del frontend
RUN cd frontend && npm install --production

# Copiar el resto del código
COPY . .

# Exponer puertos
EXPOSE 3000 3001

# Script de inicio que lanza ambos servicios
CMD ["sh", "-c", "npm start & (cd frontend && npm run build && npx serve dist -l 3001)"]
