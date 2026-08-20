/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  /** Origin the static site is served from; used to stream the repo variant. */
  SITE_ORIGIN: string;
  /** Public path of the resume that stays in the repository. */
  STATIC_RESUME_PATH: string;
}
