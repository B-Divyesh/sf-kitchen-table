# Adversarial first-read review 4 — Kitchen Table

**Verdict: PASS**

Reviewed 28 August 2026 against <https://kitchen-table.sociobot.in> and
repository base `07482e63d94b066e660ca009d7404b92b9dd6307`. Live `/health`
returned that exact build SHA. There are **zero findings**: no blocking, major,
minor, copy, claim, history, routing, accessibility, or leverage findings.

## Cold first screen

I used fresh Chromium contexts with empty storage and blocked service workers.
No scrolling occurred before this assessment.

| View | What it does | For whom | What to click first | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | Play family games in a shared room on separate phones. | Couples and families who do not want accounts or ads. | **Try it with sample data**. | Pass. The complete action, outcome, three facts, and real-game alternatives are visible. |
| 1440 × 900 | The same shared-room family games product. | Couples and families. | **Try it with sample data**. | Pass. The action is y=538–588; the three facts end at y=629. |

The first screen answers all three questions in plain words:

> “Play family games on separate phones”

> “For couples and families who want a shared game without an account or ads.”

> “Try it with sample data” — “Opens a two-player game already in progress.”

The visual check also confirms a product-specific, non-template treatment: the
dusk kitchen artwork, amber/green table palette, Fraunces/Atkinson type pair,
and board-game surfaces match `.factory/design.md` rather than a generic SaaS
layout.

## Copy audit

Counts are whitespace-separated. Controls, headings, revealed form text,
alt text, and the offline state are included. README commands and code blocks
are excluded. Every entry is at most 22 words; no banned marketing word,
jargon that obscures the job, inconsistent product term, contextless heading,
or non-result-naming action was found.

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
| Try it with sample data | 5 | Result-naming action |
| Opens a two-player game already in progress. | 7 | `demo-in-progress` |
| No ads | 2 | `no-ads` |
| No account | 2 | `no-account` |
| Return to the same room later | 6 | `room-link-resume` |
| Choose a game | 3 | Result-naming action |
| Join a room | 3 | Result-naming action |
| A warm evening kitchen table with wooden pawns, dice, a paper grid, and two phones | 15 | Alt text: pass |
| Room code | 2 | Pass |
| ABC123 | 1 | Example code: pass |
| Find the room | 3 | Result-naming action |
| Choose from three family games | 5 | `three-games` |
| A pawn race | 3 | Pass |
| Lantern Race | 2 | Pass |
| Bring two pawns around a shared path. | 7 | `race-gameplay` |
| Choose Lantern Race | 3 | Result-naming action |
| A line game | 3 | Pass |
| Make a Square | 3 | Pass |
| Draw lines and claim the squares they close. | 8 | `dots-gameplay` |
| Choose Make a Square | 4 | Result-naming action |
| A dice score sheet | 4 | Pass |
| High Five | 2 | Pass |
| Roll five dice, hold some, then choose a score row. | 10 | `dice-gameplay` |
| Choose High Five | 3 | Result-naming action |
| Your seat in the room | 5 | Pass |
| Start a room | 3 | Pass |
| What should your family call you? | 6 | Pass |
| We store your nickname, game moves, room code, and a random seat token. | 13 | `storage-disclosure` |
| Your browser stores the token so you can return to your seat. | 12 | `seat-token-private` |
| Make the room | 3 | Result-naming action |
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
| Family games for separate phones. | 5 | `three-games`, `room-link-resume` |
| Artwork generated for Kitchen Table. | 5 | `artwork-provenance` |
| Privacy | 1 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory (external site) | 6 | External destination named |
| Build `07482e6` | 2 | Build label: pass |
| You’re offline. | 2 | `demo-offline` |
| Your open board stays visible. | 5 | `demo-offline` |
| Reconnect before making a real move. | 6 | Actionable recovery: pass |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Kitchen Table | 2 | Pass |
| Play family games on separate phones with no account or ads. | 11 | `no-account`, `no-ads` |
| Make a room, share its link, and continue from the same board. | 12 | `room-link-resume` |
| Choose from three family games | 5 | `three-games` |
| Lantern Race | 2 | Pass |
| Make a Square | 3 | Pass |
| High Five | 2 | Pass |
| Try the isolated sample at `/demo` or `/?demo=1`. | 8 | `demo-isolated` |
| It opens a Make a Square game with Alex and Ravi, claimed squares, and an open move. | 17 | `demo-in-progress` |
| Create a sample link to test two phones without touching a real room. | 13 | `room-link-resume`, `demo-isolated` |
| The shared sample workspace stays apart from real rooms. | 9 | `demo-isolated`, `room-link-resume` |
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
| Code is released under the MIT License. | 7 | License fact: pass |
| The original generated artwork and its provenance are documented in .factory/design.md. | 11 | `artwork-provenance` |

