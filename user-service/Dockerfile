FROM node:20-alpine

WORKDIR /app

# Копируем зависимости
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Копируем исходники
COPY server.js ./

# Директория для загрузок (аватары)
RUN mkdir -p uploads/avatars

EXPOSE 8081

CMD ["node", "server.js"]
