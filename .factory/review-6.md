# Play family games on separate phones — review 6

**Verdict: FAIL.** There is **1 minor finding** and **0 untested public
claims**. Product code was not changed.

- Implementation reviewed: `285371898b60ef874f3a396134c97a30b6c00f75`
- Documentation checkout: `2f641770134207657c8658229724d30094c33e39`
- Live build: `e22ad2a38608d12522a5a5ef970e1f613bf467fa`
- Live URL: <https://kitchen-table.sociobot.in>

The commits after `2853718` contain only `.factory/` reports and evidence.
A clean frontend build using the live `e22ad2a…` identity matched the deployed
JavaScript and CSS byte for byte. The live footer and `/health` also expose the
same full SHA. The later `2f64177` verification-report commit does not require
a new product image.

## Job, audience, and first action

Fresh Chromium contexts used empty storage and blocked service workers. No
scrolling occurred before this assessment.

| View | Job | Audience | First action | Result |
| --- | --- | --- | --- | --- |
| Desktop, 1440 × 900 | Play family games in one shared room on separate phones. | Couples and families who want a shared game without an account or ads. | **Try it with sample data**. | Pass. The action ends at y=588; all three facts end at y=629. |
| Phone, 390 × 844 | Play the same shared-room games on phones. | Couples and families who want a shared game without an account or ads. | **Try it with sample data**. | Pass. The action ends at y=556; all three facts end at y=698. |

The first action says it opens a two-player game already in progress. The
three facts are **No ads**, **No account**, and **Return to the same room
later**. Fresh page loads had no console or page errors. Screenshots are in
`.factory/evidence/review-6-home-desktop.png` and
`.factory/evidence/review-6-home-phone.png`.

## Finding

### F-6-1 — MINOR — the 404 uses a metaphor and a mood heading

The deliberate 404 is a complete, usable page, but its visible eyebrow is
**“Empty chair”** and its h1 is **“This table is not here.”** These phrases
describe a missing web page through table imagery instead of naming the state
directly. The attached plain-words contract prohibits metaphor and mood
headings on every page.

This is not a routing defect: the response is correctly HTTP 404, has one h1
and one main landmark, passes Axe, and offers **Choose a game** and **Join a
room** recovery actions. It is a minor copy defect.

**Required fix:** remove the eyebrow or change it to a useful label, and use
the h1 **“Page not found.”** Keep the existing explanation and recovery
actions. Evidence: `/not-a-real-route` and
`.factory/evidence/review-6-404-phone.png`, captured at 390 × 844.

## Claims and clean gates

A detached clean checkout at `2f64177` received `npm ci`: 60 packages, zero
reported vulnerabilities. Every command from all 17 entries in
`.factory/claims.json` was run separately.

| Claim | Result |
| --- | --- |
| `demo-isolated` | Pass |
| `demo-in-progress` | Pass |
| `demo-reset` | Pass |
| `demo-offline` | Pass |
| `no-account` | Pass |
| `no-ads` | Pass |
| `three-games` | Pass |
| `race-gameplay` | Pass |
| `dots-gameplay` | Pass |
| `dice-gameplay` | Pass |
| `room-link-resume` | Pass |
| `no-strangers-or-payments` | Pass |
| `storage-disclosure` | Pass |
| `seat-token-private` | Pass |
| `deletion-contact` | Pass |
| `server-health-and-limits` | Pass |
| `artwork-provenance` | Pass |

The registry has exactly one matching test tag for every ID and no orphan
tags. A fresh review of the landing page, demo, legal pages, and README found
no unlisted or untested public claim.

The clean quality gates passed:

