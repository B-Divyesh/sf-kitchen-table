# Adversarial first-read review 1 — Kitchen Table

**Verdict: FAIL**

Reviewed 28 August 2026 against live URL
<https://kitchen-table.sociobot.in>, repository base
`9764adc950082faf5c3cc1d93750ea3589316cfd`, and live `/health` build
`b5c6182a4e0dfd1ed27cd795fadaf62caec1b8b3`.

The result has five blocking findings. The site has no one-click sandbox, no
claims registry or claim-tagged tests, an absolute storage statement that
contradicts its Privacy page, a blank 404, and no visible desktop action before
scrolling. PASS requires zero blocking findings and no more than three minor
findings.

## Cold first screen, before scrolling

Fresh Chromium contexts were used with service workers blocked and empty
storage. The phone viewport was 390 × 844; desktop was 1440 × 900.

| View | What I think it does | For whom | What I would click first | Result |
| --- | --- | --- | --- | --- |
| 390 px | Lets people play three turn-based games on separate phones through one room link. | Families in one room or apart. | **Choose a game** to host; **Join with a code** if invited. | Understandable, but the three trust facts are below the fold. |
| Desktop | Same product and audience. | Families, inferred from “Family, not strangers.” | No action is visibly available. **Choose a game** starts at y=899 in a 900 px viewport. | **BLOCKING**: the first screen does not answer what to click without scrolling. |

Exact first-screen copy:

> “Link, not app. Family, not strangers.”
>
> “Game night, wherever everyone is.”
>
> “Three familiar games for the phones already in your pockets. Make a room,
> share one link, and take turns together—or tomorrow.”

The headline is mood copy, not the job in the visitor’s words. The paragraph
does recover the product and audience on both sizes. It does not name a next
step. On desktop the action that supplies that answer is below the viewport.

## Findings, ordered by severity

### BLOCKING B1 — Desktop has no visible first action

**Quote:** “Game night, wherever everyone is.” and “Three familiar games for
the phones already in your pockets. Make a room, share one link, and take turns
together—or tomorrow.”

**Why this loses a first-time visitor:** At 1440 × 900, the first actionable
control begins at y=899. The visitor can infer the product but cannot answer
“what should I click first?” before scrolling. The headline also does not state
the job directly. The three promised facts are below the fold on both tested
viewports.

**Concrete fix:** Use the headline **“Play family games on separate phones”**.
Place **“Try it with sample data”** and its outcome beside the lede inside the
initial desktop viewport. Keep three visible facts there: **“No ads”**, **“No
account”**, and **“Return to the same room later.”** Reduce the desktop hero’s
type/image height so the actions are fully visible at 900 px.

### BLOCKING B2 — There is no one-click demo or isolated demo storage

**Quote:** The primary action is “Choose a game.” It changes the URL to
`/#games`, scrolls to marketing cards, and shows no game in use. `/demo` returns
404 with a zero-byte body. `/?demo=1` renders the ordinary landing page.

**Why this loses or risks a first-time visitor:** The visitor cannot see a
realistic room, board, players, or turn state without creating real backend
data and involving another player. There is no **“Demo — sample data, nothing
is saved”** banner, **Reset demo**, or **Start for real**. Therefore demo reset,
separate storage, preservation of real data, and offline sample behavior cannot
be verified. Submitting the normal form would write to production, so this
review did not do that.

**Concrete fix:** Add a first-screen **“Try it with sample data”** action and a
real `/demo` route. Open a seeded two-player game with realistic names, moves,
scores, and a current turn already visible. Use a `demo:` storage namespace or
an ephemeral backend tenant. Keep the required banner, **Reset demo**, and
**Start for real** visible on every demo screen. Document the seed and namespace
in `.factory/demo.md` and test that no production endpoint or `kt:` key is used.

### BLOCKING B3 — The claims contract is absent; every product claim is unlisted

**Quote:** `.factory/claims.json` does not exist, and the repository contains
zero `@claim:` test tags.

**Why this misleads a first-time visitor:** Statements about ads, accounts,
privacy, persistence, timing, storage, accessibility, and backend durability
have no verifier-defined evidence. There were no listed claim commands to run,
so “run every listed test” produced a set of zero tests. The ordinary unit suite
does not substitute for the required claim mapping.

