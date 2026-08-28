# Adversarial first-read review 3 — Kitchen Table

**Verdict: FAIL**

Reviewed 28 August 2026 against live <https://kitchen-table.sociobot.in>
and repository base `6bb87aeb18e8655a5ba7e15e9d47808f6357edd5`.
`/health` returned that exact build SHA. The direct one-device demo works, but
the advertised two-phone sample-room path is not reliable on the live
multi-replica deployment. There are five findings, including one blocking
recurrence of review 2 finding F-2-4.

## Cold first screen

Fresh Chromium contexts with empty storage and blocked service workers opened
the live landing page without scrolling. Phone viewport: 390 × 844. Desktop
viewport: 1440 × 900.

| View | What it does | For whom | What to click first | Result |
| --- | --- | --- | --- | --- |
| 390 px | Play three family board games in a shared room on separate phones. | Couples and families who do not want an account or ads. | **Try it with sample data**. | Pass. The action, its result, and all three facts are visible. |
| 1440 px | The same shared-room family games product. | Couples and families. | **Try it with sample data**. | Pass. The action is at y=538–588; all facts end at y=629. |

The first screen answers the three questions in plain words: **“Play family
games on separate phones”**, **“For couples and families who want a shared game
without an account or ads.”**, and **“Try it with sample data”** / **“Opens a
two-player game already in progress.”** No first-screen blocking finding.

## Findings

### F-3-1 — BLOCKING — F-2-4 is half-fixed: a live sample room is replica-local

**Location/quote:** `/demo`, **“Create sample room link”**. The resulting
route immediately renders **“Make a new sample room”** and **“That sample room
has expired. Create a new sample link.”**

**Evidence:** In 16 fresh browser contexts, each with a distinct
`X-Forwarded-For` value, the POST to `/api/demo/rooms` returned an ID and the
following GET for that ID returned the recovery state: **16 expired / 0
opened**. This is not a 24-hour expiry. The code confirms the cause:
`demo_rooms()` creates `Arc<Mutex<HashMap<String, DemoRoom>>>` in
`src/api.rs`, and each deployed replica receives its own map in `src/main.rs`.
The prior local claim test only uses one server process, so it cannot observe
the production boundary.

**Why this fails:** The demo says it can create and share a sample room, which
is how a visitor checks the product's two-phone job. The first follow-up
request can reach a different replica and lose the sample instantly. This is
an isolated-demo recurrence of review 2 F-2-4, whose required two-seat,
shared demo was recorded as closed.

**Concrete fix:** Store sample rooms in a shared isolated namespace with an
explicit TTL (for example a `demo/` Blob prefix with conditional writes), or
route all demo-room reads and writes through a true shared ephemeral tenant.
It must remain unreachable from production room APIs and use only `demo:`
browser keys. Add a deployment-stage claim test that creates a sample room,
opens its guest URL in another fresh context, moves, reloads, and proves no
sample request returns 404 across replicas. Do not close F-2-4 until that
test is run against the scaled deployment.

### F-3-2 — HIGH — the final shared-demo route loses heading focus

**Location/quote:** `/demo` → **“Create sample room link”**. The final
recovery screen has h1 **“Make a new sample room”**, while
`document.activeElement` is `BODY` and the route live region is empty.

**Why this fails:** The route initially focuses the temporary **“Opening
sample room”** h1. `sharedDemo()` then replaces the page after its asynchronous
request, removing that focused node and leaving a keyboard or screen-reader
visitor at the document body. The same source path would lose focus when the
shared board successfully renders. This does not meet the required focus and
announcement behavior on route change.

**Concrete fix:** After `renderSharedDemo()` and after the `sharedDemo()` error
render, call the same route-finalization routine that focuses the final h1 and
sets `#route-status`. Add a browser test for Create sample room link → final
board and for its recovery state; in each, assert the visible h1 is focused
and announced.

### F-3-3 — MINOR — the pawn-race behavior is an unlisted claim

**Location/quote:** landing game card, **“Bring two pawns around a shared
path.”**

**Why this fails:** This is a concrete description a visitor uses to choose a
game, but no entry in `.factory/claims.json` lists it and no
`@claim:` test observes the stated game behavior. The `three-games` test only
checks that a button exists.

**Concrete fix:** Add this sentence to a `race-gameplay` claim and a tagged
demo-sandbox test that shows two selectable pawns advancing around the shared
path, or remove the sentence.