All visitor-facing product claims map to the registry; setup instructions and
the license statement are directly verifiable repository facts. No unlisted
claim finding results.

## Demo and sandbox behavior

The visible one-click action opens `/demo` directly. Its first screen already
shows Make a Square being played: Alex and Ravi, six drawn marks, three open
moves, claimed squares, and “Alex’s turn.” The persistent banner says
**“Demo — sample data, nothing is saved”** and provides **Reset demo** and
**Start for real**.

Fresh-browser replay results:

- Drawing an open line changed the available-line count from 3 to 2; Reset
  restored it to 3.
- With a pre-existing `kt:review4-sentinel` value, demo entry, play, reset,
  and exit preserved that value and removed every `demo:` key. This confirms
  demo cleanup does not overwrite a real-storage key.
- Interception observed only `https://kitchen-table.sociobot.in`; no
  `/api/rooms` request occurred during direct demo play. Offline mode still
  accepted a sample move.
- The live browser suite repeated eight fresh host/guest/reload sample-room
  flows through `/api/demo/rooms`; each restored the moved board and made no
  production-room request or `kt:` write.

## Claims and clean-clone verification

Fresh clone: `/tmp/kitchen-table-review4-WU3XNm` at the requested base.
`npm ci`, `npm test`, and `npm run build` passed. The full suite passed 15
Rust tests, 3 Vitest tests, 24 Playwright tests, and the provenance audit.
Each registry command was then run independently from that clone.

| Claim ID | Result |
| --- | --- |
| demo-isolated | Pass |
| demo-in-progress | Pass |
| demo-reset | Pass |
| demo-offline | Pass |
| no-account | Pass |
| no-ads | Pass |
| three-games | Pass |
| race-gameplay | Pass |
| dots-gameplay | Pass |
| dice-gameplay | Pass |
| room-link-resume | Pass |
| no-strangers-or-payments | Pass |
| storage-disclosure | Pass |
| seat-token-private | Pass |
| deletion-contact | Pass |
| server-health-and-limits | Pass |
| artwork-provenance | Pass |

`PLAYWRIGHT_BASE_URL=https://kitchen-table.sociobot.in npx playwright test`
also passed all 24 checks against the live build. Thus every listed claim is
tested locally from a clean clone and replayed against the deployed product.

## Structure, accessibility, and links

- Live `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and `/room/ABC123`
  return 200. `/not-a-real-route` returns HTTP 404 and renders the designed
  “This table is not here” recovery page.
- Route titles, descriptions, canonicals, OG/Twitter metadata, favicon, Apple
  touch icon, robots, sitemap, CSP, and security headers are present. The
  title pattern is correct, including `Kitchen Table — shared room ABC123`.
- Each checked route has exactly one h1 and one main landmark. Home → Privacy
  → browser Back restores the home h1 focus, scroll position, title, and polite
  route announcement. The asynchronous shared-demo board and recovery states
  also focus and announce their final headings.
- The header/footer remain consistent and include Demo, Games, Privacy, Terms,
  factory credit, and a build label. Crawling the rendered links found 200 for
  all navigable internal links and the external factory link; the deletion
  address is an explicit `mailto:` link. The intentionally loaded 404 route
  retains its expected 404 status.
- `/opt/fleet/lib/verify-url.sh` reports a 591 ms cold live load, zero console
  errors, `lang=en`, one h1, main, complete alt text, and labelled buttons.
  Local `node .factory/a11y-check.mjs http://127.0.0.1:8080` audited seven
  screens with zero serious/critical axe violations.

## History replay

Every earlier review, polish record, verification record, and the prior
handoff was read. The following are fresh live/code replays, not acceptance of
their closure notes.

