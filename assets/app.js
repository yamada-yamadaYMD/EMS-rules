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

function buildTOC(container){
  const toc = document.getElementById('toc');
  toc.innerHTML = '';
  const headings = container.querySelectorAll('h2, h3');
  headings.forEach(h => {
    if(!h.id){
      h.id = 'h-' + Math.random().toString(36).slice(2, 9);
    }
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.className = (h.tagName === 'H3') ? 'lvl3' : 'lvl2';
    toc.appendChild(a);
  });
}

function buildFAQ(items){
  const root = document.getElementById('faqContainer');
  root.innerHTML = '';
  items.forEach((it) => {
    const wrap = document.createElement('div');
    wrap.className = 'faqItem';

    const btn = document.createElement('button');
    btn.className = 'faqQ';
    btn.innerHTML = `<span>${escapeHTML(it.q)}</span><span class="chev">▾</span>`;
    btn.addEventListener('click', () => wrap.classList.toggle('open'));

    const ans = document.createElement('div');
    ans.className = 'faqA';
    ans.textContent = it.a;

    wrap.appendChild(btn);
    wrap.appendChild(ans);
    root.appendChild(wrap);
  });
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

function bindCopyButtons(){
  document.querySelectorAll('.copyBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pre = btn.parentElement.querySelector('pre');
      if(!pre) return;
      try{
        await navigator.clipboard.writeText(pre.textContent);
        btn.textContent = 'コピーした！';
        setTimeout(() => btn.textContent = 'コピー', 1000);
      }catch(e){
        alert('コピーできませんでした（ブラウザ権限を確認）');
      }
    });
  });
}

async function main(){
  // load config
  const cfg = await loadJSON('./assets/config.json');
  document.title = `${cfg.siteTitle} | Rules`;
  document.getElementById('siteTitle').textContent = cfg.siteTitle;
  document.getElementById('tagline').textContent = cfg.tagline;
  document.getElementById('brandEmoji').textContent = cfg.brandEmoji || '🚑';
  document.getElementById('lastUpdated').textContent = cfg.lastUpdated || '—';
  document.getElementById('contact').textContent = cfg.contact || '—';

  const discordBtn = document.getElementById('discordBtn');
  discordBtn.href = cfg.discord && cfg.discord !== '[TBD]' ? cfg.discord : '#';
  if(discordBtn.href.endsWith('#')) discordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Discordリンクが未設定です。assets/config.json を編集してね。');
  });

  // load markdown
  const md = await loadText('./content/rules.md');
  const html = marked.parse(md, { mangle:false, headerIds:true });
  const rules = document.getElementById('rulesContainer');
  rules.innerHTML = html;

  // build toc
  buildTOC(rules);

  // faq
  const faq = await loadJSON('./content/faq.json');
  buildFAQ(faq);

  // search
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => highlight(rules, input.value.trim()));

  bindCopyButtons();
}

main().catch(err => {
  console.error(err);
  alert('読み込みに失敗しました。GitHub Pagesのパス/ファイル配置を確認してください。');
});
