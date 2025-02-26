FROM node:20-alpine as builder
ENV NODE_ENV=build
USER node
WORKDIR /home/yeerp

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --chown=node:node ../../package.json ../../pnpm-lock.yaml ../../turbo.json ../../.npmrc ./
COPY --chown=node:node ../../apps/api/package.json ./apps/api/
COPY --chown=node:node ../../packages/*/package.json ./packages/*/

RUN pnpm install --frozen-lockfile --filter=api...

COPY --chown=node:node ../../ ./

RUN pnpm run turbo run build --filter=api...

RUN pnpm --filter=api db:generate

RUN pnpm prune --prod --filter=api...

FROM node:20-alpine
ENV NODE_ENV=production
USER node
WORKDIR /home/yeerp

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder --chown=node:node /home/yeerp/apps/api/package.json ./package.json
COPY --from=builder --chown=node:node /home/yeerp/apps/api/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=node:node /home/yeerp/apps/api/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/yeerp/apps/api/dist ./dist
COPY --from=builder --chown=node:node /home/yeerp/apps/api/drizzle ./drizzle

CMD ["node", "dist/main.js"]