**Concrete fix:** Add one registry entry and exactly one tagged observable test
for each claim below. Reuse a claim ID for exact repeats across routes, but list
every location. Delete subjective or untestable wording.

Each row below is an unlisted-claim finding:

| ID | Quote and location | Why a visitor may rely on it | Required fix/test |
| --- | --- | --- | --- |
| UC-01 | Title: “family games, no accounts”; meta: “Three quiet family games. Share a link, skip the accounts and ads.” | Search and share previews promise the core product and privacy model. | Register the three-games, share-link, no-account, and no-ad outcomes; remove “quiet.” |
| UC-02 | Landing: “No ads.” / “Always ad-free”; README: “ad-free” | This is an absolute monetization/privacy promise. | Demo test must assert no ad UI and no ad/third-party network origins. |
| UC-03 | Landing: “No accounts.” / “No sign-up”; README: “account-free” | This promises play without identity setup. | Demo test must enter and play without signup, login, email, or account API calls. |
| UC-04 | Landing: “Three familiar games for the phones already in your pockets.”; README: “play three … games across their phones.” | This promises a count and multi-phone support. | Test all three game kinds in two isolated browser contexts; remove “familiar.” |
| UC-05 | Landing: “Make a room, share one link, and take turns together—or tomorrow.”; README: “play live or leave the board waiting for the next turn.” | This promises room creation, sharing, live play, and async resume. | Test create → join by link → move → fresh-context reload/resume. |
| UC-06 | Landing/README Lantern Race player count, 15-minute estimate, and rules | Families may choose it based on capacity, duration, and behavior. | Test 2–4 seats and observable rules. Measure or remove “15 min.” |
| UC-07 | Landing/README Make a Square player count, 10-minute estimate, and rules | Families may choose it based on capacity, duration, and behavior. | Test two seats, line/box/extra-turn behavior. Measure or remove “10 min.” |
| UC-08 | Landing/README High Five player count, 15-minute estimate, rolls, holds, and scoring | Families may choose it based on capacity, duration, and behavior. | Test two seats, three-roll limit, holds, and scoring. Measure or remove “15 min.” |
| UC-09 | Landing: “Turns wait for you” and “The board waits exactly where it was.” | This promises persistence across time and reloads. | Test a demo move, reload/new context, and exact restored board state. |
| UC-10 | Landing: “No email, profile, or install.”; README: “no matchmaking, chat, advertising, analytics, or account profile.” | These are specific absence and privacy claims. | Intercept the full demo flow and assert no such UI, fields, endpoints, or external requests. |
| UC-11 | Landing form: “A nickname is all we store. You’ll get a private seat on this device.” | This is a direct statement about stored data. | Replace the false first sentence as specified in B4; test exact local and backend fields. |
| UC-12 | README: “Nicknames, room state, and random seat tokens are stored privately.” | “Privately” implies access controls a visitor cannot inspect. | Define “private,” then test public responses omit tokens and unauthorized writes fail. |
| UC-13 | README: Azure Blob Storage, ETag compare-and-swap, replica, and restart durability sentence | Operators may rely on room correctness through concurrency and restarts. | Add a clean integration test covering two replicas, concurrent writes, and process replacement. |
| UC-14 | README: “SQLite is a local development cache.” | Operators may rely on production not treating SQLite as authoritative. | Add a configuration test for local versus production storage selection. |
| UC-15 | README: “Seat tokens stay in the browser’s local storage.” | This is a data-location promise. | Intercept a demo flow and assert the token is only in the named browser namespace and never in public room JSON. |
| UC-16 | README: “The service loads no third-party scripts, fonts, or trackers” and “Fonts and the original generated artwork are shipped locally.” | Visitors may rely on no third-party disclosure. | Route-intercept every demo request and assert same-origin only; verify every font/image URL. |
| UC-17 | README: managed identity, no storage key/browser credential, injected SHA, and `/health` statements | Operators may rely on credential handling and deploy identity. | Split the claims and test response/configuration evidence without exposing a secret. |
| UC-18 | README: semantic controls, keyboard focus, live turn announcements, reduced motion, and mobile-first layout | Disabled visitors may rely on keyboard and assistive behavior. | Add keyboard, focus, live-region, 200% zoom, 390 px, and reduced-motion claim tests. |
| UC-19 | Offline banner: “Your open game stays here; moves resume when you reconnect.” | A disconnected player may rely on state and queued/resumed moves. | Test this in the isolated demo with network offline; assert state remains and define whether moves queue or merely retry. |
| UC-20 | Privacy: “Room data is not sold or shared” and “Rooms are removed after 90 days without a game action.” | These are privacy and quantitative retention promises. | Add policy/storage tests, including expiry at 90 days, or remove the numeric promise. |
| UC-21 | Privacy: “The game does not ask for age, contact details, chat, or location.” | Parents may rely on the data-minimization promise. | Exercise every demo input and intercepted request; assert those fields never appear. |
| UC-22 | Terms: “Kitchen Table is a free family game service” and “There is no gambling, matchmaking, chat, or prize.” | Visitors may decide to use the product based on cost and child-safety boundaries. | Add UI/API/network tests for no payment or prohibited features. |
| UC-23 | README/footer/Terms: generated artwork is original and public-domain mechanics use original presentation. | This is a provenance and licensing claim. | Add the provenance record to the registry with a source-file/license audit, or limit copy to the documented facts. |

