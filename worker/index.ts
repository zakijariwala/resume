import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv, Env } from './env';
import internal from './routes/internal';
import pub, { notFound } from './routes/public';
import admin from './routes/admin';
import { requestBuild } from './lib/util';

// Only paths listed in wrangler.jsonc `assets.run_worker_first` reach this app;
// every other request is served straight from the static build.
const app = new Hono<AppEnv>();

app.use('*', async (c, next) => {
  await next();
  c.header('x-content-type-options', 'nosniff');
  c.header('referrer-policy', 'strict-origin-when-cross-origin');
});

app.route('/internal', internal);
app.route('/admin', admin);
app.route('/', pub);
app.notFound(notFound);
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error(err);
  return c.text('Something went wrong.', 500);
});

export default {
  fetch: app.fetch,
  // Weekly: ask the GitHub Action to fetch every repo's for_resume/ and rebuild.
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(requestBuild(env, 'sync', 'weekly schedule'));
  },
} satisfies ExportedHandler<Env>;
