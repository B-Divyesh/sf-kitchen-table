# Play family games on separate phones — review 5

**Verdict: FAIL**

Reviewed 6 September 2026 at <https://kitchen-table.sociobot.in>.
There are **4 findings** and **0 untested claims**. The product code was not
changed.

- Implementation candidate: `ca76ccf9de1490a1956ba6fb7bac22622d339cdf`
- Documentation checkout: `35d9a87cd7312b8a808ea15352916f72c0d64bf1`
- Live `/health` build: `07482e63d94b066e660ca009d7404b92b9dd6307`

The commits after `ca76ccf` contain only reports and evidence. A clean build
from the documentation checkout produced JavaScript and CSS byte-for-byte
identical to the live files. The live server therefore matches the last
implementation candidate even though its health value names the later report
commit.

## Job, audience, and first action

Fresh Chromium contexts used empty storage, blocked service workers, and no
scrolling. The phone viewport was 390 × 844. The desktop viewport was
1440 × 900.

| View | Job | Audience | First action | Result |
| --- | --- | --- | --- | --- |
| Phone | Play family games in one shared room on separate phones. | Couples and families who do not want an account or ads. | **Try it with sample data**. | Pass. The action, outcome, and three facts end at y=699. |
| Desktop | Play the same shared-room games. | Couples and families. | **Try it with sample data**. | Pass. The action ends at y=588 and the facts end at y=629. |

The h1 is **“Play family games on separate phones.”** The supporting sentence
names couples and families. The first action says it opens a two-player game
already in progress. Screenshots are in
`.factory/evidence/review-5-home-phone.png` and
`.factory/evidence/review-5-home-desktop.png`.

## Findings

### F-5-1 — MINOR — two demo banners name the wrong game

`/demo?game=race` shows h1 **“Lantern Race”**, but its persistent banner says
**“Alex and Ravi are playing Make a Square.”** `/demo?game=dice` shows h1
**“High Five”** with the same incorrect banner sentence. The base Make a Square
sample is accurate.

This is a false current-state statement on two of the three sample routes. It
also means the existing demo and game claim tests do not check all visible
sample wording.

**Required fix:** make the sentence name the active sample, or use a correct
game-neutral sentence. Add assertions for the banner on all three sample
routes.

### F-5-2 — MAJOR — the live footer reports a false build identity

Every live route displays **“Build local”**. The same request session received
`07482e63d94b066e660ca009d7404b92b9dd6307` from `/health`. Source inspection
shows the footer falls back to `local` because no code sets
`document.documentElement.dataset.build`.

This reopens the build-label part of review 1 M4. It also contradicts review 4,
which recorded a live footer value of `07482e6`. Support and verification
cannot rely on the visible version label.

**Required fix:** inject the source SHA into the frontend build and show the
same value as `/health`. Add a live test comparing the footer value with the
health response and rejecting `local`, `dev`, `development`, and `unknown`.

### F-5-3 — MAJOR — the build identity claim test accepts placeholders

The `server-health-and-limits` claim says `/health` returns the build SHA. Its
test only asserts that `build_sha` is a string. Values such as `unknown` or
`development` would pass. The independent live check proves the current health
response is correct, so this claim was not left untested, but its required
automated proof is incomplete.

**Required fix:** start the test server with a known build value and assert
that exact value. In the live suite, compare the response with the reviewed
candidate or deployment identity.

### F-5-4 — MAJOR — the Dockerfile pins a forbidden Rust minor version

The server build stage uses `FROM rust:1.88-alpine`. The backend contract
requires `rust:1-slim` or `rust:1-alpine` and explicitly forbids a pinned minor
because current locked dependencies may require a newer compiler in ACR.

No Docker, Podman, or Buildah executable was available in this worker, so an
OCI build could not be run. The source violation is conclusive and is not
reported as an untested public claim.

**Required fix:** use `FROM rust:1-alpine`, then build the image with the
factory build arguments and verify `/health` plus the footer identity.

## Sample and real-data isolation

The one-click sample otherwise works as required.

- It opens Make a Square with Alex 2, Ravi 1, six drawn marks, three open
  moves, and Alex’s turn.
- Drawing one line reduces the open count from three to two. **Reset demo**
  restores three.
- The required sample label, Reset, and Start for real controls remain visible
  on every sample route.
- Lantern Race moves either of two pawns. High Five rolls five dice, holds a
  die, and records six points in threes.
- A shared sample room opened in separate host and guest contexts, retained a
  move after reload, and stayed available across eight fresh repetitions.
- A sample room code returned 404 through `/api/rooms/<code>`. No direct sample
  action called `/api/rooms`, and no `kt:` key was created.
- A pre-existing `kt:review5-sentinel` survived entry, play, reset, and exit.
  Exit removed all `demo:kitchen-table:` keys.
- No real production room was created during live review.

