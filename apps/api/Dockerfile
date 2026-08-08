FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
RUN npm install -g turbo pnpm
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* yarn.lock* turbo.json ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN pnpm install --frozen-lockfile
# Build api + all workspace deps (auth, db, etc.)
RUN turbo build --filter=api
# pnpm deploy creates a self-contained dir with real node_modules (no broken symlinks)
RUN pnpm --filter api deploy --prod /app/standalone

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy self-contained deployment (node_modules with no symlinks)
COPY --from=builder /app/standalone ./
# Overwrite with compiled output
COPY --from=builder /app/apps/api/dist ./dist
EXPOSE 8000
CMD ["node", "dist/main.js"]