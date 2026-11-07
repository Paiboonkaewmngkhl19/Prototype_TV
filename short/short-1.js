
(function(){
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o){ return Object.keys(o).filter(function(k){ return o[k] != null; }).map(function(k){ return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }

  /* ---------- content: every card is a short drama in content.js (window.SHORTS, by its index: data-s) ---------- */
  var S = window.SHORTS, ALL = S.map(function(_, i){ return i; });
  function pic(i){ return 'posters/shorts/' + S[i].img; }
  function genre(g){ return ALL.filter(function(i){ return S[i].gen.indexOf(g) >= 0; }); }
  var NEW = ALL.slice().reverse();                 // New release: the newest first (the last added)
  var NEW_BADGE = 2;                               // ... the first two tagged New
  var CONTINUE = SHORT.continueList();             // this session's shorts first, then the demo's (content.js)
  var TOP10 = [3, 0, 4, 1, 6, 2, 7, 5];            // every short, ranked (there are 8)
  var NEW_EPS = [1, 4, 0, 6, 3, 7, 2, 5];
  var FOR_YOU = [4, 0, 3, 6];
  var SELECTION = [2, 5, 0, 7, 4, 1, 6, 3];
  var MORE = [6, 3, 1, 7, 0, 5, 2, 4];
  var GRID_COLS = 7;

  /* ---------- markup ---------- */
  function ptag(i){ return '<img class="ptag" src="badges/tag-' + S[i].plat + '.png" alt="">'; }
  function poster(i, set, n, badge, extra){
    return '<div class="pst item"' + attrs({kind:'short', s:i, set:set, i:n, title:S[i].t}) + ' style="background-image:url(\'' + pic(i) + '\')">' +
      (badge ? '<span class="top-tag">' + esc(badge) + '</span>' : '') + (extra || ptag(i)) + '</div>';
  }
  function sec(key, title, body, cls){
    return '<section class="sec' + (cls ? ' ' + cls : '') + '" data-row="' + key + '"><h2 class="sec-title">' + esc(title) + '</h2>' +
      '<div class="rail"><div class="track">' + body + '</div></div></section>';
  }
  var html = '';
  html += sec('new', 'New Releases', NEW.map(function(s, n){ return poster(s, 'new', n, n < NEW_BADGE ? 'New' : ''); }).join(''));
  if(CONTINUE.length) html += sec('cw', 'Continue Watching', CONTINUE.map(function(c, n){
    // the episode it is on, and how far through the series (SHORT.EPS episodes)
    return poster(c.s, 'cw', n, '', '<span class="corner-tag">EP ' + c.ep + ' of ' + SHORT.EPS + '</span>' +
      '<div class="prog"><i style="width:' + Math.max(2, Math.round(c.ep / SHORT.EPS * 100)) + '%"></i></div>');
  }).join(''));
  html += Top10.defs();
  html += '<section class="sec top10" data-row="top10"><h2 class="sec-title">Top 10</h2><div class="rail"><div class="track">' + TOP10.map(function(s, n){
    return '<div class="rank-wrap">' + Top10.numeral(n + 1) + '<div class="rank-poster item"' + attrs({kind:'short', s:s, set:'top10', i:n, title:S[s].t}) +
      ' style="background-image:url(\'' + pic(s) + '\')">' + ptag(s) + '</div></div>';
  }).join('') + '</div></div></section>';
  html += sec('neweps', 'New Episodes', NEW_EPS.map(function(s, n){ return poster(s, 'neweps', n); }).join(''));
  html += sec('foryou', 'For You', FOR_YOU.map(function(s, n){
    var sh = S[s];
    // Movie's For You (expand-card.css): the poster at rest; focused, the short's title, meta row (content.js: its
    // platform tag, Premium, genres, year, episodes, rating) and synopsis over its picture
    return '<div class="xcard item"' + attrs({kind:'short', s:s, set:'foryou', i:n, title:sh.t}) + ' data-ring-art="">' +
      '<div class="xc-portrait" style="background-image:url(\'' + pic(s) + '\')"></div>' +
      '<div class="xc-wide" style="background-image:url(\'' + pic(s) + '\')"></div><div class="xc-scrim ev-scrim"></div>' +
      '<div class="xc-content ev-info"><h3>' + esc(sh.t) + '</h3><div class="meta">' + Content.metaHtml({s:s}, true) + '</div>' +
      '<p class="syn">' + esc(sh.d) + '</p></div></div>';
  }).join(''));
  html += sec('selection', 'Drama Selection', SELECTION.map(function(s, n){ return poster(s, 'selection', n); }).join(''));
  html += sec('drama', 'Drama', genre('Drama').map(function(s, n){ return poster(s, 'drama', n); }).join(''));
  html += sec('romance', 'Romance', genre('Romance').map(function(s, n){ return poster(s, 'romance', n); }).join(''));
  // Feed: a banner with its Explore Feed button, no action yet (no feed player)
  html += '<section class="sec" data-row="feed"><h2 class="sec-title">Feed</h2><div class="feed">' +
    '<div class="tv-btn tv-btn--primary item" data-kind="feed" data-ring-art=""><i></i>Explore Feed</div></div></section>';
  html += '<section class="sec" data-row="more"><h2 class="sec-title">More You’ll Love</h2><div class="grid">' +
    MORE.map(function(s, n){ return poster(s, 'more', n); }).join('') + '</div></section>';
  html += '<section class="sec totop" data-row="totop"><div class="tv-btn tv-btn--primary tv-btn--top item" data-kind="totop" data-ring-art=""><i></i>Back to Top</div></section>';
  var page = document.getElementById('page');
  page.innerHTML = html;
  Top10.ready(page);

  /* ---------- focus rows: one per section; the grid one per line of 7 ---------- */
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  var rows = [];
  $('.sec', page).forEach(function(s){
    var items = $('.item', s);   // (the page's rows; the top bar is its own, below: nav)
    if(s.dataset.row !== 'more'){ rows.push({ sec:s, key:s.dataset.row, items:items }); return; }
    for(var n = 0; n < items.length; n += GRID_COLS) rows.push({ sec:s, key:'more', line:n / GRID_COLS, items:items.slice(n, n + GRID_COLS) });
  });
  var cur = { row:0, col:rows.map(function(){ return 0; }) };

  // ---- keep the focused item in view: the focused card in the first one's slot, the rail sliding under it (as Home's) ----
  function slide(r, el){
    var track = el.closest('.track');
    if(!track) return;
    var first = r.items[0], at = function(x){ return x.closest('.rank-wrap') || x; };   // a Top 10 poster: measure its whole card
    var want = at(el).offsetLeft - at(first).offsetLeft;
    var max = Math.max(0, track.scrollWidth - 1920);
    track.style.transform = 'translateX(' + -Math.max(0, Math.min(want, max)) + 'px)';
  }
  var pageY = 0;
  function layout(r){
    // the focused card centred on the screen, its row's title above it (as the Kids page); the first rows can't go higher
    // than the page's top and the last ones than its end, so they keep their place there
    var el = r.items[cur.col[cur.row]] || r.items[0];
    el = el.closest('.feed') || el;   // Feed: its whole banner, not only the button inside it
    var cy = el.offsetHeight / 2;
    for(var e = el; e && e !== page; e = e.offsetParent) cy += e.offsetTop;
    pageY = Math.max(0, Math.min(cy - 540, page.offsetHeight - 1080));
    page.style.transform = 'translateY(' + -pageY + 'px)';
    // a section that would reach up under the page's title steps away (never the focused one); the rest stay, so the
    // page's end (Feed, More you'll love, Back to Top all in) shows every section that fits
    var HEAD = 124;
    $('.sec', page).forEach(function(s){
      s.classList.toggle('above', s !== r.sec && s.offsetTop < pageY + HEAD);
      // the focused section's own title, when the page's end pulls it up under the page's title (the grid's last line)
      s.classList.toggle('head-off', s === r.sec && s.offsetTop < pageY + HEAD);
    });
  }
  // the top bar: Left on a rail's first card or Up from the first rail; Down (or Back) returns to the row it came from
  var navItems = $('.topnav .item'), homeTab = document.querySelector('.navtab.active'), profileEl = document.querySelector('.topnav .profile');
  var nav = { on:false, col:navItems.indexOf(homeTab) }, prof;
  function paint(){
    var inProf = prof && prof.paint(nav.on && navItems[nav.col] === profileEl);
    navItems.forEach(function(el, i){ el.classList.toggle('focused', !inProf && nav.on && i === nav.col); });
    homeTab.classList.toggle('active', nav.on); homeTab.classList.toggle('active-dim', !nav.on);
    document.body.classList.toggle('on-nav', nav.on);
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){ el.classList.toggle('focused', !nav.on && ri === cur.row && ci === cur.col[ri]); }); });
    var r = rows[cur.row];
    layout(r);
    slide(r, r.items[cur.col[cur.row]]);
    try { sessionStorage.setItem('shortsPageFocus', JSON.stringify(cur)); } catch(e){}
  }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  // leaving for another page whose Back comes here: land on the same item again
  function leave(url){ try { sessionStorage.setItem('shortsPageReturn', '1'); } catch(e){} location.href = url; }
  prof = ProfilePanel(profileEl, { paint:paint, toast:toast });   // the photo's panel, as on Home
  function select(el){
    el.animate([{ transform:getComputedStyle(el).transform }, { transform:(getComputedStyle(el).transform === 'none' ? '' : getComputedStyle(el).transform + ' ') + 'scale(0.97)' }], { duration:140, easing:'ease-out' });
    var k = el.dataset.kind;
    if(k === 'short'){ leave(Content.detailUrl({ s:+el.dataset.s })); return; }   // its page (short-detail.html)
    if(k === 'feed') return;   // Feed: a banner only, no player behind it yet (the button takes focus, Enter does nothing)
    if(k === 'totop'){ cur.row = 0; paint(); return; }
    if(el.dataset.href){ leave(el.dataset.href); return; }   // the top bar's tabs
    if(el === profileEl) return;                             // its panel is already open under it
    if(el.closest('.topnav')) toast((el.dataset.label || 'Selected') + ' (demo)');
  }
  function back(){
    if(nav.on){ nav.on = false; paint(); return; }
    if(cur.row !== 0){ cur.row = 0; paint(); return; }
    try { if(document.referrer && /home\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    var r = rows[cur.row], n = r.items.length, handled = true;
    if(nav.on){
      if(e.key === 'ArrowRight') nav.col = Math.min(navItems.length - 1, nav.col + 1);
      else if(e.key === 'ArrowLeft') nav.col = Math.max(0, nav.col - 1);
      else if(e.key === 'ArrowDown') nav.on = false;
      else if(e.key === 'Enter') select(navItems[nav.col]);
      else if(e.key === 'Escape' || e.key === 'Backspace') back();
      else if(e.key !== 'ArrowUp') handled = false;
      if(handled){ e.preventDefault(); paint(); }
      return;
    }
    if(e.key === 'ArrowRight') cur.col[cur.row] = Math.min(n - 1, cur.col[cur.row] + 1);
    // Left on a rail's first card goes up to the top bar (its Home tab), as on Home, Movie and Kids
    else if(e.key === 'ArrowLeft'){ if(cur.col[cur.row] === 0){ nav.on = true; nav.col = navItems.indexOf(homeTab); } else cur.col[cur.row]--; }
    else if(e.key === 'ArrowUp' && cur.row === 0){ nav.on = true; nav.col = navItems.indexOf(homeTab); }
    else if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){
      var to = Math.max(0, Math.min(rows.length - 1, cur.row + (e.key === 'ArrowDown' ? 1 : -1)));
      // between the grid's lines the focus keeps its column (the nearest card on a shorter line)
      if(to !== cur.row && r.key === 'more' && rows[to].key === 'more') cur.col[to] = Math.min(cur.col[cur.row], rows[to].items.length - 1);
      cur.row = to;
    }
    else if(e.key === 'Enter') select(r.items[cur.col[cur.row]]);
    else if(e.key === 'Escape' || e.key === 'Backspace') back();
    else handled = false;
    if(handled){ e.preventDefault(); paint(); }
  });
  rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){
    el.addEventListener('click', function(){ nav.on = false; cur.row = ri; cur.col[ri] = ci; paint(); select(el); });
  }); });
  navItems.forEach(function(el, i){ el.addEventListener('click', function(){ nav.on = true; nav.col = i; paint(); select(el); }); });

  // coming back (Back from a short's page or the player): the same item again
  try {
    var saved = sessionStorage.getItem('shortsPageReturn') && JSON.parse(sessionStorage.getItem('shortsPageFocus') || 'null');
    sessionStorage.removeItem('shortsPageReturn');
    if(saved && saved.col && saved.col.length === rows.length) cur = saved;
  } catch(e){}
  page.style.transition = 'none';
  paint();
  // fonts change the rows' heights: lay out again once they are in, then let the page glide
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ paint(); requestAnimationFrame(function(){ page.style.transition = ''; }); });
})();
