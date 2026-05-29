# CMS Setup Guide

Decap CMS lives at `/admin/`. It connects to the GitHub API directly — no server required. Every save commits to `main` and triggers a GitHub Actions rebuild (typically 2–3 minutes to live).

---

## Steps to activate

### 1. Create a GitHub OAuth App

Go to: **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**

- **Application name:** `zakijariwala.space CMS`
- **Homepage URL:** `https://zakijariwala.space`
- **Authorization callback URL:** `https://zakijariwala.space/admin/`

Save. Copy the **Client ID**.

### 2. Update the CMS config

In `public/admin/config.yml`, replace the placeholder:

```yaml
app_id: YOUR_GITHUB_OAUTH_APP_ID
```

with your Client ID.

### 3. Deploy

Commit and push the config.yml change. GitHub Actions will deploy it.

### 4. Test

Visit `https://zakijariwala.space/admin/`. Click **Login with GitHub**. Authorise the app. You should land on the CMS dashboard.

---

## How it works

- **Auth flow:** Implicit flow via GitHub OAuth. The browser handles the token — no backend required.
- **On save:** Decap commits the changed data file to `main`. GitHub Actions picks it up and rebuilds the static site.
- **Rebuild time:** ~2 minutes from save to live.
- **What you can edit:** All five data files (meta, experience, projects, skills, certifications) from the CMS dashboard.

---

## Cloudflare Pages note

If you migrate hosting from GitHub Pages to Cloudflare Pages, the implicit OAuth flow still works — no changes needed, as long as the callback URL is updated in the GitHub OAuth App settings to match the Cloudflare Pages domain.

---

## Troubleshooting

**"Not authorized" error on login:** The callback URL in the GitHub OAuth App must exactly match where the admin is hosted (including trailing slash if present).

**Changes not appearing after save:** Check the GitHub Actions run for build errors. CMS commits trigger the same pipeline as manual pushes.

**CMS shows blank white page:** Usually a config.yml YAML parse error. Validate the YAML syntax at yamllint.com.
