FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4000

CMD ["node", "index.js"]
