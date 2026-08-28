# Polish 2 — cumulative finding closure

Candidate `93d962e87202ef8ef1fbfcb4aa06ed1cef0d1915` was repaired in
implementation commits `e789111` and `d3fcfc7`. Evidence below comes from the
clean clone `/tmp/kitchen-table-polish2-clean-HLi77C`, local screenshots under
`.factory/evidence/polish-2-local/`, and cold production checks under
`.factory/evidence/polish-2-live/`.

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Reduced the desktop headline, widened its copy field, reordered facts before secondary actions, and made a phone-specific hero crop. | `desktop first screen contains…` and `phone first screen contains…`; `polish-2-local/desktop.png`, `mobile.png`; live boxes end at y=629 desktop and y=699 phone. |
| F-2-2 | Centralized route focus so every push and `popstate` gives the new h1 `tabindex=-1`, focuses it, scrolls to top, and updates the polite announcement. | `browser Back restores route title, announcement, scroll, and h1 focus`; live Home → Privacy → Back: h1 focused. |
| F-2-3 | Header links now have `min-width` and `min-height: 44px`; footer targets remain 44px and wrap without overflow. | `mobile header and footer links meet…`; `polish-2-local/mobile.png`; live 390px geometry passed. |
| F-2-4 | Added separate in-memory `/api/demo/rooms` routes, demo-only seat keys, two-seat share/join/move/reset behavior, and no production-room writes. Repointed all three named claim tests through `/demo`. | `@claim:room-link-resume`, `@claim:storage-disclosure`, `@claim:seat-token-private`, Rust `demo_rooms_are_memory_only…`; `polish-2-live/demo-shared-mobile.png`; live zero `/api/rooms` requests and no `kt:` keys. |
| F-2-5 | Added `demo-in-progress` to the registry and asserted both names, six played marks, three open moves, claimed scores, and isolation. | `@claim:demo-in-progress`; `polish-2-local/demo-mobile.png`; live `/?demo=1` seed replay passed. |
| F-2-6 | Replaced dead `param.fyi` with `https://hello-factory.sociobot.in/` and labeled it as an external site. | HTTP 200 locally and live on 2026-08-28; visible in `polish-2-live/demo-shared-mobile.png`. |
| F-2-7 | Replaced the metaphor with “What Kitchen Table does not include.” | `.factory/copy-audit.md`; live landing text check. |

## Review 1 blocking and major findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | The first screen names the job and keeps its complete action, outcome, and facts above both specified folds. | First-screen desktop/phone tests; local and live screenshots listed above. |
| B2 | `/demo` and `?demo=1` open a seeded game with banner, reset, exit, local offline play, and an isolated shared-room option. | `@claim:demo-isolated`, `demo-reset`, `demo-offline`, `room-link-resume`; live shared-demo screenshot. |
| B3 | `.factory/claims.json` contains 14 claims with one tagged test each. | Every registry command passed individually from the clean clone. |
| B4 | Creation and demo disclosure name nickname, moves, code, and token without an absolute false statement. | `@claim:storage-disclosure`; live `/demo` and `/privacy`. |
| B5 | Unknown routes retain HTTP 404 and render the designed recovery page. | `routes expose unique metadata and a useful HTTP 404`; live `/not-a-real-route` = 404, correct title and h1. |
| M1 | The lockfile remains tracked and current. | Clean clone `npm ci` passed. |
| M2 | Route titles, descriptions, canonicals, OG/Twitter data, social image, icons, robots, sitemap, and headers remain complete; `og:url` now updates too. | `routes expose unique metadata…`; local verify; live route/status crawl. |
| M3 | Skip focus, forward focus, Back focus, scroll reset, and polite announcements are covered. | `skip link moves keyboard focus…`; Back-focus test and live replay. |
| M4 | Header has Demo/Games/Privacy; footer has legal links, resolving factory credit, and build; landing retains demo, workflow, and limits sections. | Route crawl and screenshots; live external link = 200. |
| M5 | Privacy retains the direct `mailto:privacy@sociobot.in` deletion contact. | `@claim:deletion-contact`; live `/privacy`. |

## Review 1 plain-language findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| PW-01 | Uses “Play family games on separate phones.” | First-screen tests and both landing screenshots. |
| PW-02 | Metadata contains no subjective “quiet” wording. | Route metadata test; live title/description check. |
| PW-03 | Game copy names the pawn, line, and dice games without “familiar.” | `.factory/copy-audit.md`; `@claim:three-games`. |
| PW-04 | Section heading is “Choose from three family games.” | `@claim:three-games`; live landing. |
| PW-05 | Buttons name Lantern Race, Make a Square, or High Five. | `@claim:three-games`. |
| PW-06 | Shared sessions are called rooms throughout. | Copy audit terminology table. |
| PW-07 | Absence copy consistently uses “No account” and “No ads.” | `@claim:no-account`, `@claim:no-ads`; live hero. |
| PW-08 | Label reads “What should your family call you?” | `@claim:storage-disclosure` path and landing inspection. |
| PW-09 | Persistence copy says to continue through the room link. | `@claim:room-link-resume`. |
| PW-10 | README describes the games directly without brand-like jargon. | README and copy audit. |
| PW-11 | Storage wording names each field and browser token. | `@claim:storage-disclosure`, `@claim:seat-token-private`. |
| PW-12 | Removed the 26-word storage implementation sentence. | README sentence audit. |
| PW-13 | Removed the 23-word deployment-credential sentence. | README sentence audit. |
| PW-14 | Removed accessibility marketing jargon; kept executable accessibility evidence. | axe: four screens, 0 serious/critical. |
| PW-15 | Removed vague and unsupported retention copy. | Privacy/README audit. |
| PW-16 | Replaced “A nickname is all we store” with the complete disclosure. | `@claim:storage-disclosure`; live demo/creation copy. |

