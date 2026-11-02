
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };

  /* ---------- content: Home's Shorts row (the same titles and posters, content.js) ---------- */
  var SHORTS = window.SHORTS;   // content.js
  var si = Math.max(0, Math.min(SHORTS.length - 1, +((location.search.match(/[?&]s=(\d+)/) || [])[1] || 0)));
  var S = SHORTS[si], EPS = 160, FREE = 10, RANGE = 40;
  var STORE_KEY = 'shortUnlocked' + si;   // the episodes unlocked this session (bought / ads / subscribed)
  var unlocked = {}, adsLeft = 4;
  try { unlocked = JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}'); adsLeft = +(sessionStorage.getItem('shortAdsLeft') || 4); } catch(e){}
  // free, unlocked, a pass, bought, or this short's app package: content.js SHORT.open
  function isOpen(n){ return SHORT.open(si, n); }
  // back from its package (View Package → package-detail.html / purchase.html → ?subscribed=1): every episode is open
  var JUST_BOUGHT = /[?&]subscribed=1/.test(location.search);
  if(JUST_BOUGHT) history.replaceState(null, '', 'short-detail.html?s=' + si);
  // back from Buy (purchase.html?s=N&opt=buy → ?bought=1): the short is the viewer's, every episode open
  var BOUGHT = /[?&]bought=1/.test(location.search);
  if(BOUGHT){ SHORT.own(si); history.replaceState(null, '', 'short-detail.html?s=' + si); setTimeout(function(){ toast('You bought ' + S.t + ': every episode is unlocked'); }, 300); }
  // a pass bought on the payment page: every episode of this short is open (before the crown and buttons are drawn)
  if(/[?&]pass=1/.test(location.search)){
    unlocked.all = 1; keep();
    history.replaceState(null, '', 'short-detail.html?s=' + si);
    setTimeout(function(){ toast('Your pass is active: every episode is unlocked'); }, 300);
  }
  function keep(){ try { sessionStorage.setItem(STORE_KEY, JSON.stringify(unlocked)); sessionStorage.setItem('shortAdsLeft', adsLeft); } catch(e){} }

  // the top
  document.title = S.t;
  $('.top .pic')[0].style.backgroundImage = "url('posters/shorts/" + S.img + "')";
  $('.hero h1')[0].textContent = S.t;
  $('.metarow')[0].innerHTML = Content.metaHtml({s:si}, true);   // content.js (with Premium): Home's and the Movie page's screen text say the same
  $('.syn')[0].innerHTML = esc(S.d) + ' <b>More</b>';
  // Play: the episode the player left off on (SHORT.at), else Ep.1
  var playEp = (window.SHORT && SHORT.at(si) || {}).ep || 1;
  $('.actions .main span')[0].textContent = 'Play Ep.' + playEp;
  // watching it already (SHORT.at): Start Over after the main button, as a movie's or series' detail page
  if(window.SHORT && SHORT.at(si)) $('.actions .main')[0].insertAdjacentHTML('afterend',
    '<div class="tv-btn tv-btn--secondary ic item" data-act="startover" data-tip="Start Over" data-ring-art=""><img src="icons/player/start-over.svg" alt="Start Over"><span class="tip"></span></div>');
  // not the viewer's yet (gold crown): View Package next to Play, its app's Short Drama packages (content.js); the
  // locked episodes keep their own unlock options. Owned: every episode open, no View Package
  // a short with a price (content.js SHORTS buy): Buy N ฿ after it, to own every episode (package-detail.html, as a movie's Buy)
  if(Content.crown({s:si}) === 'gold') $('.actions .main')[0].insertAdjacentHTML('afterend',
    '<div class="tv-btn tv-btn--secondary main item" data-act="package" data-label="View Package" data-ring-art=""><i class="ic-pkg"></i>View Package</div>' +
    (S.buy ? '<div class="tv-btn tv-btn--secondary buy item" data-act="buyshort" data-label="Buy" data-ring-art="">Buy ' + S.buy + ' ฿</div>' : ''));

  // You May Also Like: other short dramas only (content.js Content.related), never a movie in their place
  var LIKES = Content.related({s:si}, 18).map(function(r){ return { t:SHORTS[r.s].t, img:'posters/shorts/' + SHORTS[r.s].img, s:r.s }; });
  var likesEl = $('.likes')[0];
  for(var r = 0; r < LIKES.length; r += 6){
    likesEl.insertAdjacentHTML('beforeend', '<div class="likerow">' + LIKES.slice(r, r + 6).map(function(x, j){
      return '<div class="poster item" data-l="' + (r + j) + '" data-s="' + x.s + '" style="background-image:url(\'' + x.img + '\')"></div>';
    }).join('') + '</div>');
  }

  // Episodes: the ranges and the grid for the picked range
  var rangesEl = $('.ranges')[0], epsEl = $('.eps')[0], rangeAt = 0;
  for(var a = 1; a <= EPS; a += RANGE) rangesEl.insertAdjacentHTML('beforeend', '<div class="rng item" data-ring-art="">' + a + '-' + (a + RANGE - 1) + '</div>');
  function buildEps(){
    var html = '';
    for(var row = 0; row < RANGE / 10; row++){
      html += '<div class="eprow">';
      for(var c = 1; c <= 10; c++){
        var n = rangeAt * RANGE + row * 10 + c;
        html += '<div class="ep item' + (isOpen(n) ? '' : ' locked') + '" data-n="' + n + '" data-ring-art=""><b>' + n + '</b><span class="lock"><img src="icons/short/lock.svg" alt="Locked"></span></div>';
      }
      html += '</div>';
    }
    epsEl.innerHTML = html;
    $('.rng').forEach(function(el, i){ el.classList.toggle('on', i === rangeAt); });
  }
  function paintLocks(){ $('.ep').forEach(function(el){ el.classList.toggle('locked', !isOpen(+el.dataset.n)); }); }

  /* ---------- focus rows ----------
     nav (the top bar), actions, tabs, then the picked tab's rows: ranges + one row per 10 episodes, or one per 6
     posters. cur.col is kept per row key; cur.from is the row the top bar was reached from. */
  var navItems = $('.topnav .item'), NAV_HOME = navItems.indexOf(document.querySelector('.navtab.active'));
  var tabAt = -1, rows = [], cur = { row:1, col:{ nav:NAV_HOME }, from:'actions' };
  function build(){
    buildEps();
    rows = [{ key:'nav', items:navItems }, { key:'actions', items:$('.actions .item') }, { key:'tabs', items:$('.ttab') }];
    if(tabAt === 0){
      rows.push({ key:'ranges', items:$('.rng') });
      $('.eprow').forEach(function(rw, i){ rows.push({ key:'ep' + i, grid:i, items:$('.item', rw) }); });
    } else if(tabAt === 1){
      $('.likerow').forEach(function(rw, i){ rows.push({ key:'like' + i, grid:i, items:$('.item', rw) }); });
    }
    $('.ttab').forEach(function(el, i){ el.classList.toggle('on', i === tabAt); });
    $('.panel').forEach(function(p){ p.classList.toggle('on', p.dataset.panel === (tabAt === 0 ? 'eps' : tabAt === 1 ? 'likes' : '')); });
    bindClicks();
  }
  function rowOf(key){ for(var i = 0; i < rows.length; i++) if(rows[i].key === key) return i; return -1; }
  function col(){ var r = rows[cur.row]; return Math.min(cur.col[r.key] || 0, r.items.length - 1); }
  function setCol(c){ cur.col[rows[cur.row].key] = c; }

  // landing on a tab or a range picks it (as Store's tab bars do)
  function land(){
    var r = rows[cur.row];
    if(r.key === 'tabs' && col() !== tabAt){ tabAt = col(); build(); }
  }
  // Enter on a range (as on a TV Guide sub-category): the grid shows those episodes, from its first column
  function pickRange(i){
    if(i === rangeAt) return;
    rangeAt = i; build();
    Object.keys(cur.col).forEach(function(k){ if(/^ep\d/.test(k)) cur.col[k] = 0; });
  }

  // the profile panel under the top bar's photo, as on Home (profile-panel.js)
  var profileEl = document.querySelector('.topnav .profile'), prof = ProfilePanel(profileEl, { paint:paint, toast:toast });

  // ---- the page's place: the top at 0; below it, the tabs bar at the top of the screen (pinned, with the ranges), and
  // inside its window the grid slides only if it overflows it ----
  var page = document.getElementById('page');
  function paint(){
    var inProf = prof.paint(cur.row === 0 && navItems[col()] === profileEl);
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){ el.classList.toggle('focused', !inProf && !modalOn && ri === cur.row && ci === col()); }); });
    // top-bar tab states (button-theme.css): the current page's tab is Active while the D-pad is on the bar, Active dim in the content
    var curTab = document.querySelector('.topnav .navtab.active, .topnav .navtab.active-dim');
    curTab.classList.toggle('active', cur.row === 0); curTab.classList.toggle('active-dim', cur.row !== 0);
    // Store's Active dim: only once focus has gone below the tabs bar (its ranges, grid or posters), not on the buttons above
    var tabsRow = rowOf('tabs');
    // (button-theme.css: Secondary at rest, the Primary focus pill when focused, as Movie Detail's tabs)
    $('.ttab').forEach(function(el){
      var f = el.classList.contains('focused');
      el.classList.toggle('tv-btn--primary', f); el.classList.toggle('tv-btn--secondary', !f);
      el.classList.toggle('active-dim', el.classList.contains('on') && cur.row > tabsRow);
    });
    var at = cur.row === 0 ? rows[Math.max(1, rowOf(cur.from))] : rows[cur.row];
    var below = at.key !== 'actions', y = below ? 936 : 0, isEp = at.key.indexOf('ep') === 0;
    page.style.transform = 'translateY(' + -y + 'px)';
    // the grid slides only when it runs past its window (the focused row to the first row's place, no further than its
    // last row needs, 40px kept under it); a grid that fits stays put
    function slide(el, step){
      var over = el.scrollHeight + 40 - el.parentNode.clientHeight, dy = at.grid && over > 0 ? Math.min(at.grid * step, over) : 0;
      el.style.transform = dy ? 'translateY(' + -dy + 'px)' : '';
    }
    if(isEp){ slide(epsEl, 188); likesEl.style.transform = ''; } else { slide(likesEl, 412); epsEl.style.transform = ''; }
    document.body.classList.toggle('below', below);
    document.body.classList.toggle('on-nav', cur.row === 0);
    // the icon buttons' tooltips, and their icons filled while on (icon-toggle.js), as on Movie Detail
    $('.actions [data-tip]').forEach(function(b){ b.querySelector('.tip').textContent = b.classList.contains('on') ? b.dataset.tipOn : b.dataset.tip; });
    $('.actions [data-toggle]').forEach(IconToggle.paint);
    paintModal();
  }

  /* ---------- Unlock Episode ---------- */
  var modalOn = false, mEp = 0, mSel = 1, mFocus = { area:'opts', i:1 };
  var optEls = $('.opt'), mBtnEls = $('.mbtn');
  function openUnlock(n){
    mEp = n; modalOn = true; mSel = 1; mFocus = { area:'btns', i:1 };   // Figma: Buy this episode picked, focus on Confirm
    $('.modal h2')[0].textContent = 'Unlock Episode ' + n;
    $('.adtxt')[0].textContent = 'Watch ads to unlock (' + adsLeft + '/5)';
    optEls[2].classList.toggle('off', adsLeft <= 0);
    document.body.classList.add('unlock'); paint();
  }
  function closeUnlock(){ modalOn = false; document.body.classList.remove('unlock'); paint(); }
  function paintModal(){
    optEls.forEach(function(o, i){ o.classList.toggle('sel', i === mSel); o.classList.toggle('focused', modalOn && mFocus.area === 'opts' && mFocus.i === i); });
    mBtnEls.forEach(function(b, i){ b.classList.toggle('focused', modalOn && mFocus.area === 'btns' && mFocus.i === i); });
  }
  function confirmUnlock(){
    var o = optEls[mSel].dataset.o;
    if(o === 'sub'){   // the Short Drama packages; All Packages comes back here
      save(); location.href = 'all-packages.html?tab=shorts'; return;
    }
    if(o === 'buy'){   // the short's payment (package-detail.html, short mode): a viewing pass
      save(); location.href = 'package-detail.html?short=' + si + '&ep=' + mEp; return;
    }
    if(o === 'ads'){
      if(adsLeft <= 0){ toast('No more ads today: try another way'); return; }
      closeUnlock(); playAd(mEp);
    }
  }
  function modalKey(k){
    if(k === 'Escape' || k === 'Backspace'){ closeUnlock(); return; }
    if(mFocus.area === 'opts'){
      if(k === 'ArrowUp') mFocus.i = Math.max(0, mFocus.i - 1);
      else if(k === 'ArrowDown'){ if(mFocus.i < 2) mFocus.i++; else mFocus = { area:'btns', i:1 }; }
      else if(k === 'Enter'){ if(!optEls[mFocus.i].classList.contains('off')) mSel = mFocus.i; }
    } else {
      if(k === 'ArrowLeft') mFocus.i = 0;
      else if(k === 'ArrowRight') mFocus.i = 1;
      else if(k === 'ArrowUp') mFocus = { area:'opts', i:mSel };
      else if(k === 'Enter'){ if(mFocus.i === 0) closeUnlock(); else confirmUnlock(); return; }
    }
    paintModal();
  }
  optEls.forEach(function(o, i){ o.addEventListener('click', function(){ if(o.classList.contains('off')) return; mSel = i; mFocus = { area:'opts', i:i }; paintModal(); }); });
  mBtnEls.forEach(function(b, i){ b.addEventListener('click', function(){ mFocus = { area:'btns', i:i }; paintModal(); if(i === 0) closeUnlock(); else confirmUnlock(); }); });
  $('.mscrim')[0].addEventListener('click', closeUnlock);

  // the ad: 5 seconds over another short's picture, then the episode is unlocked
  var adOn = false;
  function playAd(n){
    adOn = true; adsLeft--; keep();
    var ad = $('.ad')[0], cnt = $('.ad .count')[0], left = 5;
    ad.style.backgroundImage = "url('posters/shorts/" + SHORTS[(si + 3) % SHORTS.length].img + "')";
    document.body.classList.add('ad-on');
    (function tick(){
      cnt.textContent = left > 0 ? 'Episode ' + n + ' unlocks in ' + left : 'Unlocked';
      if(left-- > 0){ setTimeout(tick, 1000); return; }
      adOn = false; document.body.classList.remove('ad-on');
      unlocked[n] = 1; keep(); paintLocks(); paint(); toast('Episode ' + n + ' unlocked');
    })();
  }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function select(el){
    if(el.classList.contains('rng')){ pickRange($('.rng').indexOf(el)); return; }
    if(el === profileEl) return;   // its panel is already open under it
    if(el.dataset.href){ location.href = el.dataset.href; return; }
    if(navItems.indexOf(el) >= 0){ toast(el.dataset.label + ' (demo)'); return; }
    if(el.dataset.act === 'play'){ location.href = 'player.html?short=' + si + '&ep=' + playEp; return; }   // the vertical player
    if(el.dataset.act === 'buyshort'){ save(); location.href = 'package-detail.html?short=' + si + '&opt=buy'; return; }   // Figma "Vertical Content Full Series", then the payment; back here (?bought=1) every episode is open
    if(el.dataset.act === 'package'){ save(); location.href = Content.packageUrl({s:si}, 'short-detail.html?s=' + si); return; }   // bought, it comes back here (?subscribed=1)
    if(el.dataset.act === 'startover'){ location.href = 'player.html?short=' + si + '&ep=1&start=1'; return; }   // from Ep.1
    if(el.dataset.act === 'toggle'){
      var msgs = el.dataset.toggle.split('|'), on = !el.classList.contains('on');
      el.classList.toggle('on', on); IconToggle.pop(el, on);
      if(on && el.dataset.pair){ var other = $('.actions [data-label="' + (el.dataset.pair === '1' ? 'Dislike' : 'Like') + '"]')[0]; other.classList.remove('on'); IconToggle.paint(other); }   // like and dislike can't both be on
      toast(on ? msgs[0] : msgs[1]); return;
    }
    if(el.classList.contains('ep')){
      var n = +el.dataset.n;
      if(isOpen(n)) location.href = 'player.html?short=' + si + '&ep=' + n + (n === playEp ? '' : '&start=1'); else openUnlock(n);
      return;
    }
    if(el.classList.contains('poster')){
      Content.open({s:LIKES[+el.dataset.l].s}); return;
    }
  }
  // leaving for All Packages: coming back lands on the same tab, range and episode
  function save(){ try { sessionStorage.setItem('shortReturn', JSON.stringify({ s:si, tabAt:tabAt, rangeAt:rangeAt, cur:cur })); } catch(e){} }
  // Back: the popup, then up to the tabs, then the top, then where the page was opened from
  function back(){
    if(cur.row > 2){ cur.row = 2; paint(); return; }
    if(cur.row === 2 || cur.row === 0){ cur.row = 1; paint(); return; }
    try { if(document.referrer && /(home|movie|store|sport|news|movie-detail|short-detail)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  addEventListener('keydown', function(e){
    if(adOn){ e.preventDefault(); return; }
    if(modalOn){ e.preventDefault(); modalKey(e.key); return; }
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    var r = rows[cur.row], c = col(), handled = true;
    if(e.key === 'ArrowRight') setCol(Math.min(r.items.length - 1, c + 1));
    else if(e.key === 'ArrowLeft'){
      // Left on a row's first item goes up to the top bar (its Home tab), as on Home
      if(cur.row > 0 && c === 0){ cur.from = r.key; cur.row = 0; cur.col.nav = NAV_HOME; }
      else setCol(Math.max(0, c - 1));
    }
    else if(e.key === 'ArrowUp'){
      if(cur.row === 1){ cur.from = 'actions'; cur.row = 0; cur.col.nav = NAV_HOME; }
      else if(cur.row > 1){
        cur.row--;
        // between grid rows, keep the same column
        if(rows[cur.row].grid !== undefined && r.grid !== undefined) setCol(Math.min(c, rows[cur.row].items.length - 1));
        if(rows[cur.row].key === 'ranges') setCol(rangeAt);   // back onto the ranges: on the picked one (TV Guide)
      }
    }
    else if(e.key === 'ArrowDown'){
      if(cur.row === 0) cur.row = Math.max(1, rowOf(cur.from));
      else if(cur.row < rows.length - 1){
        cur.row++;
        if(rows[cur.row].grid !== undefined && r.grid !== undefined) setCol(Math.min(c, rows[cur.row].items.length - 1));
        if(rows[cur.row].key === 'ranges') setCol(rangeAt);
      }
    }
    else if(e.key === 'Enter') select(r.items[c]);
    else if(e.key === 'Escape' || e.key === 'Backspace'){ back(); e.preventDefault(); return; }
    else handled = false;
    if(!handled) return;
    e.preventDefault();
    land(); paint();
  });
  function bindClicks(){
    rows.forEach(function(r){ r.items.forEach(function(el, ci){
      if(el.dataset.bound) return; el.dataset.bound = 1;
      el.addEventListener('click', function(){
        var ri = -1;
        rows.forEach(function(rr, i){ if(rr.items.indexOf(el) >= 0) ri = i; });
        if(ri < 0 || modalOn) return;
        if(ri === 0 && cur.row) cur.from = rows[cur.row].key;
        cur.row = ri; setCol(rows[ri].items.indexOf(el)); land(); paint(); select(el);
      });
    }); });
  }

  // coming back from All Packages (Subscribe to unlock all): the same tab, range and episode
  try {
    var saved = JSON.parse(sessionStorage.getItem('shortReturn') || 'null');
    sessionStorage.removeItem('shortReturn');
    if(saved && saved.s === si){ tabAt = saved.tabAt; rangeAt = saved.rangeAt; cur = saved.cur; }
  } catch(e){}
  if(JUST_BOUGHT) setTimeout(function(){ toast(Content.packageFor({s:si}).n + ' is active: every episode is unlocked'); }, 300);
  build();
  if(!cur.row || cur.row >= rows.length) cur.row = 1;
  addEventListener('pageshow', function(e){ if(e.persisted) location.reload(); });   // back from the player: Play Ep.N follows it
  // from the player: a locked episode it reached (?unlock=N) opens Unlock Episode N
  var UNLOCK = +(location.search.match(/[?&]unlock=(\d+)/) || [])[1];
  if(UNLOCK){ history.replaceState(null, '', 'short-detail.html?s=' + si); if(!isOpen(UNLOCK)) setTimeout(function(){ openUnlock(UNLOCK); }, 0); }
  page.style.transition = 'none';
  paint();
  requestAnimationFrame(function(){ page.style.transition = ''; });
})();
