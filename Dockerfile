FROM node:latest

WORKDIR /toeic

COPY package*.json ./

RUN npm install
RUN npm install express dotenv mongoose
RUN npm install --save-dev nodemon
RUN npm install bcryptjs
RUN npm install multer
RUN npm install nodemailer
RUN npm install firebase-admin
RUN npm install express ws cors
RUN npm install express-async-handler
RUN npm install minio

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
