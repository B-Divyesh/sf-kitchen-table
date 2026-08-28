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
RUN mkdir -p /data && chown -R table:table /app /data
USER table
# The factory supplies all three identities from the source tarball (which has
# no .git directory). BUILD_SHA is what the health endpoint exposes.
ARG BUILD_SHA=dev
ARG GIT_SHA=
ARG SOURCE_COMMIT=
ENV BUILD_SHA=$BUILD_SHA
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O - http://127.0.0.1:8080/health || exit 1
CMD ["kitchen-table"]
