# Independent verification 3 — PASS

**Candidate:** `b5c6182a4e0dfd1ed27cd795fadaf62caec1b8b3`  
**Live URL:** <https://kitchen-table.sociobot.in>  
**Verified:** 2026-08-28 UTC from a clean checkout at the candidate  
**Verdict:** **PASS — candidate and live deployment meet the release contract.**

This is a new independent result. It supersedes the prior replica-split and
unknown-build findings: neither reproduced against this candidate.

## Build and test gates

`npm ci` completed with 58 packages and no reported vulnerabilities. The
following clean-checkout gate passed:

```sh
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

- `npm test`: **12 Rust tests passed** and **3 Vitest tests passed**. This
  includes persistent-storage/process-replacement and separate-replica room
  tests that failed in the earlier verification.
- `npm run build`: passed type checking and emitted production assets.
- strict Clippy and the release binary build passed.
- The release binary was started from a clean temporary working directory with
  only `PORT=4173` supplied. It served `/health` (default
  `build_sha: development`), `/privacy` (200), the expected malformed-request
  400, and immutable hashed-asset caching. This exercised the no-required-env
  runtime contract without writing a database in the repository.
- A Docker/OCI engine (`docker`, `podman`, and `buildah`) was not installed in
  this verifier container, so an independent container-image build was not
  possible. The repository production build and the already deployed exact
  build identity were independently verified instead.

## Live identity, persistence, and API evidence

`GET /health` returned exactly:

```json
{"build_sha":"b5c6182a4e0dfd1ed27cd795fadaf62caec1b8b3","status":"ok"}
```

The deployed hashed JS and CSS byte-match a fresh local candidate build:

| Asset | SHA-256 |
| --- | --- |
| `index-De2lm0LW.js` | `75c5ba4032227fdf8cd48aa987b6f9c258512b21ab16d144317e1be3f9351622` |
| `index-Db9abMjB.css` | `9dc30ab135dfe5ce0f394fb88ff48bc49e97004f93331daf6afbb372d9de98cd` |

A fresh live Lantern Race room (`5RVS7G`) was used for a parallel replica
smoke test. Eight simultaneous joins produced **3 × 200** and **5 × 400
(full)**, with **0 × 404**. Thirty parallel public reads then produced **30 ×
200**; all saw four players and the host seat token was absent from the public
response. This directly retests the prior release-blocking cross-replica
failure.

Boundary/recovery probes returned product errors, not framework failures:

- invalid game JSON: 400, `The request body was not valid. Check the game and
  try again.`
- malformed room lookup: 404; unknown browser path: 404.
- local release server: invalid game JSON 400, `/privacy` 200.

## Product, browser, PWA, and accessibility evidence

The brief's room-link loop was exercised in independent browser contexts:

1. On desktop, create **Make a Square** through the landing UI.
2. On a 390 × 844 phone context, open the room link and join with a nickname.
3. Start as the host, place a line, then reload the guest. The placed line was
   still disabled/persisted (`dotsMovePersisted: true`).

The axe 4.13 WCAG A/AA scan covered the mobile home plus active Race, Dots,
and Dice rooms: **4 screens, 0 serious/critical violations**. The latter two
game flows also created, joined, started, and performed their first action.

Desktop and 390 px checks found one `h1`, one `main`, `lang=en`, useful image
alt text, no horizontal overflow, and no page or application-console errors.
Keyboard Tab focused the Skip link, visibly rendered at 161 × 45.5 px.
Reduced-motion mode reports `scroll-behavior: auto`. No outbound browser
requests occurred: all app, font, image, and API traffic remained same-origin.

The service worker registered and became active, controlled the next page
load, and an intentional offline reload returned the app shell (200, one
`main`, correct title, no console errors). Its deployed worker is cached with
`no-cache`, so the browser checks it for updates; a brand-new deployment was
not available to force an otherwise artificial update during this verification.

## Privacy, response policy, and budgets

No analytics, ads, third-party scripts/fonts, cookies, or external requests
were observed. The live shell, hashed asset, worker, and API respectively
returned `no-cache`, `public, max-age=31536000, immutable`, `no-cache`, and
`no-store`. Responses include CSP restricted to `'self'`,
`X-Content-Type-Options: nosniff`, and
`Referrer-Policy: strict-origin-when-cross-origin`.

Production output is within the stated static budgets: JS 18,492 B (7,260 B
gzip), CSS 16,561 B (4,710 B gzip), self-hosted fonts 71,352 B, and mobile
hero 29,060 B. Two fresh mobile Lighthouse runs scored **99** and **97**
performance and **100** accessibility, with LCP 1.63 s / 1.54 s and CLS
0.0011. An initial 84-performance run occurred while the local optimized Rust
build saturated the verifier host (TBT 520 ms); the two immediately repeated
uncontended runs are the recorded gate measurements.

## Defects

No P0, P1, or P2 release defects found. The only verification limitation is
the missing OCI build engine in this container; it is documented above and is
offset for this candidate by exact live health identity plus byte-identical
frontend assets.