The populated sample screenshot is
`.factory/evidence/review-5-demo-phone.png`.

## Declared claims

From the clean checkout, `npm ci` passed. Every command in
`.factory/claims.json` then ran independently. The registry contains 17 IDs,
each with exactly one matching `@claim:<id>` tag and no orphan tags.

| Claim | Command result |
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
| `server-health-and-limits` | Command passes; coverage finding F-5-3 |
| `artwork-provenance` | Pass |

The full suite also passed against the live URL: 24 Playwright tests. No
declared claim was skipped. Finding F-5-1 is false visible copy outside the
current assertions. Finding F-5-2 is an unlisted false state label.

## Build and runtime checks

Clean checkout: `/tmp/kitchen-table-review5-VjlRyF` at `35d9a87`.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 60 packages, 0 reported vulnerabilities |
| `npm test` | Pass; 15 Rust, 3 Vitest, 24 Playwright, provenance |
| `npm run build` | Pass |
| `cargo clippy --all-targets --all-features -- -D warnings` | Pass |
| Every claim command, separately | 17/17 commands passed |
| Live Playwright suite | 24/24 tests passed |
| Local axe audit | 7 screens, 0 serious or critical violations |
| Live axe audit | 7 routes, 0 violations of any reported impact |
| Factory live URL verifier | Pass in 583 ms with no console errors |

The production bundle is 29.62 KB JavaScript (9.80 KB gzip), 20.38 KB CSS
(5.48 KB gzip), 71.35 KB of self-hosted fonts, and a 29.06 KB mobile hero.
Mobile Lighthouse scored 99 performance, 100 accessibility, 100 best
practices, and 100 SEO. LCP was 1.65 seconds, total blocking time was 0 ms,
and CLS was 0.038.

The clean build and live asset SHA-256 values match:

- JavaScript: `c60ff8ba68869b47de160cfea398e4548cc1f3403616e5f16d5d8dbc4c42ac01`
- CSS: `47416db0333dcb732f27a7577871a4ab670afd7c825bd13136879878576b4ff8`

## Normal, invalid, boundary, and recovery paths

| Path | Result |
| --- | --- |
| Normal | Direct and shared sample play, all three sample games, reset, exit, move, and reload passed. |
| Invalid room | 404 with “That room was not found. Check the six-letter code.” |
| Invalid game | 400 with a plain request correction. |
| Malformed JSON | 400 with the same plain correction. |
| Nickname boundary | A 20-character nickname completed a local create/join/start/move flow; 21 characters returned 400. |
| Oversized request | Returned controlled 400 JSON, not a framework page or crash. |
| Recovery UI | Unknown room and expired sample routes focus and announce an actionable heading. |
| Process replacement | A local room was created, joined, started, and moved; after stopping and restarting the server on the same SQLite file, GET returned the same revision 3 board. |

## Backend, privacy, offline, and updates

- `/health` returns 200, `status: ok`, and live build `07482e6…`.
- A 100-request live burst with one forwarded client identity returned 60 ×
  200 and 40 × 429 across the scaled deployment. Every 429 included
  `Retry-After: 1`. Health remained exempt and available.
- Rust tests passed for real-room process replacement, separate real-room
  replicas, separate demo-room replicas, and demo/production table isolation.
- Browser requests during the landing and direct demo remained same-origin.
  There were no ads, trackers, third-party scripts, cookies, or production
  room writes.
- Privacy names the stored fields and links directly to
  `privacy@sociobot.in`. Terms names the excluded social and payment features.
- The service worker became active and controlled the page. An offline reload
  restored `/demo`; a sample move reduced the open-line count from three to
  two, the offline notice appeared, and no page error occurred.
- `sw.js` is `no-cache`, hashed assets are immutable for one year, and API
  responses are `no-store`, so deployed shell updates are revalidated.

## Accessibility, routes, and links

- Home, all three demo variants, Privacy, Terms, and the 404 each have one h1,
  one main landmark, correct route titles, and zero axe violations.
- The skip link receives keyboard focus, has a 3 px honey outline, and moves
  focus to main. Back navigation and asynchronous sample recovery focus and
  announce their final headings.
- Reduced motion reports `scroll-behavior: auto` and zero active animations.
  At 200% root text size, the 390 px page has no horizontal overflow and keeps
  the h1 and primary action visible.
- All tested header and footer targets are at least 44 × 44 px.
- Internal links found on Home, Demo, Privacy, Terms, and 404 returned 200.
  `/not-a-real-route` intentionally returned HTTP 404 and rendered the
  designed recovery page. This expected 404 is not a defect.
- The factory credit remains visibly marked external and its URL is unchanged.
  It was not fetched because this work order forbids connecting to another
  product; review 4 recorded that destination as 200.
