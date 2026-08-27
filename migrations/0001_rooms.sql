CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY NOT NULL,
  state_json TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS rooms_updated ON rooms(updated_at);
