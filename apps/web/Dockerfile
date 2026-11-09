# Demo v1 Next.js web — production standalone
# Build context: apps/web
# Server: bake NEXT_PUBLIC_API_BASE_URL=/backend (same-origin via Caddy)
# Local ADR-0003 images may pass http://api.localhost

FROM node:24-bookworm AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-bookworm AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=/backend
ARG NEXT_PUBLIC_DOCS_BASE_URL=/docs/
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_DOCS_BASE_URL=$NEXT_PUBLIC_DOCS_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Use default `.next` distDir inside the image (avoid host `.next-build` collision).
RUN ./node_modules/.bin/next build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
# /login is public after form-auth; `/` redirects unauthenticated clients.
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
