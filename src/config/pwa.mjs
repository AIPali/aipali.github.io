// src/config/pwa.mjs
import AstroPWA from '@vite-pwa/astro';

export function getPwaConfig(deployEnv, baseUrl) {
  // ============================================================
  // Cloudflare 模式 (轻量，不做激进离线缓存)
  // ============================================================
  if (deployEnv !== 'github') {
    return AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,ico,png,svg,woff,woff2}'],
        globIgnores: ['**/node_modules/**/*', '**/tags/**/*'],
        navigateFallback: null,
      },
      manifest: {
        name: 'AIPali (Online)',
        short_name: 'AIPali',
        display: 'standalone',
        theme_color: '#17181c',
        background_color: '#17181c',
        icons: [{ src: `${baseUrl}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png' }]
      }
    });
  }

  // ============================================================
  // GitHub 模式：极致离线版（核心优化区）
  // ============================================================
  return AstroPWA({
    registerType: 'autoUpdate',
    injectRegister: false,
    workbox: {
      globDirectory: 'dist',
      globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      globIgnores: ['**/node_modules/**/*', '**/tags/**/*', 'sw.js', 'workbox-*.js'],
      maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      navigateFallback: null,

      runtimeCaching: [
        {
          // 1. Algolia 搜索引擎拦截
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.(algolia\.net|algolianet\.com)\/.*(queries|indexes|search).*/i,
          // 修复：networkTimeoutSeconds 必须配合 NetworkFirst 使用
          handler: 'NetworkFirst',
          options: {
            networkTimeoutSeconds: 2, // 强制2秒超时，防止VPN假在线挂起阻塞
            plugins: [
              {
                // 超时并无缓存时触发兜底响应
                handlerDidError: async () => {
                  return new Response(
                    JSON.stringify({ results: [{ hits: [], nbHits: 0, page: 0, nbPages: 0, hitsPerPage: 20 }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                  );
                },
              },
            ],
          },
        },
        {
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.(algolia\.net|algolianet\.com)\/.*\.(js|css|woff2?)(\?.*)?$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'algolia-static-cache',
            expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // 2. FastGPT AI助手请求拦截
          urlPattern: /^https:\/\/ai\.true-dhamma\.com\/.*/i,
          // 修复：networkTimeoutSeconds 必须配合 NetworkFirst 使用
          handler: 'NetworkFirst',
          options: {
            networkTimeoutSeconds: 2, // 强制2秒超时
            plugins:[
              {
                // 超时并无缓存时触发兜底响应
                handlerDidError: async ({ request }) => {
                  if (request.destination === 'document' || request.destination === 'iframe') {
                    return new Response(
                      `<!DOCTYPE html><html><head><meta charset="utf-8">
                       <style>body{margin:0;display:flex;align-items:center;justify-content:center;
                       height:100vh;font-family:sans-serif;color:#888;font-size:14px;}</style>
                       </head><body><span>AI 助手需要网络连接</span></body></html>`,
                      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                    );
                  }
                  return new Response(
                    JSON.stringify({ error: 'offline', message: 'Network unavailable' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                  );
                },
              },
            ],
          },
        },
        {
          // 3. 站内静态资源缓存
          urlPattern: ({ request, url }) => {
            if (url.origin !== self.location.origin) return false;
            return (
              request.destination === 'document' ||
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'image' ||
              request.destination === 'font' ||
              url.pathname.endsWith('/')
            );
          },
          handler: 'CacheFirst',
          options: {
            cacheName: 'aipali-offline-cache',
            expiration: { maxEntries: 3000, maxAgeSeconds: 365 * 24 * 60 * 60 },
            cacheableResponse: { statuses: [0, 200] },
            matchOptions: { ignoreVary: true, ignoreSearch: true },
          },
        },
      ],
    },
    manifest: {
      name: '巴利三藏 - AIPali离线版',
      short_name: '巴利三藏',
      description: '巴利三藏智能化工程，支持全站离线阅读',
      theme_color: '#17181c',
      background_color: '#17181c',
      display: 'standalone',
      start_url: `${baseUrl}offline/`,
      icons:[
        { src: `${baseUrl}assets/logo_192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${baseUrl}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${baseUrl}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    }
  });
}