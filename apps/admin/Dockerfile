FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* turbo.json ./
COPY apps/web ./apps/web
COPY packages ./packages
RUN npm install -g turbo
RUN npm ci
RUN turbo build --filter=web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]