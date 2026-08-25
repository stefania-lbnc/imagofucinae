const CREAM = '#FBF3E4';
const ICONS = {
  Vespa: `<ellipse cx="16" cy="20" rx="9" ry="5.5" fill="${CREAM}"/><path d="M24 19 L36 9 L32 18 L36 20 L32 22 L36 30 Z" fill="${CREAM}" opacity=".75"/><circle cx="9" cy="19" r="3.4" fill="${CREAM}"/>`,
  Papilio: `<path d="M20 20 C10 6 2 8 4 20 C2 32 10 34 20 20 Z" fill="${CREAM}"/><path d="M20 20 C30 6 38 8 36 20 C38 32 30 34 20 20 Z" fill="${CREAM}" opacity=".85"/><rect x="19" y="12" width="2" height="16" fill="${CREAM}"/>`,
  Scarabaeus: `<ellipse cx="20" cy="21" rx="13" ry="10" fill="${CREAM}"/><circle cx="20" cy="9" r="5" fill="${CREAM}"/><line x1="20" y1="12" x2="20" y2="30" stroke="#14110F" stroke-width="1.4" opacity=".4"/>`,
  Mantis: `<path d="M14 34 L20 6 L26 34 Z" fill="${CREAM}"/><path d="M17 14 L4 8 M17 18 L4 20" stroke="${CREAM}" stroke-width="2.6"/><circle cx="20" cy="6" r="4" fill="${CREAM}"/>`,
  Libellula: `<rect x="18" y="4" width="4" height="32" rx="2" fill="${CREAM}"/><ellipse cx="10" cy="12" rx="9" ry="3" fill="${CREAM}" opacity=".8"/><ellipse cx="30" cy="12" rx="9" ry="3" fill="${CREAM}" opacity=".8"/><ellipse cx="10" cy="20" rx="9" ry="3" fill="${CREAM}" opacity=".55"/><ellipse cx="30" cy="20" rx="9" ry="3" fill="${CREAM}" opacity=".55"/>`,
  Cicada: `<path d="M20 20 L2 8 C2 24 12 26 20 20 Z" fill="${CREAM}" opacity=".85"/><path d="M20 20 L38 8 C38 24 28 26 20 20 Z" fill="${CREAM}" opacity=".85"/><ellipse cx="20" cy="20" rx="6" ry="9" fill="${CREAM}"/>`,
};

const VESPA_ILLUSTRATION = `<svg viewBox="0 0 420 320" xmlns="http://www.w3.org/2000/svg">
  <path d="M100,140 C160,60 260,20 340,25 C300,70 240,110 180,150 C150,165 120,160 100,140 Z" fill="#6E675F" opacity=".5"/>
  <path d="M95,155 C140,120 200,105 250,110 C215,140 170,165 130,175 C110,180 95,170 95,155 Z" fill="#6E675F" opacity=".38"/>
  <path d="M110,135 L300,45 M105,150 L260,90 M115,125 L330,55" stroke="#14110F" stroke-width="1.2" opacity=".3" fill="none"/>
  <path d="M80,150 C100,135 120,135 130,150 L128,190 C118,205 95,205 82,190 Z" fill="#6E675F"/>
  <path d="M128,168 C140,165 150,165 158,168 L158,178 C150,181 140,181 128,178 Z" fill="#6E675F"/>
  <path d="M158,168 C190,110 250,105 300,130 C340,150 365,165 380,175 C365,185 340,200 300,220 C250,245 190,240 158,182 Z" fill="#6E675F"/>
  <path d="M197,120 C205,150 205,185 197,215 L213,213 C220,183 220,148 213,122 Z" fill="#14110F" opacity=".3"/>
  <path d="M243,113 C250,145 250,180 243,210 L259,208 C266,178 266,143 259,116 Z" fill="#14110F" opacity=".3"/>
  <path d="M285,120 C290,148 290,178 285,203 L299,200 C305,175 305,148 299,123 Z" fill="#14110F" opacity=".3"/>
  <circle cx="55" cy="170" r="30" fill="#6E675F"/>
  <path d="M50,145 Q30,110 15,95 M62,145 Q55,105 45,85" stroke="#6E675F" stroke-width="2" fill="none"/>
  <ellipse cx="48" cy="163" rx="11" ry="15" fill="#14110F"/>
  <path d="M95,195 L75,240 M110,198 L95,245 M150,180 L140,225" stroke="#6E675F" stroke-width="3.5" fill="none"/>
</svg>`;

