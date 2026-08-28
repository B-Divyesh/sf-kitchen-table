# Kitchen Table

Play family games on separate phones with no account or ads. Make a room, share
its link, and continue from the same board.

Choose from three family games:

- **Lantern Race**
- **Make a Square**
- **High Five**

Try the isolated sample at `/demo` or `/?demo=1`. It opens a Make a Square game
with Alex and Ravi, claimed squares, and an open move. Create a sample link to
test two phones without touching a real room. Demo state uses only `demo:`
browser keys and an ephemeral in-memory workspace. See `.factory/demo.md`.

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

The container serves the frontend and API together on PORT (default 8080). It
uses `/data` when no database location is supplied.

    docker build --build-arg BUILD_SHA=local -t kitchen-table .
    docker run --rm -p 8080:8080 -v kitchen-table-data:/data kitchen-table

`/health` returns the build SHA. The server rate-limits every route other than
that health check.

## License

Code is released under the MIT License. The original generated artwork and its
provenance are documented in .factory/design.md.
