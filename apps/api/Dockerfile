FROM node:22-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci

COPY apps/api/prisma ./prisma
RUN npx prisma generate

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app --create-home app

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=app:app apps/api/package.json ./
COPY --chown=app:app apps/api/prisma ./prisma
COPY --chown=app:app apps/api/src ./src
COPY --chown=app:app apps/api/uploads ./uploads
COPY --chown=app:app apps/api/docker-entrypoint.sh ./
COPY --chown=app:app apps/api/docker-seed-if-empty.js ./

RUN chmod 0555 docker-entrypoint.sh

USER app

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:5000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
