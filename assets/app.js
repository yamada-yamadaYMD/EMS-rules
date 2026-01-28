async function loadJSON(path){
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to load ' + path);
  return await res.json();
}

async function loadText(path){
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to load ' + path);
  return await res.text();
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

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

//--const PAGES = [
  //{ key:'ems_rules',     hash:'#ems-rule', title:'EMSルール',           file:'./content/ems_rules.md' },
  //{ key:'ems_response',  hash:'#ems-care', title:'EMS対応',             file:'./content/ems_response.md' },
  //{ key:'ems_promotion', hash:'#ems-rank', title:'EMS職業別昇進基準',   file:'./content/ems_promotion.md' },
  //{ key:'car_list',      hash:'#cars',     title:'車リスト',            file:'./content/car_list.md' },
  //{ key:'report_guide',  hash:'#report',   title:'救急隊報告書説明',    file:'./content/report_guide.md' },
//];

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

  // 検索欄リセット（ページ切り替えでハイライト残さない）
  const input = document.getElementById('searchInput');
  input.value = '';

  const md = await loadText(page.file);
  const html = marked.parse(md, { mangle:false, headerIds:true });
  container.innerHTML = html;

  setActiveTOC(page.key);

  // タイトル更新
  document.title = `${page.title} | EMS`;
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
      await renderPage(page);
    });
  });

  // 初期表示（hashから）
  const start = getPageByHash(location.hash);
  await renderPage(start);

  // hash change（戻る/進む）
  window.addEventListener('hashchange', async () => {
    const page = getPageByHash(location.hash);
    await renderPage(page);
  });

  // search
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const root = document.getElementById('pageContainer');
    highlight(root, input.value.trim());
  });
}

main().catch(err => {
  console.error(err);
  alert('読み込みに失敗しました。content/*.md の存在とパスを確認してください。');
});
