
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };

  /* ---------- content ----------
     Every package the Store sells (store.html), as the shared card (packages.js): AIS PLAY's bundles (Packages.BUNDLES)
     and each app's and league's packages (Packages.PKG, Packages.ottCard). Each card lists the tabs it shows on (tabs)
     and what it carries (tags), for the filters: sports, leagues, apps and AIS PLAY bundles. */
  var P = 'icons/pkg/';
  var OTT = Packages.OTT, PKG = Packages.PKG;
  // the apps by tab (Movies: the film and series apps; Short Drama: the short drama apps, with iQIYI's); a league's sport
  var MOVIES = ['netflix', 'hbo', 'disney', 'prime', 'iqiyi', 'viu', 'monomax'], SHORTS = ['reelshort', 'dramabox', 'iqiyi'];
  var SPORT_OF = { epl:'football', ucl:'football', bundesliga:'football', thai1:'football', nba:'basketball', motogp:'motorsports', pga:'golf', rws:'boxing' };
  var B = Packages.BUNDLES;
  B[0].tabs = ['foryou', 'bundle']; B[1].tabs = ['foryou', 'bundle', 'movies']; B[2].tabs = ['foryou', 'bundle', 'sports'];
  var PKGS = B.slice();
  Object.keys(PKG).forEach(function(k){
    var lg = OTT[k].league, tabs = lg ? ['sports'] : [];
    if(MOVIES.indexOf(k) >= 0) tabs.push('movies');
    if(SHORTS.indexOf(k) >= 0) tabs.push('shorts');
    PKG[k].forEach(function(p, i){
      var c = Packages.ottCard(k, i);
      c.tags = [k].concat(lg ? [SPORT_OF[k]] : []);
      // For You: each app's and league's recommended package (its first), after the bundles
      c.tabs = tabs.concat(i ? [] : ['foryou']);
      c.badge = i ? '' : c.badge;
      PKGS.push(c);
    });
  });

  // the filters under each tab (Figma's variants); logos reuse the project's league and service logos
  var LOGO = {
    netflix:{ img:P + 'l2.png', cls:'black contain' }, hbo:{ img:P + 'l3.png', cls:'black contain' }, disney:{ img:P + 'l4.png', cls:'black' },
    iqiyi:{ img:P + 'l5.png' }, viu:{ img:P + 'l6.png' }, prime:{ img:'badges/tag-prime.png' }, wetv:{ img:P + 'd-wetv.png', cls:'contain' },
    monomax:{ img:'badges/tag-monomax.png', cls:'black contain' },
    epl:{ img:'sport-assets/league-epl.png', cls:'' }, ucl:{ img:'sport-assets/league-ucl.jpg', cls:'zoom' },
    bundesliga:{ img:'sport-assets/league-bundesliga.png', cls:'inset' }, motogp:{ img:P + 'd-motogp.png', cls:'contain' },
    nba:{ img:P + 'l21.png', cls:'inset' }, nfl:{ img:P + 'l22.png', cls:'inset' }, lpga:{ img:P + 'l23.png', cls:'inset' },
    atp:{ img:P + 'l25.png', cls:'contain' }, rws:{ img:'sport-assets/league-rws.png', cls:'black' },
    // the short drama apps: ReelShort and DramaBox their square app icons (badges/tag-*.png), WeTV and iQIYI as on Movies
    reelshort:{ img:'badges/tag-reelshort.png' }, dramabox:{ img:'badges/tag-dramabox.png' }
  };
  var TABS = [
    { key:'foryou', t:'For You', icon:'tab-foryou' },
    { key:'sports', t:'Sports', icon:'tab-sports',
      names:[['all', 'All'], ['football', 'Football'], ['motorsports', 'Motorsports'], ['golf', 'Golf'], ['basketball', 'Basketball'],
        ['tennis', 'Tennis'], ['rugby', 'Rugby'], ['boxing', 'Boxing']],
      logos:['epl', 'ucl', 'bundesliga', 'motogp', 'nba', 'nfl', 'lpga', 'atp', 'rws'] },
    { key:'movies', t:'Movies', icon:'tab-movies', logos:['netflix', 'hbo', 'disney', 'iqiyi', 'viu', 'prime', 'wetv', 'monomax'] },
    { key:'shorts', t:'Short Drama', icon:'tab-shorts', logos:['reelshort', 'dramabox', 'wetv', 'iqiyi'] },
    { key:'bundle', t:'AIS PLAY Bundle', icon:'tab-bundle',
      names:[['all', 'All'], ['ultimate', 'PLAY ULTIMATE'], ['premiumplus', 'PLAY PREMIUM PLUS'], ['inter', 'PLAY INTER'], ['disneyplus', 'PLAY Disney+'],
        ['premium', 'PLAY PREMIUM'], ['asian', 'PLAY ASIAN GAMES']],
      logos:['netflix', 'hbo', 'disney', 'iqiyi', 'viu', 'epl', 'ucl', 'bundesliga', 'motogp', 'nba', 'nfl', 'lpga', 'atp', 'rws'] }
  ];

  /* ---------- markup ---------- */
  function cardHtml(p, i){ return Packages.cardHtml(p, ' data-i="' + i + '"'); }   // packages.js: the shared card
  function logoHtml(k){
    var l = LOGO[k];
    return '<div class="ava item ' + (l.ph ? 'ph' : (l.cls || '')) + '" data-f="' + k + '"' + (l.ph ? '' : ' style="background-image:url(\'' + l.img + '\')"') + ' data-ring-art=""></div>';
  }

  var tabsEl = $('.tabs')[0], namesEl = $('.names')[0], logosEl = $('.logos')[0], cardsEl = $('.cards')[0], page = document.getElementById('page');
  tabsEl.innerHTML = TABS.map(function(tb){
    return '<div class="tab item" data-key="' + tb.key + '" data-ring-art=""><img src="store-assets/allpkg/' + tb.icon + '.svg" alt="">' + esc(tb.t) + '</div>';
  }).join('');

  /* ---------- state: the picked tab, its picked filters, the focus ----------
     rows: the top bar, the tabs, then (when the tab has them) the names and the logos, then the cards (when any match);
     cur.from: the row the top bar was reached from */
  var navItems = $('.topnav .item'), NAV_STORE = navItems.indexOf(document.querySelector('.navtab.active'));
  var tabAt = 0, pick = {}, rows = [], cur = { row:1, col:{ nav:NAV_STORE }, from:'tabs' };
  TABS.forEach(function(tb){ pick[tb.key] = { name:'all', logo:'all' }; });
  var q = location.search.match(/[?&]tab=(\w+)/);
  if(q) TABS.forEach(function(tb, i){ if(tb.key === q[1]) tabAt = i; });

  function matches(){
    var tb = TABS[tabAt], p = pick[tb.key];
    return PKGS.filter(function(pk){
      return pk.tabs.indexOf(tb.key) >= 0 && (p.name === 'all' || pk.tags.indexOf(p.name) >= 0) && (p.logo === 'all' || pk.tags.indexOf(p.logo) >= 0);
    });
  }
  // the filter rows and the cards for the picked tab and filters
  function build(){
    var tb = TABS[tabAt], p = pick[tb.key];
    namesEl.hidden = !tb.names; logosEl.hidden = !tb.logos;
    namesEl.innerHTML = tb.names ? tb.names.map(function(n){ return '<div class="flt item' + (p.name === n[0] ? ' on' : '') + '" data-f="' + n[0] + '" data-ring-art="">' + esc(n[1]) + '</div>'; }).join('') : '';
    logosEl.innerHTML = tb.logos ? '<div class="flt item' + (p.logo === 'all' ? ' on' : '') + '" data-f="all" data-ring-art="">All</div>' +
      tb.logos.map(logoHtml).join('') : '';
    $('.ava', logosEl).forEach(function(a){ a.classList.toggle('on', a.dataset.f === p.logo); });
    var list = matches();
    cardsEl.innerHTML = list.map(function(pk){ return cardHtml(pk, PKGS.indexOf(pk)); }).join('');
    document.body.classList.toggle('none', !list.length);
    $('.tab', tabsEl).forEach(function(el, i){ el.classList.toggle('on', i === tabAt); });
    rows = [{ key:'nav', items:navItems }, { key:'tabs', el:tabsEl, items:$('.item', tabsEl) }];
    if(tb.names) rows.push({ key:'names', el:namesEl, items:$('.item', namesEl) });
    if(tb.logos) rows.push({ key:'logos', el:logosEl, items:$('.item', logosEl) });
    if(list.length) rows.push({ key:'cards', el:cardsEl, items:$('.item', cardsEl) });
    rows.forEach(function(r){ if(r.key !== 'nav' && r.key !== 'tabs') bindClicks(r); });   // those two are built once
  }
  // a click focuses the item (picking a tab or a filter, as landing on it does), then selects it
  function bindClicks(r){
    r.items.forEach(function(el, ci){ el.addEventListener('click', function(){
      if(r.key === 'nav' && cur.row) cur.from = rows[cur.row].key;
      cur.row = rowOf(r.key); setCol(ci); land(); paint(); select(el);
    }); });
  }
  function rowOf(key){ for(var i = 0; i < rows.length; i++) if(rows[i].key === key) return i; return -1; }
  function col(){ var r = rows[cur.row]; return Math.min(cur.col[r.key] || 0, r.items.length - 1); }
  function setCol(c){ cur.col[rows[cur.row].key] = c; }

  // landing on a tab or a filter picks it (as the Store's tab bars do); the rows under it are rebuilt
  function land(){
    var r = rows[cur.row], el = r.items[col()], tb = TABS[tabAt];
    if(r.key === 'tabs'){
      if(col() === tabAt) return;
      tabAt = col(); cur.col.names = 0; cur.col.logos = 0; cur.col.cards = 0;
    } else if(r.key === 'names' || r.key === 'logos'){
      var k = r.key === 'names' ? 'name' : 'logo';
      if(pick[tb.key][k] === el.dataset.f) return;
      pick[tb.key][k] = el.dataset.f; cur.col.cards = 0;
    } else return;
    var key = r.key;
    build();
    cur.row = rowOf(key);
  }

  // ---- keep the focused item in view: a rail slides under a fixed slot (its first item's), until its end is in;
  // the page moves up when the cards would reach past y=1014 (Figma's bottom edge for them) ----
  function slide(r){
    var c = col(), el = r.items[c];
    if(!el){ r.el.style.transform = ''; return; }
    var want = el.offsetLeft - r.items[0].offsetLeft, max = Math.max(0, r.el.scrollWidth - 1920);
    r.el.style.transform = 'translateX(' + -Math.max(0, Math.min(want, max)) + 'px)';
  }
  // the profile panel under the top bar's photo, as on Home (profile-panel.js)
  var profileEl = document.querySelector('.topnav .profile'), prof = ProfilePanel(profileEl, { paint:paint, toast:toast });

  function paint(){
    var inProf = prof.paint(cur.row === 0 && navItems[col()] === profileEl);   // focus is in the profile panel
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){ el.classList.toggle('focused', !inProf && ri === cur.row && ci === col()); }); });
    // top-bar tab states (button-theme.css): the current page's tab is Active while the D-pad is on the bar, Active dim in the content
    var curTab = document.querySelector('.topnav .navtab.active, .topnav .navtab.active-dim');
    curTab.classList.toggle('active', cur.row === 0); curTab.classList.toggle('active-dim', cur.row !== 0);
    // the category tabs, as the Store's: the picked one Active dim while focus is off its tab bar (its glass, no ring)
    var tabsRow = rowOf('tabs');
    $('.tab', tabsEl).forEach(function(el){ el.classList.toggle('active-dim', el.classList.contains('on') && cur.row !== tabsRow); });
    rows.forEach(function(r, ri){ if(ri === cur.row && r.el) slide(r); });
    document.body.classList.toggle('on-nav', cur.row === 0);
    var r = cur.row === 0 ? rows[Math.max(1, rowOf(cur.from))] : rows[cur.row], y = 0;   // on the top bar the page stays as it was
    if(r.key === 'cards') y = Math.max(0, cardsEl.offsetTop + cardsEl.offsetHeight - 1014);
    page.style.transform = 'translateY(' + -y + 'px)';
  }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function select(el){
    if(el === profileEl) return;   // its panel is already open under it
    if(el.dataset.href){ location.href = el.dataset.href; return; }
    if(rows[0].items.indexOf(el) >= 0){ toast(el.dataset.label + ' (demo)'); return; }
    if(!el.classList.contains('pcard')) return;   // tabs and filters are picked on landing
    var pk = PKGS[+el.dataset.i];
    el.animate([{ transform:'scale(1)' }, { transform:'scale(0.98)' }], { duration:140, easing:'ease-out' });
    // PLAY ULTIMATE: the same purchase flow as Movie Detail's and the Store's (package-detail.html), coming back here
    // PLAY ULTIMATE and PLAY ALL: their detail page and purchase (package-detail.html; packages.js href), coming back here
    if(pk.detail || pk.tv){ save(); location.href = (pk.href || 'package-detail.html') + (/\?/.test(pk.href || '') ? '&' : '?') + 'from=all-packages' + RET_Q; return; }
    // any other package (an app's or a league's, HBO MAX Standard): its Package Detail, coming back here
    if(pk.href){ save(); location.href = pk.href + '&from=all-packages' + RET_Q; return; }
    toast('Subscribe to ' + pk.title + ' (demo)');
  }
  // Back: up to the tabs first, then where the page was opened from (its Back lands on View All / See all Packages).
  // That page is remembered for the session, so it still holds after a trip through the package detail page.
  // (a short drama page: its address, so Back returns to the same short)
  // (the Live TV player, from Explore Package: its address, so Back returns to the same channel and programme)
  var ref = document.referrer || '', OPENER = /movie-detail\.html/.test(ref) ? 'movie-detail.html#packages' : /store\.html/.test(ref) ? 'store.html' :
    /short-detail\.html/.test(ref) ? 'short-detail.html' + (ref.match(/\?s=\d+/) || [''])[0] :
    /live-tv-player\.html/.test(ref) ? 'live-tv-player.html' + (ref.match(/\?[^#]*/) || [''])[0] : '';
  try { if(OPENER) sessionStorage.setItem('apOpener', OPENER); else OPENER = sessionStorage.getItem('apOpener') || 'store.html'; } catch(e){ OPENER = OPENER || 'store.html'; }
  if(!/\.html/.test(OPENER)) OPENER = OPENER === 'movie-detail' ? 'movie-detail.html#packages' : 'store.html';   // (saved by an earlier version)
  // ?ret=: a detail page's View Package with no package of its own (content.js Content.packageUrl): PLAY ULTIMATE's
  // purchase goes back there (package-detail.html ?ret=), subscribed
  var RET = (location.search.match(/[?&]ret=([^&#]+)/) || [])[1], RET_Q = RET ? '&ret=' + RET : '';
  function back(){
    if(cur.row > 1){ cur.row = 1; paint(); return; }
    try { if(document.referrer && /(store|movie-detail|short-detail|live-tv-player|package-suggest)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = OPENER;
  }
  // leaving for the package detail page: coming back lands on the same tab, filters and card
  function save(){ try { sessionStorage.setItem('apReturn', JSON.stringify({ tabAt:tabAt, pick:pick, cur:cur })); } catch(e){} }

  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    var r = rows[cur.row], c = col(), handled = true;
    if(e.key === 'ArrowRight') setCol(Math.min(r.items.length - 1, c + 1));
    else if(e.key === 'ArrowLeft'){
      // Left on a row's first item goes up to the top bar (its Store tab), as on Home
      if(cur.row > 0 && c === 0){ cur.from = r.key; cur.row = 0; cur.col.nav = NAV_STORE; }
      else setCol(Math.max(0, c - 1));
    }
    else if(e.key === 'ArrowUp'){
      if(cur.row === 1){ cur.from = 'tabs'; cur.row = 0; cur.col.nav = NAV_STORE; }
      else if(cur.row > 1) cur.row--;
    }
    else if(e.key === 'ArrowDown'){
      if(cur.row === 0) cur.row = Math.max(1, rowOf(cur.from));
      else cur.row = Math.min(rows.length - 1, cur.row + 1);
    }
    else if(e.key === 'Enter') select(r.items[c]);
    else if(e.key === 'Escape' || e.key === 'Backspace'){ back(); e.preventDefault(); return; }
    else handled = false;
    if(!handled) return;
    e.preventDefault();
    land();
    paint();
  });

  // coming back from the package detail page (Back, or a finished purchase): the same tab, filters and card
  var subscribed = /[?&]subscribed=1/.test(location.search);
  try {
    var saved = JSON.parse(sessionStorage.getItem('apReturn') || 'null');
    sessionStorage.removeItem('apReturn');
    if(saved && TABS[saved.tabAt]){ tabAt = saved.tabAt; pick = saved.pick; cur = saved.cur; }
  } catch(e){}

  build();
  bindClicks(rows[0]); bindClicks(rows[1]);
  if(!cur.row || cur.row >= rows.length) cur.row = 1;
  cur.col.tabs = tabAt;
  if(subscribed){
    history.replaceState(null, '', 'all-packages.html'); toast('Your package is now active');   // (package-detail.html has kept what it unlocks)
  }
  page.style.transition = 'none';
  paint();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ paint(); requestAnimationFrame(function(){ page.style.transition = ''; }); });
})();
