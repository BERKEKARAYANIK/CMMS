FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build || true && npm run db:generate

EXPOSE 4001

CMD ["sh", "-c", "npm run db:push && npm run start"]
