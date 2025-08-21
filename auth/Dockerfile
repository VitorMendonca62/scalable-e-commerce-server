FROM node:24-alpine 

WORKDIR /app

COPY package*.json /app

RUN npm install pnpm -g

RUN pnpm install

COPY . /app

EXPOSE 8080

CMD [ "pnpm", "start" ]