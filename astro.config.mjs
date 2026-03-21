import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightDocSearch from '@astrojs/starlight-docsearch';

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
      defaultLocale: 'zh-cn', 
      locales: {
        root: {
          label: '简体中文',
          lang: 'zh-CN', 
        },
      },
      components: {
        // 【关键】覆盖默认的 PageTitle 组件
        PageTitle: './src/components/PageTitle.astro',
      },
      plugins:[
        starlightDocSearch({
          appId: 'TCMTON4EX8',
          apiKey: '46fc7739c943245ddd44dac342e40493',
          indexName: 'AIPali',
          askAi: 'Hco3oWWPg1VN' // TODO: Replace with your Algolia Assistant ID
        }),
        // 👇 Topic 插件：接受两个参数，第二个参数用来配置豁免名单
        starlightSidebarTopics([
          { label: 'DN 长部', link: '/sutta/dn/', items: formatSidebarWithPali(sidebarDN) },
          { label: 'MN 中部', link: '/sutta/mn/', items: formatSidebarWithPali(sidebarMN) },
          { label: 'SN 相应部', link: '/sutta/sn/', items: formatSidebarWithPali(sidebarSN) },
          { label: 'AN 增支部', link: '/sutta/an/', items: formatSidebarWithPali(sidebarAN) },
          { label: 'KN 小部', link: '/sutta/kn/', items: formatSidebarWithPali(sidebarKN) },
          { label: 'VA 律藏', link: '/vinaya/', items: formatSidebarWithPali(sidebarVA) }
        ], {
          // 【核心修复】将标签插件自动生成的路由排除在 Topic 校验之外
          exclude: ['/tags', '/tags/**/*', '/info', '/info/**/*', '/guides/**/*', '/reference/**/*']
        })
      ]
    }),
  ],
});