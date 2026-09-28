-- Projects discovered by sync. Content columns are overwritten by sync;
-- visibility columns (visible, featured, feature_order, deep_dive, pinned) never are.
CREATE TABLE projects (
  slug            TEXT PRIMARY KEY,
  repo            TEXT NOT NULL,
  repo_meta       TEXT NOT NULL,            -- JSON RepoMeta
  title           TEXT NOT NULL,
  publish         INTEGER NOT NULL,         -- from the file
  size            TEXT NOT NULL DEFAULT 'medium',
  project_md      TEXT NOT NULL,
  deep_dive_md    TEXT,
  media           TEXT NOT NULL DEFAULT '{}',  -- JSON path -> /media/... URL
  content_hash    TEXT NOT NULL,
  source_commit   TEXT,
  commits_since   INTEGER,                  -- commits on HEAD since generated.commit
  source_missing  INTEGER NOT NULL DEFAULT 0,
  issues          TEXT NOT NULL DEFAULT '[]',  -- JSON string[] from last sync
  pending_md      TEXT,                     -- newer content held back while pinned
  pending_dd_md   TEXT,
  synced_at       TEXT NOT NULL,
  visible         INTEGER NOT NULL DEFAULT 1,
  featured        INTEGER NOT NULL DEFAULT 0,
  feature_order   INTEGER NOT NULL DEFAULT 0,
  deep_dive       INTEGER NOT NULL DEFAULT 1,
  pinned          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE sync_runs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at   TEXT NOT NULL,
  finished_at  TEXT,
  result       TEXT NOT NULL,               -- ok | partial | failed
  summary      TEXT NOT NULL DEFAULT '{}',  -- JSON {changed, added, missing, errors}
  token_expiry TEXT
);

CREATE TABLE resume_files (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  r2_key      TEXT NOT NULL,
  size        INTEGER NOT NULL,
  is_main     INTEGER NOT NULL DEFAULT 0,
  uploaded_at TEXT NOT NULL
);

CREATE TABLE resume_links (
  token       TEXT PRIMARY KEY,
  file_id     TEXT NOT NULL REFERENCES resume_files(id) ON DELETE CASCADE,
  recipient   TEXT NOT NULL,
  note        TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  revoked_at  TEXT
);

CREATE TABLE resume_events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  token    TEXT,                            -- null for the public download
  file_id  TEXT,
  kind     TEXT NOT NULL,                   -- download | view
  at       TEXT NOT NULL,
  country  TEXT,
  ua       TEXT
);
CREATE INDEX resume_events_token ON resume_events(token, at);

CREATE TABLE messages (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  email    TEXT NOT NULL,
  body     TEXT NOT NULL,
  at       TEXT NOT NULL,
  ip_hash  TEXT NOT NULL,
  read_at  TEXT
);
CREATE INDEX messages_ip ON messages(ip_hash, at);

CREATE TABLE settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL                      -- JSON
);

CREATE TABLE deploys (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  requested_at TEXT NOT NULL,
  reason       TEXT NOT NULL,
  ok           INTEGER NOT NULL,
  detail       TEXT
);
