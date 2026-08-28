# Kitchen Table repair handoff

## Independent verification 3 — PASS

Candidate `b5c6182a4e0dfd1ed27cd795fadaf62caec1b8b3` is live at
<https://kitchen-table.sociobot.in> and **PASSes** independent verification on
2026-08-28 UTC. Fresh evidence is in `.factory/verification-3.md`.

- Clean gate passed: `npm ci`, `npm test` (**12 Rust + 3 Vitest**),
  `npm run build`, strict Clippy, and `cargo build --release`.
- `/health` reports the exact candidate SHA, and the live hashed JS/CSS
  byte-match a fresh local build.
- A new live room survived 8 concurrent joins (3 accepted, 5 correctly full)
  and 30 concurrent reads (all 200, no token exposure or replica-dependent
  404s).
- Desktop plus 390 px create/join/start/play/reload, all three game smoke
  flows, offline PWA reload, keyboard/focus, reduced motion, and same-origin
  privacy checks passed. Axe found 0 serious/critical issues; repeated mobile
  Lighthouse measurements were 99/97 performance and 100 accessibility.

No P0/P1/P2 defects were found. The verifier container lacked an OCI engine,
so Docker image construction was the sole environment-limited check; the live
identity and byte comparison establish the deployed candidate independently.

## Repair scope

This repairs every release blocker in independent verification report
`4d08ce78825914498f7b0795f44327659af160f1` for candidate
`97a6c6274a95aaa67dd49f5b4a011ad0281cbfd8`.

- **Shared authoritative rooms:** production reads now always come from the
  private `sociobotblob/kitchen-table-rooms` Blob container, never from a
  replica-local SQLite cache. Creates use `If-None-Match: *`; joins, starts,
  and actions read the Blob ETag then write with `If-Match`, retrying a
  concurrent update from fresh state. SQLite remains a development/restart
  cache only. The existing Container App user-assigned identity is selected
  explicitly; no storage key is shipped or exposed to a browser.
- **Build identity:** the image accepts `BUILD_SHA` (default `dev`) and the
  deployment build injects the exact source commit, which `/health` returns.
- **Clean test setup:** the persistent-database test registers SQLx Any
  drivers before opening its first pool.

Previously repaired, passing behavior is retained: known SPA URLs return 200,
unknown URLs return 404, invalid JSON is a product 400, security/cache headers
are retained, and legal/mobile target fixes remain intact.

## Regression coverage

- `api::tests::separate_replicas_share_a_room_and_never_turn_a_fresh_link_into_a_404`
  uses two distinct application states against one durable store: create on
  one, join on the other, fill to four, then read publicly through both. It
  asserts no fresh-room 404, correct full-room 400, and no token in public
  state.
- `a_room_survives_a_process_replacement_when_database_storage_is_persistent`
  now reliably registers SQLx Any drivers before both process-simulating pool
  opens.

## Verification completed before deployment

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

All passed: **12 Rust tests** and **3 Vitest tests**. Production output is
18.49 KB JS (7.26 KB gzip), 16.56 KB CSS (4.71 KB gzip), and 71.35 KB local
fonts.

Local release-server checks (`PORT=4173 BUILD_SHA=local-repair`) passed:

- `/health` returned `{"build_sha":"local-repair","status":"ok"}`.
- `/privacy` returned 200; a hashed JS asset returned
  `Cache-Control: public, max-age=31536000, immutable`; invalid game JSON
  returned the documented product 400.
- Playwright desktop and 390 px mobile found one `h1`, one `main`, `lang=en`,
  a keyboard-reachable Skip link, no console errors or horizontal overflow,
  44×44 Privacy/Terms targets, and same-origin requests only.
- Axe 4.13 scanned home plus active Race, Dots, and Dice mobile games: **4
  screens, 0 serious/critical violations**.

## Run and deploy

```sh
npm ci && npm run build
PORT=8080 cargo run
```

The local process uses SQLite when no Azure managed-identity endpoint exists.
The shipped Container App has only `PORT` configured; its image contains
non-secret storage identifiers and automatically enables the private Blob
store when Container Apps injects its identity endpoint.

## Live deployment evidence

The functional deployment verification was run against image
`sociobotregistry.azurecr.io/sf-kitchen-table:a470bf622a98`, built from source
commit `a470bf622a989d9eda93cc4a64ff02897c055b0f` with that exact `BUILD_SHA`.

- `GET /health` returned
  `{"build_sha":"a470bf622a989d9eda93cc4a64ff02897c055b0f","status":"ok"}`.
- Fresh live Race room `SAKUSN`: eight concurrent joins returned **3 × 200**
  and **5 × 400**, with **0 × 404**. Thirty concurrent public reads then
  returned **30 × 200**, four players, and no seat token. After restarting
  revision `sf-kitchen-table--0000010`, another **60 × 200** public reads had
  the same four-player state and no token leakage.
- Known browser routes and response policy are intact: `/privacy` returns 200,
  hashed JS is immutable, and invalid game JSON returns the documented 400.
- Live Playwright desktop/390 px checks found one `h1`, one `main`, a
  keyboard-reachable Skip link, no horizontal overflow or console errors,
  44×44 Privacy/Terms targets, and same-origin-only requests. Axe scanned the
  home plus active Race, Dots, and Dice games: **4 screens, 0
  serious/critical violations**.
- The active worker controlled a warmed HTTPS page after reload; a deliberate
  offline reload retained the page title and one `main` landmark.

## Known limitations

- Turns use lightweight polling rather than push notifications.
- Rooms are private Blob data; public room reads intentionally exclude the
  private seat token.
