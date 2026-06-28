CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
