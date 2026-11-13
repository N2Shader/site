# 09 Netlify config
Status: todo
Blocked by: 01

- `netlify.toml`: build command `pnpm generate`, publish `.output/public`, Node version.
- Redirect `www` to the apex `https://n2shader.com` (301). Long cache headers for hashed assets, short for HTML. Security headers (CSP compatible with JSON-LD and the scene, HSTS, Referrer-Policy, X-Content-Type-Options).
