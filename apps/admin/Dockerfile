FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* turbo.json ./
COPY apps/admin ./apps/admin
COPY packages ./packages
RUN npm install -g turbo pnpm
RUN pnpm install --frozen-lockfile
RUN turbo build --filter=admin

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
EXPOSE 3000
CMD ["node", "apps/admin/server.js"]