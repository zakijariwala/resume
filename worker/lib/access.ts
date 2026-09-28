import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { verifyWithJwks } from 'hono/jwt';
import type { AppEnv } from '../env';

/**
 * Cloudflare Access already blocks unauthenticated requests at the edge; this
 * re-verifies the Access JWT so a misconfigured Access policy fails closed.
 */
export const requireAccess: MiddlewareHandler<AppEnv> = async (c, next) => {
  const env = c.env;
  const host = new URL(c.req.url).hostname;
  if (env.DEV_ADMIN === 'true' && (host === 'localhost' || host === '127.0.0.1')) {
    c.set('adminEmail', 'dev@localhost');
    return next();
  }
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return c.text('Admin is locked: Cloudflare Access is not configured (ACCESS_TEAM_DOMAIN / ACCESS_AUD).', 503);
  }
  const token = c.req.header('cf-access-jwt-assertion') ?? getCookie(c, 'CF_Authorization');
  if (!token) return c.text('Forbidden', 403);
  try {
    const team = env.ACCESS_TEAM_DOMAIN.replace(/\/$/, '');
    const payload = await verifyWithJwks(token, {
      jwks_uri: `${team}/cdn-cgi/access/certs`,
      allowedAlgorithms: ['RS256'],
      verification: { aud: env.ACCESS_AUD, iss: team },
    });
    c.set('adminEmail', String(payload.email ?? 'owner'));
  } catch {
    return c.text('Forbidden', 403);
  }
  return next();
};
