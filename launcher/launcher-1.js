
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');
  function byId(id){ return document.getElementById(id); }
  function $(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* the AIS PLAY logo (the brand artwork, white AIS on a transparent ground); its play triangle alone marks the titles */
  function aisLogo(markOnly){
    return markOnly ? '<img class="ais" src="icons/aisplay-mark.png" alt="">' : '<img class="ais" src="icons/aisplay-logo.png" alt="AIS PLAY">';
  }

  /* ---------- content ---------- */
  var APPS = [
    {n:'AIS PLAY', ais:true},
    {n:'Netflix', img:'partners/netflix.png'},
    {n:'Viu', img:'partners/viu.png'},
    {n:'YouTube', img:'partners/youtube.png'},
    {n:'Prime Video', img:'partners/prime.png'},
    {n:'Disney+ Hotstar', img:'partners/disney.png'},
    {n:'HBO Max', img:'partners/hbo.png'},
    {n:'WeTV', img:'partners/wetv.png'},
    {n:'iQIYI', img:'partners/iqiyi.png'},
    {n:'MONOMAX', img:'partners/monomax.png'},
    {n:'TrueID', img:'partners/trueid.png'}
  ];
  // AIS PLAY's channel on the launcher: what's on the app's Home (District 9 opens straight on its detail page)
  var AIS = [
    {t:'District 9', img:'posters/district9.jpg', href:'movie-detail.html'},
    {t:'Game of Thrones: House of the Dragon', img:'posters/house-of-the-dragon.jpg'},
    {t:'The Last of Us', img:'posters/last-of-us.jpg'},
    {t:'F1 The Movie', img:'posters/f1.jpg'},
    {t:'Wicked', img:'posters/wicked.jpg'},
    {t:'Superman', img:'posters/superman.jpg'},
    {t:'Top Gun: Maverick', img:'posters/topgun-m.jpg'},
    {t:'Loki', img:'posters/loki.jpg'},
    {t:'How to Train Your Dragon', img:'posters/how-to-train.jpg'}
  ];
  var PLAY = [
    {n:'iQIYI', img:'partners/iqiyi.png'},
    {n:'WeTV', img:'partners/wetv.png'},
    {n:'MONOMAX', img:'partners/monomax.png'},
    {n:'Prime Video', img:'partners/prime.png'},
    {n:'Disney+ Hotstar', img:'partners/disney.png'},
    {n:'TrueID', img:'partners/trueid.png'}
  ];

  byId('apps').innerHTML = APPS.map(function(a){
    return '<div class="tile app item' + (a.ais ? ' aisplay' : '') + '" data-name="' + esc(a.n) + '"' + (a.ais ? ' data-act="aisplay"' : '') + '>' +
      (a.ais ? aisLogo() : '<img class="fill" src="' + a.img + '" alt="">') + '</div>';
  }).join('');
  byId('aisRound').innerHTML = '<div style="width:86px">' + aisLogo() + '</div>';
  byId('aisRow').innerHTML = AIS.map(function(c){
    return '<div class="tile wide item" data-act="aisplay" data-name="' + esc(c.t) + '"' + (c.href ? ' data-href="' + c.href + '"' : '') + '>' +
      '<img class="fill" src="' + c.img + '" alt=""><div class="mark">' + aisLogo(true) + '</div><div class="cap">' + esc(c.t) + '</div></div>';
  }).join('');
  byId('playRow').innerHTML = PLAY.map(function(a){
    return '<div class="tile wide item" data-name="' + esc(a.n) + '"><img class="fill" src="' + a.img + '" alt=""></div>';
  }).join('');
  byId('launch').innerHTML = '<video src="video/Splash.mp4" preload="auto" playsinline></video>';

  // the clock, as the box shows it in Thai ("10:19 น.")
  function clock(){ var d = new Date(); byId('clock').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ' น.'; }
  clock(); setInterval(clock, 10000);

  /* ---------- focus: rows top to bottom, Left / Right along a row; each row remembers its place ---------- */
  var ROWS = [
    {el:null, items:$('.top .item')},
    {el:byId('rowApps'), items:[$('.apps-btn')[0]].concat($('.tile', byId('apps')))},
    {el:byId('rowAis'), items:$('.tile', byId('aisRow'))},
    {el:byId('rowPlay'), items:$('.tile', byId('playRow'))}
  ];
  var row = 1, cols = [0, 1, 0, 0];   // first focus: the AIS PLAY tile
  // back from the app (Back at the top of its Home): focus where it was left
  try { var ret = JSON.parse(sessionStorage.getItem('launcherFocus') || 'null'); if(ret){ row = ret.row; cols = ret.cols; } } catch(e){}

  function paint(){
    $('.focused').forEach(function(e){ e.classList.remove('focused'); });
    var el = ROWS[row].items[cols[row]]; el.classList.add('focused');
    ROWS.forEach(function(r, i){ if(r.el) r.el.classList.toggle('dim', row !== i && row !== 0); });
    // a rail slides only when the focused tile would run off its right edge (or back past its left), as on the box
    var track = el.parentElement;
    if(track.classList.contains('track')){
      var viewW = 1920 - 425 - 90, x = +(track.dataset.x || 0), l = el.offsetLeft, r = l + el.offsetWidth;
      if(r - x > viewW) x = r - viewW;
      if(l < x) x = l;
      track.dataset.x = x; track.style.transform = 'translateX(' + (-x) + 'px)';
    }
    // the favourite apps row names the focused app under its tile
    var name = byId('appName');
    if(row === 1 && el.classList.contains('app')){
      var tr = byId('apps');
      name.textContent = el.dataset.name; name.style.opacity = 1;
      name.style.left = 425 + el.offsetLeft - (+(tr.dataset.x || 0)) + el.offsetWidth / 2 + 'px';
    } else name.style.opacity = 0;
  }

  var toastEl = byId('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1800); }

  var launching = false;
  function open(el){
    if(el.dataset.act === 'aisplay'){
      try { sessionStorage.setItem('launcherFocus', JSON.stringify({row:row, cols:cols})); } catch(e){}
      launching = true;
      byId('launch').classList.add('on');
      // then the app's sign-in page, which goes on to Home (or the title picked here) once signed in
      var to = 'login.html' + (el.dataset.href ? '?next=' + encodeURIComponent(el.dataset.href) : '');
      var left = false;
      function go(){ if(!left){ left = true; location.href = to; } }
      var vid = byId('launch').querySelector('video');
      // reduced motion: only the video's last picture, the finished logo, for a moment
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){
        vid.currentTime = 3.8;
        setTimeout(go, 900);
        return;
      }
      // the splash plays through with its sound (muted if the browser refuses), then the app; it never holds the app up
      vid.onended = vid.onerror = go;
      setTimeout(go, 8000);
      vid.currentTime = 0; vid.muted = false;
      vid.play().catch(function(){ vid.muted = true; vid.play().catch(go); });
      return;
    }
    var act = el.dataset.act;
    if(act === 'search') toast('ค้นหาด้วยเสียงยังไม่พร้อมใช้งานในต้นแบบนี้');
    else if(act === 'notifications') toast('การแจ้งเตือน 1 รายการ');
    else if(act === 'settings') toast('การตั้งค่ายังไม่พร้อมใช้งานในต้นแบบนี้');
    else if(act === 'apps') toast('แอปทั้งหมดยังไม่พร้อมใช้งานในต้นแบบนี้');
    else toast(el.dataset.name + ' ยังไม่พร้อมใช้งานในต้นแบบนี้ · เปิด AIS PLAY ได้');
  }

  document.addEventListener('keydown', function(e){
    if(launching) return;
    var k = e.key;
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].indexOf(k) < 0) return;
    e.preventDefault();
    var items = ROWS[row].items;
    if(k === 'ArrowUp' && row > 0) row--;
    else if(k === 'ArrowDown' && row < ROWS.length - 1) row++;
    else if(k === 'ArrowLeft') cols[row] = Math.max(0, cols[row] - 1);
    else if(k === 'ArrowRight') cols[row] = Math.min(items.length - 1, cols[row] + 1);
    else if(k === 'Enter' || k === ' '){ open(items[cols[row]]); return; }
    paint();
  });
  ROWS.forEach(function(r, ri){
    r.items.forEach(function(el, ci){
      el.addEventListener('click', function(){ if(launching) return; row = ri; cols[ri] = ci; paint(); open(el); });
    });
  });
  // back here from the app through the browser's cache: the launch screen is still up, so put it away
  addEventListener('pageshow', function(){ launching = false; byId('launch').classList.remove('on'); byId('launch').querySelector('video').pause(); });

  paint();
})();
