# 09 Netlify config
Status: done
Blocked by: 01

- `netlify.toml`: build command `pnpm generate`, publish `.output/public`, Node version.
- Redirect `www` to the apex `https://n2shader.com` (301). Long cache headers for hashed assets, short for HTML. Security headers (CSP compatible with JSON-LD and the scene, HSTS, Referrer-Policy, X-Content-Type-Options).

## Comments

- 2026-11-16: Built `netlify.toml`. Build: `pnpm generate` → `.output/public`, Node 24, pnpm 10.28.0, `NITRO_PRESET=static` (without it nitro sees `NETLIFY` and uses `netlify-static`, which writes to `dist/` and adds its own `_headers`). The www→apex 301 covers both http and https. Security headers on `/*`: a static CSP (`default-src 'self'`, script/style `'self' 'unsafe-inline'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`, `frame-ancestors 'none'`), HSTS for 1 year with includeSubDomains and no preload, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`. Cache: `/_nuxt/*` for a year, immutable; `/fonts/*` for a week (the file name isn't hashed); `/`, `/es`, `/es/` revalidate. Owner choices: static CSP, HSTS without preload, no test. Files: `netlify.toml`, `CLAUDE.md` (folder map). Follow-ups: after the first deploy, check the headers with `curl -I` on `/`, `/es`, a `/_nuxt/` asset and `https://www.n2shader.com/`, and look for CSP errors in the console. A hash-based CSP is the stricter option if it's wanted later.
