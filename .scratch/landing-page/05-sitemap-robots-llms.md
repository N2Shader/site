# 05 sitemap.xml, robots.txt, llms.txt
Status: done
Blocked by: 02

- Sitemap lists `/` and `/es` with hreflang alternates.
- robots.txt allows all and explicitly allows search and AI answer crawlers (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended), and links the sitemap.
- `nuxt-llms`: title, description and links for both locales (already set in `nuxt.config.ts`; the description is read from `en.json`).
- Test: the three files are prerendered with the expected entries.

## Comments

- 2026-11-16: robots.txt keeps the module's allow-all `User-agent: *` group and adds one group naming the ten search/AI crawlers and tokens with `Allow: /`; the sitemap module adds the Sitemap line. `sitemap.sitemaps: false` makes it one `/sitemap.xml` (`/` and `/es`, hreflang en-GB, es-ES, x-default) instead of a sitemap index with per-locale sitemaps. llms.txt links are now absolute URLs. All three are prerendered by their modules; robots.txt only serves `Disallow: /` outside production (`nuxt generate` forces production). No test, owner's choice. Files: `nuxt.config.ts`. Follow-ups: the sitemap's hreflang has only the regional codes while the HTML has bare + regional (valid, not identical); check on the first Netlify deploy (ticket 09/11) that the netlify-static preset's output folder matches the publish dir in `netlify.toml`, or these files won't deploy.
