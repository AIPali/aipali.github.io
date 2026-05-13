// src/config/pwa.mjs
import AstroPWA from '@vite-pwa/astro';

export function getPwaConfig(deployEnv, baseUrl) {
  if (deployEnv !== 'github') {
    return AstroPWA({ /* ... 保持你原有的 Cloudflare 模式代码 ... */ });
  }

  // GitHub 模式：重型极致离线版
  return AstroPWA({
    registerType: 'autoUpdate',
    injectRegister: false,
    workbox: {
      globDirectory: 'dist',
      globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      globIgnores: ['**/node_modules/**/*', '**/tags/**/*', 'sw.js', 'workbox-*.js'],
      maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      navigateFallback: null,
      runtimeCaching:[
        {
          // 🚨 1. 纯动态 API 黑名单 (优先级最高，绝对不缓存)
          // 拦截 Algolia 的搜索 API 以及 FastGPT 可能的动态数据/对话 API
          urlPattern: /^https:\/\/([a-zA-Z0-9-]+\.algolia\.net|ai\.true-dhamma\.com\/api)\/.*/i,
          handler: 'NetworkOnly',
        },
        {
          // 🚀 2. 第三方外部依赖 (FastGPT 界面/JS、其它外部 CDN 脚本)
          // 策略: Stale-While-Revalidate (优先使用缓存保证速度和离线可用，后台静默拉取更新)
          urlPattern: ({ request, url }) => {
            // 匹配 FastGPT 的域名，或者常见的公共 CDN (如果 Algolia 的 JS 是从外部加载的话)
            return url.hostname === 'ai.true-dhamma.com' || 
                   url.hostname.includes('cdn.jsdelivr.net') ||
                   url.hostname.includes('unpkg.com');
          },
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'aipali-external-scripts-cache',
            expiration: {
              maxEntries: 100, // 限制外部资源缓存数量
              maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存 30 天
            },
            // 允许缓存跨域的 Opaque 响应 (HTTP 状态码为 0 的请求)
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // 🛡️ 3. 终极锁定：本站静态资源 CacheFirst (保持你原有的优秀设计)
          urlPattern: ({ request, url }) => {
            // 只缓存当前站点的同源请求，放过所有第三方外部请求
            if (url.origin !== self.location.origin) {
              return false;
            }
            
            return request.destination === 'document' || 
                   request.destination === 'style' ||
                   request.destination === 'script' ||
                   request.destination === 'image' ||
                   request.destination === 'font' ||
                   url.pathname.endsWith('/');
          },
          handler: 'CacheFirst', 
          options: {
            cacheName: 'aipali-offline-cache',
            expiration: {
              maxEntries: 3000,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 锁定 1 年
            },
            cacheableResponse: { statuses: [0, 200] },
            matchOptions: { ignoreVary: true, ignoreSearch: true },
          },
        }
      ]
    },
    manifest: {
      /* ... 保持你原有的 manifest 代码 ... */
    }
  });
}