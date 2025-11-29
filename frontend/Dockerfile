FROM node:18-alpine

WORKDIR /app

# Aktualizacja certyfikatów CA
RUN apk add --no-cache ca-certificates && \
    update-ca-certificates

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV HOST=0.0.0.0

CMD ["npm", "start"]