| Earlier finding(s) | Confirmed present result |
| --- | --- |
| Review 1 B1 | Pass: both specified first screens contain the complete sample action, result, and three facts. |
| Review 1 B2 | Pass: direct and shared isolated demos, banner, reset, exit cleanup, and offline play work. |
| Review 1 B3 | Pass: 17 registry entries have one observable tagged test each; all pass independently. |
| Review 1 B4 | Pass: complete stored-field disclosure appears before real-room creation and matches Privacy. |
| Review 1 B5 | Pass: unknown paths retain HTTP 404 and show a styled recovery page. |
| Review 1 M1 | Pass: fresh `npm ci` works. |
| Review 1 M2 | Pass: metadata, discovery files, icons, headers, and route documents are complete. |
| Review 1 M3 | Pass: skip, push, Back, and async routes put focus on the final h1 and announce it. |
| Review 1 M4 | Pass: shell, live demo, limits section, factory credit, legal links, and build label are present. |
| Review 1 M5 | Pass: Privacy contains the direct `privacy@sociobot.in` deletion link. |
| Review 1 PW-01 | Pass: the h1 names the job. |
| Review 1 PW-02 | Pass: metadata contains no vague “quiet” wording. |
| Review 1 PW-03 | Pass: game wording is concrete and does not call games “familiar.” |
| Review 1 PW-04 | Pass: the game section is “Choose from three family games.” |
| Review 1 PW-05 | Pass: each game choice names its result. |
| Review 1 PW-06 | Pass: shared sessions are consistently rooms. |
| Review 1 PW-07 | Pass: absence copy consistently uses account and ads. |
| Review 1 PW-08 | Pass: the nickname label is grammatical and specific. |
| Review 1 PW-09 | Pass: continuation copy names the room link. |
| Review 1 PW-10 | Pass: README game copy is direct and brand-free. |
| Review 1 PW-11 | Pass: storage wording names the stored fields and browser token. |
| Review 1 PW-12 | Pass: backend-jargon marketing is absent. |
| Review 1 PW-13 | Pass: deployment-credential marketing is absent. |
| Review 1 PW-14 | Pass: accessibility implementation marketing is absent; behavior is tested. |
| Review 1 PW-15 | Pass: vague retention wording is absent. |
| Review 1 PW-16 | Pass: the false “A nickname is all we store” sentence is absent. |
| Review 1 UC-01–UC-05 | Pass: product, game count, account/ad, and shared-link claims map to and pass their registry tests. |
| Review 1 UC-06–UC-09 | Pass: unmeasured durations were removed; all three current game behaviors and room restoration are sandbox-tested. |
| Review 1 UC-10–UC-12 | Pass: prohibited surfaces/traffic are absent, disclosures are exact, and public views omit tokens. |
| Review 1 UC-13–UC-17 | Pass: persistence coverage remains in Rust tests; unsupported operational copy was removed; health/limit and provenance statements are tested. |
| Review 1 UC-18–UC-23 | Pass: accessibility marketing was removed, offline behavior is tested, unsupported retention copy is absent, prohibited fields/features are absent, and art provenance is audited. |
| Review 2 F-2-1 | Pass: desktop first-screen geometry now fits. |
| Review 2 F-2-2 | Pass: Back focuses and announces the final home h1. |
| Review 2 F-2-3 | Pass: all mobile header/footer targets meet 44 × 44 px. |
| Review 2 F-2-4 | Pass: shared sample rooms are in an isolated durable namespace; live eight-flow replay succeeds. |
| Review 2 F-2-5 | Pass: the in-progress promise has its own claim and test. |
| Review 2 F-2-6 | Pass: the named external factory link returns 200. |
| Review 2 F-2-7 | Pass: the limits heading is direct. |
| Review 3 F-3-1 | Pass: the durable isolated sample tenant survives live host/guest/reload replay. |
| Review 3 F-3-2 | Pass: shared-demo success and recovery focus/announce their final h1. |
| Review 3 F-3-3 | Pass: pawn-race behavior is `race-gameplay` and sandbox-tested. |
| Review 3 F-3-4 | Pass: square-claim behavior is `dots-gameplay` and sandbox-tested. |
| Review 3 F-3-5 | Pass: dice roll/hold/score behavior is `dice-gameplay` and sandbox-tested. |
| Review 3 F-3-6 | Pass: room titles keep Kitchen Table first. |
| Verification 1 P0–P3; Verification 2 P0–P1; Verification 3 | Pass: authoritative room behavior, build/routes, touch targets, cache/error behavior, and final-live checks show no regression. |

## Missed leverage

No finding. The brief implies a shared, resumable game; room-link continuation
already provides it. AI, import/export, or a decorative assistant would not
improve the immediate family-game job and would add unnecessary privacy and
cost surface.

## What would make this perfect

Maintain the present standard: keep every visitor-facing claim mapped to a
clean-sandbox test, keep the shared demo isolated from real rooms, and replay
the cold mobile/desktop and live multi-context checks before future releases.
