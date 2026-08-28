# Kitchen Table

Play family games on separate phones with no account or ads. Make a room, share
its link, and take turns from the same board.

Choose from three family games:

- **Lantern Race** — race two pawns around a shared path with 2–4 players.
- **Make a Square** — add lines and claim completed squares with two players.
- **High Five** — roll five dice and fill score rows with two players.

Try the isolated sample at /demo. It starts a Make a Square game with Alex and
Ravi. Demo state stays in a demo: browser key and is never copied to a real
room. See .factory/demo.md.

Kitchen Table has no account, ads, matchmaking, chat, payments, or analytics.
Room creation explains the stored fields before it sends a request. See /privacy
and /terms.

## Run locally

Requirements: Node 22+, npm, and Rust 1.85+.

    npm ci
    npm run build
    cargo run

Open http://localhost:8080. For frontend development, run npm run dev in
another terminal; Vite proxies API requests to port 8080.

## Test and build

    npm test
    npm run build
    cargo build --release

npm test runs Rust unit/integration tests, Vitest scoring tests, a production
frontend build, and the browser claim suite. The claim registry is
.factory/claims.json; each command there can also run on its own.

The container serves the frontend and API together on PORT (default 8080). With
no configuration, SQLite is stored under /data.

    docker build --build-arg BUILD_SHA=local -t kitchen-table .
    docker run --rm -p 8080:8080 -v kitchen-table-data:/data kitchen-table

/health returns the build SHA. The server rate-limits every route other than
that health check.

## License

Code is released under the MIT License. The original generated artwork and its
provenance are documented in .factory/design.md.
