FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

FROM base AS builder
RUN npm install -g turbo pnpm
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* yarn.lock* turbo.json ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN pnpm install --frozen-lockfile

# Explicitly generate Prisma client with Alpine binary targets
# (turbo cache may skip this; explicit call guarantees it runs with correct binaryTargets)
RUN pnpm --filter @repo/db exec prisma generate

# Build api + all workspace deps (auth, db, etc.)
RUN turbo build --filter=api

# pnpm deploy creates a self-contained dir with real node_modules (no broken symlinks)
RUN pnpm --filter api deploy --prod /app/standalone

# pnpm deploy doesn't copy the generated Prisma client (.prisma/client/)
# Find it in the builder and copy it into the standalone node_modules
RUN find /app -path "*/.prisma/client" -not -path "*/standalone/*" -type d | head -1 | \
    xargs -I{} sh -c 'mkdir -p /app/standalone/node_modules/.prisma && cp -r {} /app/standalone/node_modules/.prisma/'

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy self-contained deployment (node_modules with no symlinks + .prisma/client)
COPY --from=builder /app/standalone ./
# Overwrite with compiled NestJS output
COPY --from=builder /app/apps/api/dist ./dist
EXPOSE 8000
CMD ["node", "dist/main.js"]