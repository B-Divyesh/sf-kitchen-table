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
RUN addgroup -S table && adduser -S table -G table
WORKDIR /app
COPY --from=server /app/target/release/kitchen-table /usr/local/bin/kitchen-table
COPY --from=web /app/frontend/dist ./frontend/dist
USER table
# The deployment injects the exact source commit with --build-arg BUILD_SHA.
# A local image remains identifiable without claiming to be a release.
ARG BUILD_SHA=dev
ENV BUILD_SHA=$BUILD_SHA
# SQLite is only a local restart cache. Every production request reads and
# conditionally writes this private Blob container, so replicas cannot diverge.
# These values are identifiers, not credentials; the managed identity supplies
# short-lived access tokens at runtime.
ENV PORT=8080 DATABASE_URL=sqlite:///tmp/kitchen-table.db?mode=rwc \
    AZURE_STORAGE_ACCOUNT=sociobotblob \
    AZURE_STORAGE_CONTAINER=kitchen-table-rooms \
    AZURE_CLIENT_ID=ba10d5bc-6375-4325-8892-4c7a5be500ca
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O - http://127.0.0.1:8080/health || exit 1
CMD ["kitchen-table"]