## Review 1 unlisted claims

| Finding | Change made | Evidence |
| --- | --- | --- |
| UC-01 | Title/meta promises map to game-count, link, account, and ad claims. | `three-games`, `room-link-resume`, `no-account`, `no-ads`. |
| UC-02 | No-ad copy has UI and same-origin network proof. | `@claim:no-ads`; live request capture. |
| UC-03 | No-account entry has no identity fields or calls. | `@claim:no-account`. |
| UC-04 | Exactly three named choices are asserted; vague wording removed. | `@claim:three-games`. |
| UC-05 | Shared-link move and reload now run in two isolated demo contexts. | `@claim:room-link-resume`; live two-context replay. |
| UC-06 | Removed Lantern Race duration and detailed marketing claims. | Copy audit; existing game unit tests. |
| UC-07 | Removed Make a Square duration and detailed marketing claims. | Copy audit; `dots_box_keeps_turn`. |
| UC-08 | Removed High Five duration and detailed marketing claims. | Copy audit; dice scoring unit tests. |
| UC-09 | Board restoration is observed after a second-context reload. | `@claim:room-link-resume`. |
| UC-10 | Demo traffic and UI are checked for identity/social/payment/analytics surfaces. | `@claim:no-strangers-or-payments`, `@claim:no-account`. |
| UC-11 | The real-room field disclosure is exact and appears before a write. | `@claim:storage-disclosure`. |
| UC-12 | Ambiguous “privately” was removed; public views omit tokens. | `@claim:seat-token-private`; Rust demo/public-view test. |
| UC-13 | Shared-store and process-replacement tests remain in the Rust suite. | `separate_replicas_share_a_room…`, `a_room_survives…`. |
| UC-14 | Removed the unhelpful authoritative/cache marketing statement. | README audit. |
| UC-15 | Demo tokens use only `demo:` storage and public JSON omits them. | `@claim:seat-token-private`; live storage capture. |
| UC-16 | Browser traffic must be same-origin; fonts and images are self-hosted. | `@claim:no-ads`; live network replay. |
| UC-17 | Only tested health identity and rate-limit behavior remain documented. | `@claim:server-health-and-limits`; live health and 100-request burst. |
| UC-18 | Unsupported accessibility marketing was removed; functional coverage remains. | structure keyboard/touch tests; axe 0 serious/critical; reduced-motion CSS. |
| UC-19 | Offline sample play changes local state without a request. | `@claim:demo-offline`. |
| UC-20 | Unsupported sale/share and 90-day promises remain removed. | Privacy audit. |
| UC-21 | No age, contact, location, account, or chat inputs occur in demo. | `@claim:no-account`, `@claim:no-strangers-or-payments`. |
| UC-22 | No payments, gambling, prizes, matchmaking, or chat surfaces occur. | `@claim:no-strangers-or-payments`. |
| UC-23 | Original-art source, sidecar, design record, and shipped files are audited. | `@claim:artwork-provenance`. |

## Earlier independent verification findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| Verification-1 P0 / Verification-2 P0 | Shared production storage and process replacement fixes remain intact; demo storage is separately memory-only. | Rust replica, restart, and demo storage tests. |
| Verification-1 P1 routes | Browser deep links return 200 and unknown paths return styled 404. | Rust `direct_spa_routes…`; browser route test; live crawl. |
| Verification-1 P1 build / Verification-2 P1 build | Docker build args feed `/health`; the deployed candidate reported the exact source SHA. | Live `/health` returned `d3fcfc7e10d49b436e588f606eaa608848ff1a95`. |
| Verification-2 P1 test | Installed SQLx drivers remain initialized before router tests. | Clean-clone `npm test`: 14 Rust tests passed. |
| Verification-1 P2 | Every tested mobile header/footer target is at least 44 × 44px. | Mobile target geometry test and live 390px replay. |
| Verification-1 P3 cache | Hashed assets remain immutable; shell/API policies remain revalidation/no-store. | Rust `cache_policy_is_immutable…`; live response checks. |
| Verification-1 P3 errors | Malformed game JSON retains a plain product error. | Rust `malformed_game_json_has_a_product_error…`. |

## Aggregate evidence

- Clean clone: `npm ci`, `npm test`, `npm run build`, then all 14 claim
  commands individually: pass.
- Full suite: 14 Rust + 3 Vitest + 19 Playwright tests: pass.
- Accessibility: four mobile screens, 0 serious/critical axe findings.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100,
  SEO 100; LCP 1.8s, CLS 0.038, TBT 0ms.
- Bundle: 25.53 KB JS and 18.78 KB CSS raw; local fonts total 71.35 KB.
- Live routes: `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, robots, and
  sitemap return 200; unknown route returns 404.
- Live rate burst: 60 × 200 and 40 × 429, with `Retry-After` on limited
  responses.

No finding is deferred.
