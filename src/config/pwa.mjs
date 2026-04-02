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
        icons: [{ src: `${baseUrl}assets/logo_dark_512x512.png`, sizes: '512x512', type: 'image/png' }]
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
          // 🚨 终极锁定：无论是 HTML、CSS、JS 还是字体图片，统统实行 CacheFirst！
          urlPattern: ({ request, url }) => 
            request.destination === 'document' || 
            request.destination === 'style' ||
            request.destination === 'script' ||
            request.destination === 'image' ||
            request.destination === 'font' ||
            url.pathname.endsWith('/'),
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
        },
        {
          // Algolia 搜索强制走网络
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.algolia\.net\/.*/i,
          handler: 'NetworkOnly',
        }
      ]
    },
    manifest: {
      name: 'AIPali 智能化巴利三藏 - 离线版',
      short_name: 'AIPali',
      description: '巴利三藏智能化工程，支持全站离线阅读',
      theme_color: '#17181c',
      background_color: '#17181c',
      display: 'standalone',
      start_url: `${baseUrl}offline/`, // 桌面打开默认进入 offline 控制台
      icons: [
        { src: `${baseUrl}assets/logo_dark_192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${baseUrl}assets/logo_dark_512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${baseUrl}assets/logo_dark_512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    }
  });
}