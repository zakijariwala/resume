#!/usr/bin/env node --experimental-strip-types
/**
 * Resume variant CLI.
 *
 *   upload <slug> <label> <file>   put a PDF in R2 and register it in D1
 *   link   <company> <role> <slug> mint an application + token for a variant
 *   opens  [slug]                  show recorded opens
 *
 * Every command targets the LOCAL emulated database by default. Pass --remote
 * to act on production. That default is deliberate: an accidental run should
 * touch a throwaway file on disk, not the real bucket.
 *
 * The upload path is the only way a non-"product" variant reaches the world.
 * Those PDFs must never be added to the repo or public/ — see docs/cloudflare.md.
 */
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { basename } from 'node:path';

const CONFIG = 'worker/wrangler.toml';
const DB_NAME = 'zakijariwala';

const argv = process.argv.slice(2);
const remote = argv.includes('--remote');
const args = argv.filter((a) => a !== '--remote');
const target = remote ? '--remote' : '--local';

function wrangler(cmd: string[], capture = false): string {
  const full = [...cmd, `--config`, CONFIG, target];
  if (!capture) console.log(`  $ wrangler ${full.join(' ')}`);
  return execFileSync('npx', ['wrangler', ...full], {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  }) as unknown as string;
}

function sql(statement: string, capture = false): string {
  return wrangler(['d1', 'execute', DB_NAME, '--command', statement], capture);
}

/** Single-quote escaping for the few literals this CLI interpolates. All of
 *  them are operator-supplied on a trusted machine, never request input. */
const q = (v: string) => `'${v.replace(/'/g, "''")}'`;

function upload(slug: string, label: string, file: string): void {
  if (!slug || !label || !file) die('usage: upload <slug> <label> <file.pdf>');
  if (slug === 'product') {
    die('the "product" variant is served from the repository and has no R2 object');
  }
  if (!existsSync(file)) die(`no such file: ${file}`);
  if (!file.toLowerCase().endsWith('.pdf')) die('expected a .pdf');

  const key = `resumes/${slug}.pdf`;
  const size = statSync(file).size;
  console.log(`Uploading ${basename(file)} (${(size / 1024).toFixed(0)} KB) to r2://${key}`);

  wrangler([
    'r2', 'object', 'put', `zakijariwala-assets/${key}`,
    '--file', file,
    '--content-type', 'application/pdf',
  ]);

  sql(
    `INSERT INTO resume_variants (slug, label, r2_key) VALUES (${q(slug)}, ${q(label)}, ${q(key)})
     ON CONFLICT(slug) DO UPDATE SET label = excluded.label, r2_key = excluded.r2_key`,
  );
  console.log(`\nRegistered variant "${slug}". It is reachable only through a token URL.`);
}

function link(company: string, role: string, slug: string): void {
  if (!company || !role || !slug) die('usage: link <company> <role> <variant-slug>');
  // 128 bits, URL-safe. Matches the worker's token pattern.
  const token = randomBytes(16).toString('base64url');
  sql(
    `INSERT INTO applications (company, role, variant_id, token, status)
     SELECT ${q(company)}, ${q(role)}, v.id, ${q(token)}, 'drafted'
       FROM resume_variants v WHERE v.slug = ${q(slug)}`,
  );
  const origin = remote ? 'https://zakijariwala.space' : 'http://127.0.0.1:8788';
  console.log(`\n${company} — ${role}\n${origin}/r/${token}`);
}

function opens(slug?: string): void {
  const where = slug ? `WHERE v.slug = ${q(slug)}` : '';
  sql(
    `SELECT a.company, a.role, v.slug, COUNT(o.id) AS opens, MAX(o.opened_at) AS last_open
       FROM applications a
       JOIN resume_variants v ON v.id = a.variant_id
       LEFT JOIN resume_opens o ON o.application_id = a.id
       ${where}
      GROUP BY a.id ORDER BY last_open DESC`,
  );
}

function die(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}

const [cmd, ...rest] = args;
switch (cmd) {
  case 'upload': upload(rest[0], rest[1], rest[2]); break;
  case 'link':   link(rest[0], rest[1], rest[2]); break;
  case 'opens':  opens(rest[0]); break;
  default:
    console.log(`resume variant CLI (default target: local, pass --remote for production)

  npm run resume -- upload <slug> <label> <file.pdf>
  npm run resume -- link <company> <role> <variant-slug>
  npm run resume -- opens [variant-slug]`);
    process.exit(cmd ? 1 : 0);
}
