
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o){ return Object.keys(o).filter(function(k){ return o[k] != null; }).map(function(k){ return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }

  /* ---------- content (Figma's) ----------
     g: the channel's name in the TV Guide, which opens it in the Live TV player (none: a demo toast) */
  var A = 'news-assets/';
  // the news channels by their TV Guide names (g: the channel Enter plays); name, number and logo come from
  // channels-data.js, so they match the TV Guide. cover: the logo fills its disc (else it sits inside it, on white)
  var CH = {cnn:{g:'CNN'}, bbc:{g:'BBC News'}, cnbc:{g:'CNBC News'}, sky:{g:'SKY News'}, fox:{g:'FOX News'}, thaipbs:{g:'TPBS'}, pptv:{g:'PPTV HD'},
            nation:{g:'Nation TV'}, one:{g:'ONE 31 HD'}, tnn:{g:'TNN'}, ch3:{g:'3 HD'}, ch7:{g:'CH7 HD'}};
  Object.keys(CH).forEach(function(k){
    var c = CH[k], d = TV.byName(c.g);
    c.n = d.n; c.no = String(d.no); c.d = d;   // d: the TV Guide channel, whose logo disc the cards show
  });
  var NEWS_DESC = 'Live news around the clock: breaking stories, in-depth reports and analysis from the newsroom, as it happens.';
  var DONT_MISS = [
    {t:'CNN News', img:A + 'dm-cnn.png', logo:1, ch:CH.cnn, time:'02:00 – 04:00', bg:A + 'hero-bg.png', v:window.LIVE.hot.filter(function(p){ return p.tv === 'CNN'; })[0].v,   // its video: content.js, shared with Home's Hot Channel Program
     d:'CNN Primetime brings the day’s biggest stories from around the world, with live reports from CNN’s correspondents and in-depth analysis.'},
    {t:'เรื่องเล่าเช้านี้', img:A + 'dm-rueng.png', ch:CH.ch3, time:'06:00 – 08:00', v:window.LIVE.hot.filter(function(p){ return p.tv === '3 HD'; })[0].v,   // its video: content.js, shared with Home's Hot Channel Program
     d:'ข่าวเช้าที่เล่าเรื่องราวรอบตัวคุณ อัปเดตทุกประเด็นร้อนตั้งแต่เช้าตรู่'},
    {t:'BBC News', img:A + 'dm-bbc.png', ch:CH.bbc, time:'07:00 – 08:00', bg:A + 'bg-bbc.webp', d:'The latest from BBC News: the stories that matter in the UK and around the world, live.'},
    {t:'สนามข่าว 7 สี', img:A + 'dm-sanam7.png', ch:CH.ch7, time:'08:00 – 09:00', bg:A + 'bg-sanam7.webp', d:'สนามข่าว 7 สี ติดตามทุกความเคลื่อนไหวของข่าวสำคัญ สดทุกวัน'},
    {t:'One News', img:A + 'ch-one.png', ch:CH.one, time:'09:00 – 10:00', bg:A + 'bg-onenews.webp', d:'ข่าวสด ข่าวด่วน ทันทุกเหตุการณ์ จาก One News'},
    {t:'News 24', img:A + 'ch-sky.png', fit:1, ch:CH.sky, time:'10:00 – 11:00', bg:A + 'bg-news24.webp', d:'Real news, honest views: breaking news, politics and business around the clock, live from the newsroom and the street.'}
  ];
  // the category chips filter the rails below them (cat: the categories each card / rail carries in `cats`)
  var CATS = [
    {t:'All', cat:'', d:'Every story in one place: live channels, programs and the latest episodes from home and abroad.'},
    {t:'International', cat:'world', d:'International news from every continent, live from the world’s biggest newsrooms.'},
    {t:'Business', cat:'business', d:'Markets, companies and the deals that move them, with live coverage of the business day.'},
    {t:'Economics', cat:'economics', d:'The economy explained: growth, inflation, jobs and what they mean for you.'},
    {t:'Politics', cat:'politics', d:'Parliament, elections and policy, at home and around the world.'},
    {t:'Entertainment', cat:'entertainment', d:'Celebrity news, film, music and culture, from red carpets to premieres.'},
    {t:'IT & Tech', cat:'tech', d:'Gadgets, startups and the technology shaping tomorrow.'},
    {t:'Thai News', cat:'thai', d:'ข่าวไทยทุกช่อง สดตลอดวัน: Thai news from every Thai channel, live, with the programs and episodes made at home.'}
  ];
  // what's on now on each news channel: the TV Guide's own channels (channels-data.js, `tv`), so the card, the TV Guide
  // and the player show the same programme, time, Time Shift and favourite
  // every news channel in the TV Guide (channels-data.js, cats 'news'), lowest number first: the Thai Digital TV ones
  // (Thai News Channel, and the Thai News chip) and the international ones; each with the categories it covers
  var NEWS_CATS = {
    'FOX News':'politics economics', 'Bloomberg':'business economics', 'CNBC News':'business economics tech', 'SKY News':'world politics business',
    'NHK World Japan':'world tech', 'CNN':'world politics entertainment', 'BBC News':'world politics tech', 'CCTV 4':'world', 'CGTN':'world economics',
    'CNA':'world business', 'Euronews':'world politics', 'DW':'world politics', 'France 24':'world politics', 'News 1':'world',
    'FOX Business':'business economics', 'Al Jazeera':'world politics', 'Top News':'world politics', 'RT Channel':'world politics', 'TVBS':'world entertainment',
    'NBT 2 HD':'politics', 'TPBS':'politics world', 'CH5 HD':'politics', 'T Sports 7':'entertainment', 'Parliament':'politics', 'TNN':'business economics tech',
    'JKN 18':'business world', 'Nation TV':'politics business', 'GMM25':'entertainment', 'CH 8':'entertainment', 'MCOT HD':'politics economics',
    'ONE 31 HD':'entertainment', 'Thairath TV HD':'politics entertainment', '3 HD':'politics entertainment', 'AmarinTV HD':'entertainment',
    'CH7 HD':'politics entertainment', 'PPTV HD':'entertainment business' };
  var INTL = [], THAI = [];
  TV.CHANNELS.filter(function(d){ return (d.cats || []).indexOf('news') >= 0; }).sort(function(a, b){ return a.no - b.no; }).forEach(function(d){
    var thai = d.cats.indexOf('digital') >= 0, e = { c:{ g:d.n, n:d.n, no:String(d.no), d:d }, tv:d.n, cats:(NEWS_CATS[d.n] || 'world') + (thai ? ' thai' : '') };
    (thai ? THAI : INTL).push(e);
  });
  // (every localized programme is Thai: the Thai News chip keeps the whole rail)
  var LOCAL = [
    {t:'ทันโลก กับ Thai PBS', cats:'world', img:A + 'lc-1.png', ch:CH.thaipbs, time:'09:00 – 10:00', d:'สรุปข่าวต่างประเทศรอบวัน เจาะลึกประเด็นที่คนทั้งโลกจับตา'},
    {t:'เปิดโต๊ะข่าว PPTV', cats:'politics', img:A + 'lc-2.png', ch:CH.pptv, time:'10:00 – 11:00', d:'เปิดโต๊ะข่าว ถกทุกประเด็นร้อนประจำวันกับทีมข่าว PPTV'},
    {t:'สถานีประชาชน', cats:'politics economics', img:A + 'lc-3.png', ch:CH.thaipbs, time:'11:00 – 12:00', d:'เสียงของประชาชน ปัญหาใกล้ตัวที่รอการแก้ไข'},
    {t:'คมชัดลึก Nation', cats:'politics', img:A + 'lc-4.png', ch:CH.nation, time:'21:00 – 22:00', d:'คมชัดลึก เจาะประเด็นการเมืองและสังคมแบบตรงไปตรงมา'},
    {t:'เข้าข่าวค่ำ PPTV', cats:'economics business', img:A + 'lc-5.png', ch:CH.pptv, time:'18:00 – 19:00', d:'สรุปข่าวรอบวันในช่วงค่ำ ครบทุกประเด็นสำคัญ'},
    {t:'แสงจากพ่อ', cats:'entertainment', img:A + 'lc-6.png', ch:CH.thaipbs, time:'19:00 – 20:00', d:'สารคดีเล่าเรื่องแรงบันดาลใจจากพระราชกรณียกิจ'}
  ];
  // a news episode card (content.js MD.M k, its episode e in MD.episodes): its picture, then "air date - episode title"
  // (Figma: "23/10/26 - #2 มรสุม …"). crop: Figma's crop of the poster ({w, left}: the picture's width and offset,
  // {h, top}: its height and offset, % of the poster; contain: the whole picture on black; none: cover)
  function epItem(k, e, p){
    var ep = MD.episode(k, 1, e), crop = '';
    p = p || {};
    if(p.w) crop = 'background-size:' + p.w + '% 100%;background-position:' + (p.left / (p.w - 100) * 100).toFixed(2) + '% 0;';
    if(p.h) crop = 'background-size:100% ' + p.h + '%;background-position:0 ' + Math.max(0, -p.top / (p.h - 100) * 100).toFixed(2) + '%;';
    // the middle of what the card shows, as fractions of the picture: the hero's panel centres on it (the people)
    var cx = p.w ? (p.left + 50) / p.w : 0.5, cy = p.h ? (50 - p.top) / p.h : 0.3;
    return { k:k, s:1, e:e, date:ep.date, t:ep.date + ' - ' + ep.t, img:ep.img, contain:p.contain, crop:crop, focus:(cx * 100).toFixed(1) + '% ' + (cy * 100).toFixed(1) + '%' };
  }
  // episode rails: a series' latest episodes, newest first (content.js: its name, words and episodes)
  function eps(k, crop){
    var n = MD.episodes(k, 1).length, out = [];
    for(var e = n; e >= 1; e--) out.push(epItem(k, e, (crop || [])[n - e]));
    return out;
  }
  var EPISODES = [
    {k:'honekrasae', title:'Hone-Krasae (โหนกระแส) EP', cats:'entertainment politics thai', items:eps('honekrasae',
      [{w:252.48, left:93.6}, {w:252.48, left:105.22}, {w:267.33, left:102.31}, {w:266.58, left:101.01}, {w:266.58, left:105.89},
       {w:266.58, left:115.58}, {w:266.58, left:105.08}, {w:266.58, left:104.28}])},
    {k:'globalstory', title:'BBC The Global Story EP', cats:'world politics economics tech', items:eps('globalstory')},
    {k:'witness', title:'An Aje Witness Documentary', cats:'world', items:eps('witness')}
  ];
  // Hot VOD (Figma: under Don't Miss): content.js MD.HOT_VOD, each card cropped as Figma's
  var HOT_CROP = [{w:252.48, left:93.6}, {h:118.71, top:-2.62}, null, null, {h:118.81, top:0.07}, {h:118.81, top:-3.42}, {h:118.71, top:-2.95}];
  var HOT = MD.HOT_VOD.map(function(h, i){ return epItem(h.k, h.e, HOT_CROP[i]); });
  // the news channels' round logos (Figma: under Thai News Channel): tv its TV Guide name (Enter plays it); the logo art
  // is Figma's: bg its disc colour, box [left, top, width, height] % of the disc (else it covers it), contain: whole
  var D = A + 'disc/';
  var DISCS = [
    {tv:'FOX Business', imgs:[D + 'fox-business-1.png', D + 'fox-business-2.png']},
    {tv:'CNA', img:D + 'cna.png', bg:'#fff', box:[21.21, 13.08, 58.06, 73.85]},
    {tv:'CH5 HD', img:D + 'ch5.png', bg:'#fff', box:[9.91, 30.77, 80.24, 38.15]},
    {tv:'ONE 31 HD', img:D + 'one-news.png'},
    {tv:'Workpoint TV', img:D + 'workpoint.png'},
    {tv:'TPBS', img:D + 'thaipbs.jpg', bg:'#fff', contain:1},
    {tv:'France 24', img:D + 'france24.png', bg:'#22a9f7', box:[14.25, 16.25, 71.5, 67.5]},
    {tv:'Thairath TV HD', img:D + 'thairath.png', bg:'#fffdfd', contain:1},
    {tv:'TNN', img:D + 'tnn.png'}
  ];
  DISCS.forEach(function(c){ var d = TV.byName(c.tv); c.c = { g:d.n, n:d.n, no:String(d.no), d:d }; c.cats = (NEWS_CATS[d.n] || 'world') + ((d.cats || []).indexOf('digital') >= 0 ? ' thai' : ''); });

  /* ---------- markup ---------- */
  // a premium channel's programme: the crown tag bottom-left (corner-tag.css), as Home's and Sport's cards
  function liveCard(it, i, set){
    return '<div class="card item"' + attrs({kind:'live', set:set, i:i}) + '><div class="thumb' + (it.logo ? ' logo' : '') + (it.fit ? ' fit' : '') + '" style="background-image:url(\'' + it.img + '\')">' +
      (it.ch && it.ch.d ? Content.crownIcon({ch:it.ch.d}, 0, 'crown-tag') : '') + '</div><span class="live-ribbon" data-ring-top="styled">Live</span>' + (set === 'dontmiss' ? '' : '<div class="t">' + esc(it.t) + '</div>') + '</div>';   // (the first rail, Don't Miss: no title, as Home's: the hero says it)   // Home's Live ribbon
  }
  function epgIcons(o){ return (o.ts ? '<img class="epg-ts" src="icons/tv-guide/timeshift.svg" alt="Time Shift">' : '') + (o.fav ? '<span class="epg-heart"><img src="icons/epg/heart.svg" alt="Favorite"></span>' : ''); }
  // Home's TV Guide card (tvguide-card.css): the channel's logo, what's on now and its progress, then what's next
  function epgCard(e, i, set){
    var c = e.c, o = TV.onNow(TV.byName(e.tv));
    var ava = TV.logoHtml(c.d, 'epg-avatar round');
    return '<div class="epg-card tv-glass item"' + attrs({kind:'epg', set:set, i:i}) + ' data-ring-art=""><div class="epg-now">' + ava +
      '<div class="epg-prog-data"><div class="epg-title">' + esc(o.now.t) + '</div><div class="epg-sub">Started at ' + o.startedAt + '</div></div>' +
      '<span class="epg-icons">' + epgIcons(o) + '</span>' +
      '<div class="progress"><i style="width:' + o.pct + '%"></i></div></div>' +
      '<div class="epg-next"><div class="epg-title">' + esc(o.next.t) + '</div><div class="epg-sub">Starts at ' + o.nextAt + '</div></div></div>';
  }
  function epCard(it, set, i){
    return '<div class="ep item"' + attrs({kind:'ep', set:set, i:i, k:it.k, s:it.s, e:it.e, focus:it.focus}) + '><div class="poster' + (it.contain ? ' contain' : '') + '" style="background-image:url(\'' + it.img + '\');' + it.crop + '"></div>' +
      '<div class="t">' + esc(it.t) + '</div></div>';
  }
  function discHtml(c, i){
    var pics = (c.imgs || [c.img]).map(function(src){
      var b = c.box, st = b ? 'left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%' : '';
      return '<img src="' + src + '" alt=""' + (b ? ' style="' + st + '"' : '') + (c.contain ? ' class="contain"' : '') + '>';
    }).join('');
    return '<div class="disc item"' + attrs({kind:'disc', i:i}) + ' data-ring-art="" style="' + (c.bg ? 'background:' + c.bg : '') + '">' + pics + '</div>';
  }
  function chanRail(key, title, list){
    return '<section class="sec" data-row="' + key + '"><h2 class="sec-title">' + title + '</h2><div class="rail"><div class="track chan-track">' +
      '<div class="epg-countdown tv-chip item"' + attrs({kind:'viewall', set:key}) + ' data-ring-art=""><b>TV Guide</b><span>View All</span></div>' +
      list.map(function(e, i){ return epgCard(e, i, key); }).join('') + '</div></div></section>';
  }
  // back from the player / TV Guide: the category that was picked
  var RETURNING = false, PICK = 0;
  try { RETURNING = !!sessionStorage.getItem('newsReturn'); if(RETURNING) PICK = +(sessionStorage.getItem('newsCat') || 0) || 0; } catch(e){}
  var html = '';
  html += '<section class="sec" data-row="dontmiss"><h2 class="sec-title">Watch on</h2><div class="rail"><div class="track">' +
    DONT_MISS.map(function(it, i){ return liveCard(it, i, 'dontmiss'); }).join('') + '</div></div></section>';
  var SHOW_HOT_VOD = false;   // the Hot VOD rail is hidden for now (true brings it back; its data stays in content.js MD.HOT_VOD)
  if(SHOW_HOT_VOD) html += '<section class="sec eps" data-row="hot"><h2 class="sec-title">Hot VOD</h2><div class="rail"><div class="track">' +
    HOT.map(function(it, i){ return epCard(it, 'hot', i); }).join('') + '</div></div></section>';
  html += '<section class="sec" data-row="cats"><div class="rail"><div class="chips">' + CATS.map(function(c, i){
    return '<div class="chip tv-chip item' + (i === PICK ? ' sel' : '') + '"' + attrs({kind:'cat', i:i}) + ' data-ring-art="">' +
      esc(c.t) + '</div>';
  }).join('') + '</div></div></section>';
  html += chanRail('intl', 'International News Channel', INTL);
  html += chanRail('thai', 'Thai News Channel', THAI);
  var SHOW_HOT_CHANNELS = false;   // the Hot Channels rail is hidden for now (true brings it back)
  if(SHOW_HOT_CHANNELS) html += '<section class="sec discs-sec" data-row="discs"><h2 class="sec-title">Hot Channels</h2><div class="rail"><div class="track discs">' + DISCS.map(discHtml).join('') + '</div></div></section>';
  html += '<section class="sec" data-row="local"><h2 class="sec-title">Localized Program News</h2><div class="rail"><div class="track">' +
    LOCAL.map(function(it, i){ return liveCard(it, i, 'local'); }).join('') + '</div></div></section>';
  EPISODES.forEach(function(r, ri){
    html += '<section class="sec eps" data-row="ep' + ri + '"><h2 class="sec-title">' + esc(r.title) + '</h2><div class="rail"><div class="track">' +
      r.items.map(function(it, i){ return epCard(it, ri, i); }).join('') + '</div></div></section>';
  });
  html += '<section class="sec totop" data-row="totop"><div class="tv-btn tv-btn--primary tv-btn--top item" data-kind="totop" data-ring-art=""><i></i>Back to Top</div></section>';
  var page = document.getElementById('page');
  page.innerHTML = html;

  /* ---------- focus rows: the top bar, then one row per section ---------- */
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  // each card (channels, programmes) and each episode rail carries its categories in data-cats
  $('[data-row="intl"] .epg-card, [data-row="thai"] .epg-card', page).forEach(function(el){ el.dataset.cats = (el.dataset.set === 'intl' ? INTL : THAI)[+el.dataset.i].cats; });
  $('[data-row="discs"] .item', page).forEach(function(el){ el.dataset.cats = DISCS[+el.dataset.i].cats; });
  $('[data-row="local"] .item', page).forEach(function(el){ el.dataset.cats = LOCAL[+el.dataset.i].cats + ' thai'; });
  EPISODES.forEach(function(r, ri){ page.querySelector('[data-row="ep' + ri + '"]').dataset.cats = r.cats; });
  var catFilter = CATS[PICK].cat;   // '' = All
  function inCat(el){ return !catFilter || (' ' + el.dataset.cats + ' ').indexOf(' ' + catFilter + ' ') >= 0; }
  // what shows and what focus can reach: below the chips, only the picked category's cards; a rail left with none goes
  // (a channel rail keeps its View All only while it has a channel)
  var secs, rows, R, DYNAMIC_END;
  function buildRows(){
    $('.sec', page).forEach(function(sec){
      var cards = $('[data-cats]', sec).filter(function(el){ return el !== sec; });
      cards.forEach(function(el){ el.classList.toggle('cat-off', !inCat(el)); });
      if(sec.dataset.cats) sec.classList.toggle('cat-off', !inCat(sec));
      else if(cards.length) sec.classList.toggle('cat-off', !cards.some(inCat));
    });
    secs = $('.sec', page).filter(function(s){ return !s.classList.contains('cat-off'); });
    rows = [{ items:$('.topnav .item') }].concat(secs.map(function(s){
      return { sec:s, key:s.dataset.row, items:$('.item', s).filter(function(el){ return !el.classList.contains('cat-off'); }) };
    }));
    R = {}; rows.forEach(function(r, i){ if(r.key) R[r.key] = i; });
    DYNAMIC_END = R.totop - 1;   // every rail up to the last one keeps the hero; Back to Top is static
  }
  buildRows();
  var homeTab = document.querySelector('.navtab.active'), NAV_HOME = rows[0].items.indexOf(homeTab);
  var cur = { row:R.dontmiss, col:rows.map(function(){ return 0; }), from:0 };   // from: the row the top bar was entered from
  cur.col[0] = NAV_HOME;
  var ROW_Y = 649;           // where the focused rail sits while the hero shows (Figma)

  // ---- the hero speaks for the focused item ----
  var heroEl = document.querySelector('.hero'), heroKey = '';
  var pics = $('.hero-bg .pic'), picFront = 0, picCur = null, heroVid = HeroVideo(document.querySelector('.hero-bg'));
  function setBg(img, side){
    // side: an episode's picture as a panel over the screen's right 70% ({size, pos}: centred on what its card shows)
    var key = (img || '') + (side ? '|' + side.size + '|' + side.pos : '');
    if((img ? key : null) === picCur) return;
    picCur = img ? key : null;
    pics[picFront].classList.remove('on');
    picFront = 1 - picFront;
    if(img){
      var p = pics[picFront];
      p.style.backgroundImage = 'url(\'' + img + '\')';
      p.classList.toggle('side', !!side);
      p.style.backgroundSize = side ? side.size : '';
      p.style.backgroundPosition = side ? side.pos : '';
      p.classList.add('on');
    }
  }
  function chMeta(c){ return '<span class="ch">' + TV.logoHtml(c.d) + 'Channel ' + c.no + ': ' + esc(c.n) + '</span>'; }
  // a news episode: its series in content.js (MD.M k), a series of its own episodes (Season 1)
  function epInfo(el){ return { k:el.dataset.k }; }
  function epOf(el){ return MD.episode(el.dataset.k, +el.dataset.s, +el.dataset.e); }
  // the channel rails' backgrounds: Thai News Channel its Thai channels' picture, International its own
  function guideBg(rowKey){ return A + (rowKey === 'thai' ? 'tvguide-thai-bg.webp' : 'tvguide-news-bg.webp'); }
  function heroFor(el, rowKey){
    var k = el && el.dataset.kind, i = el ? +el.dataset.i : 0;
    if(k === 'live'){
      var m = (el.dataset.set === 'local' ? LOCAL : DONT_MISS)[i];
      return { t:m.t, meta:'<span class="badge live">LIVE</span>' + chMeta(m.ch) + '<span class="pill">' + m.time + '</span>', d:m.d || NEWS_DESC, bg:m.bg || m.img, v:m.v };
    }
    if(k === 'cat'){ var c = CATS[i]; return { t:/News$/.test(c.t) ? c.t : c.t + ' News', d:c.d, bg:A + 'bg-news-filter.webp' }; }
    if(k === 'viewall') return { t:rowKey === 'intl' ? 'International News Channel' : 'Thai News Channel',
      d:'See what’s on now and next on every ' + (rowKey === 'intl' ? 'international' : 'Thai') + ' news channel in the TV Guide.', bg:guideBg(rowKey) };
    if(k === 'epg'){
      var e = (rowKey === 'intl' ? INTL : THAI)[i], o = TV.onNow(TV.byName(e.tv));
      return { t:o.now.t, meta:'<span class="badge live">LIVE</span>' + chMeta(e.c) + '<span class="pill">' + o.startedAt + ' – ' + TV.clock(o.now.end) + '</span>', d:'Next: ' + o.next.t + ' at ' + o.nextAt + '. ' + NEWS_DESC, bg:guideBg(rowKey) };
    }
    if(k === 'disc'){
      var dc = DISCS[i], on = TV.onNow(TV.byName(dc.tv));   // the channel: what's on now (channels-data.js), as its TV Guide card
      return { t:on.now.t, meta:'<span class="badge live">LIVE</span>' + chMeta(dc.c) + '<span class="pill">' + on.startedAt + ' – ' + TV.clock(on.now.end) + '</span>', d:'Next: ' + on.next.t + ' at ' + on.nextAt + '. ' + NEWS_DESC, bg:A + 'special-channels-bg.webp' };   // Hot Channels: its own channels' picture
    }
    if(k === 'ep'){
      var v = epInfo(el), c = Content.hero(v), ep = epOf(el);   // its series' words (content.js)
      // its picture over the right 70% of the screen, centred where its card is (the people)
      // (an episode with a full-screen picture of its own, content.js bg: that, over the whole screen)
      return { t:ep.t, meta:Content.metaHtml(v, true) + '<span class="pill">EP ' + ep.n + '</span><span class="pill">' + ep.date + '</span>', d:ep.d, bg:ep.bg || ep.img,
               side:ep.bg ? null : { size:'cover', pos:el.dataset.focus || '50% 30%' } };   // its series' meta row (1 Season), the episode and its air date
    }
    return null;
  }
  function paintHero(rowKey, el){
    var h = heroFor(el, rowKey);
    if(!h) return;
    var key = h.t + '|' + (h.meta || '');
    if(key !== heroKey){
      heroKey = key;
      heroEl.querySelector('h1').textContent = h.t;
      heroEl.querySelector('.meta').innerHTML = h.meta || '';
      heroEl.querySelector('.desc').textContent = h.d;
      heroEl.classList.remove('swap'); void heroEl.offsetWidth; heroEl.classList.add('swap');
    }
    setBg(h.bg, h.side);
    heroVid.set(h.v);
  }

  // ---- keep the focused item in view (Home's "fixed focus" sideways; the focused rail at y=649 down the page) ----
  var pageY = 0;
  function slide(r, el){
    if(r.key === 'totop') return;
    var track = el.closest('.track, .chips');
    var want = el.offsetLeft - r.items[0].offsetLeft;
    var max = Math.max(0, track.scrollWidth - 1920);
    track.style.transform = 'translateX(' + -Math.max(0, Math.min(want, max)) + 'px)';
  }
  // the hero text ends 80px above the focused rail's first line (its title, else its cards), whatever its length
  var HERO_GAP = 80;
  var CHIPS_FOCUS_Y = 594;   // Home's quick-menu chips when focused
  function placeHero(r){
    var y = 0, e = r.sec.querySelector('.sec-title, .item');
    while(e && e !== r.sec){ y += e.offsetTop; e = e.offsetParent; }
    heroEl.style.top = 'auto';
    heroEl.style.bottom = 1080 - (r.sec.offsetTop + y - pageY - HERO_GAP) + 'px';
  }
  function layout(ri){
    var r = rows[ri], top = r.sec.offsetTop, y;
    // a rail sits at y=649, or higher when it's too tall to end on screen there (the episode rails); Back to Top: the page's end
    y = ri <= DYNAMIC_END ? top - Math.min(ROW_Y, 1080 - 40 - r.sec.offsetHeight) : page.offsetHeight - 1080;
    // (the first scene: Don't Miss at y=649 with Hot VOD under it, Figma)
    var ch = rows[R.cats].sec.querySelector('.chips'), chTop = rows[R.cats].sec.offsetTop + ch.offsetTop;
    // the chips focused: up to y=594 with the rail after them showing, as Home's quick menu
    if(ri === R.cats) y = chTop - CHIPS_FOCUS_Y;
    pageY = Math.max(0, y);
    page.style.transform = 'translateY(' + -pageY + 'px)';
    secs.forEach(function(s, si){ s.classList.toggle('above', si + 1 < ri); });
    document.body.classList.toggle('static', ri > DYNAMIC_END);
  }

  // the profile panel under the top bar's photo, as on Home (profile-panel.js)
  var profileEl = document.querySelector('.topnav .profile'), prof = ProfilePanel(profileEl, { paint:paint, toast:toast });

  function paint(){
    var inProf = prof.paint(cur.row === 0 && rows[0].items[cur.col[0]] === profileEl);
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){ el.classList.toggle('focused', !inProf && ri === cur.row && ci === cur.col[ri]); }); });
    // top-bar tab states (button-theme.css): Home is Active while the D-pad is on the bar, Active dim in the content
    homeTab.classList.toggle('active', cur.row === 0);
    homeTab.classList.toggle('active-dim', cur.row !== 0);
    var ri = cur.row === 0 ? cur.from : cur.row;   // on the top bar the page stays as it was
    document.body.classList.toggle('on-nav', cur.row === 0);
    // the top bar, as Home's: gone once focus is past the first rail, back as an overlay (with its scrim) while it has focus
    document.body.classList.toggle('past-first', ri > R.dontmiss);
    layout(ri);
    var r = rows[ri], el = r.items[cur.col[ri]];
    if(cur.row) slide(r, el);
    if(ri <= DYNAMIC_END){ paintHero(r.key, el); placeHero(r); } else heroVid.set('');
    try { sessionStorage.setItem('newsFocus', JSON.stringify(cur)); } catch(e){}
  }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  // leaving for the TV Guide / player: their Back lands on the same item here
  function leave(url){ try { sessionStorage.setItem('newsReturn', '1'); } catch(e){} location.href = url; }
  // back from the player out of the browser's page cache: the channel cards' hearts (and Time Shift) as they are now
  addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    document.querySelectorAll('.epg-card[data-kind="epg"]').forEach(function(el){
      var e2 = (el.dataset.set === 'intl' ? INTL : THAI)[+el.dataset.i];
      el.querySelector('.epg-icons').innerHTML = epgIcons(TV.onNow(TV.byName(e2.tv)));
    });
  });
  // a channel the TV Guide knows opens in the Live TV player through it (its programmes, the mini EPG, Up / Down)
  function watch(c, title){
    if(c.g) leave('tv-guide.html?play=' + encodeURIComponent(c.g) + '&from=news');
    else toast('Now playing: ' + (title || c.n));
  }
  // a chip picked (focus landing on it, Enter or a click): the rails below show that category only; one chip is ever marked
  function setCat(i, quiet){
    catFilter = CATS[i].cat;
    $('.chips .chip', page).forEach(function(c, ci){ c.classList.toggle('sel', ci === i); });
    try { sessionStorage.setItem('newsCat', i); } catch(e){}
    var dm = cur.col[R.dontmiss];
    buildRows();
    $('.track', page).forEach(function(t){ if(!t.closest('[data-row="dontmiss"]')) t.style.transform = ''; });   // rails back to their start
    cur.col = rows.map(function(r, ri){ return ri === 0 ? cur.col[0] : r.key === 'cats' ? i : r.key === 'dontmiss' ? dm : 0; });
    cur.row = R.cats;
    if(!quiet) toast(catFilter ? 'Showing ' + CATS[i].t + ' news' : 'Showing all news');
  }
  function select(el){
    var k = el.dataset.kind, i = +el.dataset.i;
    el.animate([{ transform:getComputedStyle(el).transform }, { transform:(getComputedStyle(el).transform === 'none' ? '' : getComputedStyle(el).transform + ' ') + 'scale(0.97)' }], { duration:140, easing:'ease-out' });
    if(el.dataset.href){ location.href = el.dataset.href; return; }
    if(el === profileEl) return;   // its panel is already open under it
    if(k === 'live'){ var m = (el.dataset.set === 'local' ? LOCAL : DONT_MISS)[i]; watch(m.ch, m.t); return; }
    if(k === 'cat'){ setCat(i); return; }
    if(k === 'viewall'){ leave('tv-guide.html'); return; }
    if(k === 'epg'){ var e = (el.dataset.set === 'intl' ? INTL : THAI)[i]; leave('tv-guide.html?play=' + encodeURIComponent(e.tv) + '&from=news'); return; }   // as Home's: the player via the TV Guide
    if(k === 'disc'){ leave('tv-guide.html?play=' + encodeURIComponent(DISCS[i].tv) + '&from=news'); return; }   // as a channel card: the player via the TV Guide
    if(k === 'ep'){   // a news episode: its detail page (content.js), then the player
      leave(Content.detailUrl(epInfo(el))); return;
    }
    if(k === 'totop'){ cur.row = R.dontmiss; cur.col[R.dontmiss] = 0; paint(); return; }
    toast(el.dataset.label + ' (demo)');
  }
  function back(){
    if(cur.row > R.dontmiss){ cur.row = R.dontmiss; paint(); return; }
    try { if(document.referrer && /home\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    var r = rows[cur.row], n = r.items.length, handled = true;
    if(e.key === 'ArrowRight') cur.col[cur.row] = Math.min(n - 1, cur.col[cur.row] + 1);
    else if(e.key === 'ArrowLeft'){
      // Left on a rail's first item goes up to the top bar (its Home tab), as on Home
      if(cur.row > 0 && cur.col[cur.row] === 0){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_HOME; }
      else cur.col[cur.row] = Math.max(0, cur.col[cur.row] - 1);
    }
    else if(e.key === 'ArrowUp'){
      if(cur.row === R.dontmiss){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_HOME; }
      else if(cur.row > 0) cur.row--;
    }
    else if(e.key === 'ArrowDown'){
      if(cur.row === 0) cur.row = cur.from || R.dontmiss;
      else cur.row = Math.min(rows.length - 1, cur.row + 1);
    }
    else if(e.key === 'Enter') select(r.items[cur.col[cur.row]]);
    else if(e.key === 'Escape' || e.key === 'Backspace') back();
    else handled = false;
    // the chips are a single filter: the chip focus lands on is the one picked
    if(handled && rows[cur.row].key === 'cats' && !rows[cur.row].items[cur.col[cur.row]].classList.contains('sel')) setCat(cur.col[cur.row], true);
    if(handled){ e.preventDefault(); paint(); }
  });
  rows.forEach(function(r){ r.items.forEach(function(el){
    el.addEventListener('click', function(){
      var ri = -1, ci = -1;   // its place now (the rows change with the category)
      rows.forEach(function(x, xi){ var j = x.items.indexOf(el); if(j >= 0){ ri = xi; ci = j; } });
      if(ri < 0) return;
      if(ri === 0) cur.from = cur.row || cur.from; cur.row = ri; cur.col[ri] = ci; paint(); select(el); });
  }); });

  // coming back (Back from the player or the TV Guide): the same item again
  try {
    var saved = RETURNING && JSON.parse(sessionStorage.getItem('newsFocus') || 'null');
    sessionStorage.removeItem('newsReturn');
    if(saved && saved.col && saved.col.length === rows.length){ cur = saved; if(cur.row === 0) cur.row = cur.from || R.dontmiss; }
  } catch(e){}
  if(!cur.from) cur.from = R.dontmiss;
  page.style.transition = 'none';
  paint();
  // fonts change the rows' heights: lay out again once they are in, then let the page glide
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ paint(); requestAnimationFrame(function(){ page.style.transition = ''; }); });
})();
