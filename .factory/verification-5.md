# Play family games on separate phones — verification 5

**Verdict: FAIL.** There is **1 minor finding** and **0 untested public
claims**. Product code was not changed.

- Implementation candidate: `873861a05038a9c56462cde54e98e67dffc597a1`
- Documentation checkout: `b492efedf3dbb59259044de025a23bcaa67869db`
- Live `/health` and footer: `b492efedf3dbb59259044de025a23bcaa67869db`
- Live URL: <https://kitchen-table.sociobot.in>

Commits after `873861a` contain only `.factory/` reports and evidence. The live
SHA is therefore a report-only descendant of the last implementation candidate.
The footer and `/health` agree exactly. This is not a product defect.

## Job, audience, and first action

Fresh Chromium contexts used empty storage at 1440 × 900 and 390 × 844. No
scrolling occurred before this assessment.

| View | Job | Audience | First action | Result |
| --- | --- | --- | --- | --- |
| Desktop | Play family games on separate phones. | Couples and families who want a shared game without an account or ads. | **Try it with sample data**. | Pass. The action, result, and all three facts are visible. |
| Phone | Play the same shared-room games on phones. | Couples and families who want a shared game without an account or ads. | **Try it with sample data**. | Pass. The action, result, and all three facts are visible. |

The three facts are **No ads**, **No account**, and **Return to the same room
later**. Both fresh loads had one h1, one main, `lang=en`, no overflow, only
same-origin requests, and no console or page errors. Screenshots are in
`.factory/evidence/verification-5/first-screen-desktop.png` and
`first-screen-phone.png`.

## Finding

### F-V5-1 — MINOR — five phone touch targets are smaller than 44 px

The accessibility and site-structure contracts require touch targets of at
least 44 × 44 CSS px. A fresh 390 × 844 phone audit found:

| Route | Control | Measured size |
| --- | --- | ---: |
| `/demo?game=race` | **Move Alex’s first pawn** | 42 × 42 px |
| `/demo?game=race` | **Move Alex’s second pawn** | 42 × 42 px |
| `/privacy` | **Back to Kitchen Table** | 169.4 × 24 px |
| `/privacy` | **privacy@sociobot.in** | 137 × 20 px |
| `/terms` | **Back to Kitchen Table** | 169.4 × 24 px |

This is minor rather than a broken path: every control is visible,
keyboard-operable, and named, and Axe reports no WCAG A/AA violation. The pawn
controls are part of the sample and the email link is the deletion action, so
the explicit 44 px product baseline still applies.

**Required fix:** give these controls a minimum 44 × 44 px hit area without
phone overflow. Add a 390 px test that measures every visible target on all
three demos, Privacy, and Terms. Evidence: `touch-targets.log`. Active real
race, dots, and dice controls already pass; see `active-touch-targets.log`.

## Claims and clean gates

`npm ci` installed 60 locked packages with zero reported vulnerabilities. All
17 commands in `.factory/claims.json` then ran separately and passed:

| Claims | Result |
| --- | --- |
| `demo-isolated`, `demo-in-progress`, `demo-reset`, `demo-offline` | Pass |
| `no-account`, `no-ads`, `no-strangers-or-payments` | Pass |
| `three-games`, `race-gameplay`, `dots-gameplay`, `dice-gameplay` | Pass |
| `room-link-resume`, `storage-disclosure`, `seat-token-private` | Pass |
| `deletion-contact`, `server-health-and-limits`, `artwork-provenance` | Pass |

Every registry ID has exactly one `@claim:` tag. There are no missing,
duplicate, or orphan tags. A fresh review of landing, demo, legal, and README
copy found no unlisted public claim. Evidence: `claim-results.tsv`, individual
`claim-*.log` files, and `claim-tag-audit.log`.

These clean aggregate gates also passed:

