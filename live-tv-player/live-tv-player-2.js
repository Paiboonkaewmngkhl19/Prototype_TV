
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');
  var $ = function(q, el){ return Array.prototype.slice.call((el || document).querySelectorAll(q)); };
  var byId = function(id){ return document.getElementById(id); };
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function hm(d){ return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  /* ---------- the channel and programme, from the query string ---------- */
  var q = {}; location.search.slice(1).split('&').forEach(function(kv){ if(!kv) return; var i = kv.indexOf('='); q[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); });
  var C = { n:q.n || 'Channel', no:q.no || '', crown:q.crown || '', fav:q.fav === '1', logo:q.logo, fit:q.fit, box:q.box, bg:q.bg, txt:q.txt, fg:q.fg };
  var P = { t:q.t || '', start:new Date(+q.s || Date.now() - 30 * 60000), end:new Date(+q.e || Date.now() + 30 * 60000) };
  byId('video').src = byId('thumbV').src = q.v || 'video/hbo.mp4';   // the thumbnail is a second, paused copy
  // with sound: the browser may refuse to start unmuted without a key press on this page, so it then starts muted and
  // the sound comes on with the first key or click
  (function(v){
    v.play().catch(function(){
      v.muted = true; v.play();
      function unmute(){ v.muted = false; removeEventListener('keydown', unmute, true); removeEventListener('click', unmute, true); }
      addEventListener('keydown', unmute, true); addEventListener('click', unmute, true);
    });
  })(byId('video'));
  // Time Shift: set per programme in the TV Guide (its Time Shift icon). With it the viewer can pause, go back / forward
  // 10s, hold to scrub faster (with a thumbnail) and Start Over; without it the player stays live
  var TS = q.ts === '1';
  if(!TS) byId('bottom').classList.add('no-ts');
  // a package bought this session (All Packages, from Explore Package): premium channels play in full, Time Shift too
  var SUBSCRIBED = false; try { SUBSCRIBED = sessionStorage.getItem('tvSubscribed') === '1'; } catch(e){}
  // Time Shift on a premium channel not in the package (gold crown): its icon still shows (TV Guide, mini EPG), but
  // play / pause, back / forward, the hold speeds and Start Over stay locked until a package is bought
  var TS_LOCK = TS && C.crown === 'gold' && !SUBSCRIBED;
  if(TS_LOCK) byId('bottom').classList.add('ts-locked');
  // back from All Packages out of the browser's page cache: start again, so a package bought there takes effect
  addEventListener('pageshow', function(e){ if(e.persisted) location.reload(); });

  // a logo that fails to load turns into the placeholder: the channel's name on its disc (the .txt avatar)
  function logoAttrs(c){ return ' alt="' + esc(c.n) + '" onerror="var a=this.parentNode;a.classList.add(\'txt\');a.style.background=\'#2a2a2a\';a.textContent=this.alt"'; }
  var ava = byId('ava');
  if(!C.logo){ ava.className = 'ava txt'; ava.style.background = C.bg || ''; ava.style.color = C.fg || '#fff'; ava.textContent = C.txt || C.n; }
  else {
    if(C.bg) ava.style.background = C.bg;
    var b = C.box && C.box.split(',');
    ava.innerHTML = b ? '<img src="' + esc(C.logo) + '"' + logoAttrs(C) + ' style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%;object-fit:contain;">'
                      : '<img class="' + (C.fit || 'cover') + '" src="' + esc(C.logo) + '"' + logoAttrs(C) + '>';
  }
  byId('progT').textContent = P.t;
  byId('chName').textContent = C.n;
  if(!C.crown) byId('crown').style.display = 'none';
  // a premium channel in the viewer's package: the crown with the green play mark, as on the TV Guide's cards
  else if(C.crown === 'owned'){ byId('crown').classList.add('owned'); byId('crown').querySelector('img').src = 'icons/tv-guide/crown.svg'; }
  if(C.no) byId('chNo').textContent = C.no; else byId('chNo').style.display = 'none';   // Exclusive channels have no number
  byId('progTm').textContent = hm(P.start) + ' - ' + hm(P.end);
  // free preview + Explore Package: a premium channel not in the viewer's package (gold crown, not 'owned')
  // (an owned premium channel, crown 'owned', plays in full). The 3 minutes count only while playing and are kept per
  // channel for this browser session, so leaving and coming back doesn't start them over
  var preview = C.crown === 'gold' && !SUBSCRIBED, PKEY = 'freePreview:' + C.n, previewLeft = 180;
  try { var kept = sessionStorage.getItem(PKEY); if(kept !== null) previewLeft = +kept; } catch(e){}
  if(!preview) byId('bottom').classList.add('no-preview');
  function previewText(){ byId('previewLeft').textContent = previewLeft ? Math.floor(previewLeft / 60) + ':' + pad(previewLeft % 60) + ' minutes left' : 'Ended'; }
  // out of preview: the picture stops for good (nothing can play it again), the controls stay up and focus goes to
  // Explore Package
  function endPreview(){
    var v = byId('video'); v.pause();
    document.body.classList.add('preview-over'); previewText();
    row = 1; col = 0; if(typeof paint === 'function') paint();
    toast('Free preview has ended. Get a package to keep watching');
  }
  byId('video').addEventListener('play', function(){ if(preview && !previewLeft) this.pause(); });
  function setFav(){ byId('favIc').src = C.fav ? 'icons/tv-guide/heart-fill.svg' : 'icons/player/fav.svg'; byId('favLbl').textContent = C.fav ? 'Remove Favorite' : 'Add Favorite'; }
  setFav();

  /* ---------- seek bar: the programme from its start up to now, so it is full at live. `behind` is how far (ms) the
     picture is behind live; `scrub` is where the viewer is moving to before it is applied ---------- */
  var behind = 0, scrub = null, STEP = 10000, holdT = null, holdStart = 0, commitT = null;
  function win(){ return Math.max(0, Math.min(P.end - P.start, Date.now() - P.start)); }   // how much can be gone back over
  function vmod(t){ var d = byId('video').duration || 0; return d ? ((t % d) + d) % d : 0; }   // the demo clip loops for the channel
  function hms(ms){ var s = Math.floor(ms / 1000); return Math.floor(s / 3600) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }
  function scrubBy(ms){
    if(scrub === null) scrub = behind;
    scrub = Math.max(0, Math.min(win(), scrub - ms));
    clearTimeout(commitT);
    var tv = byId('thumbV');
    if(tv.readyState) tv.currentTime = vmod(byId('video').currentTime - (scrub - behind) / 1000);
    byId('thumb').classList.add('on');
    paintSeek();
  }
  // the picture jumps to where the viewer stopped
  function commit(){
    clearTimeout(commitT);
    if(scrub === null) return;
    var v = byId('video'); v.currentTime = vmod(v.currentTime - (scrub - behind) / 1000);
    behind = scrub; scrub = null;
    byId('thumb').classList.remove('on'); setSpeed(0); paintSeek();
  }
  // holding Left / Right scrubs on its own, faster the longer it is held: 2x, 4x, 8x, 16x
  function setSpeed(s){ if(s) seekFx(s < 0 ? -1 : 1, Math.abs(s) + 'x'); }   // shown on the thumbnail's disc
  // the YouTube-style marker, on the thumbnail: a press shows -10 / +10, more presses in a row add up; a hold shows its speed
  var seekSum = 0, seekDir = 0, seekT = null;
  function seekFx(dir, label){
    var f = byId('seekfx');
    if(label === undefined){
      seekSum = dir === seekDir && f.classList.contains('on') ? seekSum + 10 : 10;
      label = (dir < 0 ? '-' : '+') + seekSum;
    }
    seekDir = dir;
    f.classList.toggle('l', dir < 0); f.classList.toggle('r', dir > 0);
    byId('seekLbl').textContent = label; f.classList.add('on');
    clearTimeout(seekT); seekT = setTimeout(function(){ f.classList.remove('on'); seekSum = 0; }, 800);
  }
  function startHold(dir){
    holdStart = Date.now();
    holdT = setInterval(function(){
      var t = (Date.now() - holdStart) / 1000, sp = t < 1 ? 2 : t < 2 ? 4 : t < 3 ? 8 : 16;
      setSpeed(sp * dir); scrubBy(dir * sp * 3000);   // 30s of the programme per second at 1x
    }, 100);
  }
  function stopHold(){ if(!holdT) return; clearInterval(holdT); holdT = null; setSpeed(0); commitT = setTimeout(commit, 800); }
  function paintSeek(){
    var W = win(), el = W - (scrub === null ? behind : scrub), f = W ? el / W : 1, tr = byId('track');
    byId('elapsed').textContent = hms(el);
    tr.style.setProperty('--f', f);
    tr.style.setProperty('--b', Math.min(1, f + .02));
    if(scrub !== null){
      var w = tr.offsetWidth - 10;   // the bar, focused
      byId('thumb').style.left = Math.max(160, Math.min(tr.offsetWidth - 160, f * w)) + 'px';
      byId('thumbT').textContent = hms(el);
    }
  }
  function tick(){
    // paused with Time Shift: live moves on, so the picture falls further behind it
    if(TS && byId('video').paused && scrub === null) behind = Math.min(win(), behind + 1000);
    paintSeek();
    if(preview && previewLeft > 0 && !byId('video').paused){
      previewLeft--;
      try { sessionStorage.setItem(PKEY, previewLeft); } catch(e){}
      if(!previewLeft) endPreview();
    }
    if(preview) previewText();
  }
  tick(); setInterval(tick, 1000);

  /* ---------- focus: rows top to bottom, Left / Right along a row ---------- */
  function rows(){
    // the seek row is focused as one: the bar grows (Enter plays / pauses, Left / Right move through the programme);
    // the play / pause icon beside it only shows the state
    // hidden buttons (Start Over without Time Shift) are left out, so focus skips them
    var btns = $('.btn').filter(function(b){ return getComputedStyle(b).display !== 'none'; });
    return [$('.back'), preview ? $('.explore') : [], [byId('track')], btns].filter(function(r){ return r.length; });
  }
  var row = 2 - (preview ? 0 : 1), col = 0;   // the seek bar; see "first focus" below
  function paint(){
    var r = rows(); row = Math.max(0, Math.min(r.length - 1, row)); col = Math.max(0, Math.min(r[row].length - 1, col));
    $('.item').forEach(function(el){ el.classList.remove('focused', 'on'); });
    // the seek bar shows focus itself (taller, with the handle), so it takes .on: focus-ring.js only rings .focused
    var el = r[row][col]; el.classList.add(el.id === 'track' ? 'on' : 'focused');
  }
  // first focus: the seek bar, with Time Shift or without. After that the controls come back on the button last used
  (function(){
    var want = byId('track');
    rows().forEach(function(r, ri){ r.forEach(function(el, ci){ if(el === want){ row = ri; col = ci; } }); });
  })();

  var toastEl = byId('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1800); }
  function setPlayIcon(){ var v = byId('video'), ic = byId('playIc'); ic.src = v.paused ? 'icons/detail-play.svg' : 'icons/player/pause.svg'; ic.alt = v.paused ? 'Play' : 'Pause'; }
  function flash(paused){
    var f = byId('flash');
    byId('flashIc').src = paused ? 'icons/player/pause.svg' : 'icons/detail-play.svg';
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');   // restart the animation on every press
  }
  function favAnim(on){
    var img = byId('favIc');
    img.classList.remove('pop', 'unpop'); void img.offsetWidth;   // restart the animation
    img.classList.add(on ? 'pop' : 'unpop');
    if(!on) return;
    var b = document.createElement('span'); b.className = 'fav-burst';
    b.innerHTML = '<span class="ring"></span>' + [0,45,90,135,180,225,270,315].map(function(a){ return '<i style="--a:' + a + 'deg"></i>'; }).join('');
    img.parentElement.appendChild(b); setTimeout(function(){ b.remove(); }, 700);
    var big = document.createElement('div'); big.className = 'fav-big';
    screen.appendChild(big); setTimeout(function(){ big.remove(); }, 1000);
  }
  // the channel being watched, for the TV Guide's Watching tag (taken only right after leaving here: see tv-guide.html)
  function markWatching(){ try { sessionStorage.setItem('tvWatching', JSON.stringify({n:C.n, t:Date.now(), v:byId('video').src, at:byId('video').currentTime})); } catch(e){} }
  function back(){
    markWatching();
    try { if(document.referrer && /(tv-guide|sport|home|news|movie)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'tv-guide.html';
  }
  // a locked Time Shift control: say why, and put focus on Explore Package (the way to unlock it)
  function tsLocked(){
    toast('Time Shift is part of the package. Get it to pause, rewind and fast-forward');
    var r = rows(); for(var i = 0; i < r.length; i++) if(r[i][0].dataset.act === 'explore'){ row = i; col = 0; }
    paint();
  }
  function activate(el){
    var v = byId('video');
    if(TS_LOCK && (el.dataset.act === 'play' || el.dataset.act === 'start-over')){ tsLocked(); return; }
    switch(el.dataset.act){
      case 'back': back(); break;
      case 'play':
        if(!TS) break;   // a live channel without Time Shift can't pause: OK does nothing (the play / pause icon is hidden too)
        if(scrub !== null){ commit(); break; }   // Enter while scrubbing: play from there now
        if(preview && !previewLeft){ toast('Free preview has ended. Get a package to keep watching'); break; }
        if(v.paused) v.play(); else v.pause();
        setPlayIcon(); flash(v.paused); break;
      case 'start-over':
        scrub = null; byId('thumb').classList.remove('on'); behind = win();
        v.currentTime = 0; v.play(); setPlayIcon(); paintSeek(); toast('Start Over: ' + P.t); break;
      case 'fav':
        C.fav = !C.fav; setFav(); favAnim(C.fav);
        // the mini EPG's Favorite category follows
        try { var md = JSON.parse(sessionStorage.getItem('tvMini')); md.chans.forEach(function(x){ if(x.n === C.n) x.fav = C.fav; }); sessionStorage.setItem('tvMini', JSON.stringify(md)); } catch(e){}
        // ... and so do the TV Guide and Home (tvFavs, the session's favourites)
        try { var tf = JSON.parse(sessionStorage.getItem('tvFavs') || '{}'); tf[C.n] = C.fav; sessionStorage.setItem('tvFavs', JSON.stringify(tf)); } catch(e){}
        toast(C.fav ? 'Added to Favorite: ' + C.n : 'Removed from Favorite: ' + C.n); break;
      case 'guide': openGuide(); break;
      case 'explore': location.href = 'all-packages.html'; break;   // subscribing there unlocks the channel and its Time Shift; Back comes here
      case 'mini-epg': openMini(true); break;
      case 'sub-audio': toast('Subtitle / Audio'); break;
      case 'settings': toast('Settings'); break;
    }
  }

  /* ---------- idle: the controls fade out after 5s without a key; the first key only brings them back ---------- */
  var idleT;
  /* ---------- change channel by number: up to 3 digits, shown top right; it tunes 2s after the last digit (at once
     after the 3rd). The channel list lives in the TV Guide, so tuning goes through it: tv-guide.html?tune=N opens that
     channel here in this player's place, or comes back with ?nochan=N when there is no such channel ---------- */
  var chBuf = '', chT;
  function chPaint(){ var el = byId('chIn'); el.innerHTML = esc(chBuf) + '<i>' + '–––'.slice(chBuf.length) + '</i>'; el.classList.toggle('on', !!chBuf); }
  function chKey(d){
    clearTimeout(chShowT);
    if(chBuf.length >= 3) chBuf = '';
    chBuf += d; chPaint();
    clearTimeout(chT); chT = setTimeout(tune, chBuf.length === 3 ? 500 : 2000);
  }
  function chCancel(){ clearTimeout(chT); chBuf = ''; chPaint(); }
  function tune(){
    clearTimeout(chT);
    var n = parseInt(chBuf, 10); chBuf = '';
    if(!n){ chPaint(); return; }
    if(String(n) === C.no){ chPaint(); toast('You are watching channel ' + n); return; }
    // no such channel (the TV Guide's list, when it opened this player): say so and keep playing, without reloading
    var nos = null; try { nos = JSON.parse(sessionStorage.getItem('tvChannelNos')); } catch(e){}
    if(nos && nos.indexOf(n) < 0){ chPaint(); toast('Channel ' + n + ' is not available'); return; }
    var here = location.pathname.split('/').pop() + location.search.replace(/[?&]nochan=\d+/, '');
    location.replace('tv-guide.html?tune=' + n + '&from=' + encodeURIComponent(here));
  }
  // View Program Guide (the button, or the mini EPG's shortcut): the TV Guide's Program Guide, All Channels, with focus
  // on this channel's live card, tagged Watching
  function openGuide(){
    try {
      sessionStorage.setItem('tvGuideBack', JSON.stringify({view:'guide', cat:'all', sub:'all', n:C.n}));
    } catch(e){}
    markWatching();
    location.href = 'tv-guide.html';
  }
  function zap(dir){ location.replace('tv-guide.html?zap=' + dir + '&cur=' + encodeURIComponent(C.n)); }

  /* ---------- mini EPG: the channels come from the TV Guide (tvMini in sessionStorage, written when it opened this
     player). Up / Down move along the channels, Left / Right between them and the category bar (moving along the bar
     picks that category, like the TV Guide's tabs), Enter plays the channel, Back closes ---------- */
  var MINI_ICONS = {all:'all-on', recent:'recent', fav:'fav', exclusive:'exclusive', digital:'digital', sports:'sports', movies:'movies',
                    news:'news', cartoons:'cartoons', variety:'variety', others:'others'};
  var mini = null;
  var MINI_SLOT = 32;   // the focused card's place in the list's window: below the 24px fade, room for its ring   // open: {data, cat, list, i (focused channel), zone 'list' | 'cats', ci (focused chip)}
  function miniChans(cat){
    return mini.data.chans.filter(function(c){
      if(cat === 'all') return true;
      if(cat === 'recent') return c.recent;
      if(cat === 'fav') return c.fav;
      return c.cats.indexOf(cat) >= 0;
    });
  }
  function miniAva(c){
    if(!c.logo) return '<div class="mava txt" style="background:' + esc(c.bg) + ';color:' + esc(c.fg || '#fff') + '">' + esc(c.txt || c.n) + '</div>';
    var b = c.box, img = b ? '<img src="' + esc(c.logo) + '"' + logoAttrs(c) + ' style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%;object-fit:contain;">'
                          : '<img class="' + (c.fit || 'cover') + '" src="' + esc(c.logo) + '"' + logoAttrs(c) + '>';
    return '<div class="mava"' + (c.bg ? ' style="background:' + esc(c.bg) + '"' : '') + '>' + img + '</div>';
  }
  function miniCard(c){
    var now = Date.now(), ps = c.progs, k = 0;
    while(k < ps.length - 1 && ps[k][2] <= now) k++;
    var p = ps[k] || ['', now, now, 0], nx = ps[k + 1], watching = c.n === C.n;
    var hm2 = function(t){ return hm(new Date(t)); };
    return '<div class="mcard">' +
      '<div class="m1">' + miniAva(c) + '<div class="minfo">' +
        '<div class="mname-row"><div class="mname">' + esc(c.n) + '</div><div class="mchips">' +
          (c.fav ? '<span class="mico"><img src="icons/tv-guide/heart-fill.svg" alt="Favorite"></span>' : '') +
          (c.crown ? '<span class="mico' + (c.crown === 'owned' ? ' owned' : '') + '"><img src="icons/tv-guide/' + (c.crown === 'owned' ? 'crown.svg' : 'crown-s.svg') + '" alt="Premium"></span>' : '') +
          (c.excl ? '' : '<span class="mno">' + c.no + '</span>') + '</div></div>' +
        '<div class="mprog">' + esc(p[0]) + '</div>' +
        '<div class="mtime">' + hm2(p[1]) + ' - ' + hm2(p[2]) + '<span class="mtags">' +
          (p[3] ? '<img src="icons/tv-guide/timeshift.svg" alt="Time Shift">' : '') +
          // no Live / On Air / Don't Miss here (everything listed is on now): only Watching, on this channel
          (watching ? '<span class="mtag watch"><i class="eq"><b></b><b></b><b></b></i>Watching</span>' : '') + '</span></div>' +
      '</div></div>' +
      (nx ? '<div class="mnext"><b>Up Next :</b><span>' + esc(nx[0]) + '</span></div>' : '') +
    '</div>';
  }
  function miniRenderCats(){
    var html = '<div class="mcat" data-cat="guide"><img src="icons/mini-epg/guide.svg" alt="TV Guide"></div><img class="mini-div" src="icons/mini-epg/divider.svg" alt="">';
    html += mini.data.cats.map(function(k){ return '<div class="mcat' + (k.id === mini.cat ? ' sel' : '') + '" data-cat="' + k.id + '"><img src="icons/mini-epg/' + (MINI_ICONS[k.id] || 'all-on') + '.svg" alt="' + esc(k.n) + '"></div>'; }).join('');
    byId('miniCats').innerHTML = html;
  }
  function miniSetCat(cat, keepNo){
    mini.cat = cat; mini.list = miniChans(cat);
    var at = mini.list.map(function(c){ return c.n; }).indexOf(keepNo || C.n);
    mini.i = Math.max(0, at);
    byId('miniTitle').textContent = mini.data.cats.filter(function(k){ return k.id === cat; })[0].n;
    byId('miniList').innerHTML = mini.list.length ? mini.list.map(miniCard).join('') : '<div class="mini-empty">No channels in this category yet.</div>';
    byId('miniList').style.transform = '';
    miniMeasure();
    $('.mcat', byId('miniCats')).forEach(function(el){ el.classList.toggle('sel', el.dataset.cat === cat); });
  }
  function miniPaint(){
    // remembered for the session (miniMem): reopening the mini EPG comes back to this category (on the channel playing)
    try { sessionStorage.setItem('miniMem', JSON.stringify({cat:mini.cat, n:mini.list[mini.i] ? mini.list[mini.i].n : '', zone:mini.zone, ci:mini.ci, ciUsed:!!mini.ciUsed})); } catch(e){}
    // one focused card at most: with focus on the category bar every card is at its default size; mini.i stays as it
    // was, so Right comes back to the same channel
    $('.mcard', byId('miniList')).forEach(function(el, i){
      el.classList.toggle('focused', mini.zone === 'list' && i === mini.i);
    });
    $('.mcat', byId('miniCats')).forEach(function(el, i){ el.classList.toggle('focused', mini.zone === 'cats' && i === mini.ci); });
    var toGuide = mini.zone === 'cats' && $('.mcat', byId('miniCats'))[mini.ci].dataset.cat === 'guide';
    byId('mini').classList.toggle('to-guide', toGuide);
    byId('miniTitle').textContent = toGuide ? 'View Program Guide' : mini.data.cats.filter(function(k){ return k.id === mini.cat; })[0].n;
    // "Fixed focus", as Home's rails but up / down: the focused card sits in the first card's slot and the list slides
    // under it, until the list's end reaches the bottom of the screen; past that the focus (and the ring) moves on alone
    // to the last cards. A short list never scrolls. Worked out from the measured heights (mini.h a card, mini.H the
    // focused one), not offsetTop: the cards are still growing / shrinking at this moment
    var n = mini.list.length, step = mini.h + 12;
    if(n){
      var total = n * step - 12 + (mini.H - mini.h), vh = byId('miniList').parentElement.clientHeight;
      var maxScroll = Math.max(0, MINI_SLOT + total + 24 - vh);   // the last card 24px clear of the screen's edge, ring included
      var ty = Math.min(mini.i * step, maxScroll);
      byId('miniList').style.transform = 'translateY(' + (MINI_SLOT - ty) + 'px)';
      // the focus ring goes straight to where the focused card ends up (its slot), instead of riding along while the
      // card grows and the list slides: from the layout's offsets, which leave out the transforms still under way
      var sc = byId('miniList').parentElement, x0 = 0, y0 = 0;
      for(var o = sc; o && o !== screen; o = o.offsetParent){ x0 += o.offsetLeft; y0 += o.offsetTop; }
      $('.mcard', byId('miniList')).forEach(function(el, i){
        if(el.classList.contains('focused')) el.dataset.ringRect = [x0, y0 + MINI_SLOT + i * step - ty, 600, mini.H].join(',');
        else delete el.dataset.ringRect;
        // where this card will sit once settled (the focused one is taller, pushing the rest down): the fade's edge
        var top = MINI_SLOT + i * step + (mini.zone === 'list' && i > mini.i ? mini.H - mini.h : 0) - ty;
        // gone at the window's top, clear 24px below it; the focused card is never faded (it sits below the fade)
        el.style.setProperty('--cut', el.classList.contains('focused') ? '-9999px' : (-top) + 'px');
      });
    }
  }
  // a default card's height and a focused one's, read once without the 200ms transitions (every card is the same
  // height, and so is every focused one)
  function miniMeasure(){
    var list = byId('miniList'), card = list.querySelector('.mcard');
    if(!card){ mini.h = mini.H = 0; return; }
    list.classList.add('measure');
    $('.mcard', list).forEach(function(el){ el.classList.remove('focused'); });
    mini.h = card.offsetHeight;
    card.classList.add('focused'); mini.H = card.offsetHeight; card.classList.remove('focused');
    void list.offsetHeight; list.classList.remove('measure');
  }
  function openMini(fromButton){
    var data = null; try { data = JSON.parse(sessionStorage.getItem('tvMini')); } catch(e){}
    if(!data){ toast('Open the player from the TV Guide to browse channels'); return; }
    mini = {data:data, zone:'list', ci:0, fromButton:fromButton};
    miniRenderCats();
    // it always opens with focus on the channel playing: in the category it was last left on when that channel is
    // in it, else in All Channels
    var mem = null; try { mem = JSON.parse(sessionStorage.getItem('miniMem')); } catch(e){}
    var cat = mem && data.cats.some(function(k){ return k.id === mem.cat; }) ? mem.cat : 'all';
    miniSetCat(cat, C.n);
    if(cat !== 'all' && !mini.list.some(function(c){ return c.n === C.n; })) miniSetCat('all', C.n);
    clearTimeout(idleT); document.body.classList.add('mini-on');
    $('.item').forEach(function(el){ el.classList.remove('focused', 'on'); });
    miniPaint();
  }
  function closeMini(){
    var fromButton = mini.fromButton; mini = null;
    document.body.classList.remove('mini-on');
    $('.mcat, .mcard', byId('mini')).forEach(function(el){ el.classList.remove('focused'); });
    byId('mini').classList.remove('to-guide');
    if(fromButton){ document.body.classList.add('idle'); wake(); } else goIdle();   // back where it was opened from
  }
  function miniKey(k){
    var chips = $('.mcat', byId('miniCats'));
    if(k === 'Escape' || k === 'Backspace'){ closeMini(); return; }
    if(mini.zone === 'list'){
      if(k === 'ArrowUp' && mini.i > 0) mini.i--;
      else if(k === 'ArrowDown' && mini.i < mini.list.length - 1) mini.i++;
      else if(k === 'ArrowLeft'){ mini.zone = 'cats'; if(!mini.ciUsed) mini.ci = Math.max(0, chips.map(function(c){ return c.dataset.cat; }).indexOf(mini.cat)); mini.ciUsed = true; }
      else if((k === 'Enter' || k === ' ') && mini.list[mini.i]){
        var c = mini.list[mini.i];
        if(c.n === C.n){ closeMini(); return; }
        location.replace('tv-guide.html?play=' + encodeURIComponent(c.n));   // plays it here, with the controls away
        return;
      }
    } else {
      if(k === 'ArrowUp' && mini.ci > 0) mini.ci--;
      else if(k === 'ArrowDown' && mini.ci < chips.length - 1) mini.ci++;
      else if(k === 'ArrowRight' && mini.list.length){ mini.zone = 'list'; }
      else if((k === 'Enter' || k === ' ') && chips[mini.ci].dataset.cat === 'guide'){ openGuide(); return; }
      else if(k === 'Enter' || k === ' '){ if(mini.list.length) mini.zone = 'list'; }
      // moving onto a category shows its channels straight away (the TV Guide chip only opens the guide)
      var cat = chips[mini.ci].dataset.cat;
      if(cat !== 'guide' && cat !== mini.cat) miniSetCat(cat);
    }
    miniPaint();
  }
  if(q.nochan) toast('Channel ' + q.nochan + ' is not available');
  // a channel change (number or Up / Down) opens the new channel with the controls away: the viewer brings them up
  var quiet = q.quiet === '1' || !!q.nochan;
  // after a channel change (number or Up / Down) the new channel's number shows in the same box for 2s (its name, for
  // an Exclusive channel with no number)
  var chShowT;
  if(q.quiet === '1'){
    var chEl = byId('chIn'); chEl.textContent = C.no || C.n; chEl.classList.add('on');
    chShowT = setTimeout(function(){ if(!chBuf) chEl.classList.remove('on'); }, 2000);
  }
  try { history.replaceState(null, '', location.pathname + location.search.replace(/[?&](nochan|quiet)=\d+/g, '').replace(/^&/, '?')); } catch(e){}

  // idle: focus is put away too (Explore Package stays on screen, but without the ring) and comes back on wake
  function goIdle(){
    clearTimeout(idleT); document.body.classList.add('idle');
    $('.item').forEach(function(el){ el.classList.remove('focused', 'on'); });
  }
  function wake(){
    var was = document.body.classList.contains('idle'); document.body.classList.remove('idle'); clearTimeout(idleT);
    idleT = setTimeout(function(){ if(!document.body.classList.contains('preview-over')) goIdle(); }, 5000);   // after the preview they stay up
    if(was) paint();
    return was;
  }
  if(quiet){
    goIdle();
    // the idle state now holds the controls away; transitions come back once it has been drawn
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ document.documentElement.classList.remove('quiet-start'); }); });
  } else wake();

  document.addEventListener('keydown', function(e){
    var k = e.key, back_ = k === 'Escape' || k === 'Backspace';
    // number keys: change channel, whether or not the controls are up; Enter tunes at once, Back cancels
    if(/^[0-9]$/.test(k)){ e.preventDefault(); chKey(k); return; }
    if(chBuf && (k === 'Enter' || k === ' ')){ e.preventDefault(); tune(); return; }
    if(chBuf && back_){ e.preventDefault(); chCancel(); return; }
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].indexOf(k) < 0 && !back_) return;
    e.preventDefault();
    if(mini){ miniKey(k); return; }
    // with the controls away, Left opens the mini EPG
    if(document.body.classList.contains('idle') && k === 'ArrowLeft'){ openMini(false); return; }
    // Back with the controls up only puts them away; with them away it leaves the player
    if(back_){
      if(document.body.classList.contains('idle')) back();
      else goIdle();
      return;
    }
    // with the controls away, any key (OK too) only brings them back; play / pause is the next OK, on the seek bar
    // with the controls away, Down / Up change channel: Down the next number, Up the previous one
    if(document.body.classList.contains('idle') && (k === 'ArrowUp' || k === 'ArrowDown')){ zap(k === 'ArrowDown' ? 1 : -1); return; }
    if(wake()) return;
    var r = rows();
    if(k === 'ArrowUp' && row > 0){ row--; col = 0; }
    else if(k === 'ArrowDown' && row < r.length - 1){ row++; col = 0; }
    else if(r[row][col].id === 'track' && (k === 'ArrowLeft' || k === 'ArrowRight')){
      // on the seek bar: a press goes 10s back / forward (not past live); held, it scrubs faster
      var dir = k === 'ArrowRight' ? 1 : -1;
      if(!TS) toast('Time Shift is not available for this programme');
      else if(TS_LOCK){ if(!e.repeat) tsLocked(); }
      else if(e.repeat){ if(!holdT) startHold(dir); }
      else { scrubBy(dir * STEP); seekFx(dir); commitT = setTimeout(commit, 800); }
    }
    else if(k === 'ArrowLeft') col--;
    else if(k === 'ArrowRight') col++;
    else if(k === 'Enter' || k === ' ') activate(r[row][col]);
    paint();
  });
  $('.item').concat(byId('playBtn')).forEach(function(el){ el.addEventListener('click', function(){ wake(); activate(el); }); });
  document.addEventListener('keyup', function(e){ if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') stopHold(); });
  // only a real move of the mouse: Chrome also sends a mousemove (with no movement) when a page loads under a resting
  // pointer, which would bring the controls up on a channel change
  addEventListener('mousemove', function(e){ if((e.movementX || e.movementY) && !mini) wake(); });
  byId('video').addEventListener('click', function(){ if(wake()) return; activate(byId('playBtn')); });   // a click on the picture: the first wakes the controls, then it plays / pauses
  byId('video').addEventListener('play', setPlayIcon); byId('video').addEventListener('pause', setPlayIcon);
  if(!quiet) paint();   // otherwise focus comes with the controls (wake)
  if(preview && !previewLeft) endPreview();   // came back to a channel whose preview was already used up
})();
