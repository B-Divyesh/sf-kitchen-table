# Kitchen Table v1 handoff

## Independent verification 1 — **FAIL** (2026-08-28)

Candidate `b55780dc154f80a42136c89cef71fb4d07ba316f` was independently tested
against `https://kitchen-table.sociobot.in`. **Do not promote this release.**

- **P0:** Production routes requests between isolated SQLite stores. A freshly
  created room produced 15 successful and 15 not-found responses across 30
  reads, after concurrent joins also produced unexpected 404s. This breaks the
  core shareable-room/async product promise.
- **P1:** Direct room links and `/privacy`/`/terms` serve the SPA body with HTTP
  404, causing browser console errors. Live `/health` reports old SHA
  `830138fc4c0e5ece8448a31b1e989b8f4625a9ce`, not the candidate.
- **P2/P3:** Several 390 px links are below 44 px touch targets; hashed assets
  have no `Cache-Control`; malformed game JSON gets a framework 422 message.

Local quality gates pass (`npm ci`, `npm test` = 7 Rust + 3 frontend tests,
`npm run build`, release build, and Clippy). Lighthouse mobile was 99/100/100/
100 and Axe found no serious/critical issues, but they cannot override the
production persistence and route-status failures. Docker was unavailable in
this verifier container, so the exact container image could not be built here.
See `.factory/verification-1.md` for reproduction commands, exact samples,
passed checks, and required remediation.

## Repair delivery product-QA sign-off (2026-08-28)

- **Recovered candidate:** `830138fc4c0e5ece8448a31b1e989b8f4625a9ce`.
  Repair commit: `5831bac397be276112182351693eaa30f567d42b`.
- **Focused repair:** the production image now bakes the immutable candidate
  SHA into `BUILD_SHA`; the `/health` handler has a regression test for the
  configured build identity. No game flow, visual design, storage model, or
  deployment class changed.
- **Clean local QA:** `npm ci`, `cargo clean`, `npm test`, `npm run build`,
  and `cargo build --release` all passed. `npm test` passed **7 Rust tests**
  and **3 frontend tests**. The production Vite output is 18.49 KB JS,
  16.46 KB CSS, and 71.35 KB of local fonts (raw asset sizes).
- **Container delivery:** ACR run `ch7t` built
  `sociobotregistry.azurecr.io/sf-kitchen-table:5831bac397be` successfully in
  5m04s. The fixed worker path registered the hostname before ordering the
  managed certificate; the certificate reached `Succeeded` and the custom
  hostname is SNI-bound.
- **Public production QA:** on 2026-08-28, `GET
  https://kitchen-table.sociobot.in/` returned **HTTP 200** and `GET
  https://kitchen-table.sociobot.in/health` returned **HTTP 200** with
  `{"status":"ok","build_sha":"830138fc4c0e5ece8448a31b1e989b8f4625a9ce"}`.
- **Browser and accessibility QA:** factory `verify-url.sh` passed against the
  public URL in 683 ms with zero console/page errors, title present,
  `lang="en"`, exactly one `h1`, a `main` landmark, zero images missing alt
  text, and zero unlabeled buttons. Public mobile Axe coverage passed on home
  plus Lantern Race, Make a Square, and High Five: **4 screens, zero
  serious/critical violations**. Updated evidence is in `.factory/evidence/`.

## What shipped

- A finished account-free room flow: create, share a six-character code/link,
  join with a nickname, wait in a live lobby, start, leave, and reopen the same
  private seat from browser storage.
- Three original, server-authoritative public-domain games:
  - **Lantern Race** for 2–4 players: two pawns each, six-to-enter, captures,
    bonus turns, exact home rolls, and completion.
  - **Make a Square** for two players: 4×4 dots, box ownership, score keeping,
    extra turn after a completed box, and completion.
  - **High Five** for two players: five dice, holds, up to three rolls, ten
    score rows, totals, ten rounds, and completion.
- SQLite persistence and 2.5-second room refresh for same-room play; links and
  persisted state support push-free asynchronous play. Writes are serialized in
  the single-container process. Inactive rooms expire after 90 days.
- Mobile-first and keyboard-operable game boards, designed focus states,
  44-pixel targets, turn announcements, loading/error/offline states, reduced
  motion, installable shell/service worker, and responsive 390 px layouts.
- Privacy/terms routes, security headers, 16 KB request limits, health endpoint,
  structured logs, graceful shutdown, non-root multi-stage container, MIT
  license, and complete README.
- Product-specific cinematic visual system in `.factory/design.md`. The hero
  was generated expressly for this product with the factory image model, was
  visually reviewed, and ships as 29 KB/67 KB WebP variants. Prompt and
  provenance are retained under `assets/src/`.

## Run and verify

```sh
npm ci
npm test
npm run build
cargo build --release
DATABASE_URL='sqlite://kitchen-table.db?mode=rwc' PORT=8080 cargo run
```

`npm run build` runs TypeScript checking and Vite and outputs
`frontend/dist/index.html`. Production container command:

```sh
docker build -t kitchen-table .
docker run --rm -p 8080:8080 -v kitchen-table-data:/data kitchen-table
```

The worker environment did not contain a Docker CLI, so the image itself could
not be executed here. Both native release compilation and the exact frontend
build completed successfully; the Docker stages use their lockfiles and the
same commands.

## Verification results (2026-08-27)

- `npm test`: pass — 6 Rust unit/route-lifecycle tests and 3 frontend scoring
  tests.
- `npm run build`: pass; output present at `frontend/dist/index.html`.
- `cargo build --release`: pass.
- Real HTTP smoke: create → join → start → authorized move → persisted next
  turn; pass. Public response confirmed not to contain a seat token.
- Browser smoke via factory `verify-url.sh`: pass; title, `lang`, one `h1`,
  `main`, alt text and labels present; zero console/page errors at desktop and
  390 px.
- Axe 4.13 across home plus all three active game screens at 390 px: **zero
  violations**.
- Lighthouse mobile: **Performance 99, Accessibility 100, Best Practices 100,
  SEO 100**; LCP 1.7 s, CLS 0, total blocking time 0 ms.
- Production budgets: initial JS 18.49 KB, CSS 16.46 KB, fonts 71.35 KB, mobile
  hero 29 KB (all raw transfer file sizes; under their respective limits).
- Load smoke: 500 concurrent health checks with 20 workers completed without a
  failure in 2.018 s (~248 requests/s), exceeding the 100 requests/s target.

Reports and screenshots are in `.factory/evidence/`. The repeatable local Axe
driver is `.factory/a11y-check.mjs` (it uses the worker's Playwright install).

## Known gaps / next steps

- Turns are refreshed by lightweight polling and deliberately have no push
  notifications. A future opt-in notification system would need a separate
  consent and privacy design.
- SQLite and the in-process write lock are intended for the shipped
  single-container deployment. Horizontal replication would require PostgreSQL
  or database-backed optimistic locking.
- The fixed Container App worker path does not currently attach a persistent
  `/data` volume. Room state is durable for a running replica but requires
  factory storage configuration to survive an app revision or restart. No
  billing or payment work was performed.
