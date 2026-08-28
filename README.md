# Kitchen Table

Kitchen Table is an ad-free, account-free place for couples and families to
play three familiar public-domain games across their phones. Start a room,
share its six-character link, and play live or leave the board waiting for the
next turn.

- **Lantern Race** — a compact Parcheesi/Ludo-style pawn race for 2–4 players.
- **Make a Square** — dots and boxes for two players.
- **High Five** — a five-dice score-sheet game for two players.

There is no matchmaking, chat, advertising, analytics, or account profile.
Nicknames, room state, and random seat tokens are stored privately. In
production, Azure Blob Storage is the authoritative room store and every write
uses an ETag compare-and-swap so a room keeps working across replicas and
restarts. SQLite is a local development cache. Seat tokens stay in the
browser's local storage.

## Run locally

Requirements: Node 22+, npm, and Rust 1.85+.

```sh
npm ci
npm run build
DATABASE_URL='sqlite://kitchen-table.db?mode=rwc' cargo run
```

Open `http://localhost:8080`. For frontend development, run `npm run dev` in a
second terminal; Vite proxies API requests to port 8080.

## Test and build

```sh
npm test
npm run build
cargo build --release
```

The web build lands in `frontend/dist/`. The production container serves that
directory and the API together on `PORT` (default `8080`).

```sh
docker build -t kitchen-table .
docker run --rm -p 8080:8080 -v kitchen-table-data:/data kitchen-table
```

`PORT` defaults to `8080`; `DATABASE_URL`, `BUILD_SHA`, and `RUST_LOG` are
optional overrides. The production image uses the Container App's managed
identity (no storage key or browser credential) and reports its injected build
SHA at `/health`. Health checks are available at `/health`.

## Privacy and accessibility

The service loads no third-party scripts, fonts, or trackers. Fonts and the
original generated artwork are shipped locally. `/privacy` and `/terms`
describe the small amount of room data retained. The interface has semantic
controls, keyboard focus, live turn announcements, reduced-motion support, and
a mobile-first game layout.

## License

Code is released under the MIT License. Generated artwork is original to this
product; see `.factory/design.md` for provenance.
