
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  var byId = function(id){ return document.getElementById(id); };

  // ---- the title: where it was left (or the start), its length; the picture is a demo clip, looping ----
  var K = (location.search.match(/[?&]k=([\w-]+)/) || [])[1];
  // a short drama (?short=N&ep=E): its own titles (content.js), one season of SHORT.EPS episodes, a minute or two each
  var SI = (location.search.match(/[?&]short=(\d+)/) || [])[1], SHORT_ON = SI !== undefined && !!window.SHORTS;
  if(SHORT_ON){ SI = Math.min(+SI, SHORTS.length - 1); K = 'd9'; document.body.classList.add('vertical'); }
  if(!K || !MD.M[K]) K = 'd9';
  var m = SHORT_ON ? { t:SHORTS[SI].t, w:'posters/shorts/' + SHORTS[SI].img } : MD.M[K];
  var cw = SHORT_ON ? null : MD.cw(K), SER = SHORT_ON || MD.series(K), FROM_START = /[?&]start=1/.test(location.search);
  var sat = SHORT_ON ? SHORT.at(SI) : null;
  // a series plays one episode: ?s=&e=, else the one it was left on, else the first
  var S = +(location.search.match(/[?&]s=(\d+)/) || [])[1] || (cw && cw.s) || 1,
      E = +(location.search.match(/[?&]e(?:p)?=(\d+)/) || [])[1] || (cw && cw.e) || (sat && sat.ep) || 1;
  function shortEp(n){ return n >= 1 && n <= SHORT.EPS ? { s:1, n:n, t:'Episode ' + n, m:Math.ceil(SHORT.secs(n) / 60), sec:SHORT.secs(n) } : null; }
  var EP = SHORT_ON ? shortEp(E) : SER ? MD.episode(K, S, E) : null, NEXT = SHORT_ON ? shortEp(E + 1) : SER ? MD.next(K, S, E) : null;
  var here = SHORT_ON ? !!(sat && sat.ep === E) : cw && (!SER || (cw.s === S && cw.e === E));   // the progress belongs to what is playing
  var LEN = SHORT_ON ? EP.sec : (SER ? EP.m : here ? cw.of : MD.minutes(K)) * 60;
  var pos = FROM_START || !here ? 0 : SHORT_ON ? Math.min(sat.sec, LEN - 10) : Math.min(cw.w * 60, LEN - 60);   // seconds in
  var AT = (location.search.match(/[?&]at=(\d+)/) || [])[1];
  if(AT) pos = Math.min(+AT, LEN - 1);   // &at=<seconds>: start there (demos, e.g. just before the credits)
  var INTRO = 90, CREDITS = 30;   // a series: the intro's end; the credits' length
  var CLIP = 'video/hbo.mp4';
  byId('video').src = byId('thumbV').src = CLIP;
  if(SHORT_ON) byId('video').poster = m.w;
  byId('title').textContent = SER ? 'S' + S + ' E' + E + ' : ' + EP.t : m.t;
  byId('sub').textContent = SER ? m.t : '';
  document.title = byId('title').textContent + ' · Player';
  function hms(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 3600) + ':' + ('0' + Math.floor(s / 60) % 60).slice(-2) + ':' + ('0' + s % 60).slice(-2); }
  function vmod(t){ var d = byId('video').duration || 0; return d ? ((t % d) + d) % d : 0; }
  function mins(n){ return n >= 60 ? Math.floor(n / 60) + 'h ' + n % 60 + 'm' : n + 'm'; }

  // ---- the buttons: a movie's (Figma PLAY-player 2028:85952), a series' (2700:18288) ----
  function btn(act, ic, lbl){ return '<div class="btn item" data-act="' + act + '"><img src="icons/player/' + ic + '.svg" alt=""><span class="lbl">' + lbl + '</span></div>'; }
  byId('btns').innerHTML = btn('start-over', 'start-over', 'Start Over') + (SER ? btn('next', 'next-episode', 'Next Episode') + btn('episodes', 'select-episode', 'Select Episode') : '') +
    btn('sub-audio', 'sub-audio', 'Subtitle/Audio') + btn('settings', 'settings', 'Settings') +
    (SER ? '' : '<div class="btn ymal item" data-act="ymal"><img src="icons/player/you-may-also-like.svg" alt=""><span>You may also like</span></div>');

  var playing = true, scrub = null, last = Date.now();
  function paintSeek(){
    var at = scrub === null ? pos : scrub, tr = byId('track');
    tr.style.setProperty('--f', at / LEN); tr.style.setProperty('--b', Math.min(1, (pos + 600) / LEN));
    byId('tmNow').textContent = hms(at); byId('tmEnd').textContent = '- ' + hms(LEN - at);   // what is left (Figma)
    if(scrub !== null){
      var w = tr.offsetWidth;
      byId('thumb').style.left = Math.max(160, Math.min(w - 160, at / LEN * w)) + 'px';
      byId('thumbT').textContent = hms(at);
    }
  }
  // the clock: the title moves on while playing. A series: Skip Intro through the intro, the next episode in the credits;
  // at the end the next episode, else back to the detail page
  var skipped = SHORT_ON || pos >= INTRO, credits = '';   // a short has no intro and no credits   // credits: '' not yet, 'count' counting down, 'stopped' a key stopped it, 'watch' Watch Credit
  setInterval(function(){
    var now = Date.now(), dt = (now - last) / 1000; last = now;
    if(playing && scrub === null){
      pos = Math.min(LEN, pos + dt);
      if(pos >= LEN){ if(NEXT) playEp(NEXT); else { save(); history.back(); } return; }
    }
    if(SER){
      var sk = byId('skip'), show = !skipped && pos < INTRO && view === 'player' && !credits;
      if(sk.hidden === show){ var was = rn(); sk.hidden = !show; row = rowIx(was === 'skip' ? 'track' : was); paint(); }   // focus stays on its row
      if(!SHORT_ON && NEXT && !credits && pos >= LEN - CREDITS && scrub === null) startCredits();
    }
    paintSeek();
  }, 250);
  byId('video').addEventListener('loadedmetadata', function(){ this.currentTime = vmod(pos); this.play().catch(function(){}); });
  var leaving = false;
  function save(){ if(leaving) return; if(SHORT_ON){ SHORT.setAt(SI, E, pos); return; } MD.setProgress(K, Math.max(1, Math.round(pos / 60)), Math.round(LEN / 60), SER ? S : undefined, SER ? E : undefined); }
  addEventListener('pagehide', save);
  function playEp(ep){
    if(SHORT_ON){   // a short: a locked episode goes to the short's page to unlock it
      save(); leaving = true;
      if(!SHORT.open(SI, ep.n)){ location.href = 'short-detail.html?s=' + SI + '&unlock=' + ep.n; return; }
      SHORT.setAt(SI, ep.n, 0); location.replace('player.html?short=' + SI + '&ep=' + ep.n + '&start=1'); return;
    }
    save(); leaving = true; MD.setProgress(K, 1, ep.m, ep.s, ep.n); location.replace('player.html?k=' + K + '&s=' + ep.s + '&e=' + ep.n + '&start=1'); }

  function setPlaying(p, flash){
    playing = p; var v = byId('video');
    if(p) v.play().catch(function(){}); else v.pause();
    byId('playIc').src = p ? 'icons/player/pause.svg' : 'icons/detail-play.svg';
    if(flash){ var f = byId('flash'); byId('flashIc').src = p ? 'icons/detail-play.svg' : 'icons/player/pause.svg'; f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  }

  // ---- seeking (the Live TV player's): a press 10s, presses in a row add up; held, faster; the thumbnail shows the moment ----
  var commitT = null, holdT = null, holdStart = 0, seekSum = 0, seekDir = 0, seekT = null;
  function seekFx(dir, label){
    var f = byId('seekfx');
    if(label === undefined){ seekSum = dir === seekDir && f.classList.contains('on') ? seekSum + 10 : 10; label = (dir < 0 ? '-' : '+') + seekSum; }
    seekDir = dir; f.classList.toggle('l', dir < 0); f.classList.toggle('r', dir > 0);
    byId('seekLbl').textContent = label; f.classList.add('on');
    clearTimeout(seekT); seekT = setTimeout(function(){ f.classList.remove('on'); seekSum = 0; }, 800);
  }
  function scrubBy(s){
    if(scrub === null) scrub = pos;
    scrub = Math.max(0, Math.min(LEN - 1, scrub + s));
    var tv = byId('thumbV'); if(tv.readyState) tv.currentTime = vmod(scrub);
    byId('thumb').classList.add('on'); paintSeek();
  }
  function commit(){
    clearTimeout(commitT); if(scrub === null) return;
    pos = scrub; scrub = null; byId('video').currentTime = vmod(pos);
    if(credits && pos < LEN - CREDITS) credits = '';   // seeking back out of the credits: they can come again
    byId('thumb').classList.remove('on'); paintSeek();
  }
  function startHold(dir){
    holdStart = Date.now();
    holdT = setInterval(function(){
      var t = (Date.now() - holdStart) / 1000, sp = t < 1 ? 2 : t < 2 ? 4 : t < 3 ? 8 : 16;
      seekFx(dir, sp + 'x'); scrubBy(dir * sp * 30);
    }, 250);
  }
  addEventListener('keyup', function(e){
    if((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && holdT){ clearInterval(holdT); holdT = null; commit(); }
  });

  // ---- the row over the picture: You may also like (a movie: other titles) / Select Episode (a series: this season) ----
  if(SER && !SHORT_ON){
    byId('rowChip').innerHTML = '<img src="icons/player/select-episode.svg" alt="">Select Episode';
    byId('ymalRow').innerHTML = MD.episodes(K, S).map(function(ep){
      return '<div class="card item" data-s="' + ep.s + '" data-e="' + ep.n + '" data-ring-art=""><div class="pic" style="background-image:url(\'' + (m.w || m.p) + '\')">' +
        (ep.n === E ? '<span class="np"></span>' : '') + '</div><div class="nm">E' + ep.n + ' : ' + ep.t.replace(/</g, '&lt;') + '</div><div class="len">' + mins(ep.m) + '</div></div>';
    }).join('');
  } else {
    // You may also like: the same type only (a movie: movies; a short: shorts), content.js Content.related
    byId('ymalRow').innerHTML = Content.related(SHORT_ON ? {s:SI} : {k:K}, 10).map(function(r){
      if(r.s !== undefined){ var x = SHORTS[r.s];
        return '<div class="card item" data-s="' + r.s + '" data-ring-art=""><div class="pic" style="background-image:url(\'posters/shorts/' + x.img + '\')"></div>' +
          '<div class="nm">' + x.t.replace(/</g, '&lt;') + '</div><div class="len">' + x.gen.join(' · ') + '</div></div>'; }
      var o = MD.M[r.k];
      return '<div class="card item" data-k="' + r.k + '" data-ring-art=""><div class="pic" style="background-image:url(\'' + (o.w || o.p) + '\')"></div>' +
        '<div class="nm">' + o.t.replace(/</g, '&lt;') + '</div><div class="len">' + o.len + '</div></div>';
    }).join('');
  }

  // ---- the credits (a series with a next episode): "Next Episode in" counts 5s down, then the next one plays ----
  var countT = null;
  function startCredits(){
    credits = 'count'; setView('player'); document.body.classList.add('credits');
    byId('nextup').innerHTML = '<div class="pchip count item" data-act="next"><div class="fill"><span>Next Episode in</span></div>Next Episode in</div>' +
      '<div class="pchip item" data-act="watch">Watch Credit</div>';
    var c = byId('nextup').firstChild; void c.offsetWidth; c.classList.add('go');
    clearTimeout(countT); countT = setTimeout(function(){ if(credits === 'count') playEp(NEXT); }, 5000);
    paint();
  }
  function stopCount(){   // any key: the countdown stops, Next Episode / Watch Credit stay to pick (Figma note)
    credits = 'stopped'; clearTimeout(countT); ncol = 0;
    byId('nextup').innerHTML = '<div class="pchip item" data-act="next">Next Episode</div><div class="pchip item" data-act="watch">Watch Credit</div>';
    paint();
  }
  function endCredits(){ credits = 'watch'; clearTimeout(countT); document.body.classList.remove('credits'); row = rowIx('track'); paint(); wake(); }

  // ---- a short's Select Episode: Season 1, the 50-episode ranges (picked as focus lands, one filter), the range's
  //      episodes 10 a row: the one playing marked Watching with its progress, locked ones grey with a lock ----
  var RANGE = 50, gRange = Math.floor((E - 1) / RANGE), gcol = { sea:0, rng:gRange, eps:(E - 1) % 10 };
  function buildGrid(){
    if(!SHORT_ON) return;
    byId('seasons').innerHTML = '<div class="sea sel item" data-act="season" data-ring-art="">Season 1</div>';
    var h = '';
    for(var a = 1; a <= SHORT.EPS; a += RANGE) h += '<div class="rng item' + ((a - 1) / RANGE === gRange ? ' sel' : '') + '" data-act="range" data-ring-art="">' + a + ' - ' + Math.min(a + RANGE - 1, SHORT.EPS) + '</div>';
    byId('ranges').innerHTML = h;
    buildEps();
  }
  function buildEps(){
    var h = '';
    for(var n = gRange * RANGE + 1; n <= Math.min((gRange + 1) * RANGE, SHORT.EPS); n++){
      var open = SHORT.open(SI, n);
      h += '<div class="sep item' + (open ? '' : ' locked') + '" data-ep="' + n + '" data-ring-art=""><b>' + n + '</b>' +
        (n === E ? '<span class="watching">Watching</span><span class="bar"><i style="width:' + Math.round(pos / LEN * 100) + '%"></i></span>'
          : open ? '' : '<span class="lk"><img src="icons/short/lock.svg" alt="Locked"></span>') + '</div>';
    }
    byId('sgridEps').innerHTML = h;
    $('#ranges .rng').forEach(function(r, i){ r.classList.toggle('sel', i === gRange); });
  }
  buildGrid();

  // ---- focus: named rows. The player: back / Skip Intro (while it shows) / the seek bar / the buttons; the row over the
  //      picture: back / its back / the cards; the credits: their two chips ----
  var view = 'player', row = 0, col = 0, ycol = SER ? E - 1 : 0, ncol = 0;
  function rows(){
    if(credits === 'count' || credits === 'stopped') return [{ n:'credits', items:$('#nextup .item') }];
    if(view === 'ymal') return [{ n:'top', items:$('.top .item') }, { n:'head', items:$('.ymal-view .head .item') }, { n:'cards', items:$('#ymalRow .item') }];
    if(view === 'sgrid'){
      var g = [{ n:'ghead', items:$('.gblock .head .item') }, { n:'gsea', items:$('#seasons .item') }, { n:'grng', items:$('#ranges .item') }], eps = $('#sgridEps .item');
      for(var i = 0; i < eps.length; i += 10) g.push({ n:'geps', items:eps.slice(i, i + 10) });
      return g;
    }
    var r = [{ n:'top', items:$('.top .item') }];
    if(!byId('skip').hidden) r.push({ n:'skip', items:[byId('skip')] });
    return r.concat([{ n:'track', items:[byId('track')] }, { n:'btns', items:$('#btns .item') }]);
  }
  function rowIx(n){ var R = rows(); for(var i = 0; i < R.length; i++) if(R[i].n === n) return i; return 0; }
  function rn(){ var R = rows(); return (R[Math.max(0, Math.min(R.length - 1, row))] || {}).n; }
  function curCol(){ var n = rn(); return n === 'cards' ? ycol : n === 'credits' ? ncol : n === 'gsea' ? gcol.sea : n === 'grng' ? gcol.rng : n === 'geps' ? gcol.eps : n === 'ghead' ? 0 : col; }
  function setCol(c){ var n = rn(); if(n === 'cards') ycol = c; else if(n === 'credits') ncol = c; else if(n === 'gsea') gcol.sea = c; else if(n === 'grng') gcol.rng = c; else if(n === 'geps') gcol.eps = c; else if(n !== 'ghead') col = c; }
  function paint(){
    var R = rows(); row = Math.max(0, Math.min(R.length - 1, row));
    var items = R[row].items, c = Math.max(0, Math.min(items.length - 1, curCol())); setCol(c);
    if(view === 'sgrid' && R[row].n === 'grng' && c !== gRange){ gRange = c; buildEps(); R = rows(); }   // the range under focus fills the grid
    if(view === 'sgrid') byId('gblock').style.transform = row > 3 ? 'translateY(' + -(row - 3) * 188 + 'px)' : '';   // the focused episode row in view
    $('.item.focused').forEach(function(e){ e.classList.remove('focused'); });
    var n = R[row].n;
    // nothing focused while it counts down (Figma); the seek bar shows focus itself (taller, with the handle), so it
    // takes .on, not .focused: focus-ring.js only rings .focused (as the Live TV player)
    if(items[c] && credits !== 'count' && n !== 'track') items[c].classList.add('focused');
    byId('track').classList.toggle('on', n === 'track');
    byId('skip').classList.toggle('solo', n !== 'skip');   // Skip Intro stays light even when focus is elsewhere (Figma)
    if(view === 'ymal'){ byId('ymalRow').style.transform = 'translateX(' + -Math.max(0, ycol - 3) * 384 + 'px)'; }
  }
  // the controls fade out after 5s without a key (not over the row, nor while paused)
  var idleT;
  function wake(){
    var was = document.body.classList.contains('idle');
    document.body.classList.remove('idle'); clearTimeout(idleT);
    idleT = setTimeout(function(){ if(view === 'player' && playing) document.body.classList.add('idle'); }, 5000);
    return was;
  }
  function setView(v){
    view = v; document.body.classList.toggle('ymal', v === 'ymal'); document.body.classList.toggle('sgrid', v === 'sgrid');
    if(v === 'ymal'){ row = 2; }
    else if(v === 'sgrid'){ gRange = Math.floor((E - 1) / RANGE); gcol = { sea:0, rng:gRange, eps:(E - 1) % 10 }; buildEps(); row = 3 + Math.floor(((E - 1) % RANGE) / 10); }   // on the one playing
    else { row = rowIx('btns'); col = SER ? 2 : 3; }   // back on the button that opened it
    paint();
  }
  var toastEl = byId('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function leave(){ save(); if(history.length > 1) history.back(); else location.href = SHORT_ON ? 'short-detail.html?s=' + SI : 'movie-detail.html?k=' + K; }
  function activate(el){
    var a = el.dataset.act;
    if(a === 'ymal-back' || a === 'grid-back'){ setView('player'); return; }
    if(a === 'season'){ row++; paint(); return; }
    if(a === 'range'){ row = 3; gcol.eps = 0; paint(); return; }
    if(el.dataset.ep){ var n = +el.dataset.ep; if(n === E){ setView('player'); return; } playEp(shortEp(n)); return; }
    if(a === 'back'){ if(view === 'ymal') setView('player'); else leave(); return; }
    if(a === 'track'){ setPlaying(!playing, true); return; }
    if(a === 'skip'){ pos = INTRO; skipped = true; byId('video').currentTime = vmod(pos); paintSeek(); return; }
    if(a === 'start-over'){ pos = 0; skipped = false; credits = ''; byId('video').currentTime = 0; setPlaying(true); toast('Playing from the start'); paintSeek(); return; }
    if(a === 'next'){ if(NEXT) playEp(NEXT); else toast('This is the last episode'); return; }
    if(a === 'watch'){ endCredits(); return; }
    if(a === 'ymal' || a === 'episodes'){ setView(SHORT_ON ? 'sgrid' : 'ymal'); return; }
    if(el.dataset.e){   // Select Episode: another episode from its start (the one playing: just close the row)
      if(+el.dataset.e === E && +el.dataset.s === S){ setView('player'); return; }
      playEp(MD.episode(K, +el.dataset.s, +el.dataset.e)); return;
    }
    if(el.dataset.k){ save(); Content.open({k:el.dataset.k}); return; }   // its detail page (content.js)
    if(el.dataset.s !== undefined){ save(); Content.open({s:+el.dataset.s}); return; }   // a short (an episode card has data-e too: above)
    toast(el.querySelector('.lbl').textContent + ' (demo)');
  }
  addEventListener('keydown', function(e){
    var k = e.key;
    if(k === 'Escape' || k === 'Backspace'){ e.preventDefault(); if(view !== 'player') setView('player'); else leave(); return; }
    if(credits === 'count'){ e.preventDefault(); stopCount(); return; }   // any key stops the countdown, nothing else
    if(credits === 'stopped'){
      if(k === 'ArrowLeft') ncol--; else if(k === 'ArrowRight') ncol++;
      else if(k === 'Enter' || k === ' ') activate(rows()[0].items[ncol]);
      e.preventDefault(); paint(); return;
    }
    // the controls hidden: OK on Skip Intro skips at once; any other key first brings the controls back
    if(document.body.classList.contains('idle') && !byId('skip').hidden && (k === 'Enter' || k === ' ')){ e.preventDefault(); activate(byId('skip')); return; }
    if(wake() && k !== 'ArrowLeft' && k !== 'ArrowRight') { e.preventDefault(); return; }
    var R = rows(), n = rn();
    if(k === 'ArrowUp' && row > 0) row--;
    else if(k === 'ArrowDown' && row < R.length - 1) row++;
    else if(n === 'track' && (k === 'ArrowLeft' || k === 'ArrowRight')){
      var dir = k === 'ArrowRight' ? 1 : -1;
      if(e.repeat){ if(!holdT) startHold(dir); }
      else { scrubBy(dir * 10); seekFx(dir); clearTimeout(commitT); commitT = setTimeout(commit, 800); }
    }
    else if(k === 'ArrowLeft') setCol(curCol() - 1);
    else if(k === 'ArrowRight') setCol(curCol() + 1);
    else if(k === 'Enter' || k === ' ') activate(R[row].items[curCol()]);
    else return;
    e.preventDefault(); paint();
  });
  screen.addEventListener('click', function(e){
    wake();
    var el = e.target.closest('.item, .play');
    if(!el){ if(view === 'player' && !credits) setPlaying(!playing, true); return; }
    if(el.id === 'playBtn'){ setPlaying(!playing, true); return; }
    rows().forEach(function(r, ri){ var c = r.items.indexOf(el); if(c >= 0){ row = ri; setCol(c); } });
    paint(); activate(el);
  });
  // start: on Skip Intro while it shows (Figma), else the seek bar
  if(SER && pos < INTRO) byId('skip').hidden = false;
  row = rowIx(byId('skip').hidden ? 'track' : 'skip');
  paintSeek(); paint(); wake();
  if(pos > 0) toast('Resuming from ' + hms(pos));
})();
