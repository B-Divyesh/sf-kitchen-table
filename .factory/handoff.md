# Kitchen Table — review 3 handoff

## Completed

- Performed a cold-live, phone and desktop adversarial review against build
  `6bb87aeb18e8655a5ba7e15e9d47808f6357edd5`.
- Wrote the complete result in `.factory/review-3.md`.
- Did not modify product code.

## Verification

Fresh clone: `/tmp/kitchen-table-review3-clean-eyp2gU`.

    npm ci
    npm test
    npm run build

All passed: 14 Rust tests, 3 Vitest tests, 19 Playwright tests, and the
provenance test. Every one of the 14 commands in `.factory/claims.json` was
also run individually and passed locally. The live axe harness reported four
screens with zero serious/critical violations.

The live basic demo correctly used only `demo:` browser storage, made no
production-room request, reset its seed, exited without retaining demo data,
and accepted an offline local move.

## Known gaps

The review verdict is **FAIL**. The live **Create sample room link** flow is
not reliable across replicas: 16 fresh live attempts created a sample code and
then immediately received “That sample room has expired.” The source stores
sample rooms in a replica-local `HashMap`, so the next request may reach a
different replica. This reopens review 2 F-2-4 as blocking F-3-1.

The review also records lost focus after the asynchronous shared-demo route,
three unlisted game-rule claims, and an inverted room title pattern. See
`.factory/review-3.md` for exact evidence and concrete fixes.
