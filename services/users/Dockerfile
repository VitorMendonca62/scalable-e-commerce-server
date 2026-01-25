FROM node:24-alpine

WORKDIR /app

RUN npm install pnpm -g

COPY package*.json /app

RUN pnpm install

COPY . /app

EXPOSE 8082

CMD [ "pnpm", "start" ]