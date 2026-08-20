-- Initial migration. Intentionally schema-free: Phase 3 is infrastructure
-- only, and the resume-delivery tables arrive in Phase 4.
--
-- A migration cannot be empty (wrangler records it but D1 needs a statement),
-- so this creates the marker table the health check reads to prove the
-- binding works end to end rather than merely being present.
CREATE TABLE IF NOT EXISTS _platform_meta (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO _platform_meta (key, value)
VALUES ('bootstrap', 'phase-3')
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now');
