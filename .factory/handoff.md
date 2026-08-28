# Kitchen Table — review 4 handoff

## Review result

Adversarial first-read review 4 passed at live build
`07482e63d94b066e660ca009d7404b92b9dd6307`. The report is
`.factory/review-4.md`. No product code changed in this review.

Verification from a fresh clone (`/tmp/kitchen-table-review4-WU3XNm`):

    npm ci
    npm test
    npm run build

All passed: 15 Rust tests, 3 Vitest tests, 24 Playwright tests, and artwork
provenance. Every one of the 17 commands in `.factory/claims.json` also passed
independently. The live browser suite passed with:

    PLAYWRIGHT_BASE_URL=https://kitchen-table.sociobot.in npx playwright test

Additional review checks passed: cold 390 × 844 and 1440 × 900 first screens,
demo reset/exit isolation with an existing real-storage sentinel, offline
sample play, live two-phone sample replay, route/link crawl, and local
seven-screen axe audit (zero serious/critical).

## Known gaps

None found in this review. Preserve the existing demo/claim isolation and
repeat the live multi-context demo check after future deployment changes.

---

# Previous polish 3 handoff

## Shipped

Deployed repair source: `ca76ccf9de1490a1956ba6fb7bac22622d339cdf`.

- Replaced replica-local sample-room state with an isolated durable `demo/`
  Blob namespace in production and a separate `demo_rooms` SQLite table for
  local runs. Demo records use conditional writes and expire after 24 hours;
  they never read or write production `rooms` data.
- Added the managed-identity selector required by the factory's user-assigned
  identity. The public identifier is not a credential; no secret is in the
  image or browser. Production room creation and shared demo replay now work
  on the scaled Container App.
- Completed direct `?demo=1` sample play for Make a Square, Lantern Race, and
  High Five, with a persistent isolation banner, Reset demo, and Start for
  real. Leaving the sample clears only its `demo:` browser namespace.
- Added three observable game-rule claims and tests; the registry now has 17
  claims, each with exactly one tagged test. Updated catalog copy, demo docs,
  copy audit, privacy language, and README accordingly.
- Fixed final asynchronous route focus and polite announcements, room-title
  order, mobile sample layouts, and the cumulative routing/metadata/404/legal
  requirements while keeping the existing kitchen-table visual direction.

The full finding-by-finding closure is in `.factory/polish-3.md`.

## Verification

Final clean clone: `/tmp/kitchen-table-polish3-final2-WQHkVl` at `ca76ccf`.

    npm ci
    npm test
    npm run build

All passed: 15 Rust tests, 3 Vitest tests, 24 Playwright tests, and the
provenance audit. All 17 commands listed in `.factory/claims.json` were then
run individually from that clean clone and passed. A final registry audit
confirmed 17 claims and exactly one `@claim:<id>` tag for each.

Additional local checks passed:

    cargo clippy --all-targets --all-features -- -D warnings
    cargo build --release
    node .factory/a11y-check.mjs http://127.0.0.1:4173
    /opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence/polish-3-local

The local accessibility pass covered seven screens with zero serious or
critical issues. The production bundle is 29.62 KB JavaScript (9.80 KB gzip),
20.38 KB CSS (5.48 KB gzip), and 71.35 KB self-hosted fonts.

Live deployment and cold replay:

    /opt/fleet/lib/deploy-container.sh kitchen-table /work/repo Dockerfile 8080
    /opt/fleet/lib/verify-url.sh https://kitchen-table.sociobot.in .factory/evidence/polish-3-live
    node .factory/a11y-check.mjs https://kitchen-table.sociobot.in
    PLAYWRIGHT_BASE_URL=https://kitchen-table.sociobot.in npx playwright test

- `https://kitchen-table.sociobot.in/health` returns build SHA `ca76ccf…`.
- Cold live verification passed in 582 ms with zero console errors and a
  complete semantic shell.
- Live axe covered the landing page, three demo samples, and three real game
  screens: 7 screens, 0 serious/critical issues.
- The live browser suite passed all 24 checks, including eight fresh
  host/guest/reload sample-room flows, privacy/network assertions, offline
  demo play, focus/announcement behavior, 404/title checks, and rate-limit
  429 behavior.
- Public live checks: `/`, `/demo?game=race`, `/demo?game=dice`, `/privacy`,
  `/terms`, and `/room/ABC123` returned 200; `/not-a-real-route` returned
  404. Inspected live screenshots are in `.factory/evidence/polish-3-live/`.

## How to run

    npm ci
    npm test
    npm run build
    cargo run

Open `http://127.0.0.1:8080`, or open `/demo` / `?demo=1` for the isolated
sample. For deployment, use the container command listed above; it needs only
`PORT` at runtime.

## Known gaps

None. No AI feature was added because it would not improve the core family
board-game job and would add an unrelated privacy/cost surface.
