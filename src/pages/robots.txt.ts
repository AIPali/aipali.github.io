import type { APIRoute } from 'astro';

// 获取部署环境
const deployEnv = process.env.DEPLOY_ENV || 'domain';

const siteUrls = {
  github: 'https://aipali.github.io',
  domain: 'https://aipali.true-dhamma.com',
  offline: 'https://offline.aipali.true-dhamma.com'
};

export const GET: APIRoute = () => {
  let robotsContent = '';

  // ============================================================
  // 【架构更新】C 网站逻辑：离线专区，绝对禁止任何搜索引擎收录
  // 防止 SEO 重复内容惩罚 (Duplicate Content Penalty)
  // ============================================================
  if (deployEnv === 'offline') {
    robotsContent = [
      'User-agent: *',
      'Disallow: /'
    ].join('\n');
  } 
  // B 网站逻辑：GitHub 镜像站，禁止 Google，允许其他
  else if (deployEnv === 'github') {
    robotsContent = [
      'User-agent: Googlebot',
      'Disallow: /',
      '',
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${siteUrls.github}/sitemap-index.xml`
    ].join('\n');
  } 
  // A 网站逻辑：主站域名，禁止 Bing，允许 Google/Baidu 等其他
  else {
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