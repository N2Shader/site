# 05 sitemap.xml, robots.txt, llms.txt
Status: todo
Blocked by: 02

- Sitemap lists `/` and `/es` with hreflang alternates.
- robots.txt allows all and explicitly allows search and AI answer crawlers (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended), and links the sitemap.
- `nuxt-llms`: title, description and links for both locales (already set in `nuxt.config.ts`; the description is read from `en.json`).
- Test: the three files are prerendered with the expected entries.
