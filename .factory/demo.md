# Demo sandbox

Open `/demo` or `/?demo=1` to enter the sample directly. It starts a Make a
Square room where Alex and Ravi have already claimed three squares.

The sample state uses only the local-storage key
`demo:kitchen-table:make-a-square`. It never reads a `kt:` seat key and never
calls `/api/rooms`. **Reset demo** deletes that key and reloads the seed.
**Start for real** returns to the ordinary landing page, deletes the demo key,
and does not copy sample data into a real room.

**Create sample room link** provisions an in-memory sample workspace through
`/api/demo/rooms`. Its Alex and Ravi seat tokens use
`demo:kitchen-table:seat:<code>` keys. The share flow never calls the
production `/api/rooms` routes or creates a database row.
