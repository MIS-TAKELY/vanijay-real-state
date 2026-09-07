FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
# Accept build-time env vars — Next.js bakes NEXT_PUBLIC_* at build time,
# and next.config.js reads AUTH_API_URL for /api/auth/* rewrites at build time.
ARG NEXT_PUBLIC_API_URL=https://api.malpoth.com
ARG AUTH_API_URL=http://api:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV AUTH_API_URL=$AUTH_API_URL
COPY package.json package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* yarn.lock* turbo.json ./
COPY apps/admin ./apps/admin
COPY packages ./packages
# Pin pnpm to the version that produced pnpm-lock.yaml (lockfileVersion 9.0) —
# unpinned `npm install -g pnpm` gets pnpm 10+, whose @pnpm/exe engine identity
# check fails against pnpm-9 lockfiles (ERR_PNPM_PNPM_ENGINE_IDENTITY_UNVERIFIABLE).
RUN npm install -g turbo pnpm@9.0.0
RUN pnpm install --frozen-lockfile
RUN turbo build --filter=admin

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
EXPOSE 3001
CMD ["node", "apps/admin/server.js"]