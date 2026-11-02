
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o){ return Object.keys(o).filter(function(k){ return o[k] != null; }).map(function(k){ return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }

  /* ---------- content: the titles behind the project's posters (Figma's placeholders) ----------
     t title, p 2:3 poster, w 16:9 picture, plat platform tag (badges/tag-*.png), g genres, y year, len, age, d synopsis */
  var PP = MD.PP, P = MD.P, M = MD.M;   // the titles: content.js (shared with movie-detail.html)
  function pic(k){ return MD.bg(k); }       // the title's full-screen picture (the hero's background, as its detail page)

  var SLIDES = ['wicked', 'd9', 'topgun', 'superman', 'house', 'lastofus', 'loki', 'dragon'];   // the first scene (8 dots, as Figma)
  var CATS = [
    {t:'All', d:'Every movie and series in one place: new releases, blockbusters and the titles everyone is talking about.', bg:P + 'district9.jpg'},
    {t:'Action', d:'Car chases, heists and heroes: the films that never sit still.', bg:P + 'topgun-m.jpg'},
    {t:'Comedy', d:'Sitcoms, rom-coms and feel-good films. Sit back and enjoy a good laugh.', bg:P + 'P10-Devil.jpg'},
    {t:'Anime', d:'Top series and films from Japan, from epic adventures to slice-of-life favorites.', bg:P + 'how-to-train.jpg'},
    {t:'Horror', d:'Chilling thrillers and spine-tingling scares. Dare to watch with the lights off.', bg:P + 'last-of-us.jpg'},
    {t:'Family', d:'Films the whole family can enjoy together, from animated hits to big adventures.', bg:P + 'how-to-train.jpg'},
    {t:'Music', d:'Musicals, concert films and the stories behind the songs.', bg:P + 'wicked.jpg'},
    {t:'Mystery', d:'Whodunits, detectives and twists you will not see coming.', bg:P + 'continue/c1.jpg'}
  ];
  var CONTINUE = MD.continueList();   // this session's viewing first (content.js)
  var TOP10 = ['topgun', 'john', 'avatar', 'house', 'venom', 'f1', 'debt', 'got', 'vincenzo', 'lotr'];
  var HOT = [{k:'avatar', b:'NEW'}, {k:'f1', b:'NEW'}, {k:'debt', b:'NEW', tag:1}, {k:'john', b:'NEW'}, {k:'venom', tag:1}, {k:'topgun'}, {k:'hobbit'}];
  var FOR_YOU = MD.FOR_YOU;
  var BECAUSE = ['venom', 'avatar', 'f1', 'hobbit', 'john', 'debt', 'topgun'];
  var DISNEY = ['endgame', 'loki', 'prada', 'spider', 'avatar'];
  var MOVIES = ['topgun', 'john', 'khemjira', 'venom', 'avatar', 'medium', 'f1', 'debt', 'lotr', 'hobbit'];
  var SERIES = ['house', 'got', 'lastking', 'vikings', 'thailaw', 'dollar', 'vincenzo', 'again'];
  var MY_LIST = ['lastofus', 'house', 'superman', 'wicked', 'dragon'];
  var RENT = MD.RENT;
  var MY_RENTAL = MD.MY_RENTAL;
  var ACTORS = [{n:'Johnny Depp', img:'movie-assets/actor-johnny-depp.jpg'}, {n:'Tom Cruise'}, {n:'Keanu Reeves'}, {n:'Brad Pitt'}, {n:'Zendaya'},
                {n:'Tom Hardy'}, {n:'Song Joong-ki'}, {n:'Pedro Pascal'}, {n:'Ariana Grande'}];
  var LEAVING = ['judge', 'bigmouth', 'family', 'lawless', 'lastking', 'vikings', 'debt'];
  var SEASONAL = [{t:'Halloween Movies', img:PP + 'Venom.jpg'}, {t:'Seasonal Collection', img:PP + 'lotr/r1.jpg'}, {t:'Netflix (4K)', img:PP + 'John.jpg'},
                  {t:'Award Winners', img:PP + 'topgun_m.jpg'}, {t:'K-Drama Collection', img:PP + 'legal/l6.jpg'}];
  // the movie channels, lowest number first (TV Guide's: its names open them in the Live TV player)
  var CHANNELS = ['Warner', 'HBO', 'HBO Signature', 'HBO Hits', 'HBO Family', 'CINEMAX', 'MONOMAX 1'].map(function(n){ return {n:n}; });
  // the same channels as the TV Guide (channels-data.js): its number, logo, crown and favourite (TV.isFav: its own, or as
  // changed this session in the TV Guide or the player)
  function readFavs(){
    CHANNELS.forEach(function(c){
      var d = window.TV && TV.byName ? TV.byName(c.n) : null;
      if(d){ c.no = d.no; c.crown = d.crown; c.fav = TV.isFav(d); c.logo = TV.logoSrc(d); c.fit = d.logo ? d.fit : 'cover'; c.box = d.box; c.bg = d.bg; }
    });
  }
  readFavs();
  // back from the player (or the TV Guide) out of the browser's page cache: a favourite added there shows here too
  addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    readFavs();
    document.querySelectorAll('.ch-card').forEach(function(el){
      var c = CHANNELS[+el.dataset.i], h = el.querySelector('.fav-ic');
      if(c.fav && !h) el.querySelector('.ch-meta').insertAdjacentHTML('afterbegin', '<img class="ic20 fav-ic" src="icons/tv-guide/heart-fill.svg" alt="Favorite">');
      else if(!c.fav && h) h.remove();
    });
  });
  var QUICK = [{t:'My Subscription', sub:'4 Subscriptions', ic:'icons/quick/subscription.svg'}, {t:'FAQs', sub:'Billing, devices, how to watch', ic:'icons/quick/faqs.svg'},
               {t:'Customer Support', sub:'Call customer support or visit the support website.', ic:'store-assets/headset.svg'}];

  /* ---------- markup ---------- */
  function ptag(m){ return m.plat === 'ais' ? '<span class="ptag ais"></span>' : '<img class="ptag" src="badges/tag-' + m.plat + '.png" alt="">'; }
  function metaRow(m){ return ptag(m) + MD.metaHtml(m); }   // a card's meta row: its platform tag, genres, year, length, pills (no crown)
  function wide(k, i, set, extra){
    return '<div class="card item"' + attrs({kind:'title', k:k, set:set, i:i}) + '><div class="thumb" style="background-image:url(\'' + (M[k].w || M[k].p) + '\')">' + (extra || '') + '</div></div>';
  }
  function poster(k, i, set, badge, tag){
    var m = M[k];
    return '<div class="pst item"' + attrs({kind:'title', k:k, set:set, i:i}) + ' style="background-image:url(\'' + m.p + '\')">' +
      (badge ? '<span class="bdg top-tag">' + esc(badge) + '</span>' : '') + (tag ? ptag(m) : '') + '</div>';
  }
  function sec(key, title, body, cls){
    return '<section class="sec' + (cls ? ' ' + cls : '') + '" data-row="' + key + '">' + (title ? '<h2 class="sec-title">' + esc(title) + '</h2>' : '') +
      '<div class="rail"><div class="track">' + body + '</div></div></section>';
  }
  function logoHtml(c){
    var b = c.box, img = b ? '<img src="' + c.logo + '"' + TV.logoAttrs(c) + ' style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%;object-fit:contain;">'
                          : '<img class="' + (c.fit || 'cover') + '" src="' + c.logo + '"' + TV.logoAttrs(c) + '>';
    return '<div class="logo"' + (c.bg ? ' style="background:' + c.bg + '"' : '') + '>' + img + '</div>';
  }
  var html = '';
  html += '<section class="sec" data-row="cats"><div class="rail"><div class="chips">' + CATS.map(function(c, i){
    return '<div class="chip tv-chip item"' + attrs({kind:'cat', i:i}) + ' data-ring-art="">' + esc(c.t) + '</div>';
  }).join('') + '</div></div></section>';
  html += '<section class="sec" data-row="cw"><h2 class="sec-title">Continue Watching</h2><div class="rail"><div class="track">' + CONTINUE.map(function(c, i){
    var m = M[c.k], left = c.of - c.w;
    return '<div class="card item"' + attrs({kind:'cw', k:c.k, i:i}) + '><div class="thumb" style="background-image:url(\'' + m.w + '\')">' +
      '<span class="left corner-tag">' + (left >= 60 ? Math.floor(left / 60) + 'h ' + left % 60 + 'm' : left + 'm') + ' left</span>' +
      '<div class="prog"><i style="width:' + Math.round(c.w / c.of * 100) + '%"></i></div></div><div class="t">' + esc(m.t) + (c.s ? ' S' + c.s + ':E' + c.e : '') + '</div></div>';   // a series: its episode
  }).join('') + '</div></div></section>';
  html += Top10.defs();
  html += '<section class="sec top10" data-row="top10"><h2 class="sec-title">Top 10</h2><div class="rail"><div class="track">' + TOP10.map(function(k, i){
    var m = M[k];
    return '<div class="rank-wrap">' + Top10.numeral(i + 1) + '<div class="rank-poster item"' + attrs({kind:'title', k:k, set:'top10', i:i}) +
      ' style="background-image:url(\'' + m.p + '\')">' + ptag(m) + '</div></div>';
  }).join('') + '</div></div></section>';
  html += sec('hot', 'Hot Off the Big Screen', HOT.map(function(h, i){ return poster(h.k, i, 'hot', h.b, h.tag); }).join(''), 'tall-rail');
  html += '<section class="sec tall-rail" data-row="short"><h2 class="sec-title">Short</h2><div class="rail"><div class="track">' + window.SHORTS.map(function(s, i){
    return '<div class="pst item"' + attrs({kind:'short', i:i}) + ' data-href="short-detail.html?s=' + i + '" style="background-image:url(\'posters/shorts/' + s.img + '\')"></div>';
  }).join('') + '</div></div></section>';
  html += '<section class="sec" data-row="foryou"><h2 class="sec-title">For You</h2><div class="rail"><div class="track">' + FOR_YOU.map(function(f, i){
    var m = M[f.k];
    return '<div class="xcard item"' + attrs({kind:'buy', k:f.k, i:i}) + ' data-ring-art="">' +
      '<div class="xc-portrait" style="background-image:url(\'' + (m.p || m.w) + '\')"></div>' +
      '<div class="xc-wide" style="background-image:url(\'' + pic(f.k) + '\')"></div><div class="xc-scrim ev-scrim"></div>' +
      // open: the Store's PPV Event details (event-card.css): title, its price (MD.price: buy, else rent) with VAT, the meta
      // row (its platform tag, MD.metaHtml: no crown on a title's card) and synopsis
      '<div class="xc-content ev-info"><h3>' + esc(m.t) + '</h3>' +
        '<div class="cost"><b>' + MD.price(f.k) + ' baht</b><span>(VAT Included: ' + (Math.round(MD.price(f.k) * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2 }) + ' baht)</span></div>' +
        '<div class="meta">' + metaRow(m) + '</div><p class="syn">' + esc(m.d) + '</p></div></div>';
  }).join('') + '</div></div></section>';
  html += sec('because', 'Because You Watched District 9', BECAUSE.map(function(k, i){ return poster(k, i, 'because'); }).join(''), 'tall-rail');
  html += '<section class="sec brand" data-row="disney"><h2>Disney</h2>' +
    '<p>Stories for everyone, from Marvel and Star Wars to Pixar and the Disney classics: the films and series the whole family loves, all in one place.</p>' +
    '<div class="rail"><div class="track">' + DISNEY.map(function(k, i){ return wide(k, i, 'disney'); }).join('') + '</div></div></section>';
  // Disney's last card: Avatar has no 16:9 picture of its own, so it shows its poster's top
  html += sec('movies', 'Movies', MOVIES.map(function(k, i){ return poster(k, i, 'movies'); }).join(''), 'tall-rail');
  html += sec('series', 'Series', SERIES.map(function(k, i){ return poster(k, i, 'series'); }).join(''), 'tall-rail');
  html += sec('mylist', 'My List', MY_LIST.map(function(k, i){ return wide(k, i, 'mylist'); }).join(''));
  html += sec('myrental', 'My Rentals and Purchases', MY_RENTAL.map(function(k, i){ return wide(k, i, 'myrental'); }).join(''));
  html += sec('rent', 'Rent or Buy', RENT.map(function(r, i){ return poster(r.k, i, 'rent', r.b); }).join(''), 'tall-rail');
  html += sec('actor', 'Actor', ACTORS.map(function(a, i){
    var ini = a.n.split(' ').map(function(w){ return w[0]; }).join('').slice(0, 2);
    // the photo takes the focus, so the ring circles it (the name stays under it)
    return '<div class="actor"><div class="ph item"' + attrs({kind:'actor', i:i}) + ' data-ring-art=""' + (a.img ? ' style="background-image:url(\'' + a.img + '\')"' : '') + '>' +
      (a.img ? '' : ini) + '</div><div class="nm">' + esc(a.n) + '</div></div>';
  }).join(''), 'actors');
  html += sec('leaving', 'Leaving Soon', LEAVING.map(function(k, i){ return poster(k, i, 'leaving', 'Leaving Soon'); }).join(''), 'tall-rail');
  html += sec('seasonal', 'Movie Collection', SEASONAL.map(function(c, i){
    return '<div class="season-card item"' + attrs({kind:'season', i:i}) + ' style="background-image:url(\'' + c.img + '\')"><span>' + esc(c.t) + '</span></div>';
  }).join(''), 'seasonal');
  html += '<section class="sec" data-row="channels"><h2 class="sec-title">Movie Channel</h2><div class="rail"><div class="track chan-track">' + CHANNELS.map(function(c, i){
    return '<div class="ch-card tv-glass item"' + attrs({kind:'chan', i:i}) + ' data-ring-art=""><div class="ch-slot"><div class="ava">' + logoHtml(c) + '</div></div>' +
      '<div class="ch-name">' + esc(c.n) + '</div><div class="ch-meta">' +
      // as the TV Guide's cards: the heart only on a favourite, the crown (content.js: gold, not in the package; owned)
      (c.fav ? '<img class="ic20 fav-ic" src="icons/tv-guide/heart-fill.svg" alt="Favorite">' : '') +
      Content.crownIcon({ch:c.n}, 0, 'ic20') +
      '<div class="ch-no">' + c.no + '</div></div></div>';
  }).join('') + '</div></div></section>';
  html += '<section class="sec" data-row="quick"><div class="rail"><div class="track quick-track">' + QUICK.map(function(q, i){
    return '<div class="quick-card tv-chip item"' + attrs({kind:'quick', i:i}) + ' data-href="store.html" data-ring-art=""><span class="qc-sub">' + esc(q.sub) + '</span>' +
      '<span class="qc-name"><img src="' + q.ic + '" alt="">' + esc(q.t) + '</span></div>';
  }).join('') + '</div></div></section>';
  html += '<section class="sec totop" data-row="totop"><div class="tv-btn tv-btn--primary item" data-kind="totop" data-ring-art=""><i></i>Back to Top</div></section>';
  var page = document.getElementById('page');
  page.innerHTML = html;
  // Avatar in the Disney band: no 16:9 picture, so its poster, from the top
  page.querySelectorAll('.card[data-k="avatar"] .thumb').forEach(function(t){ t.style.backgroundImage = 'url(\'' + M.avatar.p + '\')'; t.style.backgroundPosition = 'center 20%'; });
  Top10.ready(page);
  document.querySelector('.dots').innerHTML = SLIDES.map(function(){ return '<i></i>'; }).join('');

  /* ---------- focus rows: the top bar, the first scene (Play; Detail above it), then one row per section ---------- */
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  var secs = $('.sec', page);
  var playEl = document.getElementById('play'), detailEl = document.getElementById('detail');
  var rows = [{ items:$('.topnav .item') }, { key:'scene', items:[playEl] }].concat(secs.map(function(s){ return { sec:s, key:s.dataset.row, items:$('.item', s) }; }));
  var R = {}; rows.forEach(function(r, i){ if(r.key) R[r.key] = i; });
  var movieTab = document.querySelector('.navtab.active'), NAV_MOVIE = rows[0].items.indexOf(movieTab);
  var cur = { row:R.scene, col:rows.map(function(){ return 0; }), from:0, detail:false, slide:0 };
  cur.col[0] = NAV_MOVIE;
  var DYNAMIC_END = R.short;   // the chips to Short keep the hero; For You and below scroll as a plain page
  var ROW_Y = 600;             // where the focused rail sits while the hero shows (Figma: its title at y=600)
  var STATIC_Y = 230;          // ... and once the page scrolls (Figma: For You's title at y=230)

  // ---- the hero speaks for the focused item ----
  var heroEl = document.querySelector('.hero'), heroKey = '';
  var pics = $('.hero-bg .pic'), picFront = 0, picCur = null;
  function setBg(img){
    if((img || null) === picCur) return;
    picCur = img || null;
    pics[picFront].classList.remove('on');
    picFront = 1 - picFront;
    if(img){ pics[picFront].style.backgroundImage = 'url(\'' + img + '\')'; pics[picFront].classList.add('on'); }
  }
  // a title's screen text: its detail page's tag, Premium and meta row (content.js), and how far in when it is being
  // watched (MD.watched: this session's progress, as the detail page)
  function titleHero(k){ var m = M[k], wd = MD.watched(k);
    return { t:m.t, meta:Content.metaHtml({k:k}, true), d:m.d, bg:pic(k),
      watched:wd ? '<span class="bar"><i style="width:' + wd.pct + '%"></i></span>' + wd.w + 'm of ' + wd.of + 'm' : '' }; }
  function heroFor(el, rowKey){
    if(rowKey === 'scene') return titleHero(SLIDES[cur.slide]);
    var kind = el && el.dataset.kind, i = el ? +el.dataset.i : 0;
    if(kind === 'cat'){ var c = CATS[i]; return { t:c.t === 'All' ? 'Movies & Series' : c.t, d:c.d, bg:c.bg }; }
    if(kind === 'cw') return titleHero(CONTINUE[i].k);
    if(kind === 'short'){ var s = window.SHORTS[i]; return { t:s.t, meta:Content.metaHtml({s:i}, true), d:s.d, bg:'posters/shorts/' + s.img }; }
    if(el && el.dataset.k) return titleHero(el.dataset.k);
    return null;
  }
  function paintHero(rowKey, el){
    // the first scene's main button: its movie's detail page's (content.js): View Package (premium, not the viewer's),
    // Resume, or Play
    if(rowKey === 'scene'){ var a = Content.mainAction({ k:SLIDES[cur.slide] });
      if(playEl.dataset.label !== a.label){ playEl.dataset.label = a.label; playEl.innerHTML = '<i class="' + a.icon + '"></i>' + a.label; } }
    var h = heroFor(el, rowKey);
    if(!h) return;
    var key = h.t + '|' + (h.watched || '') + '|' + (h.meta || '');
    if(key !== heroKey){
      heroKey = key;
      heroEl.querySelector('h1').textContent = h.t;
      heroEl.querySelector('.watched').innerHTML = h.watched || '';
      heroEl.querySelector('.meta').innerHTML = h.meta || '';
      heroEl.querySelector('.desc').textContent = h.d || '';
      heroEl.classList.remove('swap'); void heroEl.offsetWidth; heroEl.classList.add('swap');
    }
    setBg(h.bg);
  }

  // ---- keep the focused item in view (Home's "fixed focus" sideways; the focused rail at a fixed y down the page) ----
  var pageY = 0;
  function slide(r, el){
    if(!r.sec || r.key === 'totop') return;
    var track = el.closest('.track, .chips');
    var first = r.items[0], at = function(x){ return x.closest('.rank-wrap') || x; };   // a Top 10 poster: measure its whole card
    var want = at(el).offsetLeft - at(first).offsetLeft;
    var max = Math.max(0, track.scrollWidth - 1920);
    track.style.transform = 'translateX(' + -Math.max(0, Math.min(want, max)) + 'px)';
  }
  // the hero text ends 80px above the focused rail's first line (its title, else its cards); in the first scene, 24px
  // above Detail
  var HERO_GAP = 80;
  function placeHero(r){
    if(!r.sec){ heroEl.style.bottom = ''; return; }
    var y = 0, e = r.sec.querySelector('.sec-title, .item');
    while(e && e !== r.sec){ y += e.offsetTop; e = e.offsetParent; }
    heroEl.style.bottom = 1080 - (r.sec.offsetTop + y - pageY - HERO_GAP) + 'px';
  }
  function layout(ri){
    var r = rows[ri], y = 0;
    if(r.sec){
      var top = r.sec.offsetTop;
      y = ri <= DYNAMIC_END ? top - Math.min(ROW_Y, 1080 - 40 - r.sec.offsetHeight) : Math.min(top - STATIC_Y, page.offsetHeight - 1080);
    }
    pageY = Math.max(0, y);
    page.style.transform = 'translateY(' + -pageY + 'px)';
    rows.forEach(function(x, xi){ if(x.sec) x.sec.classList.toggle('above', xi < ri); });
    document.body.classList.toggle('scene', ri === R.scene);
    document.body.classList.toggle('static', ri > DYNAMIC_END);
  }

  // the profile panel under the top bar's photo, as on Home (profile-panel.js)
  var profileEl = document.querySelector('.topnav .profile'), prof = ProfilePanel(profileEl, { paint:paint, toast:toast });
  var dots = $('.dots i');

  function paint(){
    var inProf = prof.paint(cur.row === 0 && rows[0].items[cur.col[0]] === profileEl);
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){
      el.classList.toggle('focused', !inProf && ri === cur.row && ci === cur.col[ri] && !(ri === R.scene && cur.detail)); }); });
    detailEl.classList.toggle('focused', !inProf && cur.row === R.scene && cur.detail);
    // top-bar tab states (button-theme.css): Movie is Active while the D-pad is on the bar, Active dim in the content
    movieTab.classList.toggle('active', cur.row === 0);
    movieTab.classList.toggle('active-dim', cur.row !== 0);
    dots.forEach(function(d, i){ d.classList.toggle('on', i === cur.slide); });
    var ri = cur.row === 0 ? cur.from : cur.row;   // on the top bar the page stays as it was
    document.body.classList.toggle('on-nav', cur.row === 0);
    // the top bar, as Home's: gone once focus is past the first rail, back as an overlay (with its scrim) while it has focus
    document.body.classList.toggle('past-first', ri > R.scene);
    layout(ri);
    var r = rows[ri], el = r.items[cur.col[ri]];
    if(cur.row) slide(r, el);
    if(ri <= DYNAMIC_END){ paintHero(r.key, el); placeHero(r); }
    try { sessionStorage.setItem('movieFocus', JSON.stringify(cur)); } catch(e){}
  }

  // the first scene moves on to the next movie every 8s while it has the focus
  var autoT = setInterval(function(){
    if(cur.row !== R.scene || document.hidden) return;
    cur.slide = (cur.slide + 1) % SLIDES.length; paint();
  }, 8000);
  function nudgeSlide(dir){ cur.slide = (cur.slide + dir + SLIDES.length) % SLIDES.length; clearInterval(autoT); autoT = setInterval(function(){
    if(cur.row !== R.scene || document.hidden) return; cur.slide = (cur.slide + 1) % SLIDES.length; paint(); }, 8000); }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  // leaving for another page whose Back comes here: land on the same item again
  function leave(url){ try { sessionStorage.setItem('movieReturn', '1'); } catch(e){} location.href = url; }
  function toScene(){ cur.row = R.scene; cur.detail = false; cur.col[R.scene] = 0; }
  function select(el){
    var k = el.dataset.kind, i = +el.dataset.i;
    el.animate([{ transform:getComputedStyle(el).transform }, { transform:(getComputedStyle(el).transform === 'none' ? '' : getComputedStyle(el).transform + ' ') + 'scale(0.97)' }], { duration:140, easing:'ease-out' });
    if(el === movieTab){ toScene(); paint(); return; }   // already here: the focus goes to the first scene's Play
    if(el.dataset.href){ if(cur.row) leave(el.dataset.href); else location.href = el.dataset.href; return; }
    if(el === profileEl) return;   // its panel is already open under it
    // a title's detail page (movie-detail.html: Resume / Play / View Package + Buy, You May Also Like)
    if(el === detailEl){ leave('movie-detail.html?k=' + SLIDES[cur.slide]); return; }
    if(k === 'play'){ leave(Content.mainAction({ k:SLIDES[cur.slide] }).url); return; }   // the player, or its package (content.js)
    if(k === 'cat'){ toast('Showing ' + CATS[i].t); return; }
    if(k === 'cw' || k === 'buy' || k === 'title'){ leave('movie-detail.html?k=' + el.dataset.k); return; }
    if(k === 'actor'){ toast('Movies with ' + ACTORS[i].n); return; }
    if(k === 'season'){ toast(SEASONAL[i].t + ' (demo)'); return; }   // a collection: a mockup with no page (as Home's), OK only presses it
    if(k === 'chan'){ leave('tv-guide.html?play=' + encodeURIComponent(CHANNELS[i].n) + '&from=movie'); return; }
    if(k === 'totop'){ toScene(); paint(); return; }
    toast(el.dataset.label + ' (demo)');
  }
  function back(){
    if(cur.row !== R.scene){ toScene(); paint(); return; }
    try { if(document.referrer && /(home|news|sport|store)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    var r = rows[cur.row], n = r.items.length, handled = true;
    var inScene = cur.row === R.scene;
    if(e.key === 'ArrowRight'){ if(inScene) nudgeSlide(1); else cur.col[cur.row] = Math.min(n - 1, cur.col[cur.row] + 1); }
    else if(e.key === 'ArrowLeft'){
      if(inScene) nudgeSlide(-1);
      // Left on a rail's first item goes up to the top bar (its Movie tab), as on Home
      else if(cur.row > 0 && cur.col[cur.row] === 0){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_MOVIE; }
      else cur.col[cur.row] = Math.max(0, cur.col[cur.row] - 1);
    }
    else if(e.key === 'ArrowUp'){
      // first scene: Play, then Detail, then the top bar (landing on the Movie tab)
      if(inScene && !cur.detail) cur.detail = true;
      else if(inScene){ cur.detail = false; cur.from = R.scene; cur.row = 0; cur.col[0] = NAV_MOVIE; }
      else if(cur.row > R.scene && cur.row - 1 === R.scene){ toScene(); }
      else if(cur.row > 0) cur.row--;
    }
    else if(e.key === 'ArrowDown'){
      if(cur.row === 0){ cur.row = cur.from || R.scene; if(cur.row === R.scene) cur.detail = false; }
      else if(inScene && cur.detail) cur.detail = false;
      else cur.row = Math.min(rows.length - 1, cur.row + 1);
    }
    else if(e.key === 'Enter') select(inScene && cur.detail ? detailEl : r.items[cur.col[cur.row]]);
    else if(e.key === 'Escape' || e.key === 'Backspace') back();
    else handled = false;
    if(handled){ e.preventDefault(); paint(); }
  });
  rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){
    el.addEventListener('click', function(){ if(ri === 0) cur.from = cur.row || cur.from; cur.row = ri; cur.col[ri] = ci; cur.detail = false; paint(); select(el); });
  }); });
  detailEl.addEventListener('click', function(){ cur.row = R.scene; cur.detail = true; paint(); select(detailEl); });

  // coming back (Back from the player, the TV Guide, a short or the movie's page): the same item again
  try {
    var saved = sessionStorage.getItem('movieReturn') && JSON.parse(sessionStorage.getItem('movieFocus') || 'null');
    sessionStorage.removeItem('movieReturn');
    if(saved && saved.col && saved.col.length === rows.length){ cur = saved; if(cur.row === 0) cur.row = cur.from || R.scene; }
  } catch(e){}
  if(!cur.from) cur.from = R.scene;
  page.style.transition = 'none';
  paint();
  // fonts change the rows' heights: lay out again once they are in, then let the page glide
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ paint(); requestAnimationFrame(function(){ page.style.transition = ''; }); });
})();
