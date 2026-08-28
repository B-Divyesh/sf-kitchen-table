# Independent verification 1 — FAIL

**Candidate:** `b55780dc154f80a42136c89cef71fb4d07ba316f`  
**Live URL:** `https://kitchen-table.sociobot.in`  
**Verified:** 2026-08-28 UTC  
**Verdict:** **FAIL — do not promote.** The deployment has no shared,
durable authoritative room store, which breaks the defining room-link and async
multiplayer job.

## Release-blocking defects

### P0 — production room state is split between replicas

Created live race room `75LYEW` and concurrently submitted eight joins. The
responses were `200,200,200,400,400,404,404,404`; the three `200`s are the
expected remaining seats and the `400`s are expected full-room responses, but
the `404`s came from a replica which had never seen the room. A subsequent 30
read sample of `GET /api/rooms/75LYEW` was **15 × 200 and 15 × 404**. Every
404 body was `{"error":"That room was not found. Check the six-letter
code."}`.

This is fresh, reproducible evidence that the live fleet has multiple isolated
SQLite files. It makes a room link randomly fail, loses the authoritative game
state across replicas, and cannot provide the promised same-room or async play.
The source confirms the risk: SQLite defaults to a container-local path and the
write lock is in-process only. This violates the researched brief's explicit
authoritative-server and resumable-link requirements.

### P1 — direct room and legal-route navigations return HTTP 404

`GET /room/WHD9DS`, `GET /privacy`, and `GET /terms` each return the SPA's
`index.html` body but with **HTTP 404**. The direct room navigation emitted
three browser console resource errors (one per direct navigation) despite the
client subsequently rendering the room. Room links are the primary sharing
mechanism; they and the required legal URLs must return 200. This also fails the
no-console-errors gate.

### P1 — live build identity is not the candidate

All ten fresh `GET /health` samples returned
`{"build_sha":"830138fc4c0e5ece8448a31b1e989b8f4625a9ce","status":"ok"}`,
not candidate `b55780dc154f80a42136c89cef71fb4d07ba316f`. The shipped JS and
CSS bytes do match the candidate's local build, so this is a backend build
identity/release-traceability failure (the Dockerfile's default `BUILD_SHA`
also hard-codes the older SHA). It prevents confirmation that the deployed
backend is the verified candidate.

## Other defects

### P2 — mobile touch targets below the required 44 px minimum

At 390 px, measured visible interactive boxes were: wordmark `192 × 33`,
Privacy `43 × 21.1`, and Terms `39 × 21.1` CSS px. These links fail the stated
44 × 44 target requirement, even though the primary game controls meet it.

### P3 — no HTTP cache policy for immutable hashed assets

The JS, CSS, service worker, manifest, and landing page responses have no
`Cache-Control` header. The small bundle remains within budget, but immutable
hashed assets are not configured for long-lived caching as required by the
performance contract.

### P3 — malformed game input exposes a framework error

`POST /api/rooms` with `{"game":"invalid","nickname":"valid"}` returns
HTTP 422 and raw Axum deserialization text rather than the product's plain,
recoverable JSON error format. Empty and 21-character nicknames correctly return
HTTP 400 with `Nickname must be 1–20 characters.`

## What passed

- Clean checkout was at the requested candidate with no pre-existing changes.
  `npm ci` passed (0 reported vulnerabilities); `npm test` passed: **7 Rust**
  tests and **3 Vitest** tests. `npm run build`, `cargo build --release`, and
  `cargo clippy --all-targets -- -D warnings` passed. There is no separate lint
  script. The exact Docker image build could not be run because this verifier
  environment has no `docker` executable.
- Vite production output is within the explicit asset budgets: JS 18,492 B
  (7,260 B gzip), CSS 16,460 B (4,710 B gzip), total local fonts 71,352 B,
  and mobile hero WebP 29,060 B. The live JS/CSS SHA-256 values exactly matched
  the local candidate output.
- Fresh two-browser normal flow succeeded incidentally on one replica: create
  Make a Square room → join with a second nickname → host start → draw a line;
  the already-claimed line was disabled for the guest. This does not mitigate
  P0, because repeated requests were demonstrably routed to the other replica.
- Desktop and 390 px mobile landing pages had one `h1`, `lang="en"`, a `main`
  landmark, alt text, a keyboard-visible Skip to the game focus ring, no mobile
  horizontal overflow, and reduced-motion CSS. Axe 4.13 WCAG A/AA scans of the
  desktop home, 390 px home, and active Make a Square screen found **zero
  serious or critical violations** (indeed zero violations).
- Browser requests were same-origin only; no third-party scripts, fonts,
  analytics, ads, or cookies were observed. Public room reads did not reveal a
  seat token. CSP, `X-Content-Type-Options: nosniff`, and Referrer-Policy are
  present.
- Lighthouse mobile home: Performance **99**, Accessibility **100**, Best
  Practices **100**, SEO **100**; LCP 1,726 ms, CLS 0.0011, TBT 0 ms.
- PWA service worker registered, `registration.update()` completed with an
  active worker, took control after reload, and a warmed offline home reload
  succeeded.
- Local release-binary control check with a single SQLite file passed: health
  reported the injected candidate SHA, a race room accepted exactly the three
  remaining concurrent joins (then five full-room 400s), public state had four
  players and no token leak, and the room was available after a process restart.
  The production failure is therefore the deployment persistence boundary, not
  that narrow single-process behavior.

## Required remediation before re-verification

1. Put room state in shared durable storage (PostgreSQL is appropriate for this
   multi-replica product), or prove a single replica plus a persistent mounted
   SQLite volume and update the concurrency model accordingly. Re-run a
   multi-replica create/join/read/restart test.
2. Make the SPA fallback return 200 for known client routes (`/room/:code`,
   `/privacy`, `/terms`) while retaining a real 404 for unknown routes.
3. Inject the actual candidate SHA at image build/deploy time; do not retain a
   stale Dockerfile default as the production identity.
4. Pad the header and legal links to 44 × 44 px minimum and add immutable cache
   headers for hashed assets. Normalize malformed API JSON into the documented
   error response.
