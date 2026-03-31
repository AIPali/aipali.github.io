import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightDocSearch from '@astrojs/starlight-docsearch';
import AstroPWA from '@vite-pwa/astro';

// 引入你的自定义插件和处理函数
import { remarkObsidianCallouts, remarkParagraphRef } from './src/plugins/remark-tipitaka.mjs';
import { formatSidebarWithPali } from './src/utils/sidebar.mjs';

// 引入海量侧边栏数据
import { sidebarDN } from './src/data/sidebar/dn.mjs';
import { sidebarMN } from './src/data/sidebar/mn.mjs';
import { sidebarSN } from './src/data/sidebar/sn.mjs';
import { sidebarAN } from './src/data/sidebar/an.mjs';
import { sidebarKN } from './src/data/sidebar/kn.mjs';
import { sidebarVA } from './src/data/sidebar/va.mjs';

const deployEnv = process.env.DEPLOY_ENV || 'domain';
const deployConfig = {
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
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 500
        }
      }
    }
  },
  markdown: {
    remarkPlugins:[
      remarkObsidianCallouts, 
      remarkParagraphRef 
    ],
  },
  integrations:[
    starlight({
      title: 'AIPali 智能化巴利三藏',
      customCss:['./src/styles/custom.css'], 
      defaultLocale: 'zh-CN', 
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN', 
        },
      },
      components: {
        PageTitle: './src/components/PageTitle.astro',
        Head: './src/components/CustomHead.astro',
      },
      head: [
        {
          tag: 'script',
          attrs: {
            src: '/assets/js/gtranslate-auto.js',
            defer: true,
          },
        },
      ],
      plugins:[
        starlightDocSearch({
          appId: 'TCMTON4EX8',
          apiKey: '46fc7739c943245ddd44dac342e40493',
          indexName: 'AIPali'
        }),
        starlightSidebarTopics([
          { label: 'DN 长部', id: 'dn', link: '/sutta/dn/', items: formatSidebarWithPali(sidebarDN) },
          { label: 'MN 中部', id: 'mn', link: '/sutta/mn/', items: formatSidebarWithPali(sidebarMN) },
          { label: 'SN 相应部', id: 'sn', link: '/sutta/sn/', items: formatSidebarWithPali(sidebarSN) },
          { label: 'AN 增支部', id: 'an', link: '/sutta/an/', items: formatSidebarWithPali(sidebarAN) },
          { label: 'KN 小部', id: 'kn', link: '/sutta/kn/', items: formatSidebarWithPali(sidebarKN) },
          { label: 'VA 律藏', id: 'va', link: '/vinaya/', items: formatSidebarWithPali(sidebarVA) }
        ], {
          topics: {
            'dn': ['/tags', '/tags/**/*'] 
          },
          exclude: ['/info', '/info/**/*']
        })
      ]
    }),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
        globIgnores: ['**/node_modules/**/*', '**/tags/**/*', 'sw.js', 'workbox-*.js'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: null,
        
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            // 🚨 终极改变：从 NetworkFirst 改为 CacheFirst
            handler: 'CacheFirst',
            options: {
              cacheName: 'aipali-html-cache',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.algolia\.net\/.*/i,
            handler: 'NetworkOnly',
          }
        ]
      },
      manifest: {
        name: 'AIPali 智能化巴利三藏',
        short_name: 'AIPali',
        description: '巴利三藏智能化工程，支持全站离线阅读',
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