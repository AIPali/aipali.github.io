AstroPWA({
  registerType: 'autoUpdate',
  injectRegister: 'script',
  workbox: {
    globDirectory: 'dist',
    // 1. 预缓存：仅缓存核心资源（JS/CSS/图标），保证 App 壳子能秒开
    globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff,woff2}'], 
    globIgnores: ['**/node_modules/**/*', '**/tags/**/*', 'sw.js', 'workbox-*.js'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    
    // 2. 运行时缓存：处理那 60MB 的 HTML（实现点开即缓存，且离线可用）
    runtimeCaching: [
      {
        // 匹配所有 HTML 页面请求
        urlPattern: ({ request }) => request.mode === 'navigate',
        handler: 'NetworkFirst', // 优先看网络（保证看到最新修正的经文），没网时看缓存
        options: {
          cacheName: 'aipali-html-cache',
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存 30 天
          },
          cacheableResponse: {
            statuses: [0, 200], // 仅缓存成功的请求
          },
        },
      },
      {
        urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.algolia\.net\/.*/i,
        handler: 'NetworkOnly',
      }
    ]
  },
  manifest: { /* ...保持不变 */ }
})