```sh
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

`npm test` passed 15 Rust tests, 3 Vitest tests, 25 Playwright tests, the build,
and artwork audit. The full live Playwright suite passed 25/25.

## Sample and real play

- The sample opened a populated Make a Square game with Alex, Ravi, claimed
  squares, three open moves, and the persistent **Demo — sample data, nothing
  is saved** label.
- Drawing a line changed the open count from 3 to 2. **Reset demo** restored 3.
  **Start for real** removed the demo key and preserved a pre-existing `kt:`
  sentinel. The sample made no production-room request, set no cookie, and
  used only the product origin.
- All three sample games completed their promised move, claim, or score action.
- A desktop host and fresh phone guest created, joined, started, and moved in a
  real room through the UI. Phone reload retained the line with no overflow or
  browser error.
- A separate API game completed all 24 lines. It reached `finished`, revision
  26, with all squares assigned and a winner. Public JSON omitted tokens. No
  pre-existing user room was read or changed; only fresh QA rooms were used.

Evidence: `demo-manual.log`, `demo-phone.png`, `real-ui-flow.log`,
`real-room-phone.png`, and `live-backend.log`.

## Backend, invalid input, isolation, and persistence

- Invalid game JSON and malformed JSON returned controlled 400 JSON. A
  21-character nickname returned the stated limit. A missing room returned the
  expected product 404.
- Starting with one player, using a duplicate nickname, and moving out of turn
  returned direct corrective errors.
- A sample code returned 404 through production routes, and a production code
  returned 404 through sample routes. Public responses omitted tokens.
- A 45-request live burst returned 20 × 200 and 25 × 429. Every 429 included
  `Retry-After: 1`; `/health` remained 200.
- The release binary started twice with an environment containing only `PORT`.
  With `/data` absent it created `kitchen-table.db` beside the binary. After a
  move, graceful stop, and restart, revision 3 and the line remained. Startup
  output contained no secret-like value.

Rust tests also passed for process replacement, shared real-room replicas,
shared isolated-demo replicas, namespace isolation, limiting, cache rules, and
plain malformed-input errors.

## Accessibility, offline, routes, and performance

- The URL checker found a title, `lang=en`, one h1, one main, complete alt text,
  labeled buttons, and no console error.
- Axe scans of Home, all demos, all active games, legal pages, and the 404 found
  zero violations. F-V5-1 is a stricter target-size contract finding.
- Tab revealed a 151 × 44 px skip link with a 3 px honey ring. Enter focused
  main. Forward and Back navigation focused and announced the new h1.
- Reduced motion used `scroll-behavior: auto` with no settled animation. At
  200% text size, the 390 px page had no overflow.
- A service-worker-controlled sample reloaded offline with HTTP 200, showed the
  offline notice, and accepted a sample move from 3 to 2 open lines.
- Privacy and Terms returned 200 with unique titles. Same-origin links returned
  200. The marked external factory link was not fetched because it is outside
  this product boundary.
- `/not-a-real-route` deliberately returned HTTP 404. It had title **Page not
  found — Kitchen Table**, h1 **Page not found**, one main, zero Axe violations,
  and working **Choose a game** and **Join a room** actions. The 404 status is
  expected and is not a defect.
- Cache rules, CSP, `nosniff`, referrer policy, robots, and sitemap passed.
- The build is 29.74 KB JS (9.83 KB gzip), 20.38 KB CSS (5.48 KB gzip), 71.35
  KB of fonts, and a 29.06 KB phone hero. Lighthouse scored 99 performance and
  100 accessibility, best practices, and SEO. LCP was 1.65 s, CLS 0.038, and
  TBT 30 ms.

## Earlier finding disposition

Every earlier review, verification, repair, polish, and handoff was inspected.
These dispositions use fresh replays.

| Earlier finding group | Current disposition |
| --- | --- |
| Review 1 B1–B4 | Closed: first screens, demo, claims, and storage disclosure pass. |
| Review 1 B5 | Closed: the intentional 404 has complete structure and recovery. |
| Review 1 M1–M5 | Closed: setup, metadata, focus, shell, and deletion contact pass. |
| Review 1 PW-01–PW-16 | Closed: quoted wording remains fixed; copy audit is clean. |
| Review 1 UC-01–UC-23 | Closed: current claims map to passing tests; removed claims remain absent. |
| Review 2 F-2-1–F-2-3 | Closed for the cited fold, Back-focus, and header/footer targets. F-V5-1 is a new broader target audit. |
| Review 2 F-2-4–F-2-5 | Closed: shared sample isolation and populated output pass. |
| Review 2 F-2-6–F-2-7 | Closed: factory credit is marked external and limits copy is direct. |
| Review 3 F-3-1–F-3-2 | Closed: samples persist and final routes focus and announce. |
| Review 3 F-3-3–F-3-6 | Closed: game claims pass and room titles put Kitchen Table first. |
| Review 5 F-5-1 | Closed: each banner names its active game. |
| Review 5 F-5-2–F-5-3 | Closed: footer/health identity is exact and placeholders are rejected. |
| Review 5 F-5-4 | Closed: Dockerfile uses `rust:1-alpine`. |
| Review 6 F-6-1 | Closed: 404 now says **Page not found** and both actions work. |
| Verification 1 P0/P1 and Verification 2 P0/P1 | Closed: shared state, persistence, routes, identity, and clean tests pass. |
| Verification 1 P2/P3 | Cited targets, cache rules, and errors remain fixed. F-V5-1 is new. |
| Verification 3 and 4 | Results reproduce except for new F-V5-1. |

## Final result

**FAIL — 1 minor finding, 0 untested claims.** Increase the five hit areas to
at least 44 × 44 px and rerun the phone geometry audit before PASS.
