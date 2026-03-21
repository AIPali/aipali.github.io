---
title: Example Reference
description: A reference page in my new Starlight docs site.
---
---
title: 巴利三藏数字化工程
description: 现代、极速、美观的巴利圣典在线百科与 AI 检索库。
template: splash
hero:
  tagline: "基于当代数字技术，重塑法宝的阅读与检索体验。"
  image:
    file: ../../assets/houston.webp # 你可以后续换成一朵莲花或法轮的图片
  actions:
    - text: 开启阅读
      link: /sutta/
      icon: right-arrow
      variant: primary
    - text: 了解本项目
      link: /about/
      icon: open-book
---

import { CardGrid, LinkCard } from '@astrojs/starlight/components';

## 经典导航 (Tipitaka Navigation)

通过以下入口，快速进入三大藏的浩瀚法海。

<CardGrid stagger>
  <LinkCard 
    title="经藏 (Sutta Piṭaka)" 
    description="包含长部、中部、相应部、增支部及小部。记录了佛陀与弟子们的对话与开示。" 
    href="/sutta/" 
  />
  <LinkCard 
    title="律藏 (Vinaya Piṭaka)" 
    description="包含比丘/比丘尼分别、大品、小品等。详述了僧团的戒律与生活规范。" 
    href="/vinaya/" 
  />
  <LinkCard 
    title="论藏 (Abhidhamma Piṭaka)" 
    description="对佛法核心概念的绝对精确分类与哲学化论述。（整理中）" 
    href="/abhidhamma/" 
  />
  <LinkCard 
    title="AI 智能检索 (RAG)" 
    description="通过自然语言对话，精准定位经文段落与法义解析。" 
    href="/search/" 
  />
</CardGrid>