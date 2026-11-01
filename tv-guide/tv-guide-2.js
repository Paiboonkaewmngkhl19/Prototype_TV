
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen'), K = 1;
  function fit(){
    K = Math.min(innerWidth / 1920, innerHeight / 1080);
    frame.style.width = 1920 * K + 'px'; frame.style.height = 1080 * K + 'px';
    frame.style.marginLeft = -960 * K + 'px'; frame.style.marginTop = -540 * K + 'px';
    screen.style.transform = 'scale(' + K + ')';
  }
  addEventListener('resize', fit); fit();
  var $ = function(q, el){ return Array.prototype.slice.call((el || document).querySelectorAll(q)); };
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  var CHANNELS = window.TV.CHANNELS;   // the channels and their programmes: channels-data.js (lowest number first)
  // favourites set anywhere this session (here, in the player, shown on Home) override the built-in ones
  try { var FAVS = JSON.parse(sessionStorage.getItem('tvFavs') || 'null'); if(FAVS) CHANNELS.forEach(function(c){ if(c.n in FAVS) c.fav = FAVS[c.n]; }); } catch(e){}
  function saveFav(c){ try { var f = JSON.parse(sessionStorage.getItem('tvFavs') || '{}'); f[c.n] = c.fav; sessionStorage.setItem('tvFavs', JSON.stringify(f)); } catch(e){} }
  var CATS = [
    {id:'all', n:'All Channels'}, {id:'recent', n:'Recently Watched'}, {id:'fav', n:'Favorite'}, {id:'exclusive', n:'Exclusive'}, {id:'digital', n:'Digital TV'},
    {id:'sports', n:'Sports', subs:[['all','All Sports'],['multi','Multi-Sports'],['football','Football'],['motorsport','Motorsport'],['golf','Golf'],
      ['basketball','Basketball'],['tennis','Tennis'],['rugby','Rugby'],['boxing','Boxing']]},
    {id:'movies', n:'Movies & Series'}, {id:'news', n:'News'}, {id:'cartoons', n:'Cartoons'}, {id:'variety', n:'Variety'}, {id:'others', n:'Others', subs:[['all','All'],['education','Education'],['documentary','Documentary'],['shopping','Shopping']]}
  ];
  // Watching: the channel the player was showing, when the guide is opened from it (View Program Guide, or Back); taken
  // only if it was just set, so it never turns up later
  var WATCHING = '', ARRIVE = false;
  try {
    var w = JSON.parse(sessionStorage.getItem('tvWatching') || 'null'); sessionStorage.removeItem('tvWatching');
    if(w && w.n && Date.now() - w.t < 15000) WATCHING = w.n;
  } catch(e){}
  // and its sound keeps playing behind the guide, from where the player was (picture hidden). If the browser won't start
  // it with sound before a key press on this page, it starts with the first key or click
  if(WATCHING){ var np = document.getElementById('nowPlaying'); np.innerHTML = 'Currently playing :<b></b>'; np.querySelector('b').textContent = WATCHING; np.hidden = false; }
  if(WATCHING && w.v){
    var bgSound = document.createElement('video');
    bgSound.src = w.v; bgSound.loop = true; bgSound.playsInline = true; bgSound.style.display = 'none';
    bgSound.addEventListener('loadedmetadata', function(){ bgSound.currentTime = (w.at || 0) + (Date.now() - w.t) / 1000; });
    document.body.appendChild(bgSound);
    bgSound.play().catch(function(){
      function go(){ bgSound.play(); removeEventListener('keydown', go, true); removeEventListener('click', go, true); }
      addEventListener('keydown', go, true); addEventListener('click', go, true);
    });
  }
  // back from the player out of the browser's page cache: load again, for the channel it ended on and its Watching tag
  addEventListener('pageshow', function(e){ if(e.persisted) location.reload(); });
  var SPORT_CH = ['sports'];   // channels in these categories show a red Live tag for what's on now, others On Air

  /* ---------- schedule: each channel repeats its line-up from a per-channel offset, around the real clock ---------- */
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function fmtDate(d){ return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function fmtTime(d){ return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var DAYS_AHEAD = 7;   // the date picker: today and the next 7 days (the guide's columns run through the last one)
  var onAt = window.TV.onAt;   // each channel's line-up around the real clock: channels-data.js

  /* ---------- state ---------- */
  var S = { view:'channels', cat:'all', sub:'all', day:0, hour:-1 };   // hour -1 = now
  var reminders = {};
  function guideTime(){
    if(S.day === 0 && S.hour < 0) return new Date();
    var d = new Date(today.getTime() + S.day * 864e5);
    if(S.hour >= 0) d.setHours(S.hour); else d.setHours(new Date().getHours(), new Date().getMinutes());
    return d;
  }
  function channelsFor(){
    var cat = CATS.filter(function(c){ return c.id === S.cat; })[0];
    return CHANNELS.filter(function(c){
      if(S.cat === 'recent') return c.recent;
      if(S.cat === 'fav') return c.fav;
      if(S.cat !== 'all' && c.cats.indexOf(S.cat) < 0) return false;
      if(cat.subs && S.sub !== 'all') return (c.tags || []).indexOf(S.sub) >= 0;   // same sub-tab in both views
      return true;
    });
  }

  /* ---------- rendering ---------- */
  function logoHtml(c){
    if(!c.logo) return '<div class="logo txt' + ((c.txt || c.n).length > 8 ? ' long' : '') + '" style="background:' + c.bg + ';color:' + (c.fg || '#fff') + '"><span>' + esc(c.txt || c.n) + '</span></div>';
    var b = c.box, img = b ? '<img src="' + c.logo + '"' + TV.logoAttrs(c) + ' style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%;object-fit:contain;">'
                          : '<img class="' + (c.fit || 'cover') + '" src="' + c.logo + '"' + TV.logoAttrs(c) + '>';
    return '<div class="logo" style="' + (c.bg ? 'background:' + c.bg : '') + '">' + img + '</div>';
  }
  // favourite: the heart filled white; hold Enter on a channel card to add or remove it
  function heartIcon(c){ return '<span class="fav-wrap' + (c.fav ? '' : ' off') + '"><img class="ic20 fav-ic" src="icons/tv-guide/' + (c.fav ? 'heart-fill.svg' : 'heart.svg') + '" alt="' + (c.fav ? 'Favorite' : '') + '"></span>'; }
  // reminder bell on an upcoming programme (Figma "Card Program", 230:108415): the outline bell shows on the focused card
  // only; once set it is filled and always shows
  function bellHtml(p){ var on = !!reminders[p.key];
    return '<span class="rem-wrap' + (on ? ' on' : '') + '"><img class="ic24 bell" src="icons/tv-guide/' + (on ? 'notify.svg' : 'bell.svg') + '" alt="' + (on ? 'Reminder set' : 'Set reminder') + '"></span>'; }
  function tsHtml(p){ return p.ts ? '<img class="ic24 ts" src="icons/tv-guide/timeshift.svg" alt="Timeshift">' : ''; }
  function crownIcon(c){ return c.crown ? '<img class="ic20" src="icons/tv-guide/' + (c.crown === 'owned' ? 'crown.svg' : 'crown-s.svg') + '" alt="Premium">' : ''; }
  var tabsEl = document.getElementById('tabs'), subsEl = document.getElementById('subs'), subsRail = document.getElementById('subsRail');
  var gridEl = document.getElementById('grid'), guideEl = document.getElementById('guide');
  var emptyEl = document.getElementById('empty'), catLabel = document.getElementById('catLabel');
  tabsEl.innerHTML = CATS.map(function(c){ return '<div class="tab item" data-cat="' + c.id + '">' + esc(c.n) + '</div>'; }).join('');

  function renderTabs(){
    $('.tab', tabsEl).forEach(function(t){ t.classList.toggle('on', t.dataset.cat === S.cat); });
    var cat = CATS.filter(function(c){ return c.id === S.cat; })[0];
    // rebuilt only when the category changes; otherwise the same chips just move the selected mark, so the focus ring
    // can slide from one to the next (it can't slide away from an element that was replaced)
    if(subsEl.dataset.cat !== S.cat){
      subsEl.dataset.cat = S.cat;
      subsEl.innerHTML = cat.subs ? cat.subs.map(function(s){ return '<div class="sub item" data-sub="' + s[0] + '">' + esc(s[1]) + '</div>'; }).join('') : '';
      $('.sub', subsEl).forEach(function(el){ el.addEventListener('click', onClick); });
    }
    $('.sub', subsEl).forEach(function(el){ el.classList.toggle('on', el.dataset.sub === S.sub); });
    subsRail.style.display = cat.subs ? '' : 'none';
  }
  function renderChannels(list){
    gridEl.innerHTML = list.map(function(c){
      // Home's channel card: logo circle, name, then heart, crown and number (data-ring-art="": plain glass ring)
      return '<div class="ch-card item" data-no="' + c.no + '" data-ring-art="">' +
        '<div class="ch-slot"><div class="ava">' + logoHtml(c) + '</div></div>' +
        '<div class="ch-name clip">' + esc(c.n) + '</div>' +
        '<div class="ch-meta">' + heartIcon(c) + crownIcon(c) + (c.excl ? '' : '<div class="ch-no">' + c.no + '</div>') + '</div>' +
      '</div>';
    }).join('');
  }
  // programme cards carry no tags but Watching (the channel the player was showing, on its live card); the Time Shift
  // icon is drawn on its own (tsHtml)
  function tagsFor(p, big, when){
    var now = new Date(), airing = p.start <= now && p.end > now;
    return big && airing && p.ch.n === WATCHING ? '<div class="tags"><span class="tag watch"><i class="eq"><b></b><b></b><b></b></i>Watching</span></div>' : '';
  }
  function renderGuide(list){
    var when = guideTime(), dayOf = function(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
    // a later day (the date picker): no live card; every column opens as a next-day column does, that day's date pinned
    // at the top and its programmes from the chosen time below it (Figma's next-day column)
    var later = S.day > 0, lastEnd = today.getTime() + (DAYS_AHEAD + 1) * 864e5;
    guideEl.innerHTML = list.map(function(c){
      var pin = '', i0 = onAt(c, when), shown = c.progs.slice(i0).filter(function(p, j){ return j === 0 || p.start.getTime() < lastEnd; })   /* through the last day in the date picker: the last card is the real end */, lastDay = dayOf(when), body = '', bigHtml = '';
      if(c.excl) shown = shown.slice(0, 1 + c.up);   // Exclusive: the live programme and at most 2 after it
      shown.forEach(function(p, j){
        // a date divider only where a later day starts: none for the day being shown (today), even when the live
        // card began the evening before
        if(j > 0 && dayOf(p.start) !== lastDay && dayOf(p.start) > dayOf(when)){
          body += '<div class="day-sep">' + fmtDate(p.start) + '</div>';
          if(!pin) pin = '<div class="day-sep day-pin">' + fmtDate(p.start) + '</div>';
        }
        lastDay = dayOf(p.start);
        var tm = fmtTime(p.start) + (j === 0 && !later ? ' - ' : ' – ') + fmtTime(p.end);
        if(j === 0 && !later){
          var art = p.img ? '<div class="art" style="background-image:url(\'' + p.img + '\')"></div>'
                          : !c.logo ? '<div class="art logo-art"><span class="txt-art' + ((c.txt || c.n).length > 8 ? ' long' : '') + '" style="background:' + c.bg + ';color:' + (c.fg || '#fff') + '">' + esc(c.txt || c.n) + '</span></div>'
                          : '<div class="art logo-art"><img src="' + c.logo + '"' + TV.logoAttrs(c) + ' style="background:' + (c.bg || 'transparent') + '"></div>';
          bigHtml = '<div class="prog prog-big item" data-key="' + p.key + '">' + art + '<div class="shade"></div>' +
            '<div class="t clip">' + esc(p.t) + '</div><div class="row"><div class="tm clip">' + tm + '</div>' + tsHtml(p) + tagsFor(p, true, when) + '</div></div>';
        } else {
          body += '<div class="prog prog-blk item" data-key="' + p.key + '">' +
            '<div class="title-row"><div class="t clip">' + esc(p.t) + '</div>' +
              tsHtml(p) + (p.start > new Date() ? bellHtml(p) : '') + '</div>' +
            '<div class="row"><div class="tm">' + tm + '</div>' + tagsFor(p, false, when) + '</div></div>';
        }
      });
      if(later){   // the list opens with the day's divider (kept just out of sight under its pinned copy)
        pin = '<div class="day-sep day-pin">' + fmtDate(when) + '</div>';
        body = '<div class="day-sep">' + fmtDate(when) + '</div>' + body;
      }
      return '<div class="col' + (later ? ' next-day' : '') + '" data-no="' + c.no + '">' +
        '<div class="col-head"><div class="ava-sm">' + logoHtml(c) + '</div><div class="col-name clip">' + esc(c.n) + '</div>' +
          '<div class="col-icons"><span class="heart">' + heartIcon(c) + '</span>' +
            (c.crown ? '<span class="crown">' + crownIcon(c) + '</span>' : '') + (c.excl ? '' : '<div class="col-no">' + c.no + '</div>') + '</div></div>' +
        // the live card stays pinned under the channel header; what comes after scrolls inside the column on its own
        '<div class="col-body">' + bigHtml + pin + '<div class="col-scroll"><div class="col-list">' + body + '</div></div></div></div>';
    }).join('');
  }
  var PROG_BY_KEY = {};
  CHANNELS.forEach(function(c){ c.progs.forEach(function(p){ PROG_BY_KEY[p.key] = p; }); });

  function render(){
    document.body.className = 'v-' + S.view + (document.body.classList.contains('collapsed') ? ' collapsed' : '') + (document.body.classList.contains('in-guide') ? ' in-guide' : '');
    $('.sw').forEach(function(s){ s.classList.toggle('on', s.dataset.view === S.view); });
    renderTabs();
    var list = channelsFor();
    if(S.view === 'channels') renderChannels(list); else renderGuide(list);
    if(S.view === 'guide' && S.day > 0) $('.col-scroll', guideEl).forEach(function(o){ o.scrollTop = 106; o.dataset.scrollTopTo = 106; });
    emptyEl.style.display = list.length ? 'none' : '';
    $('.ch-card, .prog').forEach(function(el){ el.addEventListener('click', onClick); });
  }

  /* ---------- head: clock chips and the two dropdowns ---------- */
  var chipDate = document.getElementById('chipDate'), chipTime = document.getElementById('chipTime');
  var dds = { date: document.getElementById('ddDate'), time: document.getElementById('ddTime') };
  function dateOpts(){ var a = []; for(var i = 0; i <= DAYS_AHEAD; i++) a.push({v:i, n:fmtDate(new Date(today.getTime() + i * 864e5))}); return a; }
  // the time picker: today, Now and the hours still to come; a later day, every hour of it (no Now)
  function timeOpts(){
    var today_ = S.day === 0, o = today_ ? [{v:-1, n:'Now'}] : [];
    for(var h = today_ ? new Date().getHours() + 1 : 0; h < 24; h++) o.push({v:h, n:pad(h) + ':00'});
    return o;
  }
  // after a date is picked, the time must be one that date offers: Now on a later day becomes the same hour that day;
  // an hour already gone on today becomes Now
  function fitHour(){
    if(S.day > 0 && S.hour < 0) S.hour = new Date().getHours();
    else if(S.day === 0 && S.hour >= 0 && S.hour <= new Date().getHours()) S.hour = -1;
  }
  function paintHead(){
    var now = new Date();
    chipDate.textContent = fmtDate(now); chipTime.textContent = fmtTime(now);
    dds.date.querySelector('.v').textContent = fmtDate(new Date(today.getTime() + S.day * 864e5));
    dds.time.querySelector('.v').textContent = S.hour < 0 ? fmtTime(now) : pad(S.hour) + ':00';
  }
  setInterval(paintHead, 20000);

  var menu = null;   // the open dropdown: {kind, opts, hl}
  function openMenu(kind){
    var opts = kind === 'date' ? dateOpts() : timeOpts(), cur = kind === 'date' ? S.day : S.hour;
    var hl = 0; opts.forEach(function(o, i){ if(o.v === cur) hl = i; });
    menu = {kind:kind, opts:opts, hl:hl};
    var m = dds[kind].querySelector('.dd-menu');
    m.innerHTML = opts.map(function(o, i){ return '<div class="dd-opt' + (o.v === cur ? ' sel' : '') + '" data-i="' + i + '">' + o.n + '</div>'; }).join('');
    $('.dd-opt', m).forEach(function(el){ el.addEventListener('click', function(e){ e.stopPropagation(); menu.hl = +el.dataset.i; pickMenu(); }); });
    dds[kind].classList.add('open'); paintMenu();
  }
  function paintMenu(){
    var m = dds[menu.kind].querySelector('.dd-menu'), opts = $('.dd-opt', m);
    opts.forEach(function(el, i){ el.classList.toggle('hl', i === menu.hl); });
    var el = opts[menu.hl], top = el.offsetTop - 8;
    if(top < m.scrollTop) m.scrollTop = top; else if(el.offsetTop + el.offsetHeight + 8 > m.scrollTop + m.clientHeight) m.scrollTop = el.offsetTop + el.offsetHeight + 8 - m.clientHeight;
  }
  function closeMenu(){ if(!menu) return; dds[menu.kind].classList.remove('open'); menu = null; }
  function pickMenu(){
    var o = menu.opts[menu.hl];
    if(menu.kind === 'date'){ S.day = o.v; fitHour(); } else S.hour = o.v;
    closeMenu(); paintHead(); render(); resetZones(); paint();
    toast('Guide from ' + fmtDate(guideTime()) + ', ' + fmtTime(guideTime()));
  }

  /* ---------- focus: zones top to bottom, each remembers its position ---------- */
  var GRID_COLS = 8;   // View Channels: cards to a row (.grid)
  var mem = { head:0, tabs:0, subs:0, grid:0, guide:{c:0, r:0} }, zone = 'tabs';
  function zoneItems(z){
    if(z === 'head') return $('.sw').concat(S.view === 'guide' ? [dds.date.querySelector('.dd-trigger'), dds.time.querySelector('.dd-trigger'), document.getElementById('ddReset')] : []);
    if(z === 'tabs') return $('.tab', tabsEl);
    if(z === 'subs') return $('.sub', subsEl);
    if(z === 'grid') return $('.ch-card', gridEl);
    return [];
  }
  function guideCols(){ return $('.col', guideEl).map(function(col){ return $('.prog', col); }); }
  function zones(){
    var z = ['head', 'tabs'];
    if(subsEl.children.length) z.push('subs');   // Sports / Others sub-tabs, in both views
    if(S.view === 'channels'){ if(zoneItems('grid').length) z.push('grid'); }
    else if(guideCols().length) z.push('guide');
    return z;
  }
  // a guide card's middle on screen once its column has finished scrolling (paint() scrolls smoothly, to scrollTopTo)
  function settledMid(el){
    var b = el.getBoundingClientRect(); if(!b.height) return null;
    var sc = el.closest('.col-scroll'), to = sc ? sc.dataset.scrollTopTo : '';   // the live card sits above the scroller
    return b.top + b.height / 2 + (to !== undefined && to !== '' ? (sc.scrollTop - +to) * K : 0);
  }
  function resetZones(){ mem.grid = 0; mem.guide = {c:0, r:0}; if(zones().indexOf(zone) < 0) zone = 'tabs'; }
  function focusedEl(){
    if(zone === 'guide'){ var cols = guideCols(), g = mem.guide; return cols[g.c] && cols[g.c][g.r]; }
    return zoneItems(zone)[mem[zone]];
  }
  function paint(){
    $('.focused').forEach(function(e){ e.classList.remove('focused'); });
    var el = focusedEl(); if(!el) return;
    el.classList.add('focused');   // focus-ring.js puts the ring on it
    // first time focus reaches a programme in the guide (once per visit, not per column): the favourites hint again
    if(zone === 'guide' && !guideHinted){ guideHinted = true; showHint(HINT_FAV); }
    // ... and the first time it reaches an upcoming programme's card: the reminder hint (once per visit)
    else if(zone === 'guide' && !remHinted && el.querySelector('.rem-wrap')){ remHinted = true; showHint(HINT_REM); }
    // a programme column stays lit while focus is on one of its programmes
    $('.col.hl', guideEl).forEach(function(c){ c.classList.remove('hl'); });
    if(zone === 'guide'){ var own = el.closest('.col'); if(own) own.classList.add('hl'); }
    // keep it in view. Sideways, exactly like Home's rails ("fixed focus", updateTrackTransform in home.html): the
    // focused item sits at the first item's slot (the 110px margin) and the rail slides under it, until the rail's end
    // is in: it stops where the last item ends as far from the right edge as the first starts from the left; past that,
    // focus moves on alone to the last items. Short rows never scroll.
    // Down the page: the page scrolls to it.
    var rail = el.closest('.rail');
    if(rail){
      var item = zone === 'guide' ? el.closest('.col') : el, track = rail.firstElementChild;
      var desired = item.offsetLeft - track.firstElementChild.offsetLeft;
      var maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);   // the 110px margins already leave room for the ring
      var left = Math.max(0, Math.min(desired, maxScroll));
      rail.dataset.scrollLeftTo = left;   // focus-ring.js aims the ring at where the item will be once this scroll ends
      rail.scrollTo({left:left, behavior:ARRIVE ? 'auto' : 'smooth'});
    }
    var page = document.getElementById('page'), top = page.scrollTop;
    // in the Program Guide's columns the rows above (categories, sub-tabs, logos) always collapse into the breadcrumb:
    // the columns move up to sit 32px below it (label bottom = 92px into the page, so the columns' top = 124px).
    // Measured on screen, not with offsetTop: the first row's top margin collapses through #content, which offsetTop misses.
    var guideMin = 0;
    if(zone === 'guide'){
      var rail = document.getElementById('guideRail');
      guideMin = (rail.getBoundingClientRect().top - page.getBoundingClientRect().top) / K + page.scrollTop + 6 - 124;
    }
    if(zone === 'head' || zone === 'tabs' || zone === 'subs' || (zone === 'grid' && mem.grid < GRID_COLS)) top = 0;
    else if(zone === 'guide'){
      // the page stays put (collapsed); the focused column scrolls inside itself to keep the programme in view, and
      // every other column stays scrolled as it was left
      top = guideMin;
      var sc = el.closest('.col-scroll');
      $('.col-scroll', guideEl).forEach(function(o){
        var st = 0, col = o.closest('.col');
        if(o === sc){
          // a programme of the next day: the column puts its live card away and opens with that day's date divider at
          // the top (Figma's next-day column), the day's programmes below it
          // the day it belongs to: the last date divider above it. The pinned date at the top shows that day, so the date
          // card sticks there as the list scrolls on, day after day, to the last one
          var seps = $('.day-sep', o), si = -1;
          seps.forEach(function(d, i){ if(d.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) si = i; });
          var sep = seps[si], nextDay = si >= 0, pinEl = col.querySelector('.day-pin');
          var wasNext = col.classList.contains('next-day'), was = col.dataset.sep === undefined ? -1 : +col.dataset.sep;
          col.classList.toggle('next-day', nextDay);
          col.dataset.sep = si;
          if(sep && pinEl) pinEl.textContent = sep.textContent;
          var VIS = nextDay ? 522 : 416, FULL = nextDay ? 628 : 522;   // rows fully on screen; the scroller's height
          // the divider's place in the scroller (measured on screen: offsetTop would count from the column instead)
          // (the top of its grid slot: a divider still to come is a thin bar under a 51px margin, inside the same slot)
          var sepTop = sep ? (sep.getBoundingClientRect().top - o.getBoundingClientRect().top) / K + o.scrollTop - (parseFloat(getComputedStyle(sep).marginTop) || 0) : 0;
          var y = (el.getBoundingClientRect().top - o.getBoundingClientRect().top) / K + o.scrollTop, h = el.offsetHeight;
          st = o.scrollTop; if(o.dataset.scrollTopTo !== undefined) st = +o.dataset.scrollTopTo;
          if(nextDay && (!wasNext || si > was)) st = sepTop + 106;   // stepping into a later day: its first programme under the pinned date
          if(y + h + 8 > st + VIS) st = y + h + 8 - VIS;   // keep it in the rows on screen, ring included
          if(y < st) st = y;   // ... and above (the ring may overlap the card above the list)
          // whole steps of the 106px grid (a card or a date divider + the 8px gap), so the rows line up across columns
          var prev = +(o.dataset.scrollTopTo || 0);
          st = st > prev ? Math.ceil(st / 106) * 106 : st < prev ? Math.floor(st / 106) * 106 : prev;
          if(nextDay) st = Math.max(st, sepTop + 106);   // the day before (and the list's own divider) stays out of sight
          var isLast = S.cat !== 'exclusive' && el === $('.prog', o).pop();   // Exclusive's short lists never hug
          o.classList.toggle('end', isLast);   // this column hugs its last card; the others keep running on
          st = Math.max(0, Math.min(st, o.scrollHeight - (isLast ? VIS : FULL)));
        } else {
          // other columns keep their own scroll (and view) as they were left; only a column whose live card now has
          // focus shows that card again, its list staying where it was
          if(!col.contains(el)) return;
          o.classList.remove('end'); col.classList.remove('next-day');
          st = +(o.dataset.scrollTopTo || 0);
          st = Math.max(0, Math.min(st, o.scrollHeight - 522));
        }
        if(+(o.dataset.scrollTopTo || 0) !== st || o.scrollTop !== st){ o.dataset.scrollTopTo = st; o.scrollTo({top:st, behavior:ARRIVE ? 'auto' : 'smooth'}); }
      });
    }
    else {
      var y = (el.getBoundingClientRect().top - page.getBoundingClientRect().top) / K + page.scrollTop, h = el.offsetHeight;
      if(y + h + 60 > top + page.clientHeight) top = y + h + 60 - page.clientHeight;
      if(y - 150 < top) top = y - 150;   // fully visible below the collapsed label, focus ring included
    }
    top = Math.max(0, guideMin, top);
    page.dataset.scrollTopTo = top;
    page.scrollTo({top:top, behavior:ARRIVE ? 'auto' : 'smooth'});
    // scrolled down: the category rows collapse into one label, 60px under the header ("All Channels", "Sports · Football")
    // a category with sub-tabs shows as a breadcrumb: Sports › Football (the chosen sub-tab, "All Sports" included)
    var cat = CATS.filter(function(c){ return c.id === S.cat; })[0], sub = cat.subs && cat.subs.filter(function(x){ return x[0] === S.sub; })[0];
    catLabel.innerHTML = sub ? '<span class="crumb">' + esc(cat.n) + '</span><span class="sep">/</span><span class="cur">' + esc(sub[1]) + '</span>' : esc(cat.n);
    document.body.classList.toggle('collapsed', top > 0);
    document.body.classList.toggle('in-guide', zone === 'guide');   // the logo row is put away while focus is in the columns
  }
  // moving onto a category tab filters straight away; a sub-tab needs Enter
  function selectCat(id){ if(S.cat === id) return; S.cat = id; S.sub = 'all'; mem.subs = 0; render(); resetZones(); }
  function selectSub(id){ if(S.sub === id) return; S.sub = id; render(); resetZones(); }
  function setView(v){ if(S.view === v) return; S.view = v; closeMenu(); render(); resetZones(); }

  function move(dx, dy){
    var zs = zones(), zi = zs.indexOf(zone);
    if(dx){
      if(zone === 'grid'){
        var n = zoneItems('grid').length, c = mem.grid % GRID_COLS;
        if((dx < 0 && c > 0) || (dx > 0 && c < GRID_COLS - 1 && mem.grid + 1 < n)) mem.grid += dx;
      } else if(zone === 'guide'){
        // Left / Right goes to the card beside the focused one: in the next column, the card whose middle is nearest
        // the focused card's middle on screen (each column as it is scrolled, or is scrolling to)
        var cols = guideCols(), g = mem.guide, nc = Math.max(0, Math.min(cols.length - 1, g.c + dx));
        if(nc === g.c) return;
        var y = settledMid(cols[g.c][g.r]), best = 0, bestD = Infinity;
        cols[nc].forEach(function(el, i){
          var m = settledMid(el); if(m === null) return;   // the live card, put away in a next-day column
          if(Math.abs(m - y) < bestD){ bestD = Math.abs(m - y); best = i; }
        });
        mem.guide = {c:nc, r:best};
      } else {
        var items = zoneItems(zone);
        mem[zone] = Math.max(0, Math.min(items.length - 1, mem[zone] + dx));
        if(zone === 'tabs') selectCat(items[mem.tabs].dataset.cat);
      }
      return;
    }
    if(zone === 'grid'){
      var ng = mem.grid + dy * GRID_COLS;
      if(dy > 0 && ng < zoneItems('grid').length){ mem.grid = ng; return; }
      if(dy > 0 && Math.floor(mem.grid / GRID_COLS) < Math.floor((zoneItems('grid').length - 1) / GRID_COLS)){ mem.grid = zoneItems('grid').length - 1; return; }
      if(dy < 0 && ng >= 0){ mem.grid = ng; return; }
    }
    if(zone === 'guide'){
      var col = guideCols()[mem.guide.c], nr = mem.guide.r + dy;
      // Down from the live card goes to the first programme showing in the column's list, so a list left scrolled
      // stays where it was
      if(mem.guide.r === 0 && dy > 0 && col.length > 1){
        var sc = col[1].closest('.col-scroll'), top = +(sc.dataset.scrollTopTo || sc.scrollTop);
        for(var i = 1; i < col.length; i++){
          var y = (col[i].getBoundingClientRect().top - sc.getBoundingClientRect().top) / K + sc.scrollTop;
          if(y >= top - 1){ nr = i; break; }
        }
      }
      if(nr >= 0 && nr < col.length){ mem.guide = {c:mem.guide.c, r:nr}; return; }
    }
    var nz = zs[zi + dy];
    // Down from the category tabs skips the sub-tabs and lands on the first channel card (Up from the cards still
    // reaches the sub-tabs, then the categories)
    if(zone === 'tabs' && dy > 0 && nz === 'subs'){
      nz = zs[zi + 2];
      if(nz === 'grid') mem.grid = 0;
      if(nz === 'guide') mem.guide = {c:0, r:0};
    }
    if(!nz) return;
    // coming onto the sub-tabs: start on the selected (underlined) one
    if(nz === 'subs') mem.subs = Math.max(0, zoneItems('subs').map(function(e){ return e.dataset.sub; }).indexOf(S.sub));
    if(nz === 'tabs') mem.tabs = Math.max(0, CATS.map(function(c){ return c.id; }).indexOf(S.cat));
    if(nz === 'head' && zone !== 'head') mem.head = S.view === 'guide' ? 1 : 0;
    zone = nz;
  }

  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1800); }
  function back(){
    try { if(document.referrer && /(home|sport|news|movie)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }
  // Back steps out one level at a time: a programme below the live card → that column's live card → the selected sub-tab (when the category has them)
  // → the selected main category → Home
  function stepBack(){
    // in a guide column below its live card: Back first returns to that column's live card (what's on now)
    // (and that column's list goes back to its start: only that column, the others stay as they are)
    if(zone === 'guide' && mem.guide.r > 0){
      var sc = guideCols()[mem.guide.c][1].closest('.col-scroll');
      if(sc) sc.dataset.scrollTopTo = 0;   // paint() sees the change and scrolls it back
      mem.guide = {c:mem.guide.c, r:0}; return;
    }
    if(zone === 'grid' || zone === 'guide'){
      if(zones().indexOf('subs') >= 0){
        zone = 'subs'; mem.subs = Math.max(0, zoneItems('subs').map(function(e){ return e.dataset.sub; }).indexOf(S.sub));
        return;
      }
      zone = 'tabs';
    } else if(zone === 'subs') zone = 'tabs';
    else { back(); return; }
    mem.tabs = Math.max(0, CATS.map(function(c){ return c.id; }).indexOf(S.cat));
  }
  // Enter on a channel (or on what's on now) plays it in the Live TV player (live-tv-player.html). The tab and the
  // channel are kept for coming back, so Back from the player lands on the same card
  function videoFor(c){
    var V = 'video/', has = function(k){ return c.cats.indexOf(k) >= 0 || (c.tags || []).indexOf(k) >= 0; };
    if(/COOL/.test(c.n)) return V + 'coolch.mp4';
    if(has('football')) return V + 'football.mp4';
    if(has('basketball')) return V + 'all-star.mp4';
    if(has('sports')) return V + 'bad.mp4';
    if(has('cartoons')) return V + 'dis.mp4';
    if(has('variety')) return V + 'concert.mp4';
    if(/HBO|Cinemax/.test(c.n)) return V + 'hbo.mp4';
    if(has('movies')) return V + 'spiderman.mp4';
    return V + 'vall.mp4';
  }
  // a live event with its own video (content.js LIVE v: Home's first scene), else the channel's
  function liveVideo(t){ var e = window.LIVE && LIVE.find(t); return e && e.v || ''; }
  // title: a live event's own name (a LIVE card elsewhere: Home), shown in place of the programme's
  function openPlayer(c, replace, loud, title){
    var p = c.progs[onAt(c, new Date())];
    try { sessionStorage.setItem('tvGuideBack', JSON.stringify({view:S.view, cat:S.cat, sub:S.sub, no:c.no})); } catch(e){}
    // the channel numbers there are, so the player can say "not available" for a typed number without leaving
    try { sessionStorage.setItem('tvChannelNos', JSON.stringify(CHANNELS.filter(function(x){ return !x.excl; }).map(function(x){ return x.no; }))); } catch(e){}
    // and the channels with their programmes around now, for the player's mini EPG (Browse Channels)
    try {
      var t0 = Date.now() - 36e5, t1 = Date.now() + 12 * 36e5;
      sessionStorage.setItem('tvMini', JSON.stringify({
        cats: CATS.map(function(k){ return {id:k.id, n:k.n}; }),
        chans: CHANNELS.map(function(x){
          return {n:x.n, no:x.no, excl:!!x.excl, logo:x.logo || '', fit:x.fit || '', box:x.box || null, bg:x.bg || '', txt:x.txt || '', fg:x.fg || '',
            crown:x.crown || '', fav:!!x.fav, recent:!!x.recent, cats:x.cats, live:SPORT_CH.some(function(k){ return x.cats.indexOf(k) >= 0; }),
            progs:x.progs.filter(function(pr){ return pr.end > t0 && pr.start < t1; }).map(function(pr){ return [pr.t, pr.start.getTime(), pr.end.getTime(), pr.ts ? 1 : 0, pr.hot ? 1 : 0]; })};
        })
      }));
    } catch(e){}
    var q = {n:c.n, no:c.excl ? '' : c.no, crown:c.crown || '', fav:c.fav ? 1 : '', logo:c.logo || '', fit:c.fit || '', box:c.box ? c.box.join(',') : '',
             bg:c.bg || '', txt:c.txt || '', fg:c.fg || '', t:title || p.t, s:p.start.getTime(), e:p.end.getTime(), v:liveVideo(title || p.t) || videoFor(c),
             ts:p.ts ? 1 : '', quiet:replace && !loud ? 1 : ''};   // Time Shift: what's on now has the Time Shift icon; quiet: a channel change (see the player)
    var url = 'live-tv-player.html?' + Object.keys(q).filter(function(k){ return q[k] !== ''; })
      .map(function(k){ return k + '=' + encodeURIComponent(q[k]); }).join('&');
    if(replace) location.replace(url); else location.href = url;
  }
  function chByNo(no){ return CHANNELS.filter(function(c){ return c.no === +no; })[0]; }
  function activate(el){
    // sub-tabs: moving along them only moves focus; Enter picks one (underlined) and filters
    if(el.classList.contains('sub')){ selectSub(el.dataset.sub); return; }
    if(el.classList.contains('sw')){ setView(el.dataset.view); mem.head = S.view === 'guide' ? 1 : 0; zone = 'head'; return; }
    if(el.classList.contains('dd-trigger')){ openMenu(el.parentElement === dds.date ? 'date' : 'time'); return; }
    // reset: the guide back to today, now
    if(el.id === 'ddReset'){ S.day = 0; S.hour = -1; paintHead(); render(); resetZones(); paint(); toast('Guide from now'); return; }
    if(el.classList.contains('ch-card')){ openPlayer(chByNo(el.dataset.no)); return; }
    if(el.classList.contains('prog')){
      var p = PROG_BY_KEY[el.dataset.key], now = new Date();
      if(p.start <= now && p.end > now){ openPlayer(p.ch); return; }
      if(p.end <= now){ toast(p.t + ' has ended'); return; }
      // a programme still to come: Enter sets (or clears) a reminder, shown as a bell on its card
      if(reminders[p.key]){ delete reminders[p.key]; toast('Reminder removed: ' + p.t); }
      else { reminders[p.key] = true; toast('Reminder set: ' + p.t + ' at ' + fmtTime(p.start)); }
      hideHint();
      var wrap = el.querySelector('.rem-wrap');   // updated in place (no re-render), so the focus ring stays put
      if(wrap){
        var on = !!reminders[p.key], img = wrap.querySelector('img');
        wrap.classList.toggle('on', on);
        img.src = 'icons/tv-guide/' + (on ? 'notify.svg' : 'bell.svg'); img.alt = on ? 'Reminder set' : 'Set reminder';
        iconAnim(img, on);
      }
      return;
    }
  }
  function onClick(e){
    e.stopPropagation(); closeMenu();
    var el = e.currentTarget, found = false;
    zones().forEach(function(z){
      if(found) return;
      if(z === 'guide'){ guideCols().forEach(function(col, c){ var r = col.indexOf(el); if(r >= 0){ mem.guide = {c:c, r:r}; zone = 'guide'; found = true; } }); return; }
      var i = zoneItems(z).indexOf(el); if(i >= 0){ mem[z] = i; zone = z; found = true; }
    });
    if(el.classList.contains('tab')) selectCat(el.dataset.cat);
    else if(el.classList.contains('sub')) selectSub(el.dataset.sub);
    else activate(el);
    paint();
  }
  $('.sw, .tab, .dd-trigger').forEach(function(el){ el.addEventListener('click', onClick); });

  var guideHinted = false, remHinted = false;
  var HOLD_MS = 600, hold = { el:null, done:true, t:0 };
  addEventListener('keyup', function(e){
    if((e.key !== 'Enter' && e.key !== ' ') || !hold.el) return;
    clearTimeout(hold.t);
    var el = hold.el, done = hold.done; hold = { el:null, done:true, t:0 };
    if(!done && el.isConnected && el.classList.contains('focused')) activate(el);   // a short press
  });
  function toggleFav(c, from){
    hideHint();
    c.fav = !c.fav; saveFav(c);
    toast(c.fav ? 'Added to Favorite: ' + c.n : 'Removed from Favorite: ' + c.n);
    if(S.cat === 'fav'){ render(); resetZones(); paint(); return; }   // the Favorite list itself changed
    $('[data-no="' + c.no + '"] .fav-ic').forEach(function(img){ img.src = 'icons/tv-guide/' + (c.fav ? 'heart-fill.svg' : 'heart.svg'); img.alt = c.fav ? 'Favorite' : ''; img.parentElement.classList.toggle('off', !c.fav); });
    favAnim(c, from);
  }
  // a small icon turning on (heart, bell): bounces in with a ring and a burst of sparks; turning off: a quick squeeze
  function iconAnim(img, on){
    img.classList.remove('pop', 'unpop'); void img.offsetWidth;   // restart the animation
    img.classList.add(on ? 'pop' : 'unpop');
    if(!on) return;
    var b = document.createElement('span'); b.className = 'fav-burst';
    b.innerHTML = '<span class="ring"></span>' + [0,45,90,135,180,225,270,315].map(function(a){ return '<i style="--a:' + a + 'deg"></i>'; }).join('');
    img.parentElement.appendChild(b); setTimeout(function(){ b.remove(); }, 700);
  }
  // the like animation on the focused card (and its small heart wherever it shows)
  function favAnim(c, from){
    var card = from && from.isConnected ? from : $('.ch-card[data-no="' + c.no + '"]')[0];   // the big heart pops over the card held
    $('[data-no="' + c.no + '"] .fav-ic').forEach(function(img){ iconAnim(img, c.fav); });
    if(c.fav && card){
      var big = document.createElement('div'); big.className = 'fav-big';
      card.appendChild(big); setTimeout(function(){ big.remove(); }, 1000);
    }
  }
  addEventListener('keydown', function(e){
    var handled = true;
    if(menu){
      if(e.key === 'ArrowDown') menu.hl = Math.min(menu.opts.length - 1, menu.hl + 1);
      else if(e.key === 'ArrowUp') menu.hl = Math.max(0, menu.hl - 1);
      else if(e.key === 'Enter' || e.key === ' ') { pickMenu(); e.preventDefault(); return; }
      else if(e.key === 'Escape' || e.key === 'Backspace') closeMenu();
      else handled = false;
      if(handled){ e.preventDefault(); if(menu) paintMenu(); }
      return;
    }
    if(e.key === 'ArrowRight') move(1, 0);
    else if(e.key === 'ArrowLeft') move(-1, 0);
    else if(e.key === 'ArrowDown') move(0, 1);
    else if(e.key === 'ArrowUp') move(0, -1);
    else if(e.key === 'Enter' || e.key === ' '){
      var el = focusedEl();
      if(e.repeat){ e.preventDefault(); return; }   // held down: the timer below decides
      // a channel card or a programme: a short press opens / watches it (on release); held for HOLD_MS it toggles the
      // channel's Favorite instead
      if(el && (el.classList.contains('ch-card') || el.classList.contains('prog'))){
        clearTimeout(hold.t);
        var ch = el.classList.contains('prog') ? PROG_BY_KEY[el.dataset.key].ch : chByNo(el.dataset.no);
        hold = { el:el, done:false, t:setTimeout(function(){ hold.done = true; toggleFav(ch, el); }, HOLD_MS) };
        e.preventDefault(); return;
      }
      if(el) activate(el);
    }
    else if(e.key === 'Escape' || e.key === 'Backspace') stepBack();
    else handled = false;
    if(handled){ e.preventDefault(); paint(); }
  });
  // mouse wheel / trackpad scrolls the page
  document.getElementById('page').addEventListener('wheel', function(e){ this.scrollTop += e.deltaY; e.preventDefault(); }, {passive:false});

  // the hint is set up before the first paint: coming back from the player into the Program Guide paints focus on a
  // programme straight away, which shows it
  var hintEl = document.getElementById('hint'), hintT;
  function hideHint(){ clearTimeout(hintT); hintEl.classList.add('gone'); }
  var HINT_FAV = 'Press and hold OK to add/remove favorites', HINT_REM = 'Press OK to set/unset reminder';
  function showHint(msg){ clearTimeout(hintT); document.getElementById('hintText').textContent = msg || HINT_FAV; hintEl.classList.remove('gone'); hintT = setTimeout(hideHint, 2500); }   // on screen for 2.5s
  // ?view=guide opens the Program Guide straight away
  if(/view=guide/.test(location.search)) S.view = 'guide';
  // back from the player: the same view, tab and channel as when it was opened
  var ret = null; try { ret = JSON.parse(sessionStorage.getItem('tvGuideBack')); sessionStorage.removeItem('tvGuideBack'); } catch(e){}
  if(ret && !/view=/.test(location.search)){ S.view = ret.view; S.cat = ret.cat; S.sub = ret.sub; }
  // ?tune=N: the player asked for channel N (typed on the remote). This page only passes through: it opens that channel
  // in the player in its place (so Back from there still comes here), or sends the viewer back to the player they came
  // from (?from=) when there is no such channel
  // ?zap=1 / -1 & cur=<name>: Down / Up in the player, the next / previous channel by number (wrapping round; the
  // Exclusive channels have no number, so they are left out)
  // ?play=<name>: a channel picked in the player's mini EPG (by name: Exclusive channels have no number), or a channel
  // card on Home (&from=home: opened with the controls showing, and Back returns to Home; &t=: a LIVE card's event name)
  var pick = /[?&]play=([^&]*)/.exec(location.search);
  if(pick){
    var pc = CHANNELS.filter(function(c){ return c.n === decodeURIComponent(pick[1]); })[0];
    if(pc){ document.body.style.visibility = 'hidden'; openPlayer(pc, true, /[?&]from=home/.test(location.search), decodeURIComponent((/[?&]t=([^&]*)/.exec(location.search) || [])[1] || '')); return; }
  }
  var zap = /[?&]zap=(-?1)/.exec(location.search);
  if(zap){
    var nums = CHANNELS.filter(function(c){ return !c.excl; }).sort(function(a, b){ return a.no - b.no; }),   // in number order
        cur = decodeURIComponent((/[?&]cur=([^&]*)/.exec(location.search) || [])[1] || '');
    var at = nums.map(function(c){ return c.n; }).indexOf(cur), dir = +zap[1];
    if(at < 0) at = dir > 0 ? -1 : 0;
    document.body.style.visibility = 'hidden';
    openPlayer(nums[(at + dir + nums.length) % nums.length], true); return;
  }
  var tune = /[?&]tune=(\d+)/.exec(location.search);
  if(tune){
    var tc = chByNo(tune[1]), from = (/[?&]from=([^&]*)/.exec(location.search) || [])[1];
    document.body.style.visibility = 'hidden';
    if(tc && !tc.excl){ openPlayer(tc, true); return; }
    if(from){
      try { if(ret) sessionStorage.setItem('tvGuideBack', JSON.stringify(ret)); } catch(e){}   // still there for Back from that player
      from = decodeURIComponent(from); location.replace(from + (from.indexOf('?') < 0 ? '?' : '&') + 'nochan=' + tune[1]); return; }
    document.body.style.visibility = ''; document.documentElement.style.visibility = '';   // no such channel and nowhere to go back to: show the guide
  }
  paintHead(); render();
  if(ret && !/view=/.test(location.search)){
    var at = channelsFor().map(function(c){ return ret.n ? c.n : c.no; }).indexOf(ret.n || ret.no);   // by name from the player (Exclusive channels have no number)
    if(at >= 0){ if(S.view === 'channels'){ zone = 'grid'; mem.grid = at; } else { zone = 'guide'; mem.guide = {c:at, r:0}; } }
  }
  // back from the player (Back or View Program Guide): the card is focused at once, no scrolling or growing into place
  if(ret){ ARRIVE = true; document.body.classList.add('arrive'); }
  paint();
  if(ARRIVE) requestAnimationFrame(function(){ requestAnimationFrame(function(){ ARRIVE = false; document.body.classList.remove('arrive'); }); });
  // first impression: the hint slides in as the page opens and leaves after a few seconds (or once a favourite is set)
  setTimeout(function(){ showHint(HINT_FAV); }, 400);
})();
