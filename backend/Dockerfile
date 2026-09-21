# syntax=docker/dockerfile:1

# ---- deps: instala TODAS las dependencias (incl. devDependencies, necesarias para build) ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build: genera el cliente Prisma y compila TypeScript ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

# ---- runtime: imagen final, sin fuentes TS. Conserva node_modules completo
# (incl. devDependencies: prisma, tsx) a propósito, para poder correr
# `./node_modules/.bin/prisma migrate deploy` dentro del propio contenedor en el
# deploy (ver .github/workflows/cd.yml) sin necesitar una imagen/etapa aparte
# solo para eso. Es más peso de imagen a cambio de mucha menos complejidad.
# No hay pnpm ni pnpm-lock.yaml aquí a propósito: usar `pnpm exec` en este
# contenedor dispara una reinstalación de dependencias y falla. Llama a los
# binarios de node_modules/.bin directamente. ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# prisma/create-admin.ts y seed.ts importan el cliente desde src/generated/prisma
# (rutas relativas en TS); la app compilada usa dist/generated, no esto.
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
