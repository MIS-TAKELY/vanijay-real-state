FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
# Accept build-time env vars — Next.js bakes NEXT_PUBLIC_* at build time,
# and next.config.js reads AUTH_API_URL for /api/auth/* rewrites at build time.
ARG NEXT_PUBLIC_API_URL=https://realstate-api.vanijay.com
ARG AUTH_API_URL=http://api:5000
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV AUTH_API_URL=$AUTH_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
COPY package.json package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* yarn.lock* turbo.json ./
COPY apps/client ./apps/client
COPY packages ./packages 
RUN npm install -g turbo pnpm
RUN pnpm install --frozen-lockfile
RUN turbo build --filter=client

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/client/public ./apps/client/public
COPY --from=builder /app/apps/client/.next/standalone ./
COPY --from=builder /app/apps/client/.next/static ./apps/client/.next/static
EXPOSE 3000
CMD ["node", "apps/client/server.js"]