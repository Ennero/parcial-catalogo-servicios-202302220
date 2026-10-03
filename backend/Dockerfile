FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=development

# Copiar todo desde el builder para permitir ejecución de tests (Jest) y scripts CLI dentro del contenedor
COPY --from=builder /app ./

EXPOSE 4000

CMD ["node", "dist/main"]