Independent evidence does not cure the missing contract: intercepted cold-load
requests were same-origin only, and a warmed service worker reloaded the shell
offline. Neither check exercised a demo game because no demo exists.

### BLOCKING B4 — The form makes a false absolute storage statement

**Quote:** “A nickname is all we store.”

**Why this misleads a first-time visitor:** The live Privacy page says the
service also stores “a room code, player nicknames, game moves and a random
private seat token.” The README likewise says room state and tokens are stored.
The form’s absolute sentence contradicts both disclosures at the moment a user
is deciding whether to create a room.

**Concrete fix:** Replace it with **“We store your nickname, game moves, room
code, and a random seat token.”** Follow with **“Your browser stores the token
so you can return to your seat.”** Add a storage claim test.

### BLOCKING B5 — Unknown routes are blank, not designed 404 pages

**Quote:** `GET /not-a-real-route` returns HTTP 404, `Content-Length: 0`, no
title, no `<main>`, and no `<h1>`. `/demo` fails the same way.

**Why this loses a first-time visitor:** A mistyped or stale shared URL gives no
product identity, explanation, or route home. The supplied structure rubric
explicitly treats broken routing as blocking.

**Concrete fix:** Serve a styled 404 with title **“Page not found — Kitchen
Table”**, one h1 **“This table is not here”**, and links to **Choose a game** and
**Join a room**. Preserve HTTP 404.

### MAJOR M1 — The documented clean install fails

**Quote:** README says `npm ci`; `package-lock.json` is ignored and absent from
the clean clone.

**Why this blocks verification:** `npm ci` exits with `EUSAGE` before any test
can run. A new contributor cannot follow the documented path exactly.

**Concrete fix:** Track the lockfile that matches `package.json`, then verify
`npm ci && npm test && npm run build` from a fresh clone.

Fallback evidence: `npm install --no-package-lock`, `npm test`, and
`npm run build` passed from the clean clone (12 Rust tests, 3 Vitest tests;
18.49 kB JS / 7.26 kB gzip). These are not claim-tagged tests.

### MAJOR M2 — Route metadata and discovery files are incomplete

**Quote:** `/privacy` and `/terms` both retain “Kitchen Table — family games,
no accounts.” There is no canonical URL, Open Graph metadata, Twitter card,
1200 × 630 share image, or Apple touch icon. `/robots.txt` and `/sitemap.xml`
return 404. `staticwebapp.config.json` is absent.

**Why this misleads or weakens navigation:** Legal pages are mislabeled in
tabs/history and share previews. Crawlers cannot identify canonical routes or
a site map, and installed iOS shortcuts lack the required icon.

**Concrete fix:** Set **“Privacy — Kitchen Table”** and **“Terms — Kitchen
Table”** with route-specific descriptions/canonicals. Add complete OG/Twitter
metadata and original 1200 × 630 art, SVG plus 180 px Apple icons,
`robots.txt`, `sitemap.xml`, and the required routing/security config.

### MAJOR M3 — SPA navigation and the skip link do not move focus

