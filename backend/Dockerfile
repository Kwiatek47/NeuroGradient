FROM node:18-alpine

WORKDIR /app

# Aktualizacja certyfikatów CA
RUN apk add --no-cache ca-certificates && \
    update-ca-certificates

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]

