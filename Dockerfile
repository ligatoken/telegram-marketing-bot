FROM node:alpine
WORKDIR /usr/bot
COPY package.json ./
RUN apk add python make gcc g++ && npm install --only=production
COPY . .
CMD ["sh", "-c", "./node_modules/.bin/sequelize db:migrate; npm run start"]
