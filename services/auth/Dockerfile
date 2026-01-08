FROM node:24 

WORKDIR /app

RUN npm install pnpm -g

COPY package*.json /app

RUN pnpm install

COPY . /app

RUN pnpm jwt:keys:generate

EXPOSE 8080

CMD [ "pnpm", "start" ]