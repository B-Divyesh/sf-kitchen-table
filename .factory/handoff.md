# Repair handoff — perfection loop 1

Commit: 70ae421e2bb13a993cbbeb275540c1a034bb6817

## Completed

- Replaced the first screen with the reviewed plain-language headline, visible
  Try it with sample data action, outcome note, and three short facts.
- Added /demo and ?demo=1. The sample opens a seeded Alex/Ravi Make a Square
  game from a demo: local-storage namespace. It has a persistent demo banner,
  Reset demo, and Start for real. It never calls the room API.
- Added claims.json, demo.md, copy audit, seven tagged browser claim tests, and
  the tracked npm lockfile.
- Added route titles and metadata, canonical/OG/Twitter tags, local social and
  Apple artwork, robots, sitemap, consistent navigation/footer, focus and live
  route announcement, and a styled HTTP 404 page.
- Rewrote storage disclosure to name nickname, game moves, room code, and seat
  token. Privacy now contains a direct deletion contact.
- Added mobile demo layout, local assets, rate limiting with Retry-After, and a
  container-safe /data SQLite default. The original dusk-table art direction
  and type system are retained.

## Verification

- npm test: PASS — 13 Rust tests, 3 Vitest tests, production Vite build, and
  7 Playwright claim tests.
- Clean clone: PASS at /tmp/kitchen-table-clean-IzfbA0 using npm ci, npm test,
  npm run build, then every claims.json command individually.
- Browser claims passed: demo-isolated, demo-reset, demo-offline, no-account,
  no-ads, three-games, and storage-disclosure.
- Accessibility: .factory/a11y-check.mjs reported 4 screens with zero
  serious/critical violations. A separate Playwright axe scan of /demo at
  390x844 reported zero violations after the demo board fix.
- verify-url.sh reported a title, lang=en, one h1, main landmark, image alt
  text, and zero console errors on the landing page.
- Routing smoke: /demo returned 200; /not-a-real-route returned 404 with the
  SPA recovery page; robots.txt returned 200.
- Performance build output: application JavaScript 22.14 kB raw / 8.15 kB
  gzip; CSS 18.43 kB raw / 5.10 kB gzip.
- Docker is unavailable in this worker image, but the factory ACR build passed:
  run chfx built
  sociobotregistry.azurecr.io/sf-kitchen-table:e966fe12a4d8
  (sha256:5453b1d4ea7366a79a60910956a9e3590f0acdf4f84ef39cc0ef02623b2c8bde).

## Deployment

The root Dockerfile was built by Azure Container Registry run chfx and deployed
to Container App sf-kitchen-table in resource group sociobot. Revision
sf-kitchen-table--e966fe1 is Running with 100% traffic.

Live verification on 2026-08-28:

- https://kitchen-table.sociobot.in/health returned build SHA
  e966fe12a4d8a3eea29c3f85ea96b602e75e93b0.
- The custom domain returned 404 for /not-a-real-route.
- verify-url.sh passed on the custom domain with zero console errors.
- A live 390 px Playwright check opened /demo with the banner and Make a Square
  heading.

## Known gaps

None in the product repair. The only unavailable verification tool was Docker
in this worker image.
