FROM node:24 

WORKDIR /app

RUN npm install pnpm -g

COPY package*.json /app

RUN pnpm install

RUN pnpm jwt:keys:generate

COPY . /app

EXPOSE 8080

CMD [ "pnpm", "start" ]