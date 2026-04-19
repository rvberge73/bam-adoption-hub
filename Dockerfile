FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server.js db.js ./
COPY public ./public

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["npm", "start"]
