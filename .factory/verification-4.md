# Play family games on separate phones — verification 4

**Verdict: PASS.** There are **0 findings** and **0 untested public claims**.

- Implementation reviewed: `285371898b60ef874f3a396134c97a30b6c00f75`
- Documentation checkout: `e22ad2a38608d12522a5a5ef970e1f613bf467fa`
- Work-order deployed-source reference: `74b1bb14a16a1c851e02c179a044ee81535bd09c`
- Live URL: <https://kitchen-table.sociobot.in>
- Live `/health` and the visible footer both identify
  `e22ad2a38608d12522a5a5ef970e1f613bf467fa` (`Build e22ad2a`).

The observed live identity is the final documentation-only descendant, rather
than the work-order's `74b1bb1` reference. `git diff 2853718..e22ad2a` contains
only `.factory/` documentation and evidence files, so the live runtime remains
the implementation candidate. The health value and visible footer agree exactly;
this is recorded for traceability, not a product defect.

## Job, audience, and first action

Fresh empty browser contexts blocked service workers before the first load. No
scrolling occurred before this assessment.

| View | Job | Audience | First action | Result |
| --- | --- | --- | --- | --- |
| Desktop, 1440 × 900 | Play family games in a shared room on separate phones. | Couples and families who want a shared game without an account or ads. | **Try it with sample data**. | Pass: action ends at y=588; all three facts end at y=629. |
| Phone, 390 × 844 | Play the same shared-room games on phones. | Couples and families who want a shared game without an account or ads. | **Try it with sample data**. | Pass: action ends at y=556; all facts end at y=698. |

The first action says it opens a two-player game already in progress. The facts
are **No ads**, **No account**, and **Return to the same room later**. Fresh
page loads had no browser console or page errors.

## Claims and clean gates

From the clean checkout, `npm ci` completed with 60 packages and zero reported
vulnerabilities. Every test command declared by the 17 entries in
`.factory/claims.json` was run separately: all passed. The 16 Playwright claim
tests use the isolated sample entry point and the artwork provenance audit
passed separately.

The aggregate local gate also passed:

```sh
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

`npm test` passed 15 Rust tests, 3 Vitest tests, 25 Playwright tests, and the
provenance audit. The live suite also passed **25/25** with
`PLAYWRIGHT_BASE_URL=https://kitchen-table.sociobot.in npx playwright test`.

## Live product checks

- The one-click sample opened a populated Make a Square game with Alex, Ravi,
  claimed squares, open moves, and the persistent **Demo — sample data,
  nothing is saved** label. Race and dice sample banners name their active
  games. Reset restored the seed, and leaving the demo did not create a real
  room or retain demo keys.
- All three samples are playable: both Lantern Race pawns move on the shared
  path; Make a Square claims a completed square and retains the turn; High
  Five rolls, holds, and scores.
- A real Make a Square API lifecycle using a 20-character nickname completed
  create, join, start, move, and public reload successfully (all 200; revision
  3). The public response omitted the seat token.
- Invalid game JSON and malformed JSON returned 400 with the clear request
  correction. A 21-character nickname returned 400. A missing room returned
  the designed 404 recovery message.
- A 45-request live burst returned 20 × 200 and 25 × 429; every 429 included
  `Retry-After: 1`. `/health` remained 200 and is exempt as documented.
- The local process-replacement test and both isolated-demo and real-room
  cross-replica tests passed. This verifies durable restart behavior and the
  separate demo/production storage boundary without touching another service.
- A fresh service-worker-controlled `/demo` page reloaded offline, showed its
  offline notice, and changed the open-line count from 3 to 2 without page
  errors. Reduced-motion mode uses `scroll-behavior: auto`; the keyboard skip
  link focuses `<main>`; at 200% text, the 390 px page had zero horizontal
  overflow.
- Live Axe WCAG A/AA scans of home, all three demo variants, Privacy, Terms,
  and the deliberate 404 produced zero violations and zero console/page
  errors. The 404 is intentional and renders the designed recovery page.
- A fresh mobile Lighthouse run scored 99 performance, 100 accessibility,
  100 best practices, and 100 SEO (LCP 1.7 s, CLS 0.038, TBT 0 ms).

## Earlier finding disposition

All Review 1–5 and Verification 1–3 findings were inspected. Review 5's four
open findings remain closed: each demo banner names its game; footer and
health share the exact full source identity; the identity claim rejects
placeholders and compares both values; and the Dockerfile uses `rust:1-alpine`.
The prior demo, route, metadata, privacy, test-gate, focus, target-size,
durable-storage, cache, error-format, and build-traceability findings all
replayed successfully. No earlier finding reopened.

## Limitations

No OCI engine is installed in this verifier environment, so a local container
image build was not repeated. Source inspection confirms the required rolling
`rust:1-alpine` stage, and the deployed runtime, clean release build, health,
footer, and full live browser suite passed. The known data caveat remains:
rooms from the old external store were not migrated because only this product's
`/data` state is in scope.