### F-3-4 — MINOR — the line-game behavior is an unlisted claim

**Location/quote:** landing game card, **“Draw lines and claim the squares
they close.”**

**Why this fails:** The sample currently shows claimed squares, but no claims
entry or tagged test proves that closing a square claims it. A visitor is
being told a rule the claim contract does not cover.

**Concrete fix:** Add this sentence to a `dots-gameplay` claim and a tagged
demo-sandbox test that completes a square, observes the score change, and
observes the retained turn, or remove the sentence.

### F-3-5 — MINOR — the dice-game behavior is an unlisted claim

**Location/quote:** landing game card, **“Roll five dice, hold some, then
choose a score row.”**

**Why this fails:** It promises the core interaction of High Five, but no
claims entry or tagged test observes five dice, holding, and scoring. The
unit tests are not a listed, demo-entry claim test.

**Concrete fix:** Add this sentence to a `dice-gameplay` claim and a tagged
demo-sandbox test that rolls five dice, holds one, and records a score, or
remove the sentence.

### F-3-6 — MINOR — room titles reverse the required product-title pattern

**Location/quote:** live `/room/ABC123` title, **“Room ABC123 — Kitchen
Table.”**

**Why this fails:** The specified route-title pattern is “Product — what it
does.” The landing uses it, but room routes put the opaque room code before
the product name. This makes a history tab and screen-reader title less
scannable and does not meet the per-route convention.

**Concrete fix:** Set room titles to **“Kitchen Table — shared room ABC123”**
and update the route-metadata test for a real and an unknown room.

## Copy audit

