FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# RUN npm install

COPY . .
RUN npm install typescript -g
RUN npm run build

EXPOSE 4003

CMD ["npm", "start"]
