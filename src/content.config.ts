import { defineCollection, z } from 'astro:content';
// Astro 5 必须引入对应的 loader
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    // 必须声明 loader 以抓取你深层目录下的所有文档
    loader: docsLoader(),
    schema: docsSchema({
      // 核心：告诉 Astro 5 保留你的这些自定义字段，千万别删！
      extend: z.object({
        tags: z.array(z.string()).optional(),
        
        // 顺手把你 frontmatter 里的其他业务字段也保护起来
        id: z.string().optional(),
        collection: z.string().optional(),
        vagga: z.string().optional(),
        reference: z.string().optional(),
        curator: z.string().optional(),
      })
    })
  }),
  
  // 用于加载你在 root.json 里写的自定义中文翻译
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema(),
  }),
};