Counts use whitespace-separated displayed words. Controls, headings, image
alt text, and conditional landing form copy are included. Commands and code
blocks in the README are excluded. No landing or README sentence exceeds 22
words, uses a banned marketing adjective, uses inconsistent room/account/ad
terms, or uses a non-result-naming button. F-3-3 through F-3-5 are the
claim-contract flags in otherwise plain copy.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| Skip to the game | 4 | Pass |
| Kitchen Table | 2 | Pass |
| Demo | 1 | Pass |
| Games | 1 | Pass |
| Privacy | 1 | Pass |
| Family games, one shared room | 5 | Pass |
| Play family games on separate phones | 6 | Pass |
| For couples and families who want a shared game without an account or ads. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a two-player game already in progress. | 7 | `demo-in-progress` |
| No ads | 2 | `no-ads` |
| No account | 2 | `no-account` |
| Return to the same room later | 6 | `room-link-resume` |
| Choose a game | 4 | Result-naming link |
| Join a room | 4 | Result-naming button |
| A warm evening kitchen table with wooden pawns, dice, a paper grid, and two phones | 15 | Alt text: pass |
| Room code | 2 | Pass |
| ABC123 | 1 | Example code: pass |
| Find the room | 3 | Result-naming button |
| Choose a game | 4 | Pass |
| Choose from three family games | 5 | `three-games` |
| 01 | 1 | Pass |
| A pawn race | 3 | Pass |
| Lantern Race | 2 | Pass |
| Bring two pawns around a shared path. | 7 | F-3-3 |
| Choose Lantern Race | 3 | Result-naming button |
| 02 | 1 | Pass |
| A line game | 3 | Pass |
| Make a Square | 4 | Pass |
| Draw lines and claim the squares they close. | 8 | F-3-4 |
| Choose Make a Square | 4 | Result-naming button |
| 03 | 1 | Pass |
| A dice score sheet | 4 | Pass |
| High Five | 2 | Pass |
| Roll five dice, hold some, then choose a score row. | 10 | F-3-5 |
| Choose High Five | 3 | Result-naming button |
| Your seat in the room | 5 | Pass |
| Start a room | 3 | Pass |
| What should your family call you? | 6 | Pass |
| We store your nickname, game moves, room code, and a random seat token. | 13 | `storage-disclosure` |
| Your browser stores the token so you can return to your seat. | 12 | `seat-token-private` |
| Make the room | 3 | Result-naming button |
| How it works | 3 | Pass |
| Continue a game through its room link | 7 | `room-link-resume` |
| Make a room | 3 | Pass |
| Choose a game and nickname. | 5 | Pass |
| No account is needed. | 4 | `no-account` |
| Share the link | 3 | Pass |
| Send the room link to the people you play with. | 10 | `room-link-resume` |
| Take turns | 2 | Pass |
| Open the same room link when it is your turn. | 10 | `room-link-resume` |
| What Kitchen Table does not include | 6 | Pass |
| Games without strangers or chat | 5 | Pass |
| Kitchen Table has no matchmaking, chat, payments, or ads. | 9 | `no-strangers-or-payments`, `no-ads` |
| Share room links only with people you know. | 8 | Safety instruction: pass |
| Family games for separate phones. | 5 | Pass |
| Artwork generated for Kitchen Table. | 5 | `artwork-provenance` |
| Terms | 1 | Pass |
| Built by Param Factory (external site) | 6 | External destination named |
| Build local | 2 | Pass |
| You’re offline. | 2 | `demo-offline` behavior |
| Your open board stays visible. | 5 | `demo-offline` behavior |
| Reconnect before making a real move. | 6 | Actionable recovery: pass |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Kitchen Table | 2 | Pass |
| Play family games on separate phones with no account or ads. | 11 | `no-account`, `no-ads` |
| Make a room, share its link, and continue from the same board. | 12 | `room-link-resume` |
| Choose from three family games | 5 | `three-games` |
| Lantern Race | 2 | Pass |
| Make a Square | 4 | Pass |
| High Five | 2 | Pass |
| Try the isolated sample at `/demo` or `/?demo=1`. | 8 | `demo-isolated` |
| It opens a Make a Square game with Alex and Ravi, claimed squares, and an open move. | 17 | `demo-in-progress` |
| Create a sample link to test two phones without touching a real room. | 13 | F-3-1 blocks this in production |
| Demo state uses only `demo:` browser keys and an isolated sample workspace. | 12 | `demo-isolated`, `seat-token-private` |
| See `.factory/demo.md`. | 2 | Pass |
| Kitchen Table has no account, ads, matchmaking, chat, payments, or analytics. | 11 | `no-account`, `no-ads`, `no-strangers-or-payments` |
| Room creation explains the stored fields before it sends a request. | 11 | `storage-disclosure` |
| See /privacy and /terms. | 4 | Pass |
| Run locally | 2 | Pass |
| Requirements: Node 22+, npm, and Rust 1.85+. | 7 | Setup instruction |
| Open http://localhost:8080. | 1 | Setup instruction |
| For frontend development, run npm run dev in another terminal; Vite proxies API requests to port 8080. | 17 | Setup instruction |
| Test and build | 3 | Pass |
| npm test runs Rust unit/integration tests, Vitest scoring tests, a production frontend build, and the browser claim suite. | 18 | Setup instruction |
| The claim registry is .factory/claims.json; each command there can also run on its own. | 14 | Setup instruction |
| The container serves the frontend and API together on PORT (default 8080). | 12 | Setup instruction |
| It uses /data when no database location is supplied. | 9 | Setup instruction |
| /health returns the build SHA. | 5 | `server-health-and-limits` |
| The server rate-limits every route other than that health check. | 10 | `server-health-and-limits` |
| License | 1 | Pass |
| Code is released under the MIT License. | 7 | Pass |
| The original generated artwork and its provenance are documented in .factory/design.md. | 11 | `artwork-provenance` |

## Demo and sandbox behavior

The primary one-click path passes its basic contract: landing → `/demo` shows
a real Make a Square board, Alex and Ravi, three claimed squares, three open
lines, and a current turn. The persistent banner reads **“Demo — sample data,
nothing is saved”** and shows **Reset demo** and **Start for real**. Drawing a
line changed the local state and turn from Alex to Ravi; Reset restored the
six-line seed; Start for real removed all `demo:` keys and returned home.

Network interception for this direct demo saw same-origin assets only and no
`/api/rooms` request. Storage contained only
`demo:kitchen-table:make-a-square`; there was no `kt:` key. With
`context.setOffline(true)`, drawing an open sample line changed the board and
made no request. The sample-room extension fails as F-3-1, so the sandbox is
not adequate for the promised two-phone demo.

## Claims and clean-clone results

Fresh clone: `/tmp/kitchen-table-review3-clean-eyp2gU` at the requested base.
`npm ci`, `npm test`, and `npm run build` passed: 14 Rust tests, 3 Vitest
tests, 19 Playwright tests, and the provenance test. All 14 commands listed
in `.factory/claims.json` were run individually from that clone and passed.

