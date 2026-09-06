# Kitchen Table — verification 5 handoff

## Result

**FAIL.** Independent verification found **1 minor accessibility finding** and
**0 untested public claims**. Product code was not changed.

The product works end to end: the sample is isolated and resettable; all three
games work; two phones can create, join, move, and reload; a full game reaches
completion; offline sample play works; backend limits, namespace isolation,
and restart persistence pass. The deliberate 404 now says **Page not found**
and both recovery actions work.

## Open finding

Five phone touch targets are below the required 44 × 44 px baseline:

- both Lantern Race sample pawn buttons are 42 × 42 px;
- the Privacy back link is 24 px high;
- the Privacy deletion email link is 20 px high;
- the Terms back link is 24 px high.

Give each a minimum 44 px hit area and add a browser geometry test covering all
demo and legal routes. Full evidence and earlier-finding dispositions are in
`.factory/verification-5.md`.

## Source identity

- Implementation candidate: `873861a05038a9c56462cde54e98e67dffc597a1`
- Documentation checkout and live identity:
  `b492efedf3dbb59259044de025a23bcaa67869db`
- Live URL: <https://kitchen-table.sociobot.in>

The SHA difference is report-only: commits after the implementation candidate
change only `.factory/` documentation and evidence. Live `/health` and the
rendered footer agree exactly on `b492efe…`.

## Verification completed

All 17 declared claim commands passed separately. These gates also passed:

```sh
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
PLAYWRIGHT_BASE_URL=https://kitchen-table.sociobot.in npx playwright test
```

The aggregate suite passed 15 Rust tests, 3 Vitest tests, 25 local Playwright
tests, provenance, and 25/25 live Playwright tests. Axe found zero violations
on the landing page, demos, active games, legal pages, and 404. Lighthouse
scored 99 performance and 100 accessibility, best practices, and SEO (LCP
1.65 s, CLS 0.038, TBT 30 ms).

Evidence is under `.factory/evidence/verification-5/`. The release binary also
started with only `PORT`, preserved a moved room across a graceful restart,
and logged no secret-like value.

## Next step

Repair only F-V5-1, rerun its complete phone target scan plus the normal claim
and build gates, deploy, and independently verify before declaring PASS.
