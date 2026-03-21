import fs from 'fs';
import path from 'path';

// 1. 引入侧边栏数据 (请确保路径与你的项目结构一致)
import { sidebarDN } from '../src/data/sidebar/dn.mjs';
import { sidebarMN } from '../src/data/sidebar/mn.mjs';
import { sidebarSN } from '../src/data/sidebar/sn.mjs';
import { sidebarAN } from '../src/data/sidebar/an.mjs';
import { sidebarKN } from '../src/data/sidebar/kn.mjs';
import { sidebarVA } from '../src/data/sidebar/va.mjs';

const allSidebars = {
  dn: sidebarDN,
  mn: sidebarMN,
  sn: sidebarSN,
  an: sidebarAN,
  kn: sidebarKN,
  vinaya: sidebarVA
};

// 设定 Starlight 文档的根目录
const docsRoot = path.resolve('src/content/docs');

/**
 * 递归遍历侧边栏数据
 */
function scaffold(items) {
  for (const item of items) {
    if (item.link) {
      createFlatFile(item.link, item.label);
    }
    if (item.items) {
      scaffold(item.items);
    }
  }
}

/**
 * 创建扁平化的 .md 文件
 * 逻辑：/sutta/dn/dn-01/ -> sutta/dn/dn-01.md
 */
function createFlatFile(link, label) {
  // 过滤掉外部链接或纯首页
  if (link.startsWith('http') || link === '/') return;

  // 1. 路径清洗：去掉前后斜杠
  // 例如：'/sutta/dn/dn-01/' -> 'sutta/dn/dn-01'
  let cleanPath = link.replace(/^\/|\/$/g, '');

  // 2. 特殊处理：如果是各频道的首页入口（如 'sutta/dn'），
  // 为了防止它和 'sutta/dn.md' 冲突，通常 Starlight 建议 
  // 这种层级直接存为 'sutta/dn.md'。
  const fullPath = path.join(docsRoot, `${cleanPath}.md`);
  const dirPath = path.dirname(fullPath);

  // 3. 确保父级目录存在
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 创建目录: ${dirPath}`);
  }

  // 4. 【关键】防覆盖检查
  if (fs.existsSync(fullPath)) {
    // console.log(`⏩ 跳过已存在文件: ${cleanPath}.md`);
    return;
  }

  // 5. 写入内容
  const content = `---
title: "${label}"
---

# ${label}

> 🚧 **建设中**
> 本章节内容正在整理校对中。

`;

  try {
    fs.writeFileSync(fullPath, content);
    console.log(`📄 新建文件: ${cleanPath}.md`);
  } catch (err) {
    console.error(`❌ 写入失败: ${fullPath}`, err);
  }
}

// 执行生成逻辑
console.log('🚀 开始自动化同步侧边栏结构 (扁平化模式)...');
Object.values(allSidebars).forEach(sidebar => scaffold(sidebar));
console.log('✅ 同步完成！所有缺失的文件已补全。');