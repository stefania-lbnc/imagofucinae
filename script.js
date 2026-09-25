const CREAM = '#FBF3E4';
const ICONS = {
  Vespa: `<img src="assets/vespa.png" alt="Vespa" style="transform: rotate(45deg);">`,
  Papilio: `<img src="assets/papillo.png" alt="Papillo" style="transform: rotate(45deg);">`,
  //Scarabaeus: `<img src="assets/vespa.png" alt="Vespa" style="transform: rotate(45deg);">`,
  //Mantis: `<img src="assets/vespa.png" alt="Vespa" style="transform: rotate(45deg);">`,
  Libellula: `<img src="assets/libellula.png." alt="Libellula" style="transform: rotate(45deg);">`,
  //Cicada: `<img src="assets/vespa.png" alt="Vespa" style="transform: rotate(45deg);">`,
};

const ILLUSTRATIONS = {
  Vespa: `<img src="assets/vespa.png" alt="Vespa">`,
};

function getIllustration(s){
  if(ILLUSTRATIONS[s.insetto]) return ILLUSTRATIONS[s.insetto];
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
    btn.innerHTML = ICONS[s.insetto];
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
