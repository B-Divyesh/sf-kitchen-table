# Independent verification 2 — FAIL

**Candidate:** `97a6c6274a95aaa67dd49f5b4a011ad0281cbfd8`  
**Live URL:** <https://kitchen-table.sociobot.in>  
**Verified:** 2026-08-28 UTC, from a fresh detached clone at the candidate.  
**Verdict:** **FAIL — do not promote.**

The defining room-link/async multiplayer flow is not reliable in the live deployment. Fresh evidence also proves the live backend cannot be identified as the candidate, and the repository's required test command is red.

## Release blockers

### P0 — live room state is still split between replicas

Freshly created live Lantern Race room `HY5U5D`, then submitted eight concurrent joins. Results were **3 × 200, 1 × 400 (correctly full), and 4 × 404**. The 404 response was `{"error":"That room was not found. Check the six-letter code."}` for a just-created room. A following 30 concurrent public reads of the same code returned **16 × 200 and 14 × 404**. Successful reads had four players; the host's private seat token was not leaked.

This repeats the original production defect from fresh evidence: requests can reach an instance that cannot load a room created on another instance. It makes the shared link, realtime play, and async resumption promised by the brief randomly fail. The attempted Dice-room flow independently failed at join with a 404 after a successful create.

### P1 — the deployed backend does not identify as the candidate

Ten fresh `GET /health` requests each returned `{"build_sha":"unknown","status":"ok"}`, not `97a6c6274a95aaa67dd49f5b4a011ad0281cbfd8`. The live frontend JS and CSS do byte-match a local candidate build (SHA-256 JS `75c5ba4032227fdf8cd48aa987b6f9c258512b21ab16d144317e1be3f9351622`, CSS `9dc30ab135dfe5ce0f394fb88ff48bc49e97004f93331daf6afbb372d9de98cd`), but the server identity contract is not met. Therefore the live deployment cannot be confirmed as this candidate end to end.

### P1 — `npm test` fails from the clean checkout

After `npm ci` (58 packages; 0 vulnerabilities), `npm test` ran 11 Rust tests: 10 passed and `api::tests::a_room_survives_a_process_replacement_when_database_storage_is_persistent` failed. It panicked in `sqlx-core` with `No drivers installed. Please see the documentation in sqlx::any for details.` The test opens `AnyPoolOptions` before installing the SQLx Any drivers, so the repository quality gate is red.

## Other verification results

- `npm run build` passed; Vite emitted 18,492 B JS (7,260 B gzip), 16,561 B CSS (4,710 B gzip), 71,352 B of self-hosted fonts, and a 29,060 B mobile hero. These meet the stated asset budgets.
- `cargo clippy --all-targets --all-features -- -D warnings` and `cargo build --release` both passed. The resulting 12 MB release binary also started with no configuration other than its defaults, served `/health`, and returned 200 for a known SPA route. This does not override the failing test gate.
- Exact image build was attempted with `docker build --build-arg BUILD_SHA=97a6c627...`; this environment has no `docker` executable, so the Docker image could not be independently built or run.
- Browser normal flow passed incidentally when routed to a working instance: create Make a Square room `N68AFY` → second browser joins → host starts → host draws a line → guest reload sees that line disabled. This does not mitigate P0.
- Invalid/recovery paths: invalid game/malformed JSON, empty nickname, and a 21-character nickname returned clear 400 JSON errors; starting a one-person room returned the actionable invite-more-player error. The race roll endpoint advanced the turn when no pawn could move.
- Playwright desktop and 390 px mobile checks found one `h1`, `lang=en`, one `main`, no horizontal overflow, correct 44 px wordmark/legal targets, visible keyboard focus on the 161 × 45.5 px skip link, and reduced-motion behavior (`scroll-behavior: auto`, spinner animation disabled). Axe WCAG A/AA scans of desktop home, active desktop Make a Square, mobile home, and active mobile Make a Square had **zero violations**, including zero serious/critical.
- No application console/page errors occurred; the only captured console error was expected `ERR_INTERNET_DISCONNECTED` during the deliberate warmed offline PWA reload. The service worker controlled the page and that offline reload retained the app shell.
- Browser network activity was same-origin only: no trackers, ads, third-party fonts/scripts, or cookies were observed. API responses are `no-store`; the hashed JS is `public, max-age=31536000, immutable`; shell/worker/manifest revalidate. The live response has CSP, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
- Known SPA routes `/privacy`, `/terms`, and `/room/ABC123` return 200; `/not-a-route` returns 404.

## Required remediation

1. Make every deployed replica read and write the same durable, authoritative room store, and verify it with concurrent create/join/read requests across replicas plus a restart. A successful create must never be followed by a replica-dependent 404.
2. Pass the actual source SHA to the runtime image and make `/health` report it.
3. Repair the SQLx test setup so `npm test` passes reliably from a fresh process.
4. Re-run clean-checkout, Docker-image, and live verification after deployment.
