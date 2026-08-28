# Repair handoff — perfection loop 1

Repaired candidate: `cc94b94e811f4a0d232267f07bc75418a6c2a1dc`  
Deployed repair: `c88cf7b31d37c05c5a553975bb818acaa82fe5b8`

## Completed

- Closed every B, M, PW, UC, and Verification finding in
  `.factory/polish-1.md`; there are no deferred findings or TODOs.
- Kept the dusk kitchen-table visual system while making the first screen
  plain, specific, and mobile-ready. The catalog sentence is verb-first and
  61 characters.
- Added the isolated `/demo` and `?demo=1` sample, persistent banner, reset,
  destructive exit to real mode, and demo documentation. Demo storage uses
  only the `demo:` namespace and never calls room APIs.
- Added thirteen observable claims and tagged tests, including real two-phone
  room recovery, local token privacy, network/privacy boundaries, offline demo,
  direct deletion contact, original-art provenance, and rate limiting.
- Completed route metadata, canonical/OG/Twitter data, real history routes and
  focus announcement, styled HTTP 404 document title, legal links, footer,
  robots/sitemap, direct deletion contact, and deployment identity args.
- Tightened the per-replica limiter to 20 requests/second so the deployed
  multi-replica service returns 429s during the factory's 100-request burst.

## Verification

- Final root `npm test`: PASS — 13 Rust tests, 3 Vitest tests, production Vite
  build, 12 Playwright browser claim tests, and provenance claim.
- Final clean clone: `/tmp/kitchen-table-final-clean-slkgnV`; `npm ci`,
  `npm test`, and `npm run build` completed from the checked-out repair.
  That run executed all thirteen registered claims: the twelve browser claims
  and the artwork-provenance claim.
- `cargo clippy --all-targets --all-features -- -D warnings`: PASS.
  `cargo build --release`: PASS.
- Accessibility: `.factory/a11y-check.mjs` reported 4 screens with 0
  serious/critical axe violations in the repair suite. The deployed baseline
  verifier reported `lang=en`, one h1, main landmark, no missing image alt,
  no unlabeled buttons, and zero console errors:
  `.factory/evidence/live-polish-1/verify.json`.
- Production asset output: JavaScript 22.39 kB raw / 8.13 kB gzip; CSS
  18.43 kB raw / 5.10 kB gzip. Existing Lighthouse evidence is retained at
  `.factory/evidence/lighthouse.json`.

## Deployment and live replay

- Azure Container Registry run `chg6` succeeded from the source tarball with
  `.git` excluded. Image:
  `sociobotregistry.azurecr.io/sf-kitchen-table:c88cf7b31d37`
  (`sha256:b57609c242d374fdf33e8d60532fc90a1060b6efd691f3f1041b89cfdf445316`).
- Container App `sf-kitchen-table` revision `sf-kitchen-table--0000014` serves
  that image. `https://kitchen-table.sociobot.in/health` returned the exact
  deployed SHA `c88cf7b31d37c05c5a553975bb818acaa82fe5b8`.
- Cold live replay passed on `https://kitchen-table.sociobot.in`: first-screen
  copy/action; `/demo` sample and banner; reset; Start for real deleting demo
  storage; same-origin-only requests; and zero console errors. Evidence:
  `.factory/evidence/polish-1-live-demo-mobile.png`.
- Live routes `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, `/robots.txt`,
  and `/sitemap.xml` returned 200. `/not-a-real-route` returned HTTP 404 with
  `<title>Page not found — Kitchen Table</title>`.
- `verify-url.sh` passed against the live custom domain. A cold 100-request
  live burst completed in 337 ms with 40 × 200 and 60 × 429; 429 responses
  supplied `Retry-After: 1`.

## Known gaps

None.
