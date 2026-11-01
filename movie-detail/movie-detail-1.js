
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  function esc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  // ---- a channel's programme (?prog=, content.js LIVE: LIVE / Upcoming on a Movie or Sport channel), or one this page
  //      showed before a package purchase; it becomes a title of its own (MD.M) for the scene, buttons and purchase ----
  var PROG = null;
  try { var pm = /[?&]prog=([^&#]*)/.exec(location.search); if(pm) PROG = JSON.parse(decodeURIComponent(pm[1])); } catch(e){}
  try { if(!PROG && !/[?&]k=/.test(location.search)){ var sp = JSON.parse(sessionStorage.getItem('mdProg') || 'null'); if(sp && sessionStorage.getItem('mdKey') === sp.key) PROG = sp; } } catch(e){}
  var PCH = PROG && TV.byName(PROG.tv);
  if(PROG){
    PROG.key = 'prog-' + Math.abs((PROG.tv + '|' + PROG.t).split('').reduce(function(h, c){ return (h * 31 + c.charCodeAt(0)) | 0; }, 7)).toString(36);
    MD.M[PROG.key] = { t:PROG.t, plat:PCH && /^MONOMAX/.test(PCH.n) ? 'monomax' : 'prime', g:[PCH && PCH.cats.indexOf('sports') >= 0 ? 'Sports' : 'Movies'], y:2026, len:'2h 15m', age:'13+',
      d:PROG.d || PROG.t, w:PROG.bg || PROG.img,   // the picture Home's first scene shows for it
      price:PROG.live && Content.crown({tv:PROG.tv}) === 'gold' ? 299 : 0 };   // a premium channel not in the package: View Package / Buy 299 ฿
    try { sessionStorage.setItem('mdProg', JSON.stringify(PROG)); } catch(e){}
  }
  // ---- the title: ?k=, else the one this page last showed (back from the purchase), else District 9 ----
  var K = PROG ? PROG.key : (location.search.match(/[?&]k=([\w-]+)/) || [])[1];
  try { if(!K) K = sessionStorage.getItem('mdKey'); } catch(e){}
  if(!K || !MD.M[K]) K = 'd9';
  try { sessionStorage.setItem('mdKey', K); } catch(e){}
  var m = MD.M[K], SER = MD.series(K);
  // what the crown and View Package go by (content.js): a programme its channel, else the title
  var CI = PROG ? {tv:PROG.tv} : {k:K};
  var HERE = PROG ? 'movie-detail.html?prog=' + encodeURIComponent(JSON.stringify(PROG)) : 'movie-detail.html?k=' + K;
  // straight back from a finished purchase (package-detail.html / purchase.html → ?subscribed=1): the package bought
  // there is already kept (premium channels, its platform); the title is the viewer's too, so its crown is owned
  var JUST_BOUGHT = /subscribed=1/.test(location.search);
  if(JUST_BOUGHT){
    if(!PROG) MD.own(K);
    history.replaceState(null, '', HERE);
  }
  // back from Buy / Rent (purchase.html?opt=): bought, it is the viewer's (MD.own); rented, it is in My Rental until its
  // last day (MD.rent, MD.until). Either way its crown is owned and its button Play
  var BOUGHT = !PROG && /[?&]bought=1/.test(location.search), RENTED = !PROG && /[?&]rented=1/.test(location.search);
  if(BOUGHT) MD.own(K);
  if(RENTED) MD.rent(K);
  if(BOUGHT || RENTED) history.replaceState(null, '', HERE);
  document.title = m.t + (SER ? ' · Series Detail' : ' · Movie Detail');

  // ---- the scene: picture, title, how far in, meta row, synopsis ----
  var bgPic = m.b || m.w || m.p;   // MD.bg: the picture Home's and the Movie page's screen text show for it
  if(bgPic) document.getElementById('bg').style.backgroundImage = "url('" + bgPic + "')";   // a title made from a placeholder card has none
  document.getElementById('title').textContent = m.t;
  // Premium: the title's crown, gold (not the viewer's yet) or owned (content.js)
  function premBadge(){ return Content.crown(CI) ? '<span class="mbadge prem">' + Content.crownIcon(CI) + 'Premium</span>' : ''; }
  document.getElementById('meta').innerHTML = Content.metaHtml({k:K}, true);   // content.js (tag, Premium, meta): Home's and the Movie page's screen text show the same
  document.getElementById('desc').innerHTML = esc(m.d) + ' <span class="more">More</span>';
  var ctasEl = document.getElementById('ctas'), state, cw = MD.cw(K);
  function icon(label, img, tip, tipOn, toggle){
    return '<div class="tv-btn tv-btn--secondary ic item" data-label="' + label + '"' + (toggle ? ' data-toggle="' + toggle + '"' : '') + ' data-tip="' + tip + '" data-tip-on="' + (tipOn || tip) + '" data-ring-art="">' +
      '<img src="' + img + '" alt=""><span class="tip"></span></div>';
  }
  var VIEW_PACKAGE = '<div class="tv-btn tv-btn--primary main item" data-label="View Package" data-ring-art=""><i class="ic-pkg"></i>View Package</div>';
  function offerButtons(){
    var o = [];
    if(Content.packageFor(CI)) o.push(['View Package', '<i class="ic-pkg"></i>View Package']);
    if(MD.buyPrice(K)) o.push(['Buy', 'Buy ' + MD.buyPrice(K) + ' ฿']);
    if(MD.rentPrice(K)) o.push(['Rent', 'Rent ' + MD.rentPrice(K) + ' ฿']);
    return o.map(function(b, i){
      return '<div class="tv-btn ' + (i ? 'tv-btn--secondary buy' : 'tv-btn--primary main') + ' item" data-label="' + b[0] + '" data-ring-art="">' + b[1] + '</div>';
    }).join('');
  }
  var LIKE = icon('Like', 'icons/detail-like.svg', 'I like this', 'Remove like', 'You liked this|Like removed') +
             icon('Dislike', 'icons/detail-dislike.svg', 'Not for me', 'Remove dislike', 'You disliked this|Dislike removed');
  function render(){
    if(PROG){ renderProg(); return; }
    state = MD.state(K);
    var w = document.getElementById('watched');
    w.hidden = state !== 'resume';
    if(state === 'resume') w.innerHTML = '<span class="bar"><i style="width:' + Math.round(cw.w / cw.of * 100) + '%"></i></span>' + cw.w + 'm of ' + cw.of + 'm';
    var u = MD.until(K), ue = document.getElementById('until');
    ue.hidden = !u;
    if(u) ue.innerHTML = 'Available until:<span class="when">' + u.d + '<i></i>' + u.t + '</span>';
    var resumeLbl = SER && cw ? 'Resume S' + cw.s + ': Ep.' + cw.e : 'Resume';
    // gold (premium, not the viewer's): its options, each only if it has it, in this order: View Package (a package
    // has it: Content.packageFor), Buy N ฿ (MD.buyPrice), Rent N ฿ (MD.rentPrice); the first primary, the rest
    // secondary. Owned or free: Play / Resume
    var main = Content.crown(CI) === 'gold' && state !== 'soon' ? offerButtons()
      : state === 'resume' ? '<div class="tv-btn tv-btn--primary main item" data-label="Resume" data-ring-art=""><i class="ic-play"></i>' + resumeLbl + '</div>'
      : '<div class="tv-btn tv-btn--primary main item" data-label="Play" data-ring-art=""><i class="ic-play"></i>Play</div>';
    var MYLIST = icon('My List', 'icons/detail-plus.svg', 'Add to My List', 'Remove from My List', 'Added to My List|Removed from My List');
    // the icon buttons, by scenario (the same for a movie, a series and a short): coming soon: My List, Remind, Like,
    // Dislike; watching: Start Over, My List, Like, Dislike; else (first time): My List, Like, Dislike
    if(state === 'soon'){
      var out = new Date(MD.soon(K)), when = 'Coming ' + out.getDate() + ' ' + 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[out.getMonth()];
      main = '<div class="tv-btn tv-btn--primary main wait disabled" aria-disabled="true"><i class="ic-clock"></i><span>' + when + '</span></div>';
    }
    var REMIND = icon('Remind', 'icons/tv-guide/bell.svg', 'Remind me', 'Stop reminding', 'We’ll remind you when ' + m.t + ' is out|Reminder off');
    ctasEl.innerHTML = main + (state === 'soon' ? MYLIST + REMIND + LIKE
      : state === 'resume' ? icon('Start Over', 'icons/player/start-over.svg', 'Start Over') + MYLIST + LIKE
      : MYLIST + LIKE);
    if(SER) renderEps();
  }
  // ---- a channel's programme: LIVE (Play, or View Package / Buy on a premium channel not in the package) or Upcoming
  //      (its start time on a disabled button: a countdown in the last hour; it turns LIVE when it starts) ----
  function hm(t){ var d = new Date(t); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  // the start, as the cards say it (content.js LIVE.label), in Figma's words on the button: "Starting in 44:21" in the last hour
  function startsLabel(){ return LIVE.label({start:PROG.start}).replace(/^Start in/, 'Starting in'); }
  function progRange(){ return LIVE.range(PROG); }   // content.js: Home's screen text says the same
  // the LIVE / Upcoming cards: the other programmes (content.js LIVE), each to its own detail page or its channel
  // a premium channel's programme: Premium on its page (the meta row) and on its card (the crown tag), always together,
  // each with the channel's crown (content.js Content.crown: gold or owned)
  // the card tags every rail uses: LIVE is Home's Live ribbon (live-ribbon.css), a start time the top tag (corner-tag.css)
  function lcard(p){
    return '<div class="lcard item" data-href="' + esc(LIVE.href(p, 'detail')) + '" data-ring-art=""><div class="pic" style="background-image:url(\'' + p.img + '\')">' +
      (p.live ? '' : '<span class="top-tag">' + esc(p.when || '') + '</span>') + Content.crownIcon({tv:p.tv}, 0, 'crown-tag') + '</div>' +
      (p.live ? '<span class="live-ribbon" data-ring-top="styled">Live</span>' : '') +
      '<div class="t">' + esc(p.t) + '</div></div>';
  }
  // a channel's programme can't go on My List (that's for VOD: movies, series, shorts, highlights): its channel can be a
  // Favorite instead, the TV Guide's own (TV.isFav; tvFavs, shared with the guide, Home and the player)
  function FAVORITE(){
    var on = PCH && TV.isFav(PCH);
    return icon('Favorite', 'icons/tv-guide/heart' + (on ? '-fill' : '') + '.svg', 'Add to Favorite', 'Remove from Favorite', 'Added to Favorite: ' + (PCH ? PCH.n : '') + '|Removed from Favorite: ' + (PCH ? PCH.n : ''))
      .replace('class="tv-btn tv-btn--secondary ic item', 'class="tv-btn tv-btn--secondary ic item' + (on ? ' on' : ''));
  }
  var tick = null;
  function renderProg(){
    var up = !PROG.live, gold = Content.crown(CI) === 'gold';
    document.body.classList.toggle('prog-up', up); document.body.classList.toggle('prog-live', !up);
    document.title = PROG.t + ' · ' + (up ? 'Upcoming' : 'LIVE');
    document.getElementById('meta').innerHTML = (up ? '<span class="mbadge">Upcoming</span>' : '<span class="mbadge live"><i></i>Live</span>') +
      premBadge() +
      (PCH ? '<span class="chan">' + TV.logoHtml(PCH) + 'Channel ' + PCH.no + ': ' + esc(PCH.n) + '</span>' : '') +
      '<span class="pill">' + progRange() + '</span>';
    var old = document.querySelector('.uposter'); if(old) old.remove();
    if(up) document.getElementById('title').insertAdjacentHTML('beforebegin', '<div class="uposter" style="background-image:url(\'' + PROG.img + '\')"></div>');
    var others = Content.related({t:PROG.t}, 10);   // other LIVE / Upcoming programmes only, same league / sport first (content.js)
    if(up){
      state = 'up';
      var REMIND = icon('Remind', 'icons/tv-guide/bell.svg', 'Remind me', 'Stop reminding', 'We’ll remind you when ' + PROG.t + ' starts|Reminder off');
      // gold: View Package beside its start, then Remind me (all the 880px scene has room for before the cards on its
      // right); owned or free: Favorite, Remind me, Like, Dislike
      ctasEl.innerHTML = '<div class="tv-btn tv-btn--primary main wait disabled" aria-disabled="true"><i class="ic-clock"></i><span id="starts">' + startsLabel() + '</span></div>' +
        (gold ? VIEW_PACKAGE + REMIND : FAVORITE() + REMIND + LIKE);
      document.getElementById('urow').hidden = false;
      document.getElementById('utrack').innerHTML = others.filter(function(p){ return p.live; }).concat(others.filter(function(p){ return !p.live; })).map(lcard).join('');
      clearInterval(tick);
      tick = setInterval(function(){
        if(Date.now() >= PROG.start){ clearInterval(tick); PROG.live = 1; delete PROG.start; location.replace('movie-detail.html?prog=' + encodeURIComponent(JSON.stringify(PROG))); return; }   // it has started: its LIVE page
        document.getElementById('starts').textContent = startsLabel();
      }, 1000);
    } else {
      state = MD.state(K);
      ctasEl.innerHTML = (gold
        ? VIEW_PACKAGE + '<div class="tv-btn tv-btn--secondary buy item" data-label="Buy" data-ring-art="">Buy ' + MD.price(K) + ' ฿</div>'
        : '<div class="tv-btn tv-btn--primary main item" data-label="Play" data-ring-art=""><i class="ic-play"></i>Play</div>') + FAVORITE() + LIKE;
      document.getElementById('urow').hidden = true;
      document.getElementById('ymal').innerHTML = '<div class="lrow"><div class="ltrack" id="ltrack">' + others.map(lcard).join('') + '</div></div>';
    }
  }
  render();

  // ---- You May Also Like: titles of the same type (a movie: movies; a series: series), content.js Content.related;
  // 2:3 posters (a title with only a 16:9 picture shows its centre) ----
  if(!PROG) document.getElementById('ymal').innerHTML = Content.related({k:K}, 18).map(function(r){
    var o = MD.M[r.k];
    return '<div class="pst item" data-k="' + r.k + '" data-ring-art="" style="background-image:url(\'' + (o.p || o.w) + '\')"></div>';
  }).join('');

  // ---- a series: the Episodes tab first; season chips over that season's episode cards ----
  var tab = SER ? 'eps' : 'ymal', season = cw && cw.s || 1;
  if(SER) document.getElementById('menu').insertAdjacentHTML('afterbegin', '<div class="tab tv-btn tv-btn--secondary item" id="epsTab" data-tab="eps" data-ring-art="">Episodes</div>');
  function renderEps(){
    var sn = MD.seasons(K), html = '';
    for(var i = 1; i <= sn; i++) html += '<div class="season item' + (i === season ? ' sel' : '') + '" data-season="' + i + '" data-ring-art="">Season ' + i + '</div>';
    document.getElementById('seasons').innerHTML = html;
    document.getElementById('eptrack').innerHTML = MD.episodes(K, season).map(function(ep){
      var here = cw && cw.s === ep.s && cw.e === ep.n;   // where the viewer left off: its progress on the picture
      return '<div class="ep item" data-s="' + ep.s + '" data-e="' + ep.n + '" data-ring-art=""><div class="pic" style="background-image:url(\'' + (m.w || m.p) + '\')">' +
        (here ? '<div class="prog"><i style="width:' + Math.round(cw.w / cw.of * 100) + '%"></i></div>' : '') +
        '<span class="len corner-tag">' + (ep.m >= 60 ? Math.floor(ep.m / 60) + 'h ' + ep.m % 60 + 'm' : ep.m + 'm') + '</span></div>' +
        '<div class="t">Ep.' + ep.n + ' ' + esc(ep.t) + '</div><div class="d">' + esc(ep.d) + '</div></div>';
    }).join('');
  }
  if(SER) renderEps();

  // ---- focus: the scene's buttons, the tabs, then the tab's content (Episodes: seasons, episodes; the grid 6 across) ----
  var COLS = 6, cur = { row:0, col:0 };
  // the top bar (Short Drama detail's, Home's): Up from the buttons or Left from a row's first item; Down / Back leave it.
  // Its tab: Movie for a movie or series, Sport / Live TV for a channel's programme. The photo opens the profile panel
  var navItems = $('.topnav .item'), profileEl = document.querySelector('.topnav .profile'), nav = null;   // nav: {col} while the bar has focus
  var tabEl = document.querySelector('.topnav .navtab[data-label="' + (PROG ? (PCH && PCH.cats.indexOf('sports') >= 0 ? 'Sport' : 'Live TV') : 'Movie') + '"]');
  var NAV_TAB = navItems.indexOf(tabEl);
  var prof = ProfilePanel(profileEl, { paint:function(){ paint(); }, toast:function(m){ toast(m); } });
  function toNav(){ nav = { col:NAV_TAB }; }
  function selectNav(el){
    if(el === profileEl) return;   // its panel is already open under it
    if(el.dataset.href){ location.href = el.dataset.href; return; }
    toast(el.dataset.label + ' (demo)');
  }
  function navKey(k){
    if(k === 'ArrowRight') nav.col = Math.min(navItems.length - 1, nav.col + 1);
    else if(k === 'ArrowLeft') nav.col = Math.max(0, nav.col - 1);
    else if(k === 'ArrowDown' || k === 'Escape' || k === 'Backspace') nav = null;
    else if(k === 'Enter' || k === ' ') selectNav(navItems[nav.col]);
    else return false;
    return true;
  }
  function detailRows(){
    // a programme: LIVE its buttons, the tab, the cards under it; Upcoming its buttons, then the cards on its right
    if(PROG) return PROG.live ? [$('#ctas .item'), $('#menu .item'), $('#ltrack .item')] : [$('#ctas .item'), $('#utrack .item')];
    var r = [$('#ctas .item'), $('#menu .item')];
    if(tab === 'eps') return r.concat([$('#seasons .item'), $('#eptrack .item')]);
    var posters = $('#ymal .item');
    for(var i = 0; i < posters.length; i += COLS) r.push(posters.slice(i, i + COLS));
    return r;
  }
  function rows(){ return detailRows(); }
  // Home's rails' "fixed focus": the focused episode sits in the first one's slot and the row slides under it, until
  // the last episode ends as far from the right edge as the first starts from the left (with its 8% growth and ring);
  // past that the focus moves on alone to the last episodes. A short row never slides.
  function railX(track, i){
    var eps = track.children, vp = track.parentElement;
    if(!eps.length || !i) return 0;
    var pad = parseFloat(getComputedStyle(vp).paddingLeft) || 0, last = eps[eps.length - 1];
    var lastRight = last.offsetLeft - eps[0].offsetLeft + last.offsetWidth;   // from the row's start
    var maxScroll = Math.max(0, lastRight + last.offsetWidth * .04 + 12 + 2 * pad - vp.clientWidth);
    return -Math.min(eps[i].offsetLeft - eps[0].offsetLeft, maxScroll);
  }
  // the ring stays in the fixed-focus slot (Home's rails): told where the focused card ends up once its row has slid
  // (focus-ring.js data-ring-rect), it goes straight there and waits, rather than riding out and back with the card.
  // tx: the row's slide, ty: the page's (up to the tabs); the card grows 8% from its centre, or its top centre (top)
  function ringTo(el, tx, ty, top){
    var x = 0, y = 0;
    for(var o = el; o && o !== screen; o = o.offsetParent){ x += o.offsetLeft; y += o.offsetTop; }   // layout offsets: no transforms
    var w = el.offsetWidth, h = el.offsetHeight, k = 1.08;
    el.dataset.ringRect = [x + tx - w * (k - 1) / 2, y + ty - (top ? 0 : h * (k - 1) / 2), w * k, h * k].join(',');
  }
  function paint(){
    var R = rows();
    $('[data-ring-rect]').forEach(function(e){ delete e.dataset.ringRect; });
    cur.row = Math.max(0, Math.min(R.length - 1, cur.row));
    cur.col = Math.max(0, Math.min(R[cur.row].length - 1, cur.col));
    var inProf = prof.paint(!!nav && navItems[nav.col] === profileEl);
    $('.item.focused').forEach(function(e){ e.classList.remove('focused'); });
    if(nav){ if(!inProf) navItems[nav.col].classList.add('focused'); } else R[cur.row][cur.col].classList.add('focused');
    // the bar shows over the first scene; below it, only while it has focus (body.on-nav); its tab Active there, else Active dim
    document.body.classList.toggle('on-nav', !!nav);
    tabEl.classList.toggle('active', !!nav); tabEl.classList.toggle('active-dim', !nav);
    // the tabs: the focused one's content shows below (one filter); filled while focus is below them
    if(cur.row === 1 && R[1][cur.col].dataset.tab !== tab){ tab = R[1][cur.col].dataset.tab; }
    document.body.classList.toggle('tab-eps', tab === 'eps');
    // (a Secondary button at rest; focused: the Primary focus pill; the picked one Active dim while focus is below them)
    $('#menu .tab').forEach(function(t){
      var f = t.classList.contains('focused');
      t.classList.toggle('tv-btn--primary', f); t.classList.toggle('tv-btn--secondary', !f);
      t.classList.toggle('active-dim', !nav && cur.row > 1 && t.dataset.tab === tab);
    });
    var et = document.getElementById('eptrack'), ei = tab === 'eps' && cur.row === 3 ? cur.col : 0;
    et.style.transform = railX(et, ei) ? 'translateX(' + railX(et, ei) + 'px)' : '';
    document.body.classList.toggle('grid', cur.row >= 1 && !(PROG && !PROG.live));   // Upcoming's cards are in its scene
    var pageTy = document.body.classList.contains('grid') ? -936 : 0;
    if(tab === 'eps' && cur.row === 3) ringTo(R[3][cur.col], railX(et, ei), pageTy, true);
    if(PROG){
      var lt = document.getElementById(PROG.live ? 'ltrack' : 'utrack'), li = cur.row === (PROG.live ? 2 : 1) ? cur.col : 0;
      if(lt) lt.style.transform = railX(lt, li) ? 'translateX(' + railX(lt, li) + 'px)' : '';
      if(lt && cur.row === (PROG.live ? 2 : 1)) ringTo(R[cur.row][cur.col], railX(lt, li), pageTy, false);
    }
    // the grid scrolls a row at a time once past its first two
    var g = document.getElementById('ymal');
    g.style.transform = tab === 'ymal' && cur.row > 3 ? 'translateY(' + -(cur.row - 3) * 412 + 'px)' : '';
    g.style.transition = 'transform .35s cubic-bezier(.2,0,0,1)';
    $('#ctas [data-tip]').forEach(function(b){ b.querySelector('.tip').textContent = b.classList.contains('on') ? b.dataset.tipOn : b.dataset.tip; });
    $('#ctas [data-toggle]').forEach(IconToggle.paint);   // the toggles' icons filled while on (icon-toggle.js)
  }
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1800); }
  function back(){
    if(cur.row > 0){ cur.row = 0; cur.col = 0; paint(); return; }
    try { if(document.referrer && /(home|movie|store|sport|news|movie-detail|short-detail)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'movie.html';
  }
  // Play / Resume / Start Over: the movie player (player.html), from where it was left or the start
  addEventListener('pageshow', function(e){ if(e.persisted) location.reload(); });   // back from the player: show the new progress
  function play(fromStart, s, e){
    if(SER && !s){ s = cw ? cw.s : 1; e = cw ? cw.e : 1; }   // a series: the episode it was left on, else the first
    location.href = 'player.html?k=' + K + (s ? '&s=' + s + '&e=' + e : '') + (fromStart ? '&start=1' : '');
  }
  function select(el){
    var L = el.dataset.label;
    // a programme: Play is its channel, live, in the Live TV player (via the TV Guide); a card opens its own page
    if(PROG && L === 'Play'){ location.href = 'tv-guide.html?play=' + encodeURIComponent(PROG.tv) + '&from=detail&t=' + encodeURIComponent(PROG.t); return; }
    if(el.classList.contains('lcard')){ location.href = el.dataset.href; return; }
    if(L === 'Play' || L === 'Resume'){ play(false); return; }
    if(L === 'Start Over'){ play(true); return; }
    if(L === 'View Package'){ location.href = Content.packageUrl(PROG ? { tv:PROG.tv, prog:PROG } : CI, HERE); return; }   // the package that has it; bought, it comes back here (?subscribed=1)
    // its Title Details and Options (package-detail.html: Figma "Buy" / "Rent" / "PPV Event"), then the payment; back here
    // (?bought=1 / ?rented=1) it plays. (A channel's programme: its own purchase, as before)
    if(L === 'Buy' || L === 'Rent'){ location.href = PROG ? 'purchase.html?k=' + K : 'package-detail.html?k=' + K + '&opt=' + L.toLowerCase(); return; }
    if(el.dataset.k){ Content.open({k:el.dataset.k}); return; }
    if(el.dataset.tab){ cur.row = 2; cur.col = el.dataset.tab === 'eps' ? season - 1 : 0; paint(); return; }
    if(el.dataset.season){ season = +el.dataset.season; renderEps(); cur.row = 3; cur.col = 0; paint(); return; }
    if(el.dataset.e){
      if(Content.crown(CI) === 'gold'){ cur = { row:0, col:0 }; paint(); toast('Get a package or buy ' + m.t + ' to watch'); return; }   // not yet playable
      if(state === 'soon'){ toast(m.t + ' isn’t out yet: Remind me to hear when it is'); return; }
      var s = +el.dataset.s, e = +el.dataset.e;
      play(!(cw && cw.s === s && cw.e === e), s, e); return;   // the episode left part-way resumes; any other starts
    }
    if(L === 'Watch Trailer'){ toast('Trailer: ' + m.t + ' (demo)'); return; }
    if(el.dataset.toggle){
      var msgs = el.dataset.toggle.split('|'), on = !el.classList.contains('on');
      el.classList.toggle('on', on); IconToggle.pop(el, on);
      if(L === 'Favorite' && PCH){ try { var tf = JSON.parse(sessionStorage.getItem('tvFavs') || '{}'); tf[PCH.n] = on; sessionStorage.setItem('tvFavs', JSON.stringify(tf)); } catch(e){} }
      if(on && (L === 'Like' || L === 'Dislike')){ var other = document.querySelector('#ctas [data-label="' + (L === 'Like' ? 'Dislike' : 'Like') + '"]'); if(other){ other.classList.remove('on'); IconToggle.paint(other); } }
      toast(on ? msgs[0] : msgs[1]); paint(); return;
    }
    toast(L + ' (demo)');
  }
  // moving between rows: the buttons from the first, the tabs on the one showing, Episodes' chips on the season showing
  function landRow(){
    if(cur.row === 0) cur.col = 0;
    else if(cur.row === 1) cur.col = Math.max(0, $('#menu .item').map(function(t){ return t.dataset.tab; }).indexOf(tab));
    else if(tab === 'eps') cur.col = cur.row === 2 ? season - 1 : 0;
  }
  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    if(nav){ if(navKey(e.key)){ e.preventDefault(); paint(); } return; }
    var R = rows(), handled = true;
    var upRail = PROG && !PROG.live;   // Upcoming: its cards sit to the right of its buttons
    if(e.key === 'ArrowRight' && upRail && cur.row === 0 && cur.col >= R[0].length - 1 && R[1] && R[1].length){ cur.row = 1; cur.col = 0; }
    else if(e.key === 'ArrowLeft' && upRail && cur.row === 1 && cur.col === 0){ cur.row = 0; cur.col = R[0].length - 1; }
    else if(e.key === 'ArrowRight') cur.col++;
    else if(e.key === 'ArrowLeft'){ if(cur.col === 0) toNav(); else cur.col--; }   // a row's first item: up to the top bar
    else if(e.key === 'ArrowUp'){ if(cur.row > 0){ cur.row--; landRow(); } else toNav(); }
    else if(e.key === 'ArrowDown'){ if(cur.row < R.length - 1){ cur.row++; landRow(); } }
    else if(e.key === 'Enter' || e.key === ' ') select(R[cur.row][cur.col]);
    else if(e.key === 'Escape' || e.key === 'Backspace') back();
    else handled = false;
    if(handled){ e.preventDefault(); paint(); }
  });
  document.getElementById('screen').addEventListener('click', function(e){
    var el = e.target.closest('.item'); if(!el) return;
    if(navItems.indexOf(el) >= 0){ nav = { col:navItems.indexOf(el) }; paint(); selectNav(el); return; }
    nav = null;
    rows().forEach(function(r, ri){ var c = r.indexOf(el); if(c >= 0){ cur.row = ri; cur.col = c; } });
    paint(); select(el);
  });
  if(JUST_BOUGHT) setTimeout(function(){ var pf = Content.packageFor(CI), pn = pf ? pf.n : 'All Packages'; toast((pn === 'All Packages' ? 'Your package' : pn) + ' is active. Enjoy ' + m.t + '!'); }, 300);
  if(BOUGHT) setTimeout(function(){ toast('You bought ' + m.t + '. Enjoy!'); }, 300);
  if(RENTED) setTimeout(function(){ var u = MD.until(K); toast('Rented: ' + m.t + (u ? ', available until ' + u.d + ' ' + u.t : '')); }, 300);
  if(location.hash === '#packages') history.replaceState(null, '', HERE);   // (an older link to the package view: now package-suggest.html, View Package's)
  if(PROG && !PROG.live) cur = { row:1, col:0 };   // Upcoming opens on its first LIVE card (Figma); its start button can't be focused
  paint();
})();
