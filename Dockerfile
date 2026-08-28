FROM node:22-alpine AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json ./
COPY frontend ./frontend
RUN npm run build

FROM rust:1.88-alpine AS server
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY migrations ./migrations
COPY src ./src
RUN cargo build --release

FROM alpine:3.21
RUN addgroup -S table && adduser -S table -G table && mkdir -p /data && chown table:table /data
WORKDIR /app
COPY --from=server /app/target/release/kitchen-table /usr/local/bin/kitchen-table
COPY --from=web /app/frontend/dist ./frontend/dist
USER table
# The deployment must inject the exact Git commit with --build-arg BUILD_SHA.
# "unknown" is deliberately not a stale release identity.
ARG BUILD_SHA=unknown
ENV BUILD_SHA=$BUILD_SHA
# Azure Files is a durable SMB mount. The Container App is capped to one
# replica and the database pool to one connection, so SQLite has one owner.
ENV PORT=8080 DATABASE_URL=sqlite:///data/kitchen-table.db?mode=rwc
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O - http://127.0.0.1:8080/health || exit 1
CMD ["kitchen-table"]
