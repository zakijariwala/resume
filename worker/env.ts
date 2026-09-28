export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BUCKET: R2Bucket;
  EMAIL?: SendEmail;

  // vars (wrangler.jsonc)
  SITE_URL: string;             // https://zakijariwala.space
  SITE_REPO: string;            // zakijariwala/resume — receives repository_dispatch
  OWNER_EMAIL: string;          // verified Email Routing destination
  SENDER_EMAIL: string;         // address on the zone, e.g. portfolio@zakijariwala.space
  TURNSTILE_SITE_KEY: string;
  ACCESS_TEAM_DOMAIN: string;   // https://<team>.cloudflareaccess.com
  ACCESS_AUD: string;           // Access application AUD tag
  DEV_ADMIN?: string;           // "true" only in .dev.vars — bypasses Access locally

  // secrets (wrangler secret put)
  BUILD_TOKEN: string;          // shared with the GitHub Action
  DISPATCH_TOKEN: string;       // GitHub PAT: Contents write on SITE_REPO only
  TURNSTILE_SECRET: string;
  IP_SALT: string;
}

export type AppEnv = { Bindings: Env; Variables: { adminEmail: string } };