**Quote:** After activating Privacy, `document.activeElement` is `<body>`, the
new h1 is not focused, the title is unchanged, and scroll remains at y=460.
After Back, focus is still `<body>`. Activating “Skip to the game” also leaves
focus on `<body>` rather than `<main>`.

**Why this loses keyboard and screen-reader users:** The new page is not
announced at its start, and a keyboard user can land midway through legal copy.
The skip link changes the hash but does not establish a useful focus position.

**Concrete fix:** Give `<main>` `tabindex="-1"`; focus it for the skip link.
After each push/pop route, set the route title, scroll new navigations to the
top, focus the new h1, and announce it through a dedicated polite live region.
Preserve scroll only for history restoration.

### MAJOR M4 — Header/footer and landing information order miss required parts

**Quote:** The header contains only the wordmark and “No ads. No accounts. Just
your people.” The footer contains “Made for family tables,” Privacy, and Terms.

**Why this limits orientation:** There is no persistent Demo or Privacy header
navigation, no live product preview, no explicit “what it does not do” section,
and no “Built by Param Factory” or version/build ID in the footer.

**Concrete fix:** Add header links for Demo and Privacy; place the working demo
immediately after the hero; add a plain limitations/privacy section; include
the required factory credit and build ID on every route.

### MAJOR M5 — The deletion instruction has no usable contact

**Quote:** “To request early deletion, contact the operator listed in the
deployment’s site notice.”

**Why this misleads a visitor:** No site notice or operator contact appears in
the header, footer, Privacy page, or Terms page. The stated deletion path cannot
be followed.

**Concrete fix:** Name a working contact method directly on `/privacy` and test
the link. If early deletion is not currently supported, remove the promise and
state the actual retention behavior.

## Plain-words findings and rewrites

Word counts use whitespace-separated displayed words. Headings, labels,
buttons, metadata, image alt text, the revealed create/join copy, and the
offline banner are included because a visitor encounters them on the landing
route. Commands and code blocks are not sentences.

### Flagged copy findings

Each item is a finding with a concrete rewrite.

1. **PW-01 — headline does not name the job.** Quote: “Game night, wherever
   everyone is.” Why: it is mood copy and does not identify phones, family, or
   turns out of context. Rewrite: **“Play family games on separate phones.”**
2. **PW-02 — vague marketing adjective in metadata.** Quote: “Three quiet
   family games.” Why: “quiet” is subjective and not a useful outcome. Rewrite:
   **“Three family games for separate phones.”**
3. **PW-03 — vague marketing adjective on landing/README.** Quote: “Three
   familiar games …” Why: the renamed games are not familiar to a new visitor.
   Rewrite: **“Play a pawn race, dots and boxes, or a five-dice game.”**
4. **PW-04 — vague section heading.** Quote: “Small rules. Real turns.” Why:
   it does not identify the section in a heading list. Rewrite: **“Choose from
   three family games.”**
5. **PW-05 — repeated button does not name its result.** Quote: “Set this game”
   on all three cards. Why: three identical accessible names hide which game
   will be selected. Rewrite each as **“Choose Lantern Race”**, **“Choose Make a
   Square”**, and **“Choose High Five.”**
6. **PW-06 — the same session has two names.** Quotes: “Make a room,” “Room
   code,” “Find the table,” and “Your seat at the table.” Why: “room” and
   “table” alternately name the shared session. Rewrite controls with **room**:
   **“Find the room”** and **“Your seat in the room.”** Keep Kitchen Table only
   as the product name.
7. **PW-07 — related absence claims use three terms.** Quotes: “No accounts,”
   “No sign-up,” and “no account profile”; README also switches “ads” to
   “advertising.” Why: duplicate terms make visitors wonder whether they mean
   different things. Use **“No account”** and **“No ads”** everywhere.
8. **PW-08 — grammar is incomplete.** Quote: “What should family call you?”
   Why: it omits whose family. Rewrite: **“What should your family call you?”**
9. **PW-09 — link persistence is metaphorical.** Quote: “One room link keeps
   the turn.” Why: a link does not literally keep a turn. Rewrite: **“Return
   through the same link to continue the game.”**
