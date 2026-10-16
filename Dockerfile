# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
ARG NPM_VERSION=11.6.1
RUN apk add --no-cache libc6-compat && npm install -g "npm@${NPM_VERSION}"
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM base AS builder
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ARG APP_REVISION=dev
ARG NEXT_PUBLIC_APP_URL=
ENV APP_REVISION=$APP_REVISION
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM base AS migrator
WORKDIR /migrator
COPY package-lock.json ./locked.json
RUN --mount=type=cache,target=/root/.npm set -eux; \
    prisma_spec="prisma@$(node -p "require('./locked.json').packages['node_modules/prisma'].version")"; \
    dotenv_spec="dotenv@$(node -p "require('./locked.json').packages['node_modules/dotenv'].version")"; \
    rm locked.json; \
    npm init -y >/dev/null; \
    npm install --no-audit --no-fund "$prisma_spec" "$dotenv_spec"

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV MEDIA_DIR=/app/data/media
ENV PRISMA_HIDE_UPDATE_MESSAGE=1
ENV CHECKPOINT_DISABLE=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=migrator --chown=nextjs:nodejs /migrator/node_modules ./migrator/node_modules
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./migrator/prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./migrator/prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN chmod +x ./docker-entrypoint.sh && install -d -o nextjs -g nodejs /app/data/media
ARG APP_REVISION=dev
ENV APP_REVISION=$APP_REVISION
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
