# Kitchen Table — repair 5

## Outcome

**PASS.** Review 6 finding F-6-1 is closed in implementation commit
`873861a05038a9c56462cde54e98e67dffc597a1`, which is the deployed `/health`
identity. The verification documentation record is
`7e45d472106422510149f72d363118d6832c3c8b` and has no runtime product change.

## Fix

The deliberate unknown-route page now names its state directly:

- Its only page heading is **“Page not found.”**
- Its description says that the requested page could not be found.
- The former “Empty chair” label and “This table is not here” heading are
  absent.
- **Choose a game** and **Join a room** remain available recovery actions.

The browser regression test starts from an actual unknown URL, checks its HTTP
404 status and semantic recovery page, then activates each recovery action. It
asserts the resulting game choice and focused room-code field rather than
matching implementation source.

## Verification

From the documented clean setup, `npm ci`, `npm test`, `npm run build`,
`cargo clippy --all-targets --all-features -- -D warnings`, and
`cargo build --release` passed. The full test suite passed 15 Rust tests, 3
Vitest tests, 25 Playwright tests, and the provenance audit.

All 17 commands declared in `.factory/claims.json` passed independently. This
includes the isolated sample, reset, offline sample, all three playable sample
games, shared sample link/reload, privacy boundary, deletion contact, health
identity/rate-limit, and artwork provenance checks.

Local checks passed:

- `/opt/fleet/lib/verify-url.sh` found title, `lang=en`, one h1, one main,
  complete image alt text, labelled buttons, and no console errors.
- The seven-screen Axe check reported zero serious or critical violations.

The durable container deployment built image digest
`sha256:05f545bc0a58730f86b36c502bc9202be4e52b1c5ff7882321d8a7af14a1d2ec`.
It preserved the `sf-kitchen-table-data` mount at `/data`, existing container
configuration, probes, and its one-replica SQLite bound.

Live verification at `https://kitchen-table.sociobot.in` passed:

- `/health` returns the exact implementation SHA above.
- Fresh 1440 × 900 desktop and 390 × 844 phone contexts identify the job,
  audience, and **Try it with sample data** action without scrolling.
- The full live Playwright suite passed 25/25.
- The live URL check had no application console errors and found the required
  title, language, h1, main, alt text, and labels.
- Axe found zero serious or critical violations on the seven game screens.
- A fresh mobile Lighthouse run scored 99 performance and 100 for
  accessibility, best practices, and SEO (LCP 1.68 s, CLS 0.038, TBT 0 ms).
- A fresh phone check of `/not-a-real-route` returned HTTP 404, title
  **“Page not found — Kitchen Table”**, h1 **“Page not found”**, no prior mood
  copy, zero serious/critical Axe issues, and working game/join recovery
  actions.

The intentional HTTP 404 can appear as the browser's expected failed-document
network entry. It is not an application error and the recovery page itself is
complete and usable.

## History disposition

Review 6 had one minor wording finding and no untested claims. Earlier review,
verification, polish, and repair findings were already replayed as closed in
that report. This repair changes only F-6-1 and reruns the complete local and
live suites, so no earlier item reopens.
