# Demo v1 Next.js web — Compose profile `app`
# Build context: apps/web
# Browser calls API via Caddy host: http://api.localhost

# Node 24 aligns with local tooling / lockfile used for Demo v1 apps.
FROM node:24-bookworm AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-bookworm AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=http://api.localhost
# Use default `.next` distDir inside the image (avoid host `.next-build` collision).
RUN ./node_modules/.bin/next build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_BASE_URL=http://api.localhost
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
