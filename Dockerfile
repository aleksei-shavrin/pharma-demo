# Docs portal — multi-stage static build (Docusaurus → nginx)
# Build context: repository root
# Server: DOCUSAURUS_BASE_URL=/docs/ (Caddy strips /docs before nginx)

FROM node:24-bookworm AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts ./scripts
COPY website/package*.json website/
RUN npm ci && cd website && npm ci

COPY docs docs
COPY openspec/specs openspec/specs
COPY website website

ARG DOCUSAURUS_URL=http://localhost
ARG DOCUSAURUS_BASE_URL=/docs/
ENV DOCUSAURUS_URL=$DOCUSAURUS_URL
ENV DOCUSAURUS_BASE_URL=$DOCUSAURUS_BASE_URL

WORKDIR /app
RUN npm run build:cross-ref
WORKDIR /app/website
RUN npm run build

FROM nginx:alpine AS runtime

COPY nginx/docs.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/website/build /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
