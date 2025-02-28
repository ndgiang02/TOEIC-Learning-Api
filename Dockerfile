FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install express dotenv mongoose
RUN npm install --save-dev nodemon 

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
