# Polish 1 — review finding closure

Candidate repaired from `cc94b94e811f4a0d232267f07bc75418a6c2a1dc`.
Evidence paths refer to the final local run; live checks are recorded in the
handoff after deployment.

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1, PW-01 | Kept the plain job headline; hero now shows the sample action, outcome, and all three facts before the desktop fold. | `polish-1-desktop.png`; `npm test` |
| B2 | `/demo` and `?demo=1` seed Alex and Ravi, use only `demo:`, show the persistent banner, reset, and a destructive exit to real mode. | `@claim:demo-isolated`, `@claim:demo-reset`, `@claim:demo-offline`; `polish-1-demo-mobile.png` |
| B3 | Expanded the registry from seven to thirteen claims; every listed command exercises an observable result. | `.factory/claims.json`; all claim commands pass from clean clone |
| B4, PW-16, UC-11 | Creation disclosure names nickname, moves, room code, and random seat token; Privacy agrees. | `@claim:storage-disclosure`, `@claim:seat-token-private` |
| B5 | Unknown paths keep HTTP 404, return a useful document title before JS, then render the styled recovery page with working game and join links. | Rust `direct_spa_routes_return_200_and_unknown_paths_do_not`; local `/not-a-real-route` check |
| M1 | The matching `package-lock.json` is tracked; clean `npm ci` is part of verification. | clean-clone `npm ci && npm test && npm run build` |
| M2 | Route-specific title/description/canonical/OG/Twitter metadata, original social art, Apple icon, robots, sitemap, routing config, and headers remain present. | browser route checks; `npm run build` |
| M3 | Main is focusable; skip moves focus to it; route transitions focus and announce the new h1. Hash navigation now scrolls intentionally. | Playwright route/focus smoke; axe run |
| M4 | Every route keeps Demo/Games/Privacy navigation and the footer carries Privacy, Terms, factory credit, and build identifier. Landing includes a working sample and boundaries section. | local browser check; `polish-1-desktop.png` |
| M5 | Privacy has the direct `mailto:privacy@sociobot.in` deletion path. | `@claim:deletion-contact` |
| PW-02 | Removed “quiet” from metadata. | route metadata inspection |
| PW-03 | Removed “familiar”; game copy now names concrete game types. | copy audit |
| PW-04 | Uses “Choose from three family games.” | `@claim:three-games` |
| PW-05 | Every choice includes its game name. | `@claim:three-games` |
| PW-06 | Session language is consistently “room.” | copy audit |
| PW-07 | Uses “No account” and “No ads” consistently. | copy audit; `@claim:no-account`; `@claim:no-ads` |
| PW-08 | Uses “What should your family call you?” | landing form inspection |
| PW-09 | Uses “Continue a game through its room link.” | `@claim:room-link-resume` |
| PW-10 | README no longer uses the jargon-heavy race description. | README audit |
| PW-11 | Privacy and README state fields and browser token plainly. | `@claim:storage-disclosure`; `@claim:seat-token-private` |
| PW-12, PW-13 | Removed operational implementation prose that visitors cannot use. | README audit |
| PW-14 | Removed implementation-jargon accessibility marketing rather than make an untestable promise. | README audit |
| PW-15 | Removed the unverified retention sentence. | Privacy/README audit |
| UC-01 | Product title, metadata, game count, account, ads, and link promises map to the registry. | `three-games`, `no-account`, `no-ads`, `room-link-resume` claims |
| UC-02 | “No ads” now has a same-origin/no-ad-surface network test. | `@claim:no-ads` |
| UC-03 | “No account” has a no-login/no-identity-field demo test. | `@claim:no-account` |
| UC-04 | The three named choices are asserted. | `@claim:three-games` |
| UC-05 | Two isolated browser contexts create, join, play, and reload one board. | `@claim:room-link-resume` |
| UC-06 | Removed unmeasured duration and detailed rules marketing. | game copy audit |
| UC-07 | Removed unmeasured duration and detailed rules marketing. | game copy audit |
| UC-08 | Removed unmeasured duration and detailed rules marketing. | game copy audit |
| UC-09 | Board restoration is asserted after guest reload. | `@claim:room-link-resume` |
| UC-10 | The absent social/payment/analytics surfaces and all request origins are checked. | `@claim:no-strangers-or-payments` |
| UC-12 | Replaced ambiguous “privately” with concrete storage wording. | `@claim:seat-token-private` |
| UC-13 | Earlier replica/restart integration tests remain in the Rust suite. | `cargo test` (13 tests) |
| UC-14 | Removed cache/authoritative-storage marketing from README. | README audit |
| UC-15 | Public room JSON is asserted not to reveal the local token. | `@claim:seat-token-private` |
| UC-16 | Demo traffic is intercepted and must be same-origin. | `@claim:no-ads` |
| UC-17 | Server documentation is reduced to testable health/limit behavior. | `@claim:server-health-and-limits` |
| UC-18 | Removed implementation-marketing; the accessibility suite remains executable evidence. | `.factory/a11y-check.mjs` (0 serious/critical) |
| UC-19 | Offline demo action is asserted without a request. | `@claim:demo-offline` |
| UC-20 | Removed the unsupported numeric retention promise. | Privacy audit |
| UC-21 | No account/age/contact/location surfaces are covered by the demo privacy tests. | `@claim:no-account`; `@claim:no-strangers-or-payments` |
| UC-22 | Terms boundary is tested for prohibited/payment surfaces. | `@claim:no-strangers-or-payments` |
| UC-23 | Hero source, prompt sidecar, and design record are checked together. | `@claim:artwork-provenance` |
| Verification-1 P0 / Verification-2 P0 | Shared-store and process-replacement coverage remains part of the Rust suite. | `separate_replicas_share_a_room…`; `a_room_survives…` |
| Verification-1/2 P1 | Known browser routes return 200, unknown routes return styled 404, health exposes build identity, and test setup installs drivers. | Rust router/API tests; `@claim:server-health-and-limits` |
| Verification-1 P2/P3 | Header/footer targets, immutable asset cache policy, and product JSON errors remain tested. | axe run; Rust cache/error tests |

The full landing copy audit is in `.factory/copy-audit.md`. No TODOs or deferred
findings remain.

## Live replay

Every mapping above was rechecked on the deployed revision at
`https://kitchen-table.sociobot.in` on 2026-08-28. The cold-load evidence is
`.factory/evidence/live-polish-1/verify.json` and its paired desktop/mobile
screenshots; the 390 px demo replay is
`.factory/evidence/polish-1-live-demo-mobile.png`. The live probe confirmed
`/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, `/robots.txt`, and
`/sitemap.xml` return 200, while `/not-a-real-route` returns 404 with the
Page not found title. The live rate probe made 100 requests in 337 ms and
received 40 × 200 and 60 × 429 with `Retry-After: 1`.
