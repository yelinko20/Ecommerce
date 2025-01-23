FROM node:20-alpine

RUN apk add --no-cache openssl

RUN npm i -g pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN pnpx prisma generate

COPY . .

EXPOSE 8080
CMD ["pnpm","start:dev"]
