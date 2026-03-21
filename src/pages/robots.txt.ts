import type { APIRoute } from 'astro';

// 获取部署环境，逻辑与你 config 中一致
const deployEnv = process.env.DEPLOY_ENV || 'domain';

const siteUrls = {
  github: 'https://aipali.github.io',
  domain: 'https://aipali.true-dhamma.com'
};

export const GET: APIRoute = () => {
  let robotsContent = '';

  if (deployEnv === 'github') {
    // B 网站逻辑：禁止 Google，允许其他
    robotsContent = [
      'User-agent: Googlebot',
      'Disallow: /',
      '',
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${siteUrls.github}/sitemap-index.xml`
    ].join('\n');
  } else {
    // A 网站逻辑：禁止 Bing，允许 Google/Baidu 等其他
    robotsContent = [
      'User-agent: Bingbot',
      'Disallow: /',
      '',
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${siteUrls.domain}/sitemap-index.xml`
    ].join('\n');
  }

  return new Response(robotsContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};