/**
 * today-right-view.js
 * 今日正见 — 高性能 NDJSON 流式读取器
 */

(function () {
  'use strict';

  // ─── 配置 ───────────────────────────────────────────────────────────────────
  const CONFIG = {
    dataDir: '/assets/',
    sources: {
      all:      'pali-index-all.json',
      dhp:      'pali-index-dhp.json',
      thag:     'pali-index-thag-thig.json',
    },
    storageKey: 'trv_source',
    tagCloudCount: 8, // 确保 PC 端为 4 行
    sampleChunkSize: 4096,
    probeCount: 20,
  };

  // ─── 状态 ───────────────────────────────────────────────────────────────────
  let state = {
    sourceKey: 'all',
    fileSize:  0,
    fileBlob:  null,
    currentEntry: null,
    tagEntries: [],
  };

  async function readSlice(blob, start, length) {
    const end = Math.min(start + length, blob.size);
    const slice = blob.slice(start, end);
    return await slice.text();
  }

  async function fetchFileBlob(sourceKey) {
    const url = CONFIG.dataDir + CONFIG.sources[sourceKey];
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`无法加载数据文件: ${url}`);
    return await resp.blob();
  }

  async function randomEntry(blob) {
    const size = blob.size;
    const offset = Math.floor(Math.random() * (size - CONFIG.sampleChunkSize));
    const chunk = await readSlice(blob, offset, CONFIG.sampleChunkSize);
    const firstNL = chunk.indexOf('\n');
    if (firstNL === -1) return null;
    const secondNL = chunk.indexOf('\n', firstNL + 1);
    const line = secondNL === -1 ? chunk.slice(firstNL + 1) : chunk.slice(firstNL + 1, secondNL);
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('{')) return null;
    try { return JSON.parse(trimmed); } catch { return null; }
  }

  async function pickRandomEntry(blob) {
    for (let i = 0; i < CONFIG.probeCount; i++) {
      const entry = await randomEntry(blob);
      if (entry && entry.slug && entry.highlight && entry.highlight.length) return entry;
    }
    const chunk = await readSlice(blob, 0, CONFIG.sampleChunkSize);
    const nl = chunk.indexOf('\n');
    try { return JSON.parse(nl === -1 ? chunk : chunk.slice(0, nl)); } catch { return null; }
  }

  async function pickTagCloud(blob, mainSlug, count) {
    const tags = [];
    const seenSlugs = new Set([mainSlug]);
    const attempts = count * 8;
    for (let i = 0; i < attempts && tags.length < count; i++) {
      const entry = await randomEntry(blob);
      if (!entry || !entry.slug || !entry.tag || seenSlugs.has(entry.slug)) continue;
      seenSlugs.add(entry.slug);
      const t = entry.tag[Math.floor(Math.random() * entry.tag.length)];
      if (t) tags.push({ tag: t, slug: entry.slug });
    }
    return tags;
  }

  async function findEntryBySlug(blob, targetSlug) {
    const size = blob.size;
    const chunkSize = 32768;
    let offset = 0;
    let carry = '';
    while (offset < size) {
      const raw = await readSlice(blob, offset, chunkSize);
      const text = carry + raw;
      const lines = text.split('\n');
      carry = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        if (t.includes(`"slug":"${targetSlug}"`)) {
          try { return JSON.parse(t); } catch { /* skip */ }
        }
      }
      offset += chunkSize;
    }
    if (carry.trim().includes(`"slug":"${targetSlug}"`)) {
      try { return JSON.parse(carry.trim()); } catch {}
    }
    return null;
  }

  function formatDate() {
    const now = new Date();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const pad = n => String(n).padStart(2, '0');
    return {
      full: `${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())}`,
      week: `星期${days[now.getDay()]}`,
    };
  }

  // ─── 渲染入口 ────────────────────────────────────────────────────────────────
  function render(entry, tagCloud) {
    state.currentEntry = entry;
    state.tagEntries = tagCloud;

    const root = document.getElementById('aipali-trv');
    if (!root) return;

    const date = formatDate();
    const tags = (entry.tag || []).slice(0, 4);
    // const highlights = entry.highlight || [];
    const highlights = (entry.highlight || []).slice(0, 5);

    // SVG 刷新图标
    const refreshIcon = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
    `;

    root.innerHTML = `
<div class="trv-widget">
  <!-- 头部 -->
  <div class="trv-header">
    <div class="trv-header-left">
      <span class="trv-title-zh">今日正见</span>
      <span class="trv-title-pi">Sammā-Diṭṭhi</span>
    </div>
    <div class="trv-header-right">
      <select class="trv-source-select" id="trv-source-select">
        <option value="all" ${state.sourceKey === 'all' ? 'selected' : ''}>全部</option>
        <option value="dhp" ${state.sourceKey === 'dhp' ? 'selected' : ''}>法句经</option>
        <option value="thag" ${state.sourceKey === 'thag' ? 'selected' : ''}>长老偈</option>
      </select>
      <span class="trv-date">${date.full}</span>
      <span class="trv-weekday">${date.week}</span>
    </div>
  </div>

  <div class="trv-header-line"></div>

  <!-- 主体三栏 -->
  <div class="trv-body">
    <!-- 左：导读与出处 -->
    <div class="trv-col trv-col-left" role="button" tabindex="0" data-open="${entry.url}">
      <div class="trv-description">${entry.description || ''}</div>
      <div class="trv-source-info">
        <div class="trv-sutta-code">${entry.suttaCode || ''}</div>
        <div class="trv-sutta-zh">${entry.zhTitle || ''}</div>
        ${entry.pliTitle ? `<div class="trv-sutta-pli">${entry.pliTitle}</div>` : ''}
      </div>
      <div class="trv-left-tags">
        ${tags.map(t => `<span class="trv-tag-left">${t}</span>`).join('')}
      </div>
    </div>

    <!-- 中：核心经句 -->
    <div class="trv-col trv-col-mid" role="button" tabindex="0" data-open="${entry.url}">
      <ul class="trv-highlights">
        ${highlights.map(h => `
          <li>
            <span class="trv-bullet">◆</span>
            <span class="trv-hl-text">${h}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <!-- 右：探索 tag 云 (PC & Tablet) -->
    <div class="trv-col trv-col-right">
      <div class="trv-cloud-wrapper">
        <div class="trv-cloud-label">探索其他经文</div>
        <div class="trv-cloud" id="trv-cloud">
          ${tagCloud.map(tc => `<button class="trv-cloud-tag" data-slug="${tc.slug}">${tc.tag}</button>`).join('')}
        </div>
      </div>
      <button class="trv-refresh-btn trv-refresh-action">
        ${refreshIcon}换一个
      </button>
    </div>
  </div>

  <!-- 移动端：横条变为最多2行自动截断 -->
  <div class="trv-mobile-tags">
    ${tagCloud.map(tc => `
      <button class="trv-mobile-tag" data-slug="${tc.slug}">${tc.tag}</button>
    `).join('')}
  </div>

  <!-- 移动端专属刷新按钮（彻底分离 DOM 解决手机端布局失效问题） -->
  <button class="trv-refresh-btn trv-mobile-btn trv-refresh-action">
    ${refreshIcon}换一个
  </button>

</div>`;

    bindEvents(root, entry);
  }

  function bindEvents(root, entry) {
    // 点击左/中打开经文
    root.querySelectorAll('[data-open]').forEach(el => {
      const handler = () => {
        const url = el.getAttribute('data-open');
        if (url) window.open(url, '_blank');
      };
      el.addEventListener('click', handler);
      el.addEventListener('keydown', e => { if (e.key === 'Enter') handler(); });
    });

    // 下拉框数据源切换
    const sourceSelect = root.querySelector('#trv-source-select');
    if (sourceSelect) {
      sourceSelect.addEventListener('change', async (e) => {
        const key = e.target.value;
        if (key === state.sourceKey) return;
        state.sourceKey = key;
        sessionStorage.setItem(CONFIG.storageKey, key);
        await loadAndRender();
      });
    }

    // 换一个 (绑定所有 class 为 trv-refresh-action 的按钮，覆盖 PC 和 手机)
    root.querySelectorAll('.trv-refresh-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        // 禁用所有刷新按钮防止连点
        root.querySelectorAll('.trv-refresh-action').forEach(b => b.disabled = true);
        await loadAndRender();
      });
    });

    // tag 云点击
    root.querySelectorAll('.trv-cloud-tag, .trv-mobile-tag').forEach(btn => {
      btn.addEventListener('click', async () => {
        const slug = btn.getAttribute('data-slug');
        if (!slug || !state.fileBlob) return;
        setLoading(true);
        const found = await findEntryBySlug(state.fileBlob, slug);
        if (found) {
          const newTags = await pickTagCloud(state.fileBlob, found.slug, CONFIG.tagCloudCount);
          render(found, newTags);
        }
        setLoading(false);
      });
    });

    // 手机版左右滑动
    if (!root.dataset.swipeBound) {
      root.dataset.swipeBound = '1';
      let tx, ty, isX;
      root.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; isX = null; }, {passive: true});
      root.addEventListener('touchmove', e => { let dx = Math.abs(e.touches[0].clientX - tx), dy = Math.abs(e.touches[0].clientY - ty);
        if (isX === null && (dx > 5 || dy > 5)) isX = dx > dy; if (isX) e.preventDefault(); }, {passive: false});
      root.addEventListener('touchend', e => { 
        // 增加防连滑机制，并在切换成功后柔性居中
        if (isX && Math.abs(e.changedTouches[0].clientX - tx) > 60 && !root.classList.contains('trv-loading')) {
          loadAndRender().then(() => setTimeout(() => root.scrollIntoView({behavior: 'smooth', block: 'center'}), 100));
        }
      });
    }

  }

  function setLoading(loading) {
    const root = document.getElementById('aipali-trv');
    if (!root) return;
    if (loading) root.classList.add('trv-loading');
    else root.classList.remove('trv-loading');
  }

  async function loadAndRender() {
    setLoading(true);
    try {
      state.fileBlob = await fetchFileBlob(state.sourceKey);
      const entry = await pickRandomEntry(state.fileBlob);
      if (!entry) throw new Error('未能读取到有效条目');
      const tagCloud = await pickTagCloud(state.fileBlob, entry.slug, CONFIG.tagCloudCount);
      render(entry, tagCloud);
    } catch (err) {
      const root = document.getElementById('aipali-trv');
      if (root) root.innerHTML = `<div class="trv-error">今日正见暂时无法加载（${err.message}）</div>`;
      console.error('[TRV]', err);
    }
    setLoading(false);
  }

  async function init() {
    const saved = sessionStorage.getItem(CONFIG.storageKey);
    if (saved && CONFIG.sources[saved]) state.sourceKey = saved;
    await loadAndRender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TRV = { reload: loadAndRender, state };

})();