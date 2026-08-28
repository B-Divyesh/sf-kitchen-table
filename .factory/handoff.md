# Kitchen Table — polish 2 handoff

## Completed

- Closed every finding in `.factory/review-1.md` and `.factory/review-2.md`.
  The complete finding-to-change-to-evidence map is `.factory/polish-2.md`.
- Refit the first screen at 1440 × 900 and 390 × 844 while preserving the
  dusk-kitchen visual identity.
- Added a real two-seat demo share flow. It uses `/api/demo/rooms`, in-memory
  state, and `demo:` browser keys. It never calls production room routes or
  creates production room rows.
- Fixed Back/forward h1 focus and announcements, 44px mobile targets, OG URL
  updates, the limits heading, and the dead factory-credit link.
- Added the missing in-progress-demo claim and rewrote the three disputed
  claim tests to begin at `/demo` and stay isolated.
- Updated the catalog description, demo guide, README, and copy audit.

Implementation commits: `e789111` and `d3fcfc7`. The first production replay
of `d3fcfc7e10d49b436e588f606eaa608848ff1a95` returned that exact SHA from
`/health`. The documentation-complete `main` revision is deployed again during
handoff and must match `/health` before the work order closes.

## Verification

Clean clone: `/tmp/kitchen-table-polish2-clean-HLi77C`.

    npm ci
    npm test
    npm run build

Results: 14 Rust tests, 3 Vitest tests, and 19 Playwright tests passed. The
build produced `frontend/dist/`. JS is 25.53 KB raw (8.72 KB gzip); CSS is
18.78 KB raw (5.17 KB gzip); local fonts total 71.35 KB.

Every command in `.factory/claims.json` was then run individually from that
clean clone. All 14 passed, including the two-context shared-demo resume,
offline local move, storage isolation, privacy, rate-limit, and provenance
claims.

Additional evidence:

- `.factory/a11y-check.mjs`: four mobile screens, 0 serious/critical axe
  findings, both locally and against production.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100,
  SEO 100; LCP 1.8s, CLS 0.038, TBT 0ms. Report:
  `.factory/evidence/polish-2-local/lighthouse.json`.
- Local screenshots and verify output:
  `.factory/evidence/polish-2-local/`.
- Cold production screenshots and structured replay:
  `.factory/evidence/polish-2-live/`.
- Production route crawl: `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`,
  `/robots.txt`, and `/sitemap.xml` returned 200; `/not-a-real-route` returned
  the styled 404.
- Production two-context demo: one move appeared after guest reload; storage
  contained only `demo:` keys and request capture contained no `/api/rooms`.
- Production load smoke: 100 concurrent requests yielded 60 × 200 and
  40 × 429; limited responses included `Retry-After`.
- `https://hello-factory.sociobot.in/` returned 200.

## Run and deploy

Local instructions are in `README.md`. The production container starts with
only `PORT`, runs as a non-root user, serves frontend and API together, and
reports the injected source SHA at `/health`.

Deployment command used by this work order:

    /opt/fleet/lib/deploy-container.sh kitchen-table /work/repo Dockerfile 8080

Live URL: <https://kitchen-table.sociobot.in>

## Known gaps

None. No review finding, minor item, stub, or TODO is deferred.
