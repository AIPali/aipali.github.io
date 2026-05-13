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
        // 目标：*.algolia.net 及 *.algolianet.com 下的 /indexes/、
        //       /queries 等搜索端点。
        // 策略：NetworkOnly，但通过 fetchDidFail 插件在离线时
        //       返回一个合法的空 JSON，防止 DocSearch 的 JS
        //       因未捕获的 TypeError 中断页面初始化。
        // ────────────────────────────────────────────────────────
        {
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.(algolia\.net|algolianet\.com)\/.*(queries|indexes|search).*/i,
          handler: 'NetworkOnly',
          options: {
            plugins: [
              {
                // 离线时 fetch 失败 → 返回空搜索结果，而非抛出错误
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
        // 规则 2：Algolia CDN 静态资源（JS bundle、图标等）
        //         → StaleWhileRevalidate
        //
        // 目标：algolia.net / algolianet.com 下非搜索的静态资源。
        //       实际上 @docsearch/js 已被打包进本站构建产物，
        //       这条规则主要兜底 Algolia 可能动态加载的 chunk。
        // 策略：有缓存先用缓存，后台静默更新；离线时直接用缓存。
        // ────────────────────────────────────────────────────────
        {
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.(algolia\.net|algolianet\.com)\/.*\.(js|css|woff2?)(\?.*)?$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'algolia-static-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7天，跟随 Algolia 版本更新节奏
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        },

        // ────────────────────────────────────────────────────────
        // 规则 3：FastGPT 聊天 iframe 页面及 API
        //         → NetworkOnly + 离线静默降级
        //
        // 目标：ai.true-dhamma.com 下所有请求。
        // 策略：iframe 内容是实时在线服务，缓存无意义；
        //       但当 SW 拦截 iframe 导航请求时，若直接
        //       NetworkOnly 抛错，会使 iframe 显示错误页。
        //       改为在离线时返回一个最简 HTML 占位页，
        //       让 iframe 优雅降级（空白）而非报错卡住。
        // ────────────────────────────────────────────────────────
        {
          urlPattern: /^https:\/\/ai\.true-dhamma\.com\/.*/i,
          handler: 'NetworkOnly',
          options: {
            plugins: [
              {
                fetchDidFail: async ({ request }) => {
                  // 仅对 document 类型（iframe 导航）返回降级页面
                  if (request.destination === 'document' || request.destination === 'iframe') {
                    return new Response(
                      `<!DOCTYPE html><html><head><meta charset="utf-8">
                       <style>body{margin:0;display:flex;align-items:center;justify-content:center;
                       height:100vh;font-family:sans-serif;color:#888;font-size:14px;}</style>
                       </head><body><span>AI 助手需要网络连接</span></body></html>`,
                      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                    );
                  }
                  // 对 API 请求（fetch）返回标准错误 JSON，防止调用方崩溃
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
        //
        // 目标：当前域名下所有 document、style、script、image、font
        //       及路径以 / 结尾的请求（即 HTML 页面）。
        // 策略：CacheFirst，即优先读缓存，缓存命中则直接返回，
        //       不发起网络请求；缓存未命中才走网络并写入缓存。
        //       这是离线阅读能力的核心保障。
        //
        // 关键约束：url.origin !== self.location.origin 的请求
        //           全部放行（由前三条规则处理），绝不在此误拦截。
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
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
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