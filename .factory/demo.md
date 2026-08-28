# Demo sandbox

Open `/demo` or `/?demo=1` to enter the sample directly. It starts a Make a
Square room where Alex and Ravi have already claimed three squares. The same
screen links to playable Lantern Race and High Five samples.

Local sample state uses the `demo:kitchen-table:` namespace, including
`make-a-square`, `lantern-race`, and `high-five`. It never reads a `kt:` seat
key and never calls `/api/rooms`. **Reset demo** deletes the active sample key
and reloads its seed. **Start for real** returns to the ordinary landing page,
deletes every demo key, and does not copy sample data into a real room.

**Create sample room link** provisions a 24-hour isolated sample workspace
through `/api/demo/rooms`. In deployment, it uses the durable `demo/` storage
prefix so every replica can reopen the same sample. It is not reachable through
production room routes or stored in the production `rooms` table. Its Alex and Ravi seat tokens use
`demo:kitchen-table:seat:<code>` keys. The share flow never calls the
production `/api/rooms` routes or creates a database row.
