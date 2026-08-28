# Polish 3 — cumulative finding closure

Repair source deployed: `ca76ccf9de1490a1956ba6fb7bac22622d339cdf`.

This round re-read `review-1.md`, `review-2.md`, `review-3.md`, both earlier
polish records, all verification records, and the prior handoff. Evidence
below uses the clean clone `/tmp/kitchen-table-polish3-final2-WQHkVl`, the
local evidence directory `.factory/evidence/polish-3-local/`, and the final
live replay recorded below. An initial deployment exposed the factory
user-assigned identity's required public client-ID selector; `ca76ccf` fixes
that runtime configuration and was redeployed before this final replay.

## Review 3

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 (and F-2-4 recurrence) | Replaced the replica-local sample `HashMap` with a separate `demo/` durable Blob prefix in deployment and a separate local `demo_rooms` table for no-cloud runs. Sample rooms carry a 24-hour creation boundary, use conditional writes, and never use the production `rooms` table or routes. The Container App can locate the factory room container through its managed identity with only `PORT` configured. | Rust `separate_replicas_share_an_isolated_demo_room_and_keep_it_out_of_rooms`; `@claim:room-link-resume` repeats eight fresh host/guest/reload flows; live claim replay. |
| F-3-2 | Asynchronous sample-board success and recovery renders now run route finalization after the final h1 exists, focusing it and filling the polite route status. Normal async room routes use the same finalization. | `shared demo settles with focus and an announcement on both board and recovery routes`. |
| F-3-3 | Added the `race-gameplay` registry entry and a playable Lantern Race sample with two separately selectable pawns on one path. | `@claim:race-gameplay`; live `/demo?game=race`. |
| F-3-4 | Added the `dots-gameplay` registry entry. The seeded dots sample now completes a square, increments Alex’s score, and preserves Alex’s turn. | `@claim:dots-gameplay`; live `/demo`. |
| F-3-5 | Added the `dice-gameplay` registry entry and a playable High Five sample that rolls five dice, holds a die, and records a score row. | `@claim:dice-gameplay`; live `/demo?game=dice`. |
| F-3-6 | Changed room document titles, including an unknown room, to `Kitchen Table — shared room ABC123`. | `room routes keep Kitchen Table first in their document title`; live `/room/ABC123`. |

## Review 2

| Finding | Change made or replayed state | Evidence |
| --- | --- | --- |
| F-2-1 | The first action, result note, and three facts remain above 1440×900 and 390×844 folds. | `desktop first screen contains the full sample action and trust facts`; `phone first screen contains the sample action and all three trust facts`; local screenshots. |
| F-2-2 | Push and browser-history routes focus/announce the final h1; async routes are covered above. | `browser Back restores route title, announcement, scroll, and h1 focus`. |
| F-2-3 | Header and footer controls retain ≥44×44 px geometry at 390 px. | `mobile header and footer links meet the 44px touch-target baseline`. |
| F-2-4 | Superseded by the durable isolated demo tenant in F-3-1. | Eight-flow `@claim:room-link-resume`; Rust replica test; live replay. |
| F-2-5 | The exact in-progress promise has its own registry entry and test. | `@claim:demo-in-progress`. |
| F-2-6 | The factory credit remains the resolving, visibly external `hello-factory.sociobot.in` link. | Link crawl in `verify-url.sh`; live footer check. |
| F-2-7 | The limits kicker remains the direct “What Kitchen Table does not include.” | `.factory/copy-audit.md`; local/mobile screenshot. |

## Review 1 blocking and major findings