10. **PW-10 — README uses a marketing adjective and game-name jargon.** Quote:
    “a compact Parcheesi/Ludo-style pawn race.” Why: “compact” is subjective
    and the paired brand-like names require prior knowledge. Rewrite: **“Race
    two pawns around a shared path with 2–4 players.”**
11. **PW-11 — README privacy sentence uses unexplained terms.** Quote:
    “Nicknames, room state, and random seat tokens are stored privately.” Why:
    “room state,” “seat tokens,” and “privately” do not say what is stored or
    who can read it. Rewrite: **“We store nicknames, game moves, and random
    browser tokens needed to reopen a room.”**
12. **PW-12 — README sentence is over 22 words and jargon-heavy.** Quote: “In
    production, Azure Blob Storage is the authoritative room store and every
    write uses an ETag compare-and-swap so a room keeps working across replicas
    and restarts.” (26 words.) Why: several backend terms are unexplained and
    the purpose arrives last. Rewrite: **“Azure Blob Storage holds production
    rooms. Each update checks the current version so two servers cannot
    overwrite the same turn.”**
13. **PW-13 — README sentence is over 22 words and jargon-heavy.** Quote: “The
    production image uses the Container App’s managed identity (no storage key
    or browser credential) and reports its injected build SHA at /health.” (23
    words.) Why: it combines credential handling and build identity. Rewrite:
    **“Production accesses storage through its managed identity; no storage key
    reaches the browser. `/health` reports the deployed build SHA.”**
14. **PW-14 — README accessibility copy is jargon-heavy.** Quote: “The
    interface has semantic controls, keyboard focus, live turn announcements,
    reduced-motion support, and a mobile-first game layout.” Why: “semantic,”
    “reduced-motion,” and “mobile-first” describe implementation rather than
    observable behavior. Rewrite: **“Buttons and fields work by keyboard. Turn
    changes are announced. Animations stop when a device requests less motion.
    The layout fits phones.”**
15. **PW-15 — README uses a vague quantity.** Quote: “the small amount of room
    data retained.” Why: “small” hides the actual fields and retention time.
    Rewrite: **“Privacy and Terms list the stored room data and its 90-day
    inactive retention period.”**
16. **PW-16 — the storage sentence is absolute and contradicted.** Quote: “A
    nickname is all we store.” Why and rewrite are in B4.

No attached-skill banned words were found. All sentence bodies are at or below
22 words except README rows R09 and R20.

### Landing-page copy audit