```sh
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

`npm test` passed 15 Rust tests, 3 Vitest tests, 25 Playwright tests, and the
artwork provenance audit. The live browser suite also passed 25/25:

```sh
PLAYWRIGHT_BASE_URL=https://kitchen-table.sociobot.in npx playwright test
```

## Live product evidence

- The one-click sample opened a populated Make a Square board with Alex, Ravi,
  claimed squares, three open moves, and Alex's turn. The persistent label
  accurately names each of the three sample games.
- Drawing a sample line changed the open count from three to two. **Reset
  demo** restored three. **Start for real** removed every `demo:` key while a
  pre-existing `kt:review6-sentinel` remained unchanged. Direct sample play
  made zero production-room requests.
- A shared sample opened for host and guest, retained a move after reload, and
  remained isolated: a sample code was 404 through production routes, and a
  production code was 404 through sample routes. Public sample JSON omitted
  tokens.
- A fresh desktop host and 390 px guest completed create, join, start, move,
  and guest reload through the real UI. The guest saw 1 drawn line and 23 open
  lines, with no horizontal overflow or browser errors.
- A separate real Make a Square room completed all 24 moves. The final state
  was `finished`, revision 26, with all nine squares claimed and a winner.
  Public room JSON omitted seat tokens.

## Backend and recovery evidence

- A 20-character nickname completed create, public read, join, start, move,
  and reload. The reloaded room retained revision 3.
- Invalid game JSON and malformed JSON returned 400 with a plain correction.
  A 21-character nickname returned 400 with the stated limit. An oversized
  request returned controlled 400 JSON. A missing room returned the designed
  404 message.
- A 45-request live burst from one forwarded client identity returned 20 ×
  200 and 25 × 429. Every 429 included `Retry-After: 1`; `/health` remained
  200.
- A release binary started with only `PORT`, created SQLite beside the binary,
  completed a room through revision 3, shut down, restarted against the same
  file, and returned the same state. Both startups logged `generated default`
  and `SQLite` without printing secret values.
- Home uses `no-cache`, hashed assets use one-year immutable caching, the
  service worker uses `no-cache`, and API responses are `no-store`. CSP,
  `nosniff`, and strict-origin referrer policy are present.

## Accessibility, offline, routes, and performance

- `/opt/fleet/lib/verify-url.sh` passed in 644 ms with one h1, `lang=en`, one
  main, complete alt text, labelled buttons, and zero load errors.
- Axe WCAG A/AA scans of home, all three demos, Privacy, Terms, the deliberate
  404, and all three active real games found zero violations.
- Keyboard Tab reveals a 151 × 44 px skip link with a 3 px honey focus ring;
  Enter focuses main. Forward and Back navigation focus and announce the new
  h1. Async sample success and recovery screens do the same.
- Reduced-motion mode uses `scroll-behavior: auto` with no running animation.
  At 200% text size, the 390 px page has no horizontal overflow and retains
  its h1 and sample action.
- The service worker updated and controlled `/demo`. A subsequent offline
  reload returned 200, showed the offline notice, and accepted a sample move
  without a page error.
- Privacy and Terms return 200 with unique titles. The intentional unknown
  route returns 404 with a complete recovery page; its status is expected and
  is not treated as a defect. All same-origin links discovered across the
  reviewed pages returned 200, apart from that intentional self-page skip
  target on the 404 response.
- Fresh mobile Lighthouse scored 99 performance, 100 accessibility, 100 best
  practices, and 100 SEO. LCP was 1.65 seconds, CLS 0.038, and total blocking
  time 39 ms. JavaScript is 29.81 KB, CSS is 20.38 KB, self-hosted fonts total
  71.35 KB, and the mobile hero is 29.06 KB.

## Earlier finding disposition

Every earlier review, verification, repair, polish, and handoff record in
`.factory/` was inspected. These are fresh replays, not inherited closure
statements.

| Earlier finding group | Current disposition |
| --- | --- |
| Review 1 B1–B4 | Closed: first screens, isolated demo, claims registry, and complete storage disclosure pass. |
| Review 1 B5 | Functionally closed: the HTTP 404 and recovery actions work. F-6-1 is a new plain-words defect in that page's wording. |
| Review 1 M1–M5 | Closed: clean install, metadata, navigation/focus, standard shell, and deletion contact pass. |
| Review 1 PW-01–PW-16 | Closed for the original quoted copy. F-6-1 covers previously accepted 404 wording under the current no-metaphor instruction. |
| Review 1 UC-01–UC-23 | Closed: removed claims remain absent and all current claim mappings pass; no untested claim remains. |
| Review 2 F-2-1–F-2-3 | Closed: both first screens fit, Back focuses the h1, and mobile targets meet 44 × 44 px. |
| Review 2 F-2-4–F-2-5 | Closed: shared samples use isolated storage, reload across contexts, and the populated sample claim passes. |
| Review 2 F-2-6–F-2-7 | Closed: the factory link is visibly external and the limits heading is plain. The external destination was not fetched because it is outside this product boundary. |
| Review 3 F-3-1–F-3-2 | Closed: shared samples persist, and final success/recovery headings receive focus and announcement. |
| Review 3 F-3-3–F-3-6 | Closed: all three game behaviors have passing claims, and room titles keep Kitchen Table first. |
| Review 5 F-5-1 | Closed: every persistent demo banner names its active game. |
| Review 5 F-5-2–F-5-3 | Closed: footer and health exactly match `e22ad2a…`; the claim rejects placeholders and asserts the exact value. |
| Review 5 F-5-4 | Closed: the Dockerfile uses `rust:1-alpine`. |
| Verification 1 P0/P1 | Closed: room state persists, known routes are 200, the 404 is deliberate, and deployed identity is exact. |
| Verification 1 P2/P3 | Closed: targets, cache policy, and malformed-input responses pass. |
| Verification 2 P0/P1 | Closed: shared state is reliable, the deployed build is identified, and the clean test command passes. |
| Verification 3 and 4 | Their functional, privacy, accessibility, persistence, and performance results reproduce. F-6-1 is the only new finding. |

## Scope and limitations

No OCI engine is installed, so the container image was not rebuilt locally.
The Dockerfile has the required rolling Rust builder, source inspection passes,
the release binary starts with only `PORT`, and the deployed frontend assets
match a clean build exactly. Verification 4 records the successful factory
image and live restart evidence for this unchanged implementation.

The external Param Factory destination was not fetched because the work-order
boundary forbids connecting to another product. Its link is visibly marked as
external. No AI feature is warranted for this game loop; shared resumable play
is the brief's useful network feature and works end to end.

## Final result

**FAIL — 1 minor finding, 0 untested claims.** Fix F-6-1 and repeat the 404
copy, structure, accessibility, and link checks before declaring PASS.
