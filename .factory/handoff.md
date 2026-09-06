# Kitchen Table — repair 4 handoff

## Result

Review 5's four findings are fixed at implementation commit
`285371898b60ef874f3a396134c97a30b6c00f75`. The complete closure report is
`.factory/repair-4.md`.

- Every sample banner names the game actually shown.
- The footer exposes the deployed source identity and matches `/health`.
- The identity claim rejects placeholders and asserts an exact known value.
- The Dockerfile uses the supported rolling `rust:1-alpine` image.
- Production state uses SQLite on the durable `/data` mount, with one replica.
- A no-environment local start falls back to a database beside the executable.

The evidence and documentation commit containing this handoff is recorded by
the final handoff-only commit after deployment. It intentionally differs from
the implementation commit above.

## Verification

From a clean checkout at the implementation commit:

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

All passed: 15 Rust tests, 3 Vitest tests, 25 Playwright tests, and the artwork
provenance audit. Each of the 17 commands in `.factory/claims.json` then passed
independently. A separate process started with only `PORT`; it created SQLite
beside its executable and served a healthy response.

The deployed browser suite passed 25/25. The factory URL verifier found no
console errors. Axe found no serious or critical issues on the seven main
screens or on Privacy, Terms, and 404. The expected unknown route returns 404
with the designed recovery page.

Mobile Lighthouse scored 99 performance and 100 for accessibility, best
practices, and SEO. LCP was 1.65 seconds, CLS was 0.038, and total blocking
time was 0 ms. JavaScript is 29.77 KB, CSS is 20.38 KB, self-hosted fonts are
71.35 KB, and the mobile hero is 29.06 KB.

Live normal, invalid, boundary, and recovery checks passed. These include all
three populated samples, reset and exit without changes to a real-data
sentinel, two-phone room replay, offline reload and sample play, keyboard and
focus behavior, reduced motion, 200% text, malformed JSON, a 21-character
nickname rejection, missing-room recovery, 429 with `Retry-After`, and a real
replica restart with persisted sample state.

## Deployment

The durable deployment uses the fleet-created `sf-kitchen-table-data` storage
through `/data`, with minimum and maximum replicas both set to one. The final
revision, image digest, deployed source SHA, and post-deploy health result are
recorded by the final handoff-only commit.

Two intermediate revisions could not start while the default SQLite locking
mode was used on Azure Files. They received no traffic and were deactivated;
the prior healthy revision remained live throughout. Dot-file locking fixed
the mount compatibility issue.

## Run locally

```sh
npm ci
npm test
npm run build
cargo run
```

Open `http://127.0.0.1:8080`, or `/demo` for the isolated sample. The container
requires only `PORT`; it writes product state to `/data`.

## Known gap

Rooms from the earlier external storage configuration were not read or moved.
The work order permits product state only in this product's `/data` mount.
New rooms and samples persist there across process replacement.

No AI feature was added because it would not help the family game loop and
would add an unrelated privacy and cost surface. There is no paid offer, so no
billing metadata is required.
