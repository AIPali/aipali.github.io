export function getPwaConfig(basePath) {
  return {
    // 🚨 改为 prompt，不再偷偷摸摸更新，把控制权交给离线管理面板
    registerType: 'prompt', 
    injectRegister: false,
    workbox: {
      globDirectory: 'dist',
      // 预缓存：只管核心壳子（JS、CSS、图片、字体）
      globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
      globIgnores: ['**/node_modules/**/*', '**/tags/**/*', 'sw.js', 'workbox-*.js'],
      maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      navigateFallback: null,
      
      // 🚨 核心修复：禁止清理过期的 JS/CSS！
      // 哪怕更新了代码，旧的 HTML 依然能找到它对应的旧 CSS，绝对不会白屏裸奔！
      cleanupOutdatedCaches: false, 

      runtimeCaching: [
        {
          // 接管所有的页面请求
          urlPattern: ({ request, url }) => request.destination === 'document' || url.pathname.endsWith('/'),
          // 🚨 核心修复：绝对缓存优先！只要缓存有，死也不去网上找！
          handler: 'CacheFirst', 
          options: {
            cacheName: 'aipali-html-cache',
            expiration: {
              maxEntries: 3000, // 足够容纳三藏所有页面
              maxAgeSeconds: 365 * 24 * 60 * 60, // 缓存一年（基本等于永久）
            },
            cacheableResponse: { statuses: [0, 200] },
            matchOptions: { ignoreVary: true, ignoreSearch: true }
          },
        },
        {
          // 搜索功能必须走网络
          urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.algolia\.net\/.*/i,
          handler: 'NetworkOnly',
        }
      ]
    },
    manifest: {
      name: 'AIPali 智能化巴利三藏',
      short_name: 'AIPali',
      description: '支持全站离线阅读的巴利三藏工程',
      // 🚨 核心设定：把离线管理面板设为 PWA 的启动首页！
      start_url: `${basePath}offline/`, 
      display: 'standalone',
      theme_color: '#17181c',
      background_color: '#17181c',
      icons: [
        { src: `${basePath}assets/logo_192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${basePath}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${basePath}assets/logo_512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    }
  };
}