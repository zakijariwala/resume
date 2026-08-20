/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
}

type BindingStatus =
  | { ok: true; detail: string }
  | { ok: false; error: string };

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Health is a live probe; never let a CDN or browser answer from cache.
      'cache-control': 'no-store',
    },
  });

/**
 * Actually exercises the binding rather than checking it is defined.
 * A binding can be present and still fail at runtime — wrong id, deleted
 * database, missing permission — and that is exactly what this must catch.
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
    // limit:1 keeps this to a single Class A op; the bucket may be empty.
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
    {
      status: ok ? 'ok' : 'degraded',
      checked_at: new Date().toISOString(),
      bindings: { DB: db, ASSETS: r2 },
    },
    // 503 so an uptime check treats a broken binding as down without parsing.
    ok ? 200 : 503,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/health') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'method not allowed' }, 405);
      }
      return health(env);
    }

    // Anything else under the routed prefixes is not built yet. Returning 404
    // here rather than falling through keeps the contract explicit.
    return json({ error: 'not found', path: pathname }, 404);
  },
} satisfies ExportedHandler<Env>;
