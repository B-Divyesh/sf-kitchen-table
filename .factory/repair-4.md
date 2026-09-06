# Play family games on separate phones — repair 4

Repaired and verified on 6 September 2026. The implementation commit is
`285371898b60ef874f3a396134c97a30b6c00f75`.
The deployed source and documentation evidence commit is
`74b1bb14a16a1c851e02c179a044ee81535bd09c`.

## Review 5 findings

| Finding | Resolution | Outcome evidence |
| --- | --- | --- |
| F-5-1: Race and dice named the wrong sample | The persistent banner receives the active game name. | The browser derives the expected banner from each route's rendered h1. Make a Square, Lantern Race, and High Five all pass. |
| F-5-2: footer said `Build local` | Vite receives `BUILD_SHA`; the footer shows its first seven characters and retains the full value as element data. | The live claim compares both values with `/health`. Placeholder values are rejected. |
| F-5-3: build claim accepted placeholders | The local claim server receives a fixed 40-character SHA and must return that exact value. Live runs require 40 lowercase hexadecimal characters. | The claim also requires an exact full footer/health match and the correct short visible label. |
| F-5-4: Rust image pinned a minor release | The server stage now uses `rust:1-alpine`. | The factory's ACR build completed from the source tarball with all build identity arguments. |

The banner and build checks assert rendered outcomes rather than matching
implementation source. All 17 declared claim commands pass independently.

## Durable backend

Production now uses SQLite on the fleet-managed `/data` mount. The app has one
connection and the deployment has one replica. SQLite uses its dot-file lock
mode because the mount does not provide POSIX byte-range locking. Schema setup
retries a transient busy database. Outside the container, the no-environment
default writes beside the executable when `/data` is absent.

An isolated sample room was created, then the active production replica was
restarted. A new process returned the same sample, revision, and players. The
browser suite separately proved sample/real-room isolation, seat-token
privacy, real room-link resume, and 429 responses with `Retry-After`.

## Current verification

- Clean checkout at the exact deployed source: `npm ci`, `npm test`,
  `npm run build`, strict Clippy, and `cargo build --release` pass.
- Full suite: 15 Rust, 3 Vitest, 25 Playwright, and provenance checks pass.
- Every command in `.factory/claims.json`: 17/17 pass separately.
- Live browser suite: 25/25 pass.
- Factory URL verifier: pass with no console errors.
- Axe: seven main screens plus Privacy, Terms, and 404 have no serious or
  critical findings.
- Mobile Lighthouse: 99 performance and 100 accessibility, best practices,
  and SEO; LCP 1.65 seconds, CLS 0.038, total blocking time 0 ms.
- Production output: 29.77 KB JavaScript, 20.38 KB CSS, 71.35 KB fonts, and a
  29.06 KB mobile hero image.
- Phone and desktop cold first screens show the job, audience, primary action,
  action outcome, and three facts without scrolling.
- The deliberate unknown route returns HTTP 404 with the complete recovery
  design. Invalid game, malformed JSON, long nickname, and missing-room
  requests return controlled product errors.
- At 200% text size the phone layout has no horizontal overflow. Reduced
  motion disables scrolling animation, and the offline controlled reload can
  still make and reset a sample move.

## Earlier history

Every review, verification, polish report, and prior handoff in `.factory/`
was inspected. Review 5 already records the item-by-item disposition of review
1, review 2, and review 3 findings. Those closure checks were replayed here.
Review 5's four open findings are the four resolved above; no earlier finding
reopened.

The only data caveat is deliberate: rooms from the previous external storage
configuration were not read or copied because this work order permits product
state only on `/data`. Rooms created after this repair persist in the mounted
SQLite database.