| Claim ID | Result |
| --- | --- |
| demo-isolated | Pass |
| demo-in-progress | Pass |
| demo-reset | Pass |
| demo-offline | Pass |
| no-account | Pass |
| no-ads | Pass |
| three-games | Pass |
| room-link-resume | Pass locally; F-3-1 shows its deployment premise fails live |
| no-strangers-or-payments | Pass |
| storage-disclosure | Pass |
| seat-token-private | Pass |
| deletion-contact | Pass |
| server-health-and-limits | Pass |
| artwork-provenance | Pass |

The registry has no failing listed command. F-3-3 through F-3-5 are unlisted
claim findings from the live landing; F-3-1 shows that the local
`room-link-resume` test lacks a multi-replica deployment assertion.

## Structure, accessibility, and link checks

- `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and `/room/ABC123` returned
  200. `/not-a-real-route` returned 404 with title **“Page not found — Kitchen
  Table”** and visible h1 **“This table is not here.”**
- Every checked page has one h1, one `main`, `lang="en"`, a description,
  canonical, OG/Twitter title, SVG favicon, and Apple touch icon. Route title
  wording is otherwise correct; F-3-6 records the room-route exception.
- The live header and footer are consistent and include Demo, Games, Privacy,
  Terms, factory credit, and build ID. Internal links returned 200; the
  external factory credit resolves to 200. `robots.txt`, `sitemap.xml`,
  `social-card.jpg`, and the icons returned 200.
- Home → Privacy → browser Back correctly returns focus to the home h1, moves
  scroll to 0, and updates the polite route announcement. F-3-2 records the
  async shared-demo exception.
- `node .factory/a11y-check.mjs https://kitchen-table.sociobot.in` reported
  four screens and zero serious/critical axe findings. The 390 px header and
  footer targets meet 44 × 44 px; there was no horizontal overflow.
- The dusk kitchen, self-hosted Fraunces/Atkinson pairing, restrained amber
  palette, and illustrated 404 match `.factory/design.md` and are distinct
  from a generic SaaS template.

No AI feature is expected for this bounded, turn-based family-game job. The
brief's valuable sync requirement is already represented by room links; the
live demo must first make that existing shared-link flow reliable (F-3-1)
rather than add AI, import, or export.

## History replay

Every earlier review, polish record, verification, and the previous handoff
was read. Live and source checks give the following result; “pass” means the
specific earlier finding was actually replayed, not merely marked closed.

| Earlier record | Replay result |
| --- | --- |
| Review 1 B1 | Pass: the first action, outcome, and three facts fit both required viewports. |
| Review 1 B2 | Basic demo pass; its later two-phone extension is blocked by F-3-1. |
| Review 1 B3–B5 | Pass: claims registry/tests, storage wording, and styled 404 all work. |
| Review 1 M1–M2 | Pass: clean `npm ci`; route metadata, discovery files, icons, and headers present. |
| Review 1 M3 | Pass for skip, forward, and browser Back focus; F-3-2 is a new async-route exception. |
| Review 1 M4–M5 | Pass: standard skeleton/footer and direct deletion mailto present. |
| Review 1 PW-01–PW-16 | Pass: current audit has short plain copy, consistent terms, and result-naming buttons. |
| Review 1 UC-01–UC-23 | The original statements are registered, removed, or supported as recorded; F-3-3–F-3-5 are new unlisted game-rule sentences. |
| Review 2 F-2-1–F-2-3 | Pass: both first screens fit; Back focus works; mobile targets meet 44 px. |
| Review 2 F-2-4 | **Blocking recurrence: F-3-1.** The demo is isolated but not shared across live replicas. |
| Review 2 F-2-5–F-2-7 | Pass: in-progress claim registered, external factory URL live, and limits heading plain. |
| Verification 1 P0/P1/P2/P3 and verification 2 P0/P1 | Pass for authoritative production-room behavior, routes, build identity, clean tests, targets, cache policy, and product errors, as confirmed by verification 3 plus this clean run. |
| Verification 3 | No recorded defect regressed. Its pass did not exercise the later in-memory sample-room path across replicas. |
| Polish 1, Polish 2, prior handoff | Their stated closed items were replayed above; the “no gaps” conclusion is no longer accurate because of F-3-1 through F-3-6. |

## What would make this perfect

Make the sample-room tenant genuinely shared across live replicas, then add a
deployment-stage two-context replay. Preserve focus and announcement after its
asynchronous route settles. Register and sandbox-test the three game-rule
sentences (or remove them), and put Kitchen Table first in room titles. Re-run
the full cold-live, clean-clone review with no findings.
