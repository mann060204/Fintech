FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json
RUN npm install --legacy-peer-deps

COPY . .
RUN npm install typescript -g
RUN npm run build

EXPOSE 4001

CMD ["npm", "start"]