| ID | Exact text | Words | Flag |
| --- | --- | ---: | --- |
| L01 | Kitchen Table — family games, no accounts | 7 | PW-07 |
| L02 | Three quiet family games. | 4 | PW-02 |
| L03 | Share a link, skip the accounts and ads. | 8 | PW-07 |
| L04 | Skip to the game | 4 | — |
| L05 | Kitchen Table | 2 | — |
| L06 | No ads. | 2 | PW-07, UC-02 |
| L07 | No accounts. | 2 | PW-07, UC-03 |
| L08 | Just your people. | 3 | — |
| L09 | Link, not app. | 3 | — |
| L10 | Family, not strangers. | 3 | — |
| L11 | Game night, wherever everyone is. | 5 | PW-01 |
| L12 | Three familiar games for the phones already in your pockets. | 10 | PW-03, UC-04 |
| L13 | Make a room, share one link, and take turns together—or tomorrow. | 11 | UC-05 |
| L14 | Choose a game | 3 | B2 |
| L15 | Join with a code | 4 | — |
| L16 | Always ad-free | 2 | UC-02 |
| L17 | No sign-up | 2 | PW-07, UC-03 |
| L18 | Turns wait for you | 4 | UC-09 |
| L19 | Pick tonight’s game | 3 | — |
| L20 | Small rules. | 2 | PW-04 |
| L21 | Real turns. | 2 | PW-04 |
| L22 | 2–4 players · 15 min | 5 | UC-06 |
| L23 | Lantern Race | 2 | — |
| L24 | Bring two pawns around the shared path. | 7 | UC-06 |
| L25 | Roll a six to enter; send rivals back to the porch. | 11 | UC-06 |
| L26 | Set this game | 3 | PW-05 |
| L27 | 2 players · 10 min | 5 | UC-07 |
| L28 | Make a Square | 3 | — |
| L29 | Add one line at a time. | 6 | UC-07 |
| L30 | Close a square to claim it—and take another turn. | 9 | UC-07 |
| L31 | Set this game | 3 | PW-05 |
| L32 | 2 players · 15 min | 5 | UC-08 |
| L33 | High Five | 2 | — |
| L34 | Roll five dice up to three times, hold your favourites, then choose one score row. | 15 | UC-08 |
| L35 | Set this game | 3 | PW-05 |
| L36 | Across the sofa or across town | 6 | — |
| L37 | One room link keeps the turn. | 6 | PW-09, UC-09 |
| L38 | Make a room | 3 | — |
| L39 | Choose a game and a nickname. | 6 | — |
| L40 | No email, profile, or install. | 5 | PW-07, UC-10 |
| L41 | Pass the link | 3 | — |
| L42 | Send it to family however you already talk. | 8 | UC-05 |
| L43 | Play at your pace | 4 | — |
| L44 | Leave and return later. | 4 | UC-05 |
| L45 | The board waits exactly where it was. | 7 | UC-09 |
| L46 | A warm evening kitchen table set with wooden pawns, dice, a paper grid and two phones | 16 | — |
| L47 | Made for family tables. | 4 | — |
| L48 | Hero artwork generated for Kitchen Table. | 6 | UC-23 |
| L49 | Privacy | 1 | — |
| L50 | Terms | 1 | — |
| L51 | Room code | 2 | — |
| L52 | Find the table | 3 | PW-06 |
| L53 | Your seat at the table | 5 | PW-06 |
| L54 | Start a room | 3 | — |
| L55 | What should family call you? | 5 | PW-08 |
| L56 | A nickname is all we store. | 6 | B4, PW-16, UC-11 |
| L57 | You’ll get a private seat on this device. | 8 | PW-06, UC-11 |
| L58 | Make the room | 3 | — |
| L59 | You’re offline. | 2 | — |
| L60 | Your open game stays here; moves resume when you reconnect. | 10 | UC-19 |

### README copy audit

| ID | Exact text | Words | Flag |
| --- | --- | ---: | --- |
| R01 | Kitchen Table | 2 | — |
| R02 | Kitchen Table is an ad-free, account-free place for couples and families to play three familiar public-domain games across their phones. | 20 | PW-03, PW-07, UC-02–04 |
| R03 | Start a room, share its six-character link, and play live or leave the board waiting for the next turn. | 19 | UC-05 |
| R04 | Lantern Race — a compact Parcheesi/Ludo-style pawn race for 2–4 players. | 11 | PW-10, UC-06 |
| R05 | Make a Square — dots and boxes for two players. | 10 | UC-07 |
| R06 | High Five — a five-dice score-sheet game for two players. | 10 | UC-08 |
| R07 | There is no matchmaking, chat, advertising, analytics, or account profile. | 10 | PW-07, UC-10 |
| R08 | Nicknames, room state, and random seat tokens are stored privately. | 10 | PW-11, UC-12 |
| R09 | In production, Azure Blob Storage is the authoritative room store and every write uses an ETag compare-and-swap so a room keeps working across replicas and restarts. | 26 | PW-12, UC-13 |
| R10 | SQLite is a local development cache. | 6 | UC-14 |
| R11 | Seat tokens stay in the browser’s local storage. | 8 | PW-11, UC-15 |
| R12 | Run locally | 2 | — |
| R13 | Requirements: Node 22+, npm, and Rust 1.85+. | 7 | — |
| R14 | Open `http://localhost:8080`. | 2 | — |
| R15 | For frontend development, run `npm run dev` in a second terminal; Vite proxies API requests to port 8080. | 18 | — |
| R16 | Test and build | 3 | — |
| R17 | The web build lands in `frontend/dist/`. | 6 | — |
| R18 | The production container serves that directory and the API together on `PORT` (default `8080`). | 14 | — |
| R19 | `PORT` defaults to `8080`; `DATABASE_URL`, `BUILD_SHA`, and `RUST_LOG` are optional overrides. | 11 | — |
| R20 | The production image uses the Container App’s managed identity (no storage key or browser credential) and reports its injected build SHA at `/health`. | 23 | PW-13, UC-17 |
| R21 | Health checks are available at `/health`. | 6 | UC-17 |
| R22 | Privacy and accessibility | 3 | — |
| R23 | The service loads no third-party scripts, fonts, or trackers. | 9 | UC-16 |
| R24 | Fonts and the original generated artwork are shipped locally. | 9 | UC-16, UC-23 |
| R25 | `/privacy` and `/terms` describe the small amount of room data retained. | 11 | PW-15 |
| R26 | The interface has semantic controls, keyboard focus, live turn announcements, reduced-motion support, and a mobile-first game layout. | 17 | PW-14, UC-18 |
| R27 | License | 1 | — |
| R28 | Code is released under the MIT License. | 7 | — |
| R29 | Generated artwork is original to this product; see `.factory/design.md` for provenance. | 11 | UC-23 |

