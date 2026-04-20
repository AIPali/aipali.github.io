import { defineCollection, z } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

// ... 其他 import 保持不变

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        tags: z.array(z.string()).optional(),
        
        // 保护这些字段不被 Astro 过滤
        id: z.string().optional(),
        collection: z.string().optional(),
        vagga: z.string().optional(),
        reference: z.string().optional(),
        curator: z.string().optional(),
        version: z.union([z.string(), z.number()]).optional(), 
      })
    }),

    i18n: defineCollection({
      type: 'data',
      schema: i18nSchema() 
    })
  }),
  
  // 用于加载你在 root.json 里写的自定义中文翻译
  i18n: defineCollection({
    loader: i18nLoader(),
    schema: i18nSchema(),
  }),
};