function getIllustration(s){
  if(s.insetto === 'Vespa') return VESPA_ILLUSTRATION;
  return `<svg viewBox="0 0 40 40" opacity=".85">${ICONS[s.insetto]}</svg>`;
}

function slugFor(s){ return s.gesto.toLowerCase(); }

// tutto cio che dipende dai contenuti parte solo dopo il fetch di content.json.
// alla fine, i contenuti veri si inseriscono li dentro: questa logica non cambia.
fetch('content.json')
  .then(res => res.json())
  .then(data => init(data.sections))
  .catch(err => console.error('Impossibile caricare content.json —', err,
    '(se stai aprendo il file direttamente da disco, serve un piccolo server locale: fetch non legge file:// per motivi di sicurezza del browser)'));

function init(SECTIONS){
  const nodesEl = document.getElementById('nodes');
  const gridLinesEl = document.getElementById('gridLines');
  const infoCard = document.getElementById('infoCard');
  const planeWrap = document.getElementById('planeWrap');
  const gridSvg = document.getElementById('gridSvg');
  const overlay = document.getElementById('overlay');
  const corpusOverlay = document.getElementById('corpusOverlay');

  for(let i=10;i<100;i+=10){
    gridLinesEl.insertAdjacentHTML('beforeend',
      `<line class="grid-line" x1="${i}" y1="0" x2="${i}" y2="100"></line>
       <line class="grid-line" x1="0" y1="${i}" x2="100" y2="${i}"></line>`);
  }

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  let activeTouchId = null;

  SECTIONS.forEach((s, i)=>{
    const btn = document.createElement('button');
    btn.className = 'node';
    btn.style.left = s.left + '%';
    btn.style.top = s.top + '%';
    btn.style.background = s.color;
    btn.style.setProperty('--i', i);
    btn.setAttribute('aria-label', `${s.sezione} — ${s.gesto}`);
    btn.innerHTML = `<svg viewBox="0 0 40 40">${ICONS[s.insetto]}</svg>`;
    if(isTouch){
      btn.addEventListener('click', ()=>{
        if(activeTouchId === s.id){ openSection(s); }
        else{ activeTouchId = s.id; showCard(s, btn); }
      });
    } else {
      btn.addEventListener('mouseenter', ()=>showCard(s, btn));
      btn.addEventListener('focus', ()=>showCard(s, btn));
      btn.addEventListener('mouseleave', hideCard);
      btn.addEventListener('blur', hideCard);
      btn.addEventListener('click', ()=>openSection(s));
    }
    nodesEl.appendChild(btn);
  });

  infoCard.addEventListener('click', ()=>{
    if(isTouch && activeTouchId){
      const s = SECTIONS.find(sec => sec.id === activeTouchId);
      if(s) openSection(s);
    }
  });

  document.addEventListener('click', (e)=>{
    if(!isTouch) return;
    if(!e.target.closest('.node') && !e.target.closest('.info-card')){
      hideCard();
      activeTouchId = null;
    }
  });

  function showCard(s, btn){
    document.getElementById('cGesto').textContent = s.gesto;
    document.getElementById('cTitle').textContent = s.sezione;
    document.getElementById('cSub').textContent = s.insetto;
    document.getElementById('cParola').textContent = s.parola;
    document.getElementById('cCoord').textContent = `digitale ${s.left} · segnale ${100 - s.top}`;

    if(isTouch){
      infoCard.classList.add('sheet-mode');
      infoCard.style.left = '';
      infoCard.style.top = '';
    } else {
      infoCard.classList.remove('sheet-mode');
      const rect = btn.getBoundingClientRect();
      const cardW = infoCard.offsetWidth || 200;
      const cardH = infoCard.offsetHeight || 150;
      let x = rect.right + 16, y = rect.top - 20;
      if(x + cardW > window.innerWidth - 16) x = rect.left - cardW - 16;
      x = Math.max(16, Math.min(x, window.innerWidth - cardW - 16));
      if(y + cardH > window.innerHeight - 16) y = window.innerHeight - cardH - 16;
      y = Math.max(16, y);
      infoCard.style.left = x + 'px';
      infoCard.style.top = y + 'px';
    }
    infoCard.classList.add('visible');
  }
  function hideCard(){ infoCard.classList.remove('visible'); }

  // off-canvas nav
  const burgerBtn = document.getElementById('burgerBtn');
  const navBackdrop = document.getElementById('navBackdrop');
  const navPanel = document.getElementById('navPanel');
  const navList = document.getElementById('navList');

  SECTIONS.forEach(s=>{
    const item = document.createElement('button');
    item.className = 'nav-item';
    item.innerHTML = `<span class="n">${s.id}</span><span class="g">${s.gesto}</span><span class="k">${s.parola}</span>`;
    item.addEventListener('click', ()=>{ toggleNav(false); openSection(s); });
    navList.appendChild(item);
  });

  function toggleNav(force){
    const open = force !== undefined ? force : !navPanel.classList.contains('open');
    navPanel.classList.toggle('open', open);
    navBackdrop.classList.toggle('open', open);
    burgerBtn.classList.toggle('open', open);
    navPanel.setAttribute('aria-hidden', String(!open));
  }
  burgerBtn.addEventListener('click', ()=>toggleNav());
  navBackdrop.addEventListener('click', ()=>toggleNav(false));

  // corpus
  document.getElementById('corpusLink').addEventListener('click', ()=>{
    toggleNav(false);
    openCorpus();
  });
  document.getElementById('corpusBack').addEventListener('click', ()=>{
    closeAll();
  });

  function openCorpus(pushHash = true){
    document.getElementById('corpusScroll').scrollTop = 0;
    corpusOverlay.classList.add('open');
    if(pushHash) location.hash = 'corpus';
  }

  function openSection(s, pushHash = true){
    hideCard();
    activeTouchId = null;
    overlay.style.setProperty('--ov-bg', s.color);
    document.getElementById('ovNumber').textContent = s.id;
    document.getElementById('ovIllustration').innerHTML = getIllustration(s);
    document.getElementById('ovInsetto').textContent = s.insetto;
    document.getElementById('ovGesto2').innerHTML =
      (s.gestoBreak || [s.gesto.toUpperCase()]).map(p => `<span class="g-line">${p}</span>`).join('');
    document.getElementById('ovSezioneName').textContent = s.sezione;
    document.getElementById('ovDesc').textContent = s.desc;

    const ovContent = document.getElementById('ovContent');
    ovContent.innerHTML = '';
    (s.opere || []).forEach(op=>{
      const card = document.createElement('div');
      card.className = 'op-card';
      card.textContent = op.title;
      ovContent.appendChild(card);
    });

    const idx = SECTIONS.findIndex(sec => sec.id === s.id);
    const prev = SECTIONS[(idx - 1 + SECTIONS.length) % SECTIONS.length];
    const next = SECTIONS[(idx + 1) % SECTIONS.length];
    const sectionNav = document.getElementById('sectionNav');
    sectionNav.innerHTML = `
      <button class="prev">← ${prev.gesto}</button>
      <button class="next">${next.gesto} →</button>`;
    sectionNav.querySelector('.prev').addEventListener('click', ()=>openSection(prev));
    sectionNav.querySelector('.next').addEventListener('click', ()=>openSection(next));

    document.getElementById('overlayScroll').scrollTop = 0;
    overlay.classList.add('open');
    if(pushHash) location.hash = slugFor(s);
  }

  document.getElementById('backBtn').addEventListener('click', ()=>{
    closeAll();
  });

  function closeAll(){
    overlay.classList.remove('open');
    corpusOverlay.classList.remove('open');
    if(location.hash){
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }

  // hash-routing: URL condivisibili per sezione, tasto indietro del browser funzionante
  function syncFromHash(){
    const hash = location.hash.replace('#','');
    if(!hash){
      overlay.classList.remove('open');
      corpusOverlay.classList.remove('open');
      return;
    }
    if(hash === 'corpus'){
      if(!corpusOverlay.classList.contains('open')) openCorpus(false);
      return;
    }
    const s = SECTIONS.find(sec => slugFor(sec) === hash);
    if(s){
      if(!overlay.classList.contains('open')) openSection(s, false);
    } else {
      overlay.classList.remove('open');
      corpusOverlay.classList.remove('open');
    }
  }
  window.addEventListener('hashchange', syncFromHash);
  syncFromHash(); // apre subito la sezione giusta se si arriva da un link diretto

  if(window.matchMedia('(pointer: fine)').matches){
    planeWrap.addEventListener('mousemove', (e)=>{
      const r = planeWrap.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width - .5);
      const dy = ((e.clientY - r.top) / r.height - .5);
      gridSvg.style.transform = `translate(${dx*6}px, ${dy*6}px)`;
      nodesEl.style.transform = `translate(${dx*-14}px, ${dy*-14}px)`;
    });
  }
}