Terminology check:

| Concept | Terms found | Required single term |
| --- | --- | --- |
| Shared play session | room, table | room |
| No identity setup | account, sign-up, profile | account |
| Commercial messages | ads, advertising | ads |
| Selecting a game | choose, set | choose |

## Structure, behavior, and accessibility evidence

| Check | Result |
| --- | --- |
| Home title pattern, `lang`, one h1, one main | Pass. Home title is 41 characters; `lang="en"`; one h1 and one main. |
| Route titles | Fail. Privacy and Terms retain the home title. Blank 404 has no title. |
| Meta description | Present on home; not route-specific. |
| Canonical, OG, Twitter, share image | Missing. |
| Favicon | SVG present; 180 px Apple touch icon missing. |
| 404 | **Blocking fail:** zero-byte response with no recovery link. |
| Deep links | `/privacy` and `/terms` load; a six-character `/room/...` deep link renders an in-product result. |
| Back/route focus | Fail: focus becomes `<body>`; route h1 is not focused or announced; pushed route keeps y=460. |
| Skip link | Present and first in Tab order, 44 px tall; activation leaves focus on `<body>`. |
| Link crawl | All links exposed on home, Privacy, and Terms resolve; no dead linked URL was found. Demo is not linked and 404s. |
| Header/footer | Consistent shell, but missing required Demo/Privacy header nav, factory credit, and build ID. |
| `robots.txt`, `sitemap.xml`, routing config | Missing/404. |
| Console and layout | No console/page errors; no 390 px horizontal overflow. |
| Automated accessibility | axe 4.13 found zero WCAG A/AA violations on home, Privacy, and Terms at 390 px. |
| Reduced motion | A reduced-motion context loads without errors; the demo-specific motion path cannot be tested. |
| Network/privacy probe | Cold landing and `?demo=1` issued only same-origin GETs. No production API writes were made. |
| Offline probe | After an online controlling reload, the service worker restores the landing shell offline and shows the offline banner. No sample game exists to verify offline game behavior. |
| Visual identity | Pass. The dusk kitchen painting, Fraunces/Atkinson pairing, dark pine/honey palette, and table-like controls are distinct from a generic SaaS template and match `.factory/design.md`. |

## Verification log

- Live cold screenshots: `/tmp/kitchen-mobile-cold.png` and
  `/tmp/kitchen-desktop-cold.png` (review-container evidence; not committed).
- Fresh browser contexts: 390 × 844 and 1440 × 900; no console/page errors.
- `/demo` and unknown route: HTTP 404, zero-byte body.
- `?demo=1`: ordinary landing UI, no demo banner/reset/start-real controls,
  empty local storage, same-origin static GETs only.
- Clean clone: `/tmp/kitchen-review-clean` at the reviewed commit.
- `npm ci`: **FAIL**, missing tracked lockfile.
- `npm install --no-package-lock`: pass.
- `npm test`: pass, 12 Rust + 3 Vitest; no `@claim:` tests.
- `npm run build`: pass; output in `frontend/dist/`; JS 18.49 kB raw,
  7.26 kB gzip.
- Live axe 4.13: zero violations on `/`, `/privacy`, and `/terms` at 390 px.

## Final verdict

**FAIL.** Five blocking findings remain. A passing re-review requires a visible
one-click isolated demo, a complete claims registry with tagged tests, truthful
storage copy, a designed 404, and an actionable first desktop viewport. The
clean install, route metadata/focus, required site files, navigation skeleton,
and flagged copy also need correction.
