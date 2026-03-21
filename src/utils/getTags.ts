import { getCollection, type CollectionEntry } from 'astro:content';

// 定义返回的数据结构
interface TagsData {
  tagCounts: Record<string, number>;
  allDocs: CollectionEntry<'docs'>[];
}

// 模块级缓存变量
let cachedData: TagsData | null = null;

export async function getTagsData(): Promise<TagsData> {
  // 如果已经计算过，直接返回缓存结果
  if (cachedData) {
    return cachedData;
  }

  const allDocs = await getCollection('docs');
  const tagCounts: Record<string, number> = {};

  allDocs.forEach(doc => {
    // 假设你的 tags 字段在 frontmatter 中
    const docTags = doc.data.tags;
    if (docTags) {
      const tagsArr = Array.isArray(docTags) ? docTags : [docTags];
      tagsArr.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }
  });

  // 写入缓存
  cachedData = {
    tagCounts,
    allDocs
  };

  console.log(`[Tags Utility] 成功索引了 ${allDocs.length} 篇文档，生成了 ${Object.keys(tagCounts).length} 个唯一标签。`);
  
  return cachedData;
}