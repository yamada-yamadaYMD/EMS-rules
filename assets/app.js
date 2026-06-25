
/* =========================
   Display mode
   ========================= */
const MODE_KEY = 'ems-site-mode';

function getInitialMode(){
  const saved = localStorage.getItem(MODE_KEY);
  if(['light','dark','minna'].includes(saved)) return saved;
  return 'light';
}

function applyMode(mode){
  const theme = mode === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.mode = mode;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(MODE_KEY, mode);

  document.querySelectorAll('.modeBtn').forEach(btn => {
    const active = btn.dataset.mode === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function setupModeSwitch(){
  applyMode(getInitialMode());
  document.querySelectorAll('.modeBtn').forEach(btn => {
    btn.addEventListener('click', () => applyMode(btn.dataset.mode));
  });
}

/* =========================
   Background rotation
   ========================= */
const BACKGROUND_IMAGES = [
  './assets/backgrounds/bg01.webp',
  './assets/backgrounds/bg02.webp',
  './assets/backgrounds/bg03.webp',
  './assets/backgrounds/bg04.webp',
  './assets/backgrounds/bg05.webp',
  './assets/backgrounds/bg06.webp',
  './assets/backgrounds/bg07.webp',
  './assets/backgrounds/bg08.webp',
  './assets/backgrounds/bg09.webp',
  './assets/backgrounds/bg10.webp',
  './assets/backgrounds/bg11.webp',
  './assets/backgrounds/bg12.webp',
  './assets/backgrounds/bg13.webp',
  './assets/backgrounds/bg14.webp',
  './assets/backgrounds/bg15.webp',
];

function setupBackgroundRotator(){
  const slideA = document.getElementById('bgSlideA');
  const slideB = document.getElementById('bgSlideB');
  if(!slideA || !slideB || !BACKGROUND_IMAGES.length) return;

  let currentIndex = 0;
  let active = slideA;
  let idle = slideB;

  const applyImage = (el, src) => {
    el.style.backgroundImage = `url(${src})`;
  };

  const nextIndex = () => (currentIndex + 1) % BACKGROUND_IMAGES.length;

  applyImage(active, BACKGROUND_IMAGES[currentIndex]);
  active.classList.add('is-visible');

  if(BACKGROUND_IMAGES.length > 1){
    applyImage(idle, BACKGROUND_IMAGES[nextIndex()]);
  }

  if(BACKGROUND_IMAGES.length === 1) return;

  setInterval(() => {
    currentIndex = nextIndex();
    applyImage(idle, BACKGROUND_IMAGES[currentIndex]);
    idle.classList.add('is-visible');
    active.classList.remove('is-visible');
    [active, idle] = [idle, active];
  }, 6500);
}

/* =========================
   Debug helpers
   ========================= */
const DEBUG = false; // ←エラー確認したい時だけ true

function debugLog(...args){
  if(DEBUG) console.log('[EMS DEBUG]', ...args);
}

function showErrorOverlay(message, detail){
  // 既にあれば更新
  let box = document.getElementById('debugOverlay');
  if(!box){
    box = document.createElement('div');
    box.id = 'debugOverlay';
    box.style.cssText = `
      position: fixed; inset: 16px;
      z-index: 99999;
      display: none;
      background: rgba(10,12,24,.92);
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 16px;
      backdrop-filter: blur(14px);
      box-shadow: 0 18px 60px rgba(0,0,0,.6);
      color: rgba(240,245,255,.92);
      padding: 16px;
      overflow: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    `;
    document.body.appendChild(box);
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);

  box.innerHTML = `
    <div style="display:flex; gap:10px; align-items:center; justify-content:space-between; margin-bottom:10px;">
      <div style="font-weight:800; font-size:14px;">⚠️ 読み込みエラー（デバッグ情報）</div>
      <button id="dbgClose" style="
        padding:10px 12px; border-radius:999px; border:1px solid rgba(255,255,255,.18);
        background: rgba(255,255,255,.06); color: rgba(240,245,255,.92); cursor:pointer;
      ">閉じる</button>
    </div>

    <div style="line-height:1.6; font-size:13px;">
      <div style="margin-bottom:8px;"><b>概要:</b> ${esc(message)}</div>
      <div style="margin-bottom:8px;"><b>URL:</b> ${esc(location.href)}</div>
      <div style="margin-bottom:8px;"><b>hash:</b> ${esc(location.hash || '(none)')}</div>
      <div style="margin-bottom:8px;"><b>ユーザー環境:</b> ${esc(navigator.userAgent)}</div>

      ${detail ? `<div style="margin-top:12px;"><b>詳細:</b><pre style="white-space:pre-wrap; margin:8px 0; padding:12px; border-radius:12px; background: rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.12);">${esc(detail)}</pre></div>` : ''}

      <div style="margin-top:12px; color: rgba(200,210,240,.75);">
        <b>よくある原因:</b><br>
        - content/*.md が存在しない / ファイル名が違う（大文字小文字含む）<br>
        - GitHub に push できてない<br>
        - Pages の公開元フォルダが違う（root /docs など）<br>
      </div>
    </div>
  `;

  box.style.display = 'block';
  box.querySelector('#dbgClose')?.addEventListener('click', () => {
    box.style.display = 'none';
  });
}

function showToast(msg){
  // 既にあれば更新
  let t = document.getElementById('debugToast');
  if(!t){
    t = document.createElement('div');
    t.id = 'debugToast';
    t.style.cssText = `
      position: fixed; right: 16px; bottom: 16px;
      z-index: 99998;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,.16);
      background: rgba(10,12,24,.75);
      backdrop-filter: blur(12px);
      color: rgba(240,245,255,.92);
      font-size: 12px;
      display: none;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(() => (t.style.display = 'none'), 2500);
}

/* =========================
   fetch wrappers (with status)
   ========================= */
async function loadJSON(path){
  debugLog('loadJSON:', path);
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok){
    const msg = `Failed to load JSON: ${path} (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }
  return await res.json();
}

async function loadText(path){
  debugLog('loadText:', path);
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok){
    const msg = `Failed to load TEXT: ${path} (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }
  return await res.text();
}

/* =========================
   highlight helpers (+ jump)
   ========================= */

// 検索状態（「次へ/前へ」用）
let searchMarks = [];
let searchIndex = -1;

function clearHighlights(root){
  // mark.highlight を全部テキストに戻す
  root.querySelectorAll('mark.highlight').forEach(m => {
    m.replaceWith(document.createTextNode(m.textContent || ''));
  });

  // 連続するTextNodeをまとめてDOMを綺麗にする
  root.normalize();
}

// 目的：ハイライトした mark を配列で返す（ジャンプに使う）
function highlight(root, query){
  clearHighlights(root);

  // 検索状態リセット
  searchMarks = [];
  searchIndex = -1;

  if(!query) return [];

  const q = query.trim();
  if(!q) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if(!p) return NodeFilter.FILTER_REJECT;

      // 触りたくない領域
      if(['SCRIPT','STYLE','CODE','PRE'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;

      // 入力などは除外
      if(p.closest('button, input, textarea, select')) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while(walker.nextNode()) nodes.push(walker.currentNode);

  const qLower = q.toLowerCase();

  nodes.forEach(n => {
    const text = n.nodeValue;
    const textLower = text.toLowerCase();

    let start = 0;
    let idx = textLower.indexOf(qLower, start);
    if(idx === -1) return;

    const frag = document.createDocumentFragment();

    while(idx !== -1){
      // before
      if(idx > start){
        frag.appendChild(document.createTextNode(text.slice(start, idx)));
      }

      // match
      const mark = document.createElement('mark');
      mark.className = 'highlight';
      mark.textContent = text.slice(idx, idx + q.length);
      frag.appendChild(mark);

      // ★ジャンプ候補として保存
      searchMarks.push(mark);

      start = idx + q.length;
      idx = textLower.indexOf(qLower, start);
    }

    // after
    if(start < text.length){
      frag.appendChild(document.createTextNode(text.slice(start)));
    }

    n.replaceWith(frag);
  });

  return searchMarks;
}

// 指定Indexの mark にスクロールして「今ここ」を強調
function jumpToMatch(idx){
  if(!searchMarks.length) return;
  if(idx < 0) idx = 0;
  if(idx >= searchMarks.length) idx = searchMarks.length - 1;

  searchIndex = idx;
  const m = searchMarks[searchIndex];
  if(!m) return;

  // 以前の「今の一致」強調を外す
  searchMarks.forEach(x => x.classList.remove('current'));

  // 今の一致を強調
  m.classList.add('current');

  // 画面内に持ってくる（ヘッダーのsticky分だけ少し余裕）
  // scrollIntoView は Safari でも安定
  m.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

  // 何件目かトーストで表示（邪魔なら消してOK）
  showToast(`一致: ${searchIndex + 1}/${searchMarks.length}`);
}

function jumpNext(){
  if(!searchMarks.length) return;
  const next = (searchIndex + 1) % searchMarks.length;
  jumpToMatch(next);
}

function jumpPrev(){
  if(!searchMarks.length) return;
  const prev = (searchIndex - 1 + searchMarks.length) % searchMarks.length;
  jumpToMatch(prev);
}

/* =========================
   pages
   ========================= */
const PAGES = [
  { key:'ems_rules',     hash:'#ems-rule', title:'EMSルール',           file:'./content/ems_rules.md' },
  { key:'ems_keep',      hash:'#ems-keep', title:'EMSとして守ること',   file:'./content/ems_keep.md' },
  { key:'ems_response',  hash:'#ems-care', title:'EMS対応',             file:'./content/ems_response.md' },
  { key:'ems_promotion', hash:'#ems-rank', title:'EMS職業別昇進基準',   file:'./content/ems_promotion.md' },
  { key:'car_list',      hash:'#cars',     title:'車リスト',            file:'./content/car_list.md' },
  { key:'report_guide',  hash:'#report',   title:'救急隊報告書説明',    file:'./content/report_guide.md' },
];

function getPageByHash(hash){
  return PAGES.find(p => p.hash === hash) || PAGES[0];
}

function getPageByKey(key){
  return PAGES.find(p => p.key === key) || null;
}

function setActiveTOC(pageKey){
  document.querySelectorAll('#toc a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageKey);
  });
}

async function renderPage(page){
  const container = document.getElementById('pageContainer');
  const title = document.getElementById('pageTitle');
  const pill = document.getElementById('pagePill');

  title.textContent = page.title;
  pill.textContent = page.file.replace('./content/','content/');

  const input = document.getElementById('searchInput');
  input.value = '';

  // 検索状態リセット
  searchMarks = [];
  searchIndex = -1;

  // marked がない場合もわかるように
  if(typeof marked === 'undefined'){
    throw new Error('marked が読み込まれていません（CDN失敗 or script順序）');
  }

  const md = await loadText(page.file);

  // 空ファイルチェック
  if(!md || !md.trim()){
    showToast(`警告: ${page.file} が空です`);
  }

  const html = marked.parse(md, { mangle:false, headerIds:true });
  container.innerHTML = html;

  setActiveTOC(page.key);
  document.title = `${page.title} | EMS`;

  debugLog('renderPage OK:', page.key);
}

/* =========================
   unified navigation
   ========================= */
async function navigateToPage(page, mode = 'replace'){ // mode: 'replace' | 'push'
  if(!page) page = PAGES[0];

  // hash をURLに反映（戻る/進むの整合性も取る）
  try{
    if(mode === 'push') history.pushState(null, '', page.hash);
    else history.replaceState(null, '', page.hash);
  }catch(_e){
    // 古い環境保険（普通は来ない）
    location.hash = page.hash;
  }

  try{
    await renderPage(page);
  }catch(err){
    console.error(err);
    showErrorOverlay(err.message, err.stack || String(err));
  }
}

/* =========================
   app main
   ========================= */
async function main(){
  setupModeSwitch();
  setupBackgroundRotator();

  // config
  const cfg = await loadJSON('./assets/config.json');

  document.getElementById('siteTitle').textContent = cfg.siteTitle || 'EMS';
  document.getElementById('tagline').textContent = cfg.tagline || '';
  document.getElementById('brandEmoji').textContent = cfg.brandEmoji || '🚑';
  document.getElementById('contact').textContent = cfg.contact || '—';

  const discordBtn = document.getElementById('discordBtn');
  if(discordBtn){
    discordBtn.href = cfg.discord && cfg.discord !== '[TBD]' ? cfg.discord : '#';
    if(discordBtn.href.endsWith('#')){
      discordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Discordリンクが未設定です。assets/config.json を編集してね。');
      });
    }
  }

  /* -------------------------
     TOC click (left tabs)
     - 既存の挙動を壊さない
     - ただし履歴に残す（push）ほうが自然
     ------------------------- */
  document.querySelectorAll('#toc a[data-page]').forEach(a => {
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const key = a.dataset.page;
      const page = getPageByKey(key) || PAGES[0];
      await navigateToPage(page, 'push');
    });
  });

  /* -------------------------
     Header / Hero links to hashes
     - #ems-keep などを押しても確実に同じ処理を通す
     ------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    // TOCは上で処理済みなので二重登録防止
    if(a.closest('#toc')) return;

    a.addEventListener('click', async (e) => {
      const href = a.getAttribute('href');
      if(!href || !href.startsWith('#')) return;

      // 外部リンクや空hashはスルー
      if(href === '#') return;

      // hashからページ取得 → 統一ナビゲーション
      const page = getPageByHash(href);
      e.preventDefault();
      await navigateToPage(page, 'push');
    });
  });

  // 初期表示（hashから）
  const start = getPageByHash(location.hash);
  await navigateToPage(start, 'replace');

  // hash change（戻る/進む / 直打ち）
  window.addEventListener('hashchange', async () => {
    const page = getPageByHash(location.hash);
    await navigateToPage(page, 'replace');
  });

  // search: 入力→ハイライト→最初の一致へジャンプ
  const input = document.getElementById('searchInput');

  // デバウンス（重さ・挙動の変さ防止）
  let searchTimer = null;

  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const root = document.getElementById('pageContainer');
      const marks = highlight(root, input.value);

      // 最初の一致へ飛ぶ
      if(marks.length){
        jumpToMatch(0);
      }else{
        // 見つからなかった時だけ軽く通知（いらなければ消してOK）
        if(input.value.trim()) showToast('一致なし');
      }
    }, 120);
  });

  // Enter で次へ、Shift+Enter で前へ
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      e.preventDefault();
      if(e.shiftKey) jumpPrev();
      else jumpNext();
    }
    // Escape で検索解除（任意）
    if(e.key === 'Escape'){
      input.value = '';
      const root = document.getElementById('pageContainer');
      clearHighlights(root);
      searchMarks = [];
      searchIndex = -1;
    }
  });
}

/* =========================
   Global error capture
   ========================= */
window.addEventListener('error', (e) => {
  if(!DEBUG) return;
  console.error('window.error:', e.error || e.message);
  showErrorOverlay('JavaScript Error', (e.error && e.error.stack) ? e.error.stack : (e.message || 'unknown'));
});

window.addEventListener('unhandledrejection', (e) => {
  if(!DEBUG) return;
  console.error('unhandledrejection:', e.reason);
  showErrorOverlay('Unhandled Promise Rejection', (e.reason && e.reason.stack) ? e.reason.stack : String(e.reason));
});

main().catch(err => {
  console.error(err);
  showErrorOverlay(err.message, err.stack || String(err));
});
