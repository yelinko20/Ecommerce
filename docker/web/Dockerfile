FROM node:20-alpine

WORKDIR /home/yeerp

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY ../../apps/web/package.json ./package.json
COPY ../../apps/web/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --frozen-lockfile

COPY ../../apps/web/ ./

CMD ["pnpm", "run", "dev"]
