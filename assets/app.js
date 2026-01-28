/* =========================
   Debug helpers
   ========================= */
const DEBUG = true; // ←本番で消したい時は false

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
   highlight helpers (unchanged)
   ========================= */
function clearHighlights(root){
  root.querySelectorAll('mark.highlight').forEach(m => {
    const text = document.createTextNode(m.textContent);
    m.replaceWith(text);
  });
}

function highlight(root, query){
  clearHighlights(root);
  if(!query) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if(!p) return NodeFilter.FILTER_REJECT;
      if(['SCRIPT','STYLE','CODE','PRE'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const q = query.toLowerCase();
  const nodes = [];
  while(walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(n => {
    const t = n.nodeValue;
    const idx = t.toLowerCase().indexOf(q);
    if(idx === -1) return;

    const before = document.createTextNode(t.slice(0, idx));
    const match = document.createElement('mark');
    match.className = 'highlight';
    match.textContent = t.slice(idx, idx + query.length);
    const after = document.createTextNode(t.slice(idx + query.length));

    const frag = document.createDocumentFragment();
    frag.appendChild(before);
    frag.appendChild(match);
    frag.appendChild(after);
    n.replaceWith(frag);
  });
}

/* =========================
   pages
   ========================= */
const PAGES = [
  { key:'ems_rules',     hash:'#ems-rule', title:'EMSルール',           file:'./content/ems_rules.md' },
  { key:'ems_response',  hash:'#ems-care', title:'EMS対応',             file:'./content/ems_response.md' },
  { key:'ems_promotion', hash:'#ems-rank', title:'EMS職業別昇進基準',   file:'./content/ems_promotion.md' },
  { key:'car_list',      hash:'#cars',     title:'車リスト',            file:'./content/car_list.md' },
  { key:'report_guide',  hash:'#report',   title:'救急隊報告書説明',    file:'./content/report_guide.md' },
];

function getPageByHash(hash){
  return PAGES.find(p => p.hash === hash) || PAGES[0];
}

function setActiveTOC(pageKey){
  document.querySelectorAll('#toc a[data-page]').forEach(a => {
    if(a.dataset.page === pageKey){
      a.style.background = 'rgba(255,255,255,.06)';
      a.style.borderColor = 'rgba(255,255,255,.10)';
    }else{
      a.style.background = '';
      a.style.borderColor = '';
    }
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

async function main(){
  // config
  const cfg = await loadJSON('./assets/config.json');

  document.getElementById('siteTitle').textContent = cfg.siteTitle || 'EMS';
  document.getElementById('tagline').textContent = cfg.tagline || '';
  document.getElementById('brandEmoji').textContent = cfg.brandEmoji || '🚑';
  document.getElementById('lastUpdated').textContent = cfg.lastUpdated || '—';
  document.getElementById('contact').textContent = cfg.contact || '—';

  const discordBtn = document.getElementById('discordBtn');
  discordBtn.href = cfg.discord && cfg.discord !== '[TBD]' ? cfg.discord : '#';
  if(discordBtn.href.endsWith('#')){
    discordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Discordリンクが未設定です。assets/config.json を編集してね。');
    });
  }

  // toc click
  document.querySelectorAll('#toc a[data-page]').forEach(a => {
    a.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = PAGES.find(p => p.key === a.dataset.page) || PAGES[0];
      history.replaceState(null, '', page.hash);

      try{
        await renderPage(page);
      }catch(err){
        console.error(err);
        showErrorOverlay(err.message, err.stack || String(err));
      }
    });
  });

  // 初期表示（hashから）
  const start = getPageByHash(location.hash);
  await renderPage(start);

  // hash change（戻る/進む）
  window.addEventListener('hashchange', async () => {
    const page = getPageByHash(location.hash);
    try{
      await renderPage(page);
    }catch(err){
      console.error(err);
      showErrorOverlay(err.message, err.stack || String(err));
    }
  });

  // search
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const root = document.getElementById('pageContainer');
    highlight(root, input.value.trim());
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
