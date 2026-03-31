import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightDocSearch from '@astrojs/starlight-docsearch';
import AstroPWA from '@vite-pwa/astro'; // 引入 PWA 插件

// 引入你的自定义插件和处理函数
import { remarkObsidianCallouts, remarkParagraphRef } from './src/plugins/remark-tipitaka.mjs';
import { formatSidebarWithPali } from './src/utils/sidebar.mjs';

// 引入刚刚抽离的海量侧边栏数据
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
    // PWA 配置必须放在 starlight 之后
    AstroPWA({
      registerType: 'autoUpdate', // 发现新版本（你更新经文后）自动静默更新
      injectRegister: 'script', // 自动注入 Service Worker 注册脚本，无需手动写代码
      workbox: {
        // 核心：指定需要批量缓存的文件类型，包含了所有生成的 html
        globDirectory: 'dist',
        globPatterns: ['**/*.{html,js,css,ico,png,svg,webp,woff,woff2}'],
        // 增加单文件缓存上限到 5MB（巴利三藏某些合并经文可能比较大，突破默认的 2MB 限制）
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        // Algolia 搜索强依赖网络，我们配置它走网络优先，避免报错
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[a-zA-Z0-9-]+\.algolia\.net\/.*/i,
            handler: 'NetworkOnly',
          }
        ]
      },
      manifest: {
        name: 'AIPali 智能化巴利三藏',
        short_name: 'AIPali',
        description: '智能化巴利三藏工程，支持全站离线阅读',
        theme_color: '#17181c', // Dark mode：Starlight 默认深色背景
        background_color: '#17181c', // Dark mode：PWA 启动屏背景色
        display: 'standalone', // 隐藏浏览器 UI，像独立 App 一样运行
        icons: [
          {
            src: '/assets/logo_192x192.png', // 你准备好的图标
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/logo_512x512.png', // 你准备好的图标
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/assets/logo_512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // 支持安卓自动适应图标形状
          }
        ]
      }
    })
  ],
});