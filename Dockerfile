FROM node:lts-alpine3.22

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

# Needed because `npm ci` runs `postinstall` (Prisma generate)
COPY prisma ./prisma

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run db:deploy && npm run start"]