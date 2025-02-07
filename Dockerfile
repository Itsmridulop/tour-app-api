FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

RUN npm i nodemon

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
