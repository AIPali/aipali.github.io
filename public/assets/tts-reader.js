// public/assets/tts-reader.js
// ==========================================
// 配置区域
// ==========================================
const TTS_CONFIG = {
  WORKER_URL: 'https://proxy.true-dhamma.com/tts-proxy',
  SHOW_SCROLL_TO_TOP_BUTTON: true,
  PREFETCH_WINDOW_SIZE: 5,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  ARTICLE_SELECTOR: '.sl-markdown-content', 
  EXCLUDE_PATHS: ['/', '/offline'], 
  EXCLUDE_DIRS: ['/tags/', '/info/'], 
  EXCLUDE_SELECTORS: '.p-ref', 
  SCROLL_OFFSET: 220, 
};

// ==========================================
// 全局状态与 DOM 引用
// ==========================================
let isReading = false;
let textQueue =[];
let currentIndex = 0;
let currentlyHighlightedElement = null;
let audioPlayer = new Audio();
let fetchController;

let container, controlBtn, playIcon, stopIcon, scrollTopBtn;

// ==========================================
// 工具与样式注入函数
// ==========================================
function shouldEnableTTS() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (TTS_CONFIG.EXCLUDE_PATHS.includes(path)) return false;
  if (TTS_CONFIG.EXCLUDE_DIRS.some(dir => path.includes(dir))) return false;
  return true;
}

