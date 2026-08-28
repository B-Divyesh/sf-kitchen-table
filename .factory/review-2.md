# Adversarial first-read review 2 — Kitchen Table

**Verdict: FAIL**

Reviewed 28 August 2026 against `https://kitchen-table.sociobot.in` and
repository base `93d962e87202ef8ef1fbfcb4aa06ed1cef0d1915`. Live `/health`
reported that exact SHA.

## Cold first screen

Fresh Chromium contexts used empty storage and blocked service workers. Phone
was 390 × 844; desktop was 1440 × 900. No scrolling occurred before this
assessment.

| View | What it does | For whom | What to click first | Result |
| --- | --- | --- | --- | --- |
| 390 px | Lets people play three family board games through a shared room on separate phones. | Couples and families. | **Try it with sample data**. | All three answers are visible. The three promised facts are below the fold. |
| 1440 px | The headline and lede explain the same product and audience. | Couples and families. | Cannot verify from the first screen: the primary action starts at y=898 and ends at y=973. | **Blocking.** Only a thin top edge of the action is visible at a 900 px viewport; the outcome and all three facts are below it. |

The exact copy that should answer the third question is **“Try it with sample
data”** and **“Opens a two-player game already in progress.”** It is not
readable/actionable before scrolling at the specified desktop size.

## Findings

### F-2-1 — BLOCKING — earlier B1 remains unfixed on desktop

**Location/quote:** landing hero, **“Try it with sample data”**. At 1440 × 900
its bounding box is x=160, y=898, 159 × 75 px. The primary result note begins
below the viewport. **“No ads”**, **“No account”**, and **“Return to the same
room later”** are also below it.

**Why this fails:** A desktop visitor cannot confirm what to click first from
the initial screen. This is the same first-screen failure recorded as B1 in
review 1, despite the closure record saying the action was visible at 900 px.

**Fix:** Reduce the desktop hero headline/copy scale or increase usable copy
width until the complete sample action, its result note, and all three facts
fit above y=900. Add a 1440 × 900 Playwright viewport assertion that the full
primary-action and trust-fact rectangles are within the viewport.

### F-2-2 — BLOCKING — earlier M3 is only half fixed: Back loses route focus

**Location/quote:** Home → header **“Privacy”** → browser Back. Privacy
correctly focuses `h1` **“Privacy at Kitchen Table”**. After Back, the route is
`/`, its `h1` exists, but `document.activeElement` is `BODY`, not **“Play
family games on separate phones.”** This reproduced in two fresh contexts.

**Why this fails:** Keyboard and screen-reader users return to an unannounced
page root rather than the new page heading. The required Back/forward focus
behavior is not met; M3 must not be recorded as closed.

**Fix:** Make the `popstate` route path call the same post-render focus routine
as a forward navigation, then add a browser test: Home → Privacy → Back must
focus the home `h1` and update the polite route announcement.

### F-2-3 — BLOCKING — earlier verification P2 remains partly unfixed

**Location/quote:** mobile header and footer links. At 390 px the visible
rectangles are header **“Demo”** 37 × 44 px, header **“Privacy”** 43 × 44 px,
and footer **“Privacy”** 44 × 44 px / **“Terms”** 44 × 44 px. The header Demo
and Privacy targets are narrower than the required 44 px.

**Why this fails:** A target that is 37 or 43 px wide misses the stated
44 × 44 px touch baseline. P2 was previously described as repaired, but the
live CSS gives navigation links `min-height` only.

**Fix:** Add horizontal padding or `min-width: 44px` to the header navigation
links, then test every header and footer interactive target at 390 px.

### F-2-4 — HIGH — three claim tests bypass the required demo sandbox

**Location/quote:** `tests/claims.spec.ts` routes
`@claim:room-link-resume`, `@claim:storage-disclosure`, and
`@claim:seat-token-private` start at `"/"` and create ordinary rooms. The
claim contract requires each claim test to run from a clean state through the
demo entry point; the demo contract says verifiers use only the demo and its
shipped sample data.

**Why this fails:** The sample board verifies a local `demo:` state, while
the room-link and token promises are verified through a separate normal-room
flow. A verifier therefore cannot establish those promises through the
one-click sandbox promised to visitors.

**Fix:** Extend `/demo` with an isolated, two-seat sample-room flow (or a
separate ephemeral demo tenant) that can exercise joining, returning through a
link, storage disclosure, and non-leaking seat state. Point these three tests
only at that flow and assert no `kt:` key or production room endpoint is used.

### F-2-5 — MEDIUM — a hero promise is absent from `claims.json`

