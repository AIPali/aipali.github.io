$body = @"
{
  "title": "Lobster Assistant: site upgrade and optimization",
  "head": "Ai2026000:main",
  "base": "main",
  "body": "## Lobster Assistant Site Upgrades\n\n### Changes:\n1. **SEO Enhancement** &mdash; sitemap, OG/Twitter meta tags, keywords, canonical link\n2. **Performance** &mdash; Preconnect/DNS-Prefetch to critical third-party domains\n3. **Accessibility** &mdash; prefers-reduced-motion, focus-visible, selection styles\n4. **UI Improvements** &mdash; table styles, gradient separators, list formatting, responsive tweaks\n5. **Lobster Helper Tool** &mdash; tools/lobster-helper.mjs CLI for dev/build/deploy\n\n### Usage:\n```bash\nnode tools/lobster-helper.mjs dev\nnode tools/lobster-helper.mjs build\nnode tools/lobster-helper.mjs deploy\n```"
}
"@

# Note: Replace YOUR_GITHUB_TOKEN with a token that has 'repo' scope
$token = "YOUR_GITHUB_TOKEN"

Invoke-RestMethod -Uri "https://api.github.com/repos/aipali/aipali.github.io/pulls" -Method Post -Headers @{Authorization="token $token"} -Body $body -ContentType "application/json" | Select-Object html_url, title, state
