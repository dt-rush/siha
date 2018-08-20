FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm i

RUN npm i -g gulp-cli

EXPOSE 3000

CMD [ "gulp", "dev-serve" ]