**Location/quote:** landing hero, **“Opens a two-player game already in
progress.”** The `demo-isolated` entry lists only **“Demo — sample data,
nothing is saved”** and its `where` omits the landing hero. Its test checks a
heading and Alex's turn but does not assert two named players or existing game
state.

**Why this fails:** A first-time visitor may rely on the advertised immediate,
two-player in-progress sample. It is a claim-like sentence without a registry
entry/location and lacks an observable test of its full outcome.

**Fix:** Add a `demo-in-progress` claim (or expand `demo-isolated`'s claim and
`where`) for the exact hero sentence. Assert the first demo screen has Alex
and Ravi, claimed squares, an open move, and no real-storage/API use.

### F-2-6 — MEDIUM — the required factory-credit link is dead in this review environment

**Location/quote:** footer, **“Built by Param Factory”** links to
`https://param.fyi/`. DNS resolution for `param.fyi` and `www.param.fyi`
failed (`curl: (6) Could not resolve host`); the link cannot return 200.

**Why this fails:** The site-structure link crawl requires each link to resolve
to 200 (or be an explicit mailto/download). The footer exposes a broken
destination instead.

**Fix:** Use the current resolving Param Factory URL, verify it returns 200 in
CI, and mark it visibly as external, for example **“Built by Param Factory
(opens external site)”**.

### F-2-7 — MINOR — a limits heading is metaphorical out of context

**Location/quote:** landing limits kicker, **“A small table, on purpose.”**

**Why this fails:** In a heading list it does not identify that the section
states privacy and social boundaries. It requires surrounding copy to decode.

**Fix:** Replace it with **“What Kitchen Table does not include”**.

## Copy audit

Counts use whitespace-separated words. Navigation, headings, controls, and
footer text are included so the audit covers all visitor-facing landing copy;
README commands and code blocks are excluded.

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
| Try it with sample data | 5 | Claim gap: F-2-5 context |
| Opens a two-player game already in progress. | 7 | F-2-5 |
| Choose a game | 4 | Pass |
| Join a room | 4 | Pass |
| Room code | 2 | Pass |
| Find the room | 3 | Result-naming verb |
| No ads | 2 | Registered |
| No account | 2 | Registered |
| Return to the same room later | 6 | Registered |
| A warm evening kitchen table with wooden pawns, dice, a paper grid, and two phones | 15 | Image alt: Pass |
| Choose a game | 4 | Pass |
| Choose from three family games | 5 | Registered |
| 01 | 1 | Pass |
| A pawn race | 3 | Pass |
| Lantern Race | 2 | Pass |
| Bring two pawns around a shared path. | 7 | Pass |
| Choose Lantern Race | 3 | Result-naming verb |
| 02 | 1 | Pass |
| A line game | 3 | Pass |
| Make a Square | 4 | Pass |
| Draw lines and claim the squares they close. | 8 | Pass |
| Choose Make a Square | 4 | Result-naming verb |
| 03 | 1 | Pass |
| A dice score sheet | 4 | Pass |
| High Five | 2 | Pass |
| Roll five dice, hold some, then choose a score row. | 10 | Pass |
| Choose High Five | 3 | Result-naming verb |
| Your seat in the room | 5 | Pass |
| Start a room | 3 | Pass |
| What should your family call you? | 6 | Pass |
| We store your nickname, game moves, room code, and a random seat token. | 13 | Registered |
| Your browser stores the token so you can return to your seat. | 12 | Registered |
| Make the room | 3 | Result-naming verb |
| How it works | 3 | Pass |
| Continue a game through its room link | 7 | Registered |
| Make a room | 3 | Pass |
| Choose a game and nickname. | 5 | Pass |
| No account is needed. | 4 | Registered |
| Share the link | 3 | Pass |
| Send the room link to the people you play with. | 10 | Pass |
| Take turns | 2 | Pass |
| Open the same room link when it is your turn. | 10 | Registered |
| A small table, on purpose | 5 | F-2-7 |
| Games without strangers or chat | 5 | Pass |
| Kitchen Table has no matchmaking, chat, payments, or ads. | 9 | Registered |
| Share room links only with people you know. | 9 | Registered |
| Family games for separate phones. | 5 | Pass |
| Artwork generated for Kitchen Table. | 5 | Registered |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | F-2-6 |
| Build local | 2 | Pass |
| You’re offline. | 2 | Registered by offline behavior test |
| Your open board stays visible. | 5 | Registered by offline behavior test |
| Reconnect before making a real move. | 6 | Pass |

No landing item exceeds 22 words or uses an attached-skill banned adjective.
The game-choice buttons name their results. The only wording finding is
F-2-7; F-2-5 is a claims-contract finding rather than a length issue.

