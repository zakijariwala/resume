-- Phase 4: tracked resume delivery.
--
-- Privacy is part of the schema, not a policy layered on top: there is no
-- column that can hold an IP address, and none that can hold a raw
-- user-agent string. What cannot be stored cannot leak.

CREATE TABLE IF NOT EXISTS resume_variants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  -- NULL means "served from the repository's public/ directory".
  -- Any non-NULL key lives in R2 and never enters the repo.
  r2_key     TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  company    TEXT NOT NULL,
  role       TEXT NOT NULL,
  variant_id INTEGER NOT NULL REFERENCES resume_variants(id),
  token      TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status     TEXT NOT NULL DEFAULT 'drafted'
);

CREATE TABLE IF NOT EXISTS resume_opens (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id    INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  opened_at         TEXT NOT NULL DEFAULT (datetime('now')),
  -- Two-letter country code from the Cloudflare request property. Never an IP.
  coarse_country    TEXT,
  -- A coarse family such as 'Chrome' or 'Safari'. Never the raw header.
  user_agent_family TEXT
);

-- Token lookup is the hot path on every /r/:token request.
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_token ON applications(token);
-- Serves both the 10-minute dedupe probe and the retention sweep.
CREATE INDEX IF NOT EXISTS idx_resume_opens_app_time ON resume_opens(application_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_opens_time ON resume_opens(opened_at);

-- The two launch variants.
-- 'product' is the PDF already in public/ and keeps serving from there.
-- 'infrastructure' resolves to an R2 object that is uploaded separately with
-- `npm run resume:upload`; until then its token URL returns 404, by design.
INSERT INTO resume_variants (slug, label, r2_key) VALUES
  ('product',        'Product / AI PM',            NULL),
  ('infrastructure', 'Infrastructure / Systems',   'resumes/infrastructure.pdf')
ON CONFLICT(slug) DO NOTHING;
