# Kitchen Table — repair 5 handoff

## Result

**PASS.** Kitchen Table lets couples and families play three shared family
games on separate phones without an account or ads. The first action is
**Try it with sample data**, which opens a populated two-player game.

Review 6's only finding is fixed. The designed unknown-route page now uses the
direct heading **“Page not found”** and direct description. It retains the
working **Choose a game** and **Join a room** recovery actions.

## Source identity and deployment

The deployed implementation is
`873861a05038a9c56462cde54e98e67dffc597a1`; `/health` and the visible footer
agree on that exact value. The deployment image is
`sociobotregistry.azurecr.io/sf-kitchen-table@sha256:05f545bc0a58730f86b36c502bc9202be4e52b1c5ff7882321d8a7af14a1d2ec`.

The container deployment preserved its durable `sf-kitchen-table-data` mount
at `/data`, existing environment/probes, and one-replica SQLite limit. It
requires only `PORT`; local no-environment runs use a database alongside the
binary when `/data` is absent.

## Verification

From the documented clean setup, these all passed:

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

The full suite passed 15 Rust tests, 3 Vitest tests, 25 Playwright tests, and
the artwork provenance audit. All 17 commands in `.factory/claims.json` also
passed separately.

Local URL verification found no console errors, one title/h1/main structure,
`lang=en`, complete alt text, and labelled buttons. The seven-screen Axe scan
had zero serious or critical issues.

Live HTTPS checks passed for fresh desktop and phone first screens, the
populated demo, sample label/reset/exit isolation, all three sample games,
two-phone sample resume, privacy boundaries, offline sample behavior, keyboard
and focus behavior, reduced motion, rate limiting, and build identity. The
full live browser suite passed 25/25. The 404 has HTTP status 404, a direct
title and h1, no prior mood copy, zero serious/critical Axe issues, and both
recovery actions work.

`/work/.evidence/catalog-description.txt` is an exact copy of the 74-byte,
verb-first catalog description.

## Documentation and history

`.factory/repair-5.md` records the focused change and evidence. Review 6
already replayed all earlier review, verification, polish, and repair findings;
this repair reran the full local and live suites and reopened none of them.

## Run locally

```sh
npm ci
npm test
npm run build
cargo run
```

Open `http://127.0.0.1:8080`, or `/demo` for the isolated sample.

## Known gaps

There are no known product gaps in the reviewed scope. The deliberate HTTP 404
may be shown by browsers as an expected failed-document network request; the
complete recovery page is intentional and remains usable.

No AI feature is used because it would not improve this turn-based family-game
job. There is no paid offer or billing dependency.
