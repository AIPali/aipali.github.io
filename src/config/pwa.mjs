// src/config/pwa.mjs
import AstroPWA from '@vite-pwa/astro';

export function getPwaConfig(deployEnv, baseUrl) {
  // Cloudflare 模式 (保持轻量，不进行侵入式 PWA 代理)
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

  // GitHub 模式：重型极致离线版
  return AstroPWA({
    registerType: 'autoUpdate',
    injectRegister: false,
    workbox: {
      globDirectory: 'dist',
      // 预缓存只负责壳子资源，绝不预缓存 HTML
      globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      globIgnores: ['**/node_modules/**/*', '**/tags/**/*', 'sw.js', 'workbox-*.js'],
      maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      navigateFallback: null,
      runtimeCaching: [
        {
          // 🚀 1. 外部动态服务白名单（必须放在最前面！）
          // 匹配 FastGPT 域名和 Algolia 搜索，强制走网络，绝不缓存
          urlPattern: /^https:\/\/(ai\.true-dhamma\.com|[a-zA-Z0-9-]+\.algolia\.net)\/.*/i,
          handler: 'NetworkOnly',
        },
        {
          // 🚨 2. 终极锁定：本站静态资源 CacheFirst
          urlPattern: ({ request, url }) => {
            // 【关键修复】只缓存当前站点的同源请求，放过所有第三方外部请求
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
      name: '巴利三藏 - AIPali离线版',
      short_name: '巴利三藏',
      description: '巴利三藏智能化工程，支持全站离线阅读',
      theme_color: '#17181c',
      background_color: '#17181c',
      display: 'standalone',
      start_url: `${baseUrl}offline/`, // 桌面打开默认进入 offline 控制台
      icons: [
        { src: `${baseUrl}assets/logo_192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${baseUrl}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${baseUrl}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    }
  });
}