import { defineConfig } from 'astro/config';
import { getPwaConfig } from './src/config/pwa.mjs';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';

import { remarkObsidianCallouts, remarkParagraphRef } from './src/config/remark-tipitaka.mjs';
import { formatSidebarWithPali } from './src/utils/sidebar.mjs';
import { sidebarDN } from './src/config/sidebar/dn.mjs';
import { sidebarMN } from './src/config/sidebar/mn.mjs';
import { sidebarSN } from './src/config/sidebar/sn.mjs';
import { sidebarAN } from './src/config/sidebar/an.mjs';
import { sidebarKN } from './src/config/sidebar/kn.mjs';
import { sidebarVA } from './src/config/sidebar/va.mjs';

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
  markdown: { remarkPlugins:[remarkObsidianCallouts, remarkParagraphRef] },
  integrations:[
    starlight({
      title: 'AIPali 智能化巴利三藏',
      customCss:['./src/styles/custom.css'], 
      defaultLocale: 'zh-CN', 
      locales: { root: { label: '简体中文', lang: 'zh-CN' } },
      components: {
        PageTitle: './src/components/PageTitle.astro',
        Head: './src/components/CustomHead.astro',
        Search: './src/components/AlgoliaSearch.astro',
      },
      head: [
        { tag: 'script', attrs: { src: '/assets/gtranslate-auto.js', defer: true, }, },
        { tag: 'script', attrs: { src: '/assets/tts-reader.js', defer: true, }, },
      ],
      plugins:[
        starlightSidebarTopics([
          { label: 'DN 长部', id: 'dn', link: '/sutta/dn/', items: formatSidebarWithPali(sidebarDN) },
          { label: 'MN 中部', id: 'mn', link: '/sutta/mn/', items: formatSidebarWithPali(sidebarMN) },
          { label: 'SN 相应部', id: 'sn', link: '/sutta/sn/', items: formatSidebarWithPali(sidebarSN) },
          { label: 'AN 增支部', id: 'an', link: '/sutta/an/', items: formatSidebarWithPali(sidebarAN) },
          { label: 'KN 小部', id: 'kn', link: '/sutta/kn/', items: formatSidebarWithPali(sidebarKN) },
          { label: 'VA 律藏', id: 'va', link: '/vinaya/', items: formatSidebarWithPali(sidebarVA) }
        ], { topics: { 'dn': ['/tags', '/tags/**/*'] }, exclude: ['/info', '/info/**/*'] })
      ]
    }),
    // 注入动态 PWA 配置
    getPwaConfig(deployEnv, currentConfig.base)
  ],
});