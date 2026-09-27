import type { Env } from '../env';

export const now = () => new Date().toISOString();

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time comparison for bearer secrets. */
export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomId(len = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
}

export async function getSetting<T>(env: Env, key: string, fallback: T): Promise<T> {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  return row ? (JSON.parse(row.value) as T) : fallback;
}

export async function setSetting(env: Env, key: string, value: unknown) {
  await env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(key, JSON.stringify(value)).run();
}

/** Ask the GitHub Action to rebuild (and optionally re-sync) the site. */
export async function requestBuild(env: Env, kind: 'sync' | 'rebuild', reason: string): Promise<boolean> {
  let ok = false;
  let detail = '';
  try {
    const res = await fetch(`https://api.github.com/repos/${env.SITE_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.DISPATCH_TOKEN}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
        'user-agent': 'zakijariwala-worker',
      },
      body: JSON.stringify({ event_type: kind, client_payload: { reason } }),
    });
    ok = res.status === 204;
    detail = ok ? kind : `${res.status} ${await res.text()}`;
  } catch (e) {
    detail = (e as Error).message;
  }
  await env.DB.prepare('INSERT INTO deploys (requested_at, reason, ok, detail) VALUES (?, ?, ?, ?)')
    .bind(now(), reason, ok ? 1 : 0, detail.slice(0, 500)).run();
  return ok;
}
