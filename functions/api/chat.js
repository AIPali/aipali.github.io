/**
 * Cloudflare Pages Function — /api/chat
 * AIPali 巴利三藏 AI 助手后端
 *
 * 部署方式：
 * 1. 本文件放在 functions/api/chat.js
 * 2. Cloudflare Pages 会自动识别并部署为 /api/chat 端点
 * 3. 在 Cloudflare Pages 面板中设置 DEEPSEEK_API_KEY 环境变量
 */

// 在构建时内联 NDJSON 数据（通过 import 从 public 目录加载）
// 注：Cloudflare Pages Functions 需要在构建时把数据打包进去
// 这里使用 import.meta.env 方式访问构建时注入的数据

export async function onRequest(context) {
  const { request, env } = context;

  // 只接受 POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '请使用 POST 方法' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: '请提供问题内容' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. 检索相关经文（从静态 NDJSON 中查找）
    const ndjsonUrl = new URL('/assets/pali-index-all.json', request.url);
    let entries = [];
    try {
      const resp = await fetch(ndjsonUrl.toString());
      if (resp.ok) {
        const text = await resp.text();
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try { entries.push(JSON.parse(trimmed)); } catch { /* skip */ }
        }
      }
    } catch (e) {
      console.warn('[AIPali Chat] Failed to load NDJSON:', e.message);
    }

    // 2. 关键词检索
    function scoreEntry(entry, keywords) {
      let score = 0;
      const fields = [
        entry.description || '',
        entry.zhTitle || '',
        entry.pliTitle || '',
        ...(entry.highlight || []),
        ...(entry.tag || []),
      ];
      for (const field of fields) {
        const lower = field.toLowerCase();
        for (const kw of keywords) {
          if (lower.includes(kw)) score += 1;
        }
      }
      for (const t of entry.tag || []) {
        const lower = t.toLowerCase();
        for (const kw of keywords) {
          if (lower.includes(kw)) score += 2;
        }
      }
      return score;
    }

    const words = message.match(/[\u4e00-\u9fff\w]{2,}/g) || [];
    const keywords = new Set(words.map(w => w.toLowerCase()));
    let retrieved = [];

    if (keywords.size > 0) {
      const scored = entries
        .map(e => ({ entry: e, score: scoreEntry(e, keywords) }))
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score);
      retrieved = scored.slice(0, 5).map(e => e.entry);
    }

    // 3. 构建 context
    function buildContext(retrieved) {
      if (retrieved.length === 0) return '';
      return retrieved.map((e, i) => {
        const highlights = (e.highlight || []).slice(0, 3).map(h => `  - ${h}`).join('\n');
        const tags = (e.tag || []).slice(0, 5).map(t => `#${t}`).join(' ');
        return `[${i + 1}] ${e.suttaCode || '?'}「${e.zhTitle || e.slug || ''}」
  描述：${e.description || '无'}
  重要经文摘要：
${highlights}
  标签：${tags || '无'}
  链接：${e.url || ''}`;
      }).join('\n\n');
    }

    const context = buildContext(retrieved);
    const hasContext = context.length > 0;

    // 4. 构建 system prompt
    const lang = message.match(/[\u4e00-\u9fff]/) ? '中文' : 'English';
    const systemPrompt = `You are AIPali Pali Tipitaka Assistant, an AI expert in the Theravada Pali Canon.

## Core Principles
1. **Scripture-based** — Cite specific sutta references (name, chapter)
2. **Honest** — Admit when you don't know; never fabricate quotes
3. **Skillful means** — Explain deep Dhamma in accessible language
4. **Middle way** — Stay objective, avoid extremes
5. **Beneficial** — Make answers genuinely helpful for practice

${hasContext ? `## Retrieved Scriptures
Reference scriptures for your answer:

${context}

Prioritize these passages. If insufficient, supplement from your Pali Canon knowledge, clearly distinguishing scripture from interpretation.` : `## Note
No directly matching scriptures were found. Answer from your broad Pali Canon knowledge, and note at the end: "This answer is based on my overall understanding of the Pali Canon."`}

## Format
- Opening: Direct answer (1-2 sentences)
- Body: Scripture references and Dhamma exposition
- Closing: Summary or practical advice
- Separate sections with blank lines

## Language
Respond in ${lang}.`;

    // 5. 调用 DeepSeek
    const apiKey = env.DEEPSEEK_API_KEY || '';
    if (!apiKey) {
      return new Response('⚠️ DeepSeek API key not configured', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const deepseekResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!deepseekResp.ok) {
      const err = await deepseekResp.text();
      return new Response(`⚠️ DeepSeek API error (${deepseekResp.status}): ${err}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 6. 转发流式响应
    return new Response(deepseekResp.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: `Server error: ${err.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
