FROM oven/bun:canary-alpine AS base
WORKDIR /app

FROM base AS install
RUN mkdir -p /temp
COPY package.json bun.lock /temp/
RUN cd /temp && bun install --frozen-lockfile 

FROM base AS builder
COPY --from=install /temp/node_modules node_modules
COPY . .
RUN bun run build

FROM base AS release
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=install /temp/node_modules ./node_modules

USER bun
EXPOSE 8082
CMD ["bun", "run", "dist/main.js"]