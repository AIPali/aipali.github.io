import AstroPWA from '@vite-pwa/astro';

export function getPwaConfig(deployEnv, baseUrl) {
  // ==========================================
  // Cloudflare 模式：轻量级，避免重定向冲突
  // ==========================================
  if (deployEnv !== 'github') {
    return AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,ico,png,svg,woff,woff2}'], // 预缓存 CSS/JS，确保样式不丢
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

  // ==========================================
  // GitHub 模式：重型纯离线 App (满足需求 1,2,3,6,7)
  // ==========================================
  return AstroPWA({
    registerType: 'autoUpdate',
    injectRegister: false,
    workbox: {
      globDirectory: 'dist',
      // 【重点 3】：强制预缓存所有 CSS 和 JS，解决离线没有样式的问题！
      globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      globIgnores: ['**/node_modules/**/*', '**/tags/**/*', 'sw.js', 'workbox-*.js'],
      maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      navigateFallback: null,
      runtimeCaching: [
        {
          // 捕获所有页面请求
          urlPattern: ({ request, url }) => request.destination === 'document' || url.pathname.endsWith('/'),
          // 【重点 6】：CacheFirst！只要缓存里有，绝对不走网络，彻底切断重定向干扰！
          handler: 'CacheFirst', 
          options: {
            cacheName: 'aipali-html-cache',
            expiration: {
              maxEntries: 3000,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 【重点 4】告诉 Workbox 缓存保留 1 年
            },
            cacheableResponse: { statuses: [0, 200] },
            matchOptions: { ignoreVary: true, ignoreSearch: true },
          },
        },
        {
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.algolia\.net\/.*/i,
          handler: 'NetworkOnly',
        }
      ]
    },
    manifest: {
      name: 'AIPali 离线三藏',
      short_name: 'AIPali',
      description: '智能化巴利三藏工程，支持全站离线阅读',
      theme_color: '#17181c',
      background_color: '#17181c',
      display: 'standalone',
      // 【重点 7】：安装到桌面后，默认启动页强制设置为 /offline/ ！
      start_url: `${baseUrl}offline/`, 
      icons: [
        { src: `${baseUrl}assets/logo_dark_192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${baseUrl}assets/logo_dark_512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${baseUrl}assets/logo_dark_512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    }
  });
}