function injectTTSUI() {
  if (document.getElementById('tts-fab-container')) return;

  const style = document.createElement('style');
  style.id = 'tts-style';
  style.textContent = `
    .tts-fab-container { position: fixed; bottom: 30px; right: 30px; z-index: 1000; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    
    .tts-button { display: flex; justify-content: center; align-items: center; width: 50px; height: 50px; border: 1px solid #eaeaea; background-color: #ffffff; border-radius: 50%; cursor: pointer; padding: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.3s ease, border-color 0.2s ease; }
    .tts-button:hover { background-color: #f2f2f2; transform: translateY(-2px); }
    .tts-button:active { transform: scale(0.95); }
    .tts-icon { fill: #333; width: 24px; height: 24px; transition: fill 0.2s ease; }
    .tts-highlight { background-color: #fef8e0; border-radius: 4px; transition: background-color 0.3s ease, color 0.3s ease; }

    /* 深色模式适配 (针对 Starlight 深色背景优化) */
    html[data-theme='dark'] .tts-button { background-color: #23262f; border: 1.5px solid #4a4d55; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    html[data-theme='dark'] .tts-button:hover { background-color: #353945; border-color: #7e8492; }
    html[data-theme='dark'] .tts-icon { fill: #ffffff; }
    html[data-theme='dark'] .tts-highlight { background-color: #4a3e10; color: #ffffff; }
  `;
  document.head.appendChild(style);

  const div = document.createElement('div');
  div.id = 'tts-fab-container';
  div.className = 'tts-fab-container';
  div.style.display = 'none';
  
  div.innerHTML = `
    <button id="tts-scroll-top-btn" class="tts-button" aria-label="回到顶部" style="display: none; opacity: 0;">
      <svg class="tts-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/></svg>
    </button>
    <button id="tts-control-btn" class="tts-button" aria-label="朗读文章">
      <svg class="tts-icon" id="tts-play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
      <svg class="tts-icon" id="tts-stop-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="display: none;"><path d="M6 6h12v12H6z"></path></svg>
    </button>
  `;
  document.body.appendChild(div);

  container = document.getElementById('tts-fab-container');
  controlBtn = document.getElementById('tts-control-btn');
  playIcon = document.getElementById('tts-play-icon');
  stopIcon = document.getElementById('tts-stop-icon');
  scrollTopBtn = document.getElementById('tts-scroll-top-btn');

  controlBtn.addEventListener('click', () => isReading ? stopReading(true) : startReading());
  if (TTS_CONFIG.SHOW_SCROLL_TO_TOP_BUTTON && scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

// ==========================================
// 核心逻辑函数
// ==========================================
function updateUI() {
  if (!playIcon || !stopIcon || !controlBtn) return;
  if (isReading) {
    playIcon.style.display = 'none';
    stopIcon.style.display = 'inline-block';
    controlBtn.setAttribute('aria-label', '停止朗读');
  } else {
    playIcon.style.display = 'inline-block';
    stopIcon.style.display = 'none';
    controlBtn.setAttribute('aria-label', '朗读文章');
  }
}

function clearHighlight() {
  if (currentlyHighlightedElement) {
    currentlyHighlightedElement.classList.remove('tts-highlight');
    currentlyHighlightedElement = null;
  }
}

function highlightElement(element) {
  clearHighlight();
  if (element) {
    element.classList.add('tts-highlight');
    currentlyHighlightedElement = element;
    const y = element.getBoundingClientRect().top + window.scrollY - TTS_CONFIG.SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

function handleScroll() {
  if (!TTS_CONFIG.SHOW_SCROLL_TO_TOP_BUTTON || !scrollTopBtn) return;
  const shouldBeVisible = window.scrollY > window.innerHeight / 2;
  if (shouldBeVisible) {
    scrollTopBtn.style.display = 'flex';
    requestAnimationFrame(() => scrollTopBtn.style.opacity = '1');
  } else {
    scrollTopBtn.style.opacity = '0';
    setTimeout(() => { if (window.scrollY <= window.innerHeight / 2) scrollTopBtn.style.display = 'none'; }, 300);
  }
}

function findStartingIndex() {
  return new Promise(resolve => {
    const elements = textQueue.map(item => item.element);
    const observer = new IntersectionObserver(entries => {
      let firstVisibleElement = null; let minTop = Infinity;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const top = entry.boundingClientRect.top;
          if (top < minTop) { minTop = top; firstVisibleElement = entry.target; }
        }
      });
      observer.disconnect();
      const foundIndex = firstVisibleElement ? elements.findIndex(el => el === firstVisibleElement) : -1;
      resolve(foundIndex > -1 ? foundIndex : 0);
    }, { threshold: 0.01, rootMargin: `-${TTS_CONFIG.SCROLL_OFFSET}px 0px 0px 0px` });
    elements.forEach(el => observer.observe(el));
  });
}

async function fetchAndCacheAudio(index, signal) {
  const item = textQueue[index];
  if (!item) return false;
  if (item.blobUrl) return true;

  if (item.fetchPromise) {
    return await item.fetchPromise;
  }

  item.fetchPromise = (async () => {
    let success = false;
    for (let i = 0; i < TTS_CONFIG.MAX_RETRIES; i++) {
      if (!isReading || signal.aborted) return false;
      try {
        const response = await fetch(TTS_CONFIG.WORKER_URL, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ text: item.text }), 
          signal: signal 
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const audioBlob = await response.blob();
        item.blobUrl = URL.createObjectURL(audioBlob);
        success = true;
        break;
      } catch (error) {
        if (error.name === 'AbortError') break;
        if (i < TTS_CONFIG.MAX_RETRIES - 1) { 
          await new Promise(res => setTimeout(res, TTS_CONFIG.RETRY_DELAY)); 
        }
      }
    }
    return success;
  })();

  const result = await item.fetchPromise;
  if (!result) item.fetchPromise = null;
  return result;
}

async function managePrefetchWindow() {
  const start = currentIndex + 1;
  const end = Math.min(currentIndex + TTS_CONFIG.PREFETCH_WINDOW_SIZE + 1, textQueue.length);
  for (let i = start; i < end; i++) {
    if (!isReading) break;
    await fetchAndCacheAudio(i, fetchController.signal);
  }
}

async function playCurrentAndPrefetchNext() {
  if (currentIndex >= textQueue.length || !isReading) { if (isReading) stopReading(true); return; }
  
  const previousItem = textQueue[currentIndex - 1];
  if (previousItem && previousItem.blobUrl) { URL.revokeObjectURL(previousItem.blobUrl); previousItem.blobUrl = null; }
  
  const currentItem = textQueue[currentIndex];
  highlightElement(currentItem.element);
  
  const success = await fetchAndCacheAudio(currentIndex, fetchController.signal);
  
  if (!isReading) return;
  
  // 【修改点 1】：获取音频失败时，不再中断停止，而是跳过当前段落继续下一段
  if (!success) { 
    console.warn(`[TTS] 跳过无法获取音频的段落: ${currentItem.text}`);
    currentIndex++;
    return playCurrentAndPrefetchNext();
  }
  
  audioPlayer.src = currentItem.blobUrl;
  
  // 【修改点 2】：捕获播放异常（如空文件/损坏的音频），跳过并播放下一段
  audioPlayer.play().catch(err => { 
    console.warn(`[TTS] 播放失败跳过 (${err.message}): ${currentItem.text}`);
    if (isReading) { 
      currentIndex++; 
      playCurrentAndPrefetchNext(); 
    } 
  });
  
  managePrefetchWindow();
}

async function startReading() {
  if (isReading) return;
  isReading = true;
  fetchController = new AbortController();
  updateUI();
  currentIndex = await findStartingIndex();
  if (!isReading) { stopReading(true); return; }
  playCurrentAndPrefetchNext();
}

function stopReading(shouldUpdateUI = false) {
  isReading = false;
  if (fetchController) { fetchController.abort(); fetchController = null; }
  if (audioPlayer) { audioPlayer.pause(); audioPlayer.src = ''; }
  textQueue.forEach(item => { 
    if (item.blobUrl) URL.revokeObjectURL(item.blobUrl); 
    item.blobUrl = null; 
    item.fetchPromise = null; 
  });
  clearHighlight();
  if (shouldUpdateUI) updateUI();
}

audioPlayer.onended = () => { if (isReading) { currentIndex++; playCurrentAndPrefetchNext(); } };

// 【修改点 3】：音频解码发生错误时跳过，而不是停止
audioPlayer.onerror = () => { 
  if (isReading) { 
    console.warn(`[TTS] 音频格式错误或加载失败，跳过...`);
    currentIndex++; 
    playCurrentAndPrefetchNext(); 
  } 
};

// ==========================================
// 初始化与生命周期绑定
// ==========================================
function initTTS() {
  stopReading(true);
  textQueue =[];
  currentIndex = 0;

  if (!shouldEnableTTS() || !document.querySelector(TTS_CONFIG.ARTICLE_SELECTOR)) {
    if (container) container.style.display = 'none';
    return;
  }
  
  injectTTSUI();

  const article = document.querySelector(TTS_CONFIG.ARTICLE_SELECTOR);
  const selector = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, figcaption';
  const allPotentialElements = Array.from(article.querySelectorAll(selector));
  const elementSet = new Set(allPotentialElements);

  const topLevelElements = allPotentialElements.filter(el => {
    if (el.closest('.expressive-code') || el.closest('.sl-steps')) return false;
    let parent = el.parentElement;
    while (parent && parent !== article) {
      if (elementSet.has(parent)) return false;
      parent = parent.parentElement;
    }
    return true;
  });

  topLevelElements.forEach(el => {
    let text;
    if (TTS_CONFIG.EXCLUDE_SELECTORS) {
      const clone = el.cloneNode(true);
      const ignoreElements = clone.querySelectorAll(TTS_CONFIG.EXCLUDE_SELECTORS);
      ignoreElements.forEach(node => node.remove());
      text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    } else {
      text = el.innerText.trim();
    }
 
    if (text) { 
      // 【修改点 4】：使用正则过滤，如果文本中去除了所有标点符号和空格后，没有任何实质内容(汉字/字母/数字)，则压根不加入队列
      // \p{P} 匹配所有标点符号(包含中英)，\p{S} 匹配符号(如$+~等)，\s 匹配空格
      const strippedText = text.replace(/[\p{P}\p{S}\s]/gu, '');
      if (strippedText.length > 0) {
        textQueue.push({ text: text, element: el, blobUrl: null, fetchPromise: null }); 
      }
    }
  });

  if (textQueue.length > 0) {
    container.style.display = 'flex';
    handleScroll();
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
  } else {
    container.style.display = 'none';
  }
}

document.addEventListener('astro:page-load', initTTS);
document.addEventListener('astro:before-swap', () => stopReading(false));
window.addEventListener('beforeunload', () => stopReading(false));

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTTS);
} else {
  initTTS();
}