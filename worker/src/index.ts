/// <reference types="@cloudflare/workers-types" />
import type { Env } from './env';
import { json, notFound } from './lib/http';
import { handleResume } from './resume';

/** Opens older than this are deleted by the nightly retention sweep. */
const RETENTION_DAYS = 180;

type BindingStatus = { ok: true; detail: string } | { ok: false; error: string };

/**
 * Exercises the binding rather than checking it is defined. A binding can be
 * present and still fail — wrong id, deleted database, revoked permission —
 * and that is exactly what this must catch.
 */
async function checkD1(env: Env): Promise<BindingStatus> {
  try {
    const row = await env.DB.prepare(
      "SELECT value FROM _platform_meta WHERE key = 'bootstrap'",
    ).first<{ value: string }>();
    return row
      ? { ok: true, detail: `migrations applied (${row.value})` }
      : { ok: false, error: 'query succeeded but _platform_meta is empty — migrations not applied' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function checkR2(env: Env): Promise<BindingStatus> {
  try {
    const listed = await env.ASSETS.list({ limit: 1 });
    return { ok: true, detail: `bucket reachable (${listed.objects.length} object(s) sampled)` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function health(env: Env): Promise<Response> {
  const [db, r2] = await Promise.all([checkD1(env), checkR2(env)]);
  const ok = db.ok && r2.ok;
  return json(
    { status: ok ? 'ok' : 'degraded', checked_at: new Date().toISOString(), bindings: { DB: db, ASSETS: r2 } },
    ok ? 200 : 503,
  );
}

/**
 * Retention: opens older than RETENTION_DAYS are deleted outright.
 *
 * The rows hold no identifier — a country code and a browser family — but
 * keeping them forever still builds a history nobody asked for, so they go.
 */
async function sweepOpens(env: Env): Promise<number> {
  const result = await env.DB.prepare(
    `DELETE FROM resume_opens WHERE opened_at < datetime('now', ?1)`,
  )
    .bind(`-${RETENTION_DAYS} days`)
    .run();
  return result.meta?.changes ?? 0;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/health') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'method not allowed' }, 405);
      }
      return health(env);
    }

    const resume = /^\/r\/([^/]+)\/?$/.exec(pathname);
    if (resume) return handleResume(request, env, ctx, decodeURIComponent(resume[1]));

    return notFound(pathname);
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      sweepOpens(env).then(
        (n) => console.log(`retention: deleted ${n} resume_opens row(s) older than ${RETENTION_DAYS} days`),
        (e) => console.error('retention sweep failed', e),
      ),
    );
  },
} satisfies ExportedHandler<Env>;