| Finding | Change made or replayed state | Evidence |
| --- | --- | --- |
| B1 | Plain-language headline, visible sample action/result, and three facts remain within both required first screens. | First-screen Playwright tests and `polish-3-local/desktop-fold.png`. |
| B2 | Direct `/demo` and `?demo=1` seed a visible two-player game; banner, Reset demo, Start for real, offline local play, and the durable two-phone sample route are real. Exiting clears `demo:` storage before navigation. | `demo-isolated`, `demo-in-progress`, `demo-reset`, `demo-offline`, `room-link-resume` claims; `polish-3-local/demo-mobile.png`. |
| B3 | Registry now contains 17 claims, each with exactly one tagged observable test. | Registry/tag audit; every listed command passed individually from the final clean clone. |
| B4 | The exact field disclosure remains before real-room creation and agrees with Privacy. | `@claim:storage-disclosure`; live landing and Privacy checks. |
| B5 | Unknown routes still preserve HTTP 404 and render the designed h1/title/recovery links. | `routes expose unique metadata and a useful HTTP 404`; live `/not-a-real-route`. |
| M1 | The tracked lockfile supports documented `npm ci` from a clean clone. | Final clean clone: `npm ci && npm test && npm run build`. |
| M2 | Route titles/descriptions/canonicals/OG/Twitter data, social card, icons, robots, sitemap, headers, and real routes remain intact; room title order is now corrected. | Metadata/404 and room-title tests; `verify-url.sh`. |
| M3 | Skip link, forward, Back, and async route focus/announcement behavior are covered. | Skip, Back, and shared-demo focus tests. |
| M4 | Header/footer, demo preview, limits section, factory credit, and build label remain on every shell. | Desktop/mobile screenshots and route crawl. |
| M5 | The direct privacy deletion contact remains usable. | `@claim:deletion-contact`. |

## Review 1 plain-language findings

| Finding | Change made or replayed state | Evidence |
| --- | --- | --- |
| PW-01 | “Play family games on separate phones” remains the first h1. | First-screen tests; copy audit. |
| PW-02 | Metadata remains concrete and does not use “quiet.” | Metadata route test. |
| PW-03 | Game copy remains concrete and avoids “familiar.” | Copy audit; game claims. |
| PW-04 | The game section remains “Choose from three family games.” | `@claim:three-games`. |
| PW-05 | Every game button names its destination. | `@claim:three-games`; screenshot. |
| PW-06 | Shared sessions are consistently called rooms. | Copy-audit terminology table. |
| PW-07 | Absence copy consistently says “No account” and “No ads.” | `@claim:no-account`; `@claim:no-ads`. |
| PW-08 | The nickname prompt remains grammatical and specific. | `@claim:storage-disclosure`. |
| PW-09 | Persistence wording names the room link rather than a metaphor. | `@claim:room-link-resume`. |
| PW-10 | README game wording remains direct and brand-free. | README/copy audit. |
| PW-11 | Storage wording names fields and browser token plainly. | `storage-disclosure`; `seat-token-private`. |
| PW-12 | Unsupported backend-jargon marketing remains absent. | README/copy audit. |
| PW-13 | Unsupported deployment-credential marketing remains absent. | README/copy audit. |
| PW-14 | Accessibility marketing jargon remains removed; executable checks remain. | Seven-screen axe report; keyboard tests. |
| PW-15 | Unsupported vague retention marketing remains absent. | Privacy/README audit. |
| PW-16 | The false “nickname is all we store” sentence remains absent. | `@claim:storage-disclosure`. |

## Review 1 unlisted claims

| Finding | Change made or replayed state | Evidence |
| --- | --- | --- |
| UC-01 | Game count, sharing, account, and ad statements map to registry claims. | `three-games`, `room-link-resume`, `no-account`, `no-ads`. |
| UC-02 | No-ad UI and same-origin demo traffic are asserted. | `@claim:no-ads`. |
| UC-03 | The sample opens without account fields or calls. | `@claim:no-account`. |
| UC-04 | Exactly three named choices are asserted. | `@claim:three-games`. |
| UC-05 | Isolated two-phone join, move, and reload run eight times. | `@claim:room-link-resume`. |
| UC-06 | Race behavior is now registered and demonstrated; duration marketing remains absent. | `@claim:race-gameplay`. |
| UC-07 | Dots closure/extra-turn behavior is now registered and demonstrated; duration marketing remains absent. | `@claim:dots-gameplay`. |
| UC-08 | Five-dice roll/hold/score behavior is now registered and demonstrated; duration marketing remains absent. | `@claim:dice-gameplay`. |
| UC-09 | A second context reload observes the moved board. | `@claim:room-link-resume`. |
| UC-10 | Demo checks absent identity/social/payment/analytics surfaces and all request origins. | `no-account`, `no-strangers-or-payments`, `no-ads`. |
| UC-11 | Exact storage disclosure appears before a real write. | `@claim:storage-disclosure`. |
| UC-12 | Public room/sample views omit return tokens; ambiguous privacy language is absent. | `@claim:seat-token-private`; Rust public-view tests. |
| UC-13 | Real rooms and isolated demo rooms both have replica/process persistence coverage. | Rust real-room replica/restart tests; Rust demo-replica test. |
| UC-14 | Unsupported storage-topology marketing remains removed. | README audit. |
| UC-15 | Sample seat keys use only `demo:`; public data omits tokens. | `@claim:seat-token-private`. |
| UC-16 | Browser traffic is same-origin and shipped assets are local. | `@claim:no-ads`; `verify-url.sh`. |
| UC-17 | README only claims testable health and rate-limit behavior. | `@claim:server-health-and-limits`. |
| UC-18 | Keyboard, touch, focus, reduced-motion, and axe checks are executable evidence rather than unsupported marketing. | Structure tests; seven-screen axe report. |
| UC-19 | Offline demo play changes local state without a request. | `@claim:demo-offline`. |
| UC-20 | Unsupported retention/sale wording remains removed. | Privacy audit. |
| UC-21 | The demo has no age/contact/location/account/chat surfaces. | `no-account`; `no-strangers-or-payments`. |
| UC-22 | Terms boundaries have no payment/gambling/prize/matchmaking/chat surface. | `@claim:no-strangers-or-payments`. |
| UC-23 | Generated artwork provenance remains source-audited. | `@claim:artwork-provenance`. |

