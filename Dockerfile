# Docs portal — multi-stage static build (Docusaurus → nginx)
# Build context: repository root

FROM node:20-bookworm AS build

WORKDIR /app

# Install deps first (better layer cache)
COPY website/package*.json website/
RUN cd website && npm ci

# Content + site sources (paths relative to website: ../docs, ../openspec/specs)
COPY docs docs
COPY openspec/specs openspec/specs
COPY website website

WORKDIR /app/website
RUN npm run build

FROM nginx:alpine AS runtime

COPY nginx/docs.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/website/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