- Titles, descriptions, canonicals, Open Graph/Twitter metadata, icons,
  `robots.txt`, `sitemap.xml`, CSP, `nosniff`, and referrer policy are present.

## Earlier finding disposition

Every earlier review, verification, polish record, and handoff was inspected.
The current replay produced these dispositions.

| Earlier finding | Current evidence |
| --- | --- |
| Review 1 B1 | Closed: both first screens contain the job, audience, action, outcome, and facts. |
| Review 1 B2 | Closed: direct/shared isolated samples, reset, exit, and offline play pass. |
| Review 1 B3 | Closed: 17 registry entries and tags exist; all commands pass. F-5-3 is a new coverage defect in one assertion. |
| Review 1 B4 | Closed: stored fields agree across creation, Demo, and Privacy. |
| Review 1 B5 | Closed: a deliberate HTTP 404 renders a complete recovery page. |
| Review 1 M1 | Closed: clean `npm ci` passes. |
| Review 1 M2 | Closed: metadata, discovery files, icons, and security headers are present. |
| Review 1 M3 | Closed: skip, forward, Back, and async focus/announcement tests pass. |
| Review 1 M4 | **Reopened in part by F-5-2:** shell and sections remain, but the live build label is false. |
| Review 1 M5 | Closed: the deletion mail link is present. |
| Review 1 PW-01–PW-05 | Closed: job headline, concrete metadata/game heading, and named actions remain. |
| Review 1 PW-06–PW-10 | Closed: room/account/ad terms, nickname label, link copy, and README game names remain plain. |
| Review 1 PW-11–PW-16 | Closed: storage words are concrete; old jargon, retention, and false nickname-only text remain absent. |
| Review 1 UC-01–UC-05 | Closed by game-count, no-account, no-ad, and shared-link claim replays. |
| Review 1 UC-06–UC-09 | Closed by all three game claims and guest reload persistence; durations remain absent. |
| Review 1 UC-10–UC-12 | Closed by prohibited-surface, disclosure, and token-privacy checks. |
| Review 1 UC-13–UC-17 | Persistence and isolation remain closed. **UC-17 gains F-5-3 for weak build-value assertion.** |
| Review 1 UC-18–UC-23 | Closed by accessibility, offline, privacy-boundary, and provenance checks. |
| Review 2 F-2-1 | Closed: first-screen geometry passes. |
| Review 2 F-2-2 | Closed: browser Back focuses and announces home. |
| Review 2 F-2-3 | Closed: all tested mobile targets meet 44 × 44 px. |
| Review 2 F-2-4 | Closed: eight live shared-sample flows pass with no real-room request or key. |
| Review 2 F-2-5 | Closed: the populated in-progress sample claim passes. |
| Review 2 F-2-6 | Closed: the factory link is visibly marked external and retains the URL that review 4 verified; this review did not fetch another product. |
| Review 2 F-2-7 | Closed: the limits heading remains plain. |
| Review 3 F-3-1 | Closed: durable shared samples survived all live host/guest/reload repetitions. |
| Review 3 F-3-2 | Closed: final shared-demo success and recovery headings receive focus and announcement. |
| Review 3 F-3-3 | Closed: both race pawns are playable and the claim passes. |
| Review 3 F-3-4 | Closed: square completion changes the score and keeps the turn. |
| Review 3 F-3-5 | Closed: roll, hold, and score behavior passes. |
| Review 3 F-3-6 | Closed: room titles keep Kitchen Table first. |
| Verification 1 P0 / Verification 2 P0 | Closed: replica and process persistence tests pass; live shared samples pass repeatedly. |
| Verification 1 P1 routes | Closed: legal, room, and demo deep links return 200; unknown routes return designed 404. |
| Verification 1 P1 build / Verification 2 P1 build | `/health` is exact, but the visible label is reopened by F-5-2. |
| Verification 2 P1 tests | Closed: clean `npm test` passes. |
| Verification 1 P2 | Closed: touch targets pass. |
| Verification 1 P3 cache/error | Closed: cache headers and plain malformed-request responses pass. |
| Verification 3 | Its passing user flows, persistence, accessibility, privacy, and budgets reproduce; the four new findings remain. |
| Review 4 | Its zero-finding result does not reproduce because F-5-1 through F-5-4 are present now; F-5-2 also contradicts its recorded footer value. |

## Missed leverage

No finding. The useful implied feature is shared resumable play, which the
room link already supplies. AI, import/export, or an assistant would not
improve this family-game task and would add an unnecessary data surface.

## Required next steps

1. Correct and test the game-specific demo banner text.
2. Inject one real build identity into both the footer and `/health`, and make
   the claim test reject placeholders.
3. Change the Rust builder image to the moving Rust 1 Alpine tag and run an
   OCI build in an environment with a container engine.
4. Deploy the repaired candidate and repeat the live first-screen, sample,
   claim, accessibility, offline, identity, and rate-limit checks.