### README

| Text | Words | Result |
| --- | ---: | --- |
| Play family games on separate phones with no account or ads. | 11 | Registered |
| Make a room, share its link, and continue from the same board. | 12 | Registered |
| Choose from three family games | 5 | Registered |
| Lantern Race | 2 | Pass |
| Make a Square | 4 | Pass |
| High Five | 2 | Pass |
| Try the isolated sample at /demo. | 6 | Pass |
| It starts a Make a Square game with Alex and Ravi. | 11 | Claim evidence incomplete: F-2-5 |
| Demo state stays in a demo: browser key and is never copied to a real room. | 16 | Registered |
| See .factory/demo.md. | 2 | Pass |
| Kitchen Table has no account, ads, matchmaking, chat, payments, or analytics. | 11 | Registered |
| Room creation explains the stored fields before it sends a request. | 11 | Registered |
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
| /health returns the build SHA. | 5 | Registered |
| The server rate-limits every route other than that health check. | 10 | Registered |
| License | 1 | Pass |
| Code is released under the MIT License. | 7 | Pass |
| The original generated artwork and its provenance are documented in .factory/design.md. | 11 | Registered |

No README sentence exceeds 22 words or uses a banned marketing term. The
technical setup vocabulary is appropriate to the developer README; it is not
used as product marketing.

## Demo and sandbox result

**Pass for the basic one-click demo.** The first click from the 390 px landing
opens `/demo` with a visible Make a Square board, Alex and Ravi, three claimed
squares, an open move, and **“Demo — sample data, nothing is saved.”** The
banner retains **Reset demo** and **Start for real**. Fresh-browser inspection
found only `demo:kitchen-table:make-a-square`, no `kt:` key, and no
`/api/rooms` request. Reset restored the seeded open-line count. The registered
offline test passed after `context.setOffline(true)`. F-2-4 records the
separate issue that several other claims do not use this sandbox.

## Claims result

Clean clone: `/tmp/kitchen-table-review-2-XW3Dbn`. `npm ci`, `npm test`, and
`npm run build` passed. Every command listed by the 13 registry entries was
then run individually and passed:

| Claim | Result |
| --- | --- |
| demo-isolated, demo-reset, demo-offline | Pass |
| no-account, no-ads, three-games | Pass |
| room-link-resume, no-strangers-or-payments | Pass |
| storage-disclosure, seat-token-private, deletion-contact | Pass |
| server-health-and-limits | Pass |
| artwork-provenance | Pass |

The local accessibility harness also passed: four mobile screens, zero
serious/critical axe findings. Passing commands do not close F-2-4 or F-2-5.

## Structure and history replay

Direct live routes `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, and a room
deep link returned 200. An unknown route returned a styled HTTP 404 with title
**“Page not found — Kitchen Table”** and h1 **“This table is not here.”** Each
checked page had one h1, one main landmark, `lang="en"`, route-specific title,
description, canonical, OG title, favicon, and Apple icon. `robots.txt`,
`sitemap.xml`, original 1200 × 630 social art, Privacy, and Terms are present.
The visual identity is distinct and coherent with `.factory/design.md`; it is
not a generic SaaS template. Internal links crawled 200; F-2-6 is the failed
external destination.

Earlier records read: `review-1.md`, `polish-1.md`, `handoff.md`, and the
three verification records. Replay status:

| Earlier finding group | Live/code replay |
| --- | --- |
| B1 | **Still failing:** F-2-1 |
| B2–B5 | Confirmed fixed: sandbox, registry, storage disclosure, and styled 404 work |
| M1–M2, M4–M5 | Confirmed fixed: clean install, metadata, skeleton, direct deletion contact |
| M3 | **Partly failing:** F-2-2; forward focus works, Back focus does not |
| PW-01–PW-16 | Original findings confirmed fixed; F-2-7 is a new heading finding |
| UC-01–UC-23 | Registered tests pass; F-2-4 and F-2-5 identify remaining sandbox/location-contract gaps |
| Verification P0, P1, P3 | Confirmed fixed on the present live build |
| Verification P2 | **Partly failing:** F-2-3 |

No AI feature is expected for this simple family-game job, and none is present;
AI, import/export, or sync would not add obvious first-use value beyond the
existing shared-room continuation.

## What would make this perfect

Fit the entire desktop first action and three facts into the first viewport;
restore h1 focus after Back; make every navigation link 44 × 44 px; make all
claims runnable solely through an isolated demo tenant; register and test the
hero's in-progress sample promise; replace the dead factory URL; and use a
plain limits heading. Re-run this full cold-live and clean-clone review with
zero findings.
