import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightDocSearch from '@astrojs/starlight-docsearch';
import AstroPWA from '@vite-pwa/astro';

import { remarkObsidianCallouts, remarkParagraphRef } from './src/plugins/remark-tipitaka.mjs';
import { formatSidebarWithPali } from './src/utils/sidebar.mjs';

import { sidebarDN } from './src/data/sidebar/dn.mjs';
import { sidebarMN } from './src/data/sidebar/mn.mjs';
import { sidebarSN } from './src/data/sidebar/sn.mjs';
import { sidebarAN } from './src/data/sidebar/an.mjs';
import { sidebarKN } from './src/data/sidebar/kn.mjs';
import { sidebarVA } from './src/data/sidebar/va.mjs';

const deployEnv = process.env.DEPLOY_ENV || 'domain';
const deployConfig = {
  // 我们只针对 GitHub Pages 优化 PWA
  github: { site: 'https://aipali.github.io', base: '/' },
  domain: { site: 'https://aipali.true-dhamma.com', base: '/' }
};
const currentConfig = deployConfig[deployEnv];

export default defineConfig({
  site: currentConfig.site,
  base: currentConfig.base,
  vite: {
    server: {
      hmr: false,
      watch: {
        usePolling: true,
        interval: 500, 
        awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 500 }
      }
    }
  },
  markdown: {
    remarkPlugins:[ remarkObsidianCallouts, remarkParagraphRef ],
  },
  integrations:[
    starlight({
      title: 'AIPali 智能化巴利三藏',
      customCss:['./src/styles/custom.css'], 
      defaultLocale: 'zh-CN', 
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      components: {
        PageTitle: './src/components/PageTitle.astro',
        Head: './src/components/CustomHead.astro',
      },
      head: [
        { tag: 'script', attrs: { src: '/assets/js/gtranslate-auto.js', defer: true } },
      ],
      plugins:[
        starlightDocSearch({
          appId: 'TCMTON4EX8', apiKey: '46fc7739c943245ddd44dac342e40493', indexName: 'AIPali'
        }),
        starlightSidebarTopics([
          { label: 'DN 长部', id: 'dn', link: '/sutta/dn/', items: formatSidebarWithPali(sidebarDN) },
          { label: 'MN 中部', id: 'mn', link: '/sutta/mn/', items: formatSidebarWithPali(sidebarMN) },
          { label: 'SN 相应部', id: 'sn', link: '/sutta/sn/', items: formatSidebarWithPali(sidebarSN) },
          { label: 'AN 增支部', id: 'an', link: '/sutta/an/', items: formatSidebarWithPali(sidebarAN) },
          { label: 'KN 小部', id: 'kn', link: '/sutta/kn/', items: formatSidebarWithPali(sidebarKN) },
          { label: 'VA 律藏', id: 'va', link: '/vinaya/', items: formatSidebarWithPali(sidebarVA) }
        ], {
          topics: { 'dn': ['/tags', '/tags/**/*'] },
          exclude: ['/info', '/info/**/*']
        })
      ]
    }),
    
    // 【白盒化 PWA 重构】
    AstroPWA({
      // 放弃 autoUpdate 的激进刷新，改为 prompt（我们自己接管生命周期）
      registerType: 'prompt',
      injectRegister: false, // 坚决使用手动注册
      workbox: {
        globDirectory: 'dist',
        // 🚨 预缓存：仅包含最最基础的 Logo 和首页核心结构，不碰任何动态 Hash 文件
        globPatterns: ['favicon.ico', 'assets/logo_*.png'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: null, // 绝不劫持路由
        
        // 核心：精细化的运行时动态缓存
        runtimeCaching: [
          // 1. CSS 和 JS (带 Hash 的文件)：使用 StaleWhileRevalidate
          // 保证瞬间加载，同时后台去拿最新带 Hash 的文件，防 CSS 丢失
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'aipali-static-assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          // 2. 图片和字体：基本不变，使用 CacheFirst 强缓存
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?|eot|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'aipali-images-fonts',
              expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          // 3. HTML (经文页面)：使用 StaleWhileRevalidate
          // 为什么不用 CacheFirst？因为我们要保证经文修正后，用户联网再看时能被后台更新。
          // 没网时，由于它会先吐出旧缓存，所以同样支持完美离线。
          {
            urlPattern: ({ request, url }) => request.destination === 'document' || url.pathname.endsWith('/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'aipali-html-cache',
              expiration: {
                maxEntries: 3000, // 足够容纳所有经文
                maxAgeSeconds: 60 * 24 * 60 * 60, // 增加到 60 天
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 4. Algolia 搜索 API：坚决不缓存，必须联网
          {
            urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.algolia\.net\/.*/i,
            handler: 'NetworkOnly',
          }
        ]
      },
      manifest: {
        name: 'AIPali 巴利三藏',
        short_name: 'AIPali',
        description: '智能化巴利三藏工程，支持全站离线阅读',
        theme_color: '#17181c',
        background_color: '#17181c',
        display: 'standalone',
        icons: [
          { src: '/assets/logo_dark_192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/logo_dark_512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/assets/logo_dark_512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
});