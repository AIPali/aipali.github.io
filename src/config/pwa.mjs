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

        // ────────────────────────────────────────────────────────
        // 规则 1：Algolia 搜索 API（动态查询）→ 纯网络，离线静默失败
        //
        // 【第二道防线】：前端已在 navigator.onLine===false 时跳过
        // docsearch() 初始化，此规则兜底那些"在线但请求失败"的情况。
        // fetchDidFail 在 fetch 彻底失败时触发，返回空 JSON 避免
        // DocSearch JS 因 TypeError 中断页面。
        // ────────────────────────────────────────────────────────
        {
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.(algolia\.net|algolianet\.com)\/.*(queries|indexes|search).*/i,
          handler: 'NetworkOnly',
          options: {
            plugins: [
              {
                fetchDidFail: async () => {
                  return new Response(
                    JSON.stringify({ results: [{ hits: [], nbHits: 0, page: 0, nbPages: 0, hitsPerPage: 20 }] }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                  );
                },
              },
            ],
          },
        },

        // ────────────────────────────────────────────────────────
        // 规则 2：Algolia CDN 静态资源 → StaleWhileRevalidate
        //
        // @docsearch/js 已打包进构建产物，此规则兜底 Algolia
        // 可能动态加载的 chunk。有缓存先用缓存，后台静默更新。
        // ────────────────────────────────────────────────────────
        {
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.(algolia\.net|algolianet\.com)\/.*\.(js|css|woff2?)(\?.*)?$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'algolia-static-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 7 * 24 * 60 * 60,
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        },

        // ────────────────────────────────────────────────────────
        // 规则 3：FastGPT 聊天 iframe 页面及 API → NetworkOnly + 降级
        //
        // 【第二道防线】：前端已在 navigator.onLine===false 时跳过
        // iframe src 赋值，此规则兜底"在线时打开后网络中断"的情况。
        // 离线时对 document/iframe 导航返回占位 HTML，对 API 返回
        // 503 JSON，均为静默降级，不抛出错误不阻塞页面。
        // ────────────────────────────────────────────────────────
        {
          urlPattern: /^https:\/\/ai\.true-dhamma\.com\/.*/i,
          handler: 'NetworkOnly',
          options: {
            plugins: [
              {
                fetchDidFail: async ({ request }) => {
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

        // ────────────────────────────────────────────────────────
        // 规则 4：本站同源资源 → CacheFirst（离线核心）
        // ────────────────────────────────────────────────────────
        {
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
            expiration: {
              maxEntries: 3000,
              maxAgeSeconds: 365 * 24 * 60 * 60,
            },
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
      icons: [
        { src: `${baseUrl}assets/logo_192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${baseUrl}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${baseUrl}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    }
  });
}