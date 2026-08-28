-- Isolated sample workspaces. These records are never queried by production
-- room endpoints; deployed replicas use the matching `demo/` Blob prefix.
CREATE TABLE IF NOT EXISTS demo_rooms (
  id TEXT PRIMARY KEY NOT NULL,
  state_json TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS demo_rooms_updated ON demo_rooms(updated_at);
