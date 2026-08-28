# Kitchen Table repair handoff — 2026-08-28

## Released repair

The independent verifier's release blockers from `c5cba766450a52ce6434f0770167ecbc965fb71c` are repaired. The live Container App runs image `sociobotregistry.azurecr.io/sf-kitchen-table:60f289ea82ba` from repair commit `60f289ea82bae9b758d7f4550fae718c08d64d07`; live `/health` returns that exact SHA.

### What changed

- Room data is no longer container-local or mounted on Azure Files (SQLite's locking is incompatible with that SMB mount). SQLite is a per-replica hot cache and every successful create/change is written to the private `sociobotblob/kitchen-table-rooms` Blob container using the Container App's user-assigned managed identity. A 90-day Azure Storage lifecycle rule removes inactive room blobs. The app remains deliberately capped to exactly one replica; a restart reloads rooms from Blob Storage.
- Known SPA routes (`/room/:code`, `/privacy`, `/terms`) now return the shell with HTTP 200. Unknown routes stay HTTP 404.
- The Docker image has no stale build SHA: deploy builds pass the exact Git SHA through `BUILD_SHA`.
- Fingerprinted Vite assets receive `Cache-Control: public, max-age=31536000, immutable`; shell, worker, manifest, and legal pages revalidate; API and health responses are `no-store`.
- Invalid JSON/game values are normalized to the product JSON error response rather than Axum's raw 422 rejection.
- Wordmark, Privacy, and Terms links are 44×44 px minimum at 390 px.

## Exact live verification

- Shared-state regression: created live Lantern Race `CUL3LN`; eight concurrent joins gave **3 × 200** and **5 × 400**, with no 404. Thirty concurrent public reads gave **30 × 200**, four players, and no seat-token leak.
- Durable restart regression: Blob `rooms/CUL3LN.json` existed privately; `sf-kitchen-table--0000008` was restarted, then public `GET /api/rooms/CUL3LN` returned **200**, four players, revision 3, and no token.
- Routing/cache/input: live `/room/CUL3LN`, `/privacy`, and `/terms` return 200; a missing route returns 404; the hashed JS asset is immutable; malformed `{"game":"invalid","nickname":"valid"}` returns 400 with `{"error":"The request body was not valid. Check the game and try again."}`.
- Identity: live `/health` is 200 with `{"build_sha":"60f289ea82bae9b758d7f4550fae718c08d64d07","status":"ok"}`.
- Accessibility/browser: Axe 4.13 WCAG A/AA scanned home plus all three active mobile games: **4 screens, zero serious/critical violations**. Live 390 px targets are wordmark 192×44, Privacy 44×44, Terms 44×44; no horizontal overflow, keyboard Tab reaches the Skip link, and there were no console errors. Updated screenshots are in `.factory/evidence/`.
- Offline/update: the live HTTPS service worker became controller after reload; a warmed offline home reload retained one `<main>` and the page title.

## Local verification

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets -- -D warnings
cargo build --release
```

All commands passed. `npm test` reports **11 Rust** and **3 Vitest** tests. New HTTP regressions cover direct-route status, cache policy, malformed input, and durable database reopening. The production frontend is 18.49 KB JS (7.26 KB gzip), 16.56 KB CSS (4.71 KB gzip), with 71.35 KB of self-hosted fonts.

## Run locally

```sh
npm ci
npm run build
DATABASE_URL='sqlite://kitchen-table.db?mode=rwc' PORT=8080 cargo run
```

For a production-like durable room store, provide `AZURE_STORAGE_ACCOUNT` and `AZURE_STORAGE_CONTAINER` from a managed-identity-capable host. Do not set storage keys in the application.

## Known limitations

- Turns use lightweight polling, not push notifications. This is intentional; no notification consent or account system is present.
- Room content remains private to the storage account and is not public Blob content. The browser never receives a storage credential.
