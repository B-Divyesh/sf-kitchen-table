# Review handoff — review 2

## Completed

- Performed fresh live reviews at 390 × 844 and 1440 × 900, a one-click demo
  sandbox replay, route/metadata/link checks, copy audit, and history replay.
- Created `.factory/review-2.md`. No product code was changed.
- Used a fresh clone at `/tmp/kitchen-table-review-2-XW3Dbn`: `npm ci`,
  `npm test`, `npm run build`, and all 13 listed claim commands passed.
- Ran `.factory/a11y-check.mjs` against a local clean-clone server: four
  screens and zero serious/critical axe findings.

## Result

**FAIL.** The report records seven findings. Three are blocking regressions:

1. The desktop 1440 × 900 first screen clips the primary demo action below the
   fold (earlier B1).
2. Browser Back returns route focus to `body`, not the new h1 (earlier M3).
3. Mobile header Demo and Privacy targets are 37 × 44 and 43 × 44 px (earlier
   verification P2).

The review also identifies non-demo claim tests, an unregistered hero promise,
a dead `param.fyi` footer URL, and one vague heading. See `review-2.md` for
exact locations, evidence, and fixes.

## How to verify

Read `.factory/review-2.md`, then run from a clean clone:

    npm ci
    npm test
    npm run build

Run each command in `.factory/claims.json` separately. Replay the first screen
at 390 × 844 and 1440 × 900, and test Home → Privacy → browser Back focus.

## Known gaps

The seven findings in `.factory/review-2.md` remain. Do not claim closure until
they are fixed and this full review is replayed.