## Earlier verification findings

| Finding | Change made or replayed state | Evidence |
| --- | --- | --- |
| Verification 1 P0 / Verification 2 P0 | Production rooms retain their shared durable path; sample rooms now use a separate durable path, too. | Rust real-room and demo replica tests; final live two-phone replay. |
| Verification 1 P1 / Verification 2 P1 | Build identity, valid/invalid routes, and clean test setup remain covered. | `/health`; metadata/404 tests; final clean clone. |
| Verification 1 P2 | All required header/footer targets remain at least 44 px. | Mobile geometry test; mobile screenshot. |
| Verification 1 P3 | Cache policy and product-error tests remain green. | Rust cache/error tests; `verify-url.sh`. |

## Aggregate local evidence

- Final clean clone: `npm ci`, `npm test`, and `npm run build` passed.
- Final clean clone: all 17 commands in `.factory/claims.json` passed one at a
  time; the repeated shared-link claim completed eight host/guest/reload flows.
- Full suite: 15 Rust, 3 Vitest, 24 Playwright, and the provenance audit passed.
- `cargo clippy --all-targets --all-features -- -D warnings` and `cargo build
  --release` passed.
- `node .factory/a11y-check.mjs http://127.0.0.1:4173` audited home, all three
  demo samples, and all three real game screens: 7 screens, 0 serious/critical.
- `verify-url.sh` local report: correct title/lang/main/alt/button labels and
  no console errors. `polish-3-local/verify.json` records a 745 ms cold local
  load. The production bundle is 29.62 KB JS (9.80 KB gzip), 20.38 KB CSS
  (5.48 KB gzip), and 71.35 KB fonts.

## Final cold live replay

All mappings above were rechecked after deployment at
`https://kitchen-table.sociobot.in`, build
`ca76ccf9de1490a1956ba6fb7bac22622d339cdf`.

- `verify-url.sh https://kitchen-table.sociobot.in` passed with a 582 ms cold
  load, zero console errors, one h1, `lang=en`, `main`, alt text, and labelled
  buttons. Evidence: `polish-3-live/verify.json`,
  `polish-3-live/screenshot-desktop.png`, and
  `polish-3-live/screenshot-mobile.png`.
- `node .factory/a11y-check.mjs https://kitchen-table.sociobot.in` audited the
  landing page, all three demo samples, and all three real game screens: seven
  screens, zero serious/critical issues. Evidence: `.factory/evidence/axe.json`
  and the three live game screenshots.
- `PLAYWRIGHT_BASE_URL=https://kitchen-table.sociobot.in npx playwright test`
  passed all 24 checks. This replays every tagged claim, including eight fresh
  `@claim:room-link-resume` host/guest/reload loops, final async focus and
  announcement, titles, history, 44 px targets, privacy traffic, and rate
  limiting.
- The public live-route check returned 200 for `/`, `/demo?game=race`,
  `/demo?game=dice`, `/privacy`, `/terms`, and `/room/ABC123`; it returned 404
  for `/not-a-real-route`. `/health` returned the deployed SHA.
- I cold-opened `?demo=1` and `/` at 390×844 and 1440×900. The inspected
  screenshots are `polish-3-live/live-demo-mobile.png` and
  `polish-3-live/live-home-desktop.png`: the demo banner, Reset demo, Start
  for real, seeded board, first-screen action/result, and three facts are all
  visible.
