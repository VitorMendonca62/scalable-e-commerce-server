FROM node:24-alpine

WORKDIR /app

RUN npm install pnpm -g

COPY package*.json /app

RUN pnpm install

RUN apk add --no-cache openssl

RUN mkdir -p certs

RUN pnpm jwt:keys:generate

COPY . /app

EXPOSE 8080

CMD [ "pnpm", "start" ]