
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o){ return Object.keys(o).filter(function(k){ return o[k] != null; }).map(function(k){ return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }

  /* ---------- content ----------
     Artwork is Figma's own; every other card keeps Figma's placeholder (ph) and speaks with Figma's placeholder text. */
  var SA = 'store-assets/', PK = SA + 'pkg/';
  var LOREM = 'Lorem Ipsum is simply dummy text of the printing and setting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since 1966, when Lorem Ipsum hassasdfasdf Lorem Ipsum is simply dummy text of the printing and setting industry. Lorem Ipsum has been';
  // a placeholder package, as Figma's hero shows it
  function ph(badge){ return { badge:badge, t:'Package Title', price:199, per:'Month', tags:['Monthly', 'Recurring'], d:LOREM }; }
  // art: how the card shows its picture; hero: the picture behind the hero (a logo on black keeps Figma's placeholder hero)
  var ULTIMATE = { badge:'Recommend', dark:1, t:'PLAY ULTIMATE', price:999, per:'Month', tags:['Monthly', 'Recurring', 'Recommend'],
    d:'Netflix, HBO Max, Disney+ Hotstar, iQIYI, oneD and WeTV in one package, with AIS PLAY Premium channels and live sport. Watch on your TV, phone and tablet.',
    art:{ img:SA + 'foryou-play-ultimate.png', crop:'height:123.75%;left:-60%;top:-17.17%;width:220%' }, hero:SA + 'hero-play-ultimate.png', pkg:1 };
  var OTT = Packages.OTT, PKG = Packages.PKG;   // packages.js (Package Detail shows the same)
  // the Movies tabs: Popular, then each OTT's own packages
  var TAB_OTT = { 'Netflix':'netflix', 'HBO Max':'hbo', 'Disney+':'disney', 'iQIYI':'iqiyi', 'Viu':'viu', 'MONOMAX':'monomax',
    // the Sports tabs: each league's own packages
    'Premier League':'epl', 'UEFA Champions League':'ucl', 'NBA':'nba', 'Thai League':'thai1', 'RWS':'rws', 'Bundesliga':'bundesliga',
    'MotoGP':'motogp', 'PGA Tour':'pga',
    // the Short Series tabs: each app's own packages
    'ReelShort':'reelshort', 'DramaBox':'dramabox' };
  var NETFLIX_7D = PKG.netflix[0];
  var ROWS = {
    foryou:[ ULTIMATE,
      { badge:'Best Seller', dark:1, t:'PLAY ALL Asian Games', price:199, per:'Month', tags:['Monthly', 'Recurring', 'Best Seller'],
        d:'Every sport of the Asian Games live on AIS PLAY, with Thai commentary, replays and daily highlights, plus the PLAY ALL sports channels.',
        art:{ img:SA + 'foryou-asian-games.png' }, pkg:1 },
      { badge:'New Release', dark:1, t:'PLAY PREMIUM PLUS', price:99, per:'Month', tags:['Monthly', 'Recurring', 'New Release'],
        d:'Supergirl and the newest HBO Max originals, with five more apps in one package: HBO Max, Disney+ Hotstar, iQIYI, oneD and AIS PLAY.',
        art:{ img:SA + 'foryou-supergirl.png' }, pkg:1 },
      // AIS's own package art (store-assets/pkg/): each package once in a rail
      { badge:'Flash Sale', timer:43 * 3600 + 14 * 60 + 38, dark:1, t:'PLAY ASIAN PLUS', price:169, per:'Month', tags:['Monthly', 'Recurring', 'Flash Sale'],
        d:'iQIYI, Viu, WeTV and oneD in one package: Thai, Korean and Chinese series, from Khemjira to Against the Current.',
        art:{ img:PK + 'asian-plus.jpg' }, pkg:1 },
      { dark:1, t:'oneD PREMIUM Monthly', price:99, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Watch Raeng Ngao and every one31 drama before anyone else on oneD. 99 baht a month for AIS customers only (usually 149).',
        art:{ img:PK + 'oned-premium-monthly.jpg' }, pkg:1 },
      { dark:1, t:'oneD PREMIUM Yearly', price:999, per:'Year', tags:['Yearly', 'Recurring'],
        d:'A year of oneD PREMIUM for 999 baht (usually 1,490), for AIS customers only: one31 dramas first, ad-free.',
        art:{ img:PK + 'oned-premium-yearly.jpg' }, pkg:1 }],
    highlight:[
      // the shows each package brings (AIS's package art, store-assets/pkg/)
      { dark:1, t:'PLAY PREMIUM PLUS', price:299, per:'Month', tags:['Monthly', 'Recurring'],
        d:'The Lord of the Rings: The Rings of Power on Prime Video, with HBO Max, iQIYI, Viu and WeTV: five apps in one package.',
        art:{ img:PK + 'premium-plus-rings.jpg' }, hero:PK + 'premium-plus-rings-wide.jpg', wide:1, pkg:1 },   // hero: its 16:9 key art, across the screen
      { dark:1, t:'PLAY ULTIMATE', price:999, per:'Month', tags:['Monthly', 'Recurring'],
        d:'The Super Mario Galaxy Movie on HBO Max, Steps on Netflix and Moana on Disney+: all six apps in one package.',
        art:{ img:PK + 'ultimate-mario.jpg' }, pkg:1 },
      { dark:1, t:'PLAY PREMIUM PLUS', price:299, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Make Me Tingle on HBO Max, Final Table on Prime Video and One of a Kind Romance on Viu, in one package with iQIYI and WeTV.',
        art:{ img:PK + 'premium-plus-tingle.jpg' }, pkg:1 },
      { dark:1, t:'PLAY ULTIMATE', price:999, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Take Charge of My Heart on Netflix, Make Me Tingle on HBO Max and Merry Berry Love on Disney+: six apps, one price.',
        art:{ img:PK + 'ultimate-take-charge.jpg' }, pkg:1 },
      { dark:1, t:'PLAY ASIAN PLUS', price:169, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Khemjira Forever on iQIYI, with Viu, WeTV and oneD: four apps of Asian drama in one package.',
        art:{ img:PK + 'asian-plus-khemjira.jpg' }, pkg:1 },
      { dark:1, t:'PLAY ASIAN PLUS', price:169, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Raeng Ngao on oneD, with iQIYI, Viu and WeTV: four apps of Asian drama in one package.',
        art:{ img:PK + 'asian-plus-rang-ngao.jpg' }, pkg:1 }],
    sports:[
      { badge:'Recommend', t:'PLAY ALL', price:299, per:'Month', tags:['Monthly', 'Recurring', 'Recommend'],
        d:'All the sport on AIS PLAY in one package: Premier League, Bundesliga, Formula 1, NBA and the AIS PLAY Sports channels.',
        art:{ logo:SA + 'sports-playall.png' }, pkg:1 }
      // then one package of each league (packages.js): its disc | AIS PLAYBOX, as the Movies rail's OTT cards
      ].concat(['epl', 'ucl', 'nba', 'thai1', 'rws', 'bundesliga', 'motogp', 'pga'].map(function(k){ return Object.assign({}, PKG[k][0], { badge:null }); })),
    // Popular: one of each OTT, as the Figma's rail
    movies:[ NETFLIX_7D ].concat([PKG.disney[0], PKG.hbo[0], PKG.prime[0], PKG.viu[0], PKG.iqiyi[0], PKG.netflix[1], PKG.monomax[0]].map(function(p){
      return Object.assign({}, p, { badge:null }); })),   // (Recommend: the rail's first only)
    // Popular: both apps' packages, alternating, as the Movies rail (Recommend: the first only)
    short:[ PKG.reelshort[0] ].concat([PKG.dramabox[0], PKG.reelshort[1], PKG.dramabox[1], PKG.reelshort[2], PKG.dramabox[2]].map(function(p){
      return Object.assign({}, p, { badge:null }); })),
    value:[ph('Best Saver'), ph(), ph(), ph(), ph(), ph(), ph()]
  };
  var TABS = {
    sports:['Popular', 'Premier League', 'UEFA Champions League', 'NBA', 'Thai League', 'RWS', 'Bundesliga', 'MotoGP', 'PGA Tour'],
    movies:['Popular', 'Netflix', 'HBO Max', 'Disney+', 'iQIYI', 'Viu', 'MONOMAX'],
    short:['Popular', 'ReelShort', 'DramaBox'],
    value:['< 100 baht Enjoy Asia Movies & Shorts', '< 100 baht Sports Lover', '300 - 500 baht Enjoy Movies & Sports', 'Asian Games']
  };
  // the OTT tabs carry the project's own platform tag logos (Home's cards use the same ones)
  var TAB_LOGO = { 'Netflix':'badges/tag-netflix.png', 'HBO Max':'badges/tag-hbo.png', 'Disney+':'badges/tag-disney.png',
    'iQIYI':'partners/iqiyi.png', 'Viu':'badges/tag-viu.png', 'MONOMAX':'badges/tag-monomax.png',
    'ReelShort':'badges/tag-reelshort.png', 'DramaBox':'badges/tag-dramabox.png' };
  var EVENTS = [
    { kind:'vod', t:'Content Title', price:199 },
    { kind:'upcoming', t:'Content Title', price:199, when:'Today 20:30 PM' },
    { kind:'live', t:'Content Title', price:199, time:'20:00 – 22:15' },
    { kind:'vod', t:'Content Title', price:149 },
    { kind:'upcoming', t:'Content Title', price:249, when:'Tomorrow 19:00 PM' }
  ];
  var EVENT_SYN = 'Package Description Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed bibendum, ex id condimentum egestas, libero velit consectetur purus, ut tristique turpis elit eu diam. Curabitur lobortis ligula purus, sed molestie eros sagittis quis. Suspendisse potenti. Aenean';
  var RENTALS = [{ badge:'Recommend', price:199 }, { badge:'Best Seller', price:149 }, { price:99 }, { price:99 }, { price:129 }, { price:149 }, { price:99 }, { price:79 }, { price:99 }, { price:149 }, { price:199 }];
  var ONETIME = [NETFLIX_7D, ph(), ph(), ph(), ph(), ph(), ph(), ph()];
  var OTHERS = [
    { t:'Smart Soundbar', price:250, per:'Month', tags:['24 Months', 'Add-on'], art:{ img:SA + 'banner-soundbar.png', pos:'left center' },
      d:'An Android TV soundbar with Dolby Vision and Atmos, with HBO Max, karaoke and PLAY ALL included. 250 baht a month for 24 months.' },
    { t:'AIS Cloud PC', price:199, per:'Month', tags:['Monthly', 'Add-on'], art:{ img:SA + 'others-cloud-pc.png' },
      d:'A Windows PC in the cloud that you can open on your TV, laptop or phone.' },
    ph(), ph(), ph(), ph(), ph(), ph(), ph(), ph(), ph(), ph()];
  // the banner carousel's slides (the Smart Soundbar promotion, then wide pictures until the other promotions have art)
  var BANNERS = [{ t:'Smart Soundbar', img:SA + 'banner-soundbar.png', pkg:1 }, { t:'Miss Universe Thailand 2026', img:'posters/miss-universe.jpg' },
    { t:'Top Gun: Maverick', img:'posters/topgun-m.jpg', pos:'center 30%' }, { t:'F1', img:'posters/f1.jpg', pos:'center 30%' },
    { t:'Superman', img:'posters/superman.jpg', pos:'center 25%' }, { t:'Wicked', img:'posters/wicked.jpg', pos:'center 30%' },
    { t:'House of the Dragon', img:'posters/house-of-the-dragon.jpg', pos:'center 30%' }, { t:'Liverpool vs Brentford', img:'posters/liver-ben.jpg' }];
  var SHORTCUTS = [{ s:'3 Subscriptions', t:'My Subscription', ic:'icons/quick/subscription.svg' }, { s:'12 Questions', t:'FAQs', ic:'icons/quick/faqs.svg' },
                   { s:'Call or scan', t:'Customer Support', ic:SA + 'headset.svg' }];

  /* ---------- markup ---------- */
  var RATIO_SM = '<div class="ratio"><img src="sport-assets/ratio-icon.svg" alt=""><span>1:1</span></div>';
  function vat(p){ return (Math.round(p * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2 }); }
  function hms(s){ return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(function(n){ return (n < 10 ? '0' : '') + n; }).join(':'); }
  function badgeHtml(it){
    if(!it.badge) return '';
    return '<span class="bdg top-tag"' + (it.timer ? ' data-timer="' + it.timer + '"' : '') + '>' +
      esc(it.badge + (it.timer ? ' ' + hms(it.timer) : '')) + '</span>';
  }
  // a brand's logo: an OTT's picture, or a league's disc (leagues.js, league-disc.css)
  function ottLogo(o, cls){
    if(o.league) return '<span class="ldisc ' + (cls || '') + '">' + Leagues.pic(Leagues.list.filter(function(l){ return l.id === o.league; })[0]) + '</span>';
    return '<img class="' + (cls || '') + (o.tile ? ' tile' : '') + (o.icon ? ' icon' : '') + '" src="' + o.logo + '" alt="' + esc(o.n) + '">';
  }
  function sqPic(it){
    if(it.ott){ var o = OTT[it.ott];
      return '<div class="pic ott"><div class="lg">' + ottLogo(o) + '<i></i><img class="ais" src="' + SA + 'ott/ais-playbox.png" alt="AIS PLAYBOX"></div>' +
        '<div class="pr">' + it.price + '<i></i>' + it.card + '</div></div>'; }
    var a = it.art;
    if(!a) return '<div class="pic ph-bg">' + RATIO_SM + '</div>';
    if(a.logo) return '<div class="pic black contain" style="background-image:url(\'' + a.logo + '\')">' +
      (a.price ? '<img src="' + a.price.img + '" alt="" style="' + a.price.at + '">' : '') + '</div>';
    if(a.crop) return '<div class="pic ph-bg"><img src="' + a.img + '" alt="" style="' + a.crop + '"></div>';
    return '<div class="pic" style="background-image:url(\'' + a.img + '\')' + (a.pos ? ';background-position:' + a.pos : '') + '"></div>';
  }
  function sqCard(it, set, i){
    var ring = it.art ? (it.art.logo ? 'url(\'' + it.art.logo + '\')' : null) : '';
    return '<div class="sq item"' + attrs({ kind:'pkg', set:set, i:i, 'ring-art':ring }) + '>' + sqPic(it) + badgeHtml(it) + '</div>';
  }
  function viewAll(set){ return '<div class="viewall tv-chip item"' + attrs({ kind:'viewall', set:set }) + ' data-ring-art=""><b>View All</b></div>'; }
  function cardsHtml(key, list, more){ return list.map(function(it, i){ return sqCard(it, key, i); }).join('') + (more ? viewAll(key) : ''); }
  // Popular (the first): its name only, no icon; the others: their OTT's tag, else the league's disc, as Sport's
  // League & Tournament (leagues.js; one with no logo yet: its initials)
  function chipHtml(t, i){
    return '<div class="chip item' + (i ? '' : ' on txt') + '"' + attrs({ kind:'tab', i:i }) + ' data-ring-art="">' +
      (TAB_LOGO[t] ? '<img class="ott" src="' + TAB_LOGO[t] + '" alt="">' : i ? '<span class="lgdisc">' + Leagues.pic(Leagues.find(t) || { t:t }) + '</span>' : '') + esc(t) + '</div>';
  }
  function eventCard(e, i){
    var tall = '<div class="xc-portrait ph-bg"><div class="ratio big huge"><img src="' + SA + 'image-icon-60.svg" alt=""><span>2:3</span></div></div>';
    var wide = '<div class="xc-wide ph-bg"><div class="ratio row huge"><img src="' + SA + 'image-icon-46.svg" alt=""><span>16:9</span></div></div>';
    var live = e.kind === 'live';
    var open = '<div class="xcard item' + (live ? ' xc-ribbon' : '') + '"' + attrs({ kind:'event', i:i }) + ' data-ring-art="">';
    if(!e.kind) return open + tall + wide + '</div>';
    var top = e.kind === 'upcoming' ? '<span class="top-tag ev-top">' + esc(e.when) + '</span>' : '';
    var meta = e.kind === 'vod'
      ? '<span class="ptag ais" aria-label="AIS PLAY"></span><strong>Genres · Genres</strong><span>2026</span><span>2h 15m</span><span class="pill sm">16+</span><span class="pill sm">HD</span>'
      : '<span class="b"><img src="sport-assets/crown.svg" alt="">Premium</span><span class="logo"></span><span>Channel 111: AISPLAY 111</span>' +
        (e.time ? '<span class="pill">' + e.time + '</span>' : '') + '<span class="pill sm">HD</span>';
    return open + tall + wide + '<div class="xc-scrim ev-scrim"></div>' + top +
      '<div class="xc-content ev-info"><h3>' + esc(e.t) + '</h3><div class="cost"><b>' + e.price + ' baht</b><span>(VAT Included: ' + vat(e.price) + ' baht)</span></div>' +
        '<div class="meta">' + meta + '</div><p class="syn">' + EVENT_SYN + '</p></div>' +
      (live ? '<span class="live-ribbon" data-ring-top="styled">Live</span>' : '') + '</div>';   // live: Home's Live ribbon (live-ribbon.css)
  }
  function posterCard(p, set, i){
    return '<div class="pst item"' + attrs({ kind:set, i:i }) + '><div class="pic ph-bg"><div class="ratio big"><img src="' + SA + 'ratio-icon-36.svg" alt=""><span>2:3</span></div></div>' +
      badgeHtml(p) + '</div>';
  }
  function railSec(key, title, inner, cls){
    return '<section class="sec' + (cls ? ' ' + cls : '') + '" data-sec="' + key + '"><h2 class="sec-title">' + title + '</h2><div class="rail"><div class="track">' + inner + '</div></div></section>';
  }
  function catSec(key, title, more){
    return '<section class="sec cat" data-sec="' + key + '"><h2 class="sec-title">' + title + '</h2>' +
      '<div class="tabs" data-row="' + key + '-tabs">' + TABS[key].map(chipHtml).join('') + '</div>' +
      '<div class="rail"><div class="track" data-row="' + key + '">' + cardsHtml(key, ROWS[key], more) + '</div></div></section>';
  }
  var html = '';
  html += railSec('foryou', 'For You', cardsHtml('foryou', ROWS.foryou, true));
  html += '<section class="sec gene" data-sec="highlight"><h2 class="sec-title">Highlight you shouldn’t misss</h2><div class="rail"><div class="track">' + cardsHtml('highlight', ROWS.highlight) + '</div></div></section>';
  html += catSec('sports', 'Sports', true);
  html += catSec('movies', 'Movies', true);
  html += catSec('short', 'Short Series');
  html += catSec('value', 'Great Value');
  html += railSec('event', 'PPV Event', EVENTS.map(eventCard).join(''));
  html += railSec('rent', 'Rent or Buy', RENTALS.map(function(p, i){ return posterCard(p, 'rent', i); }).join('') + viewAll('rent'), 'rent');
  html += railSec('onetime', 'One Time Package', cardsHtml('onetime', ONETIME));
  html += railSec('others', 'Others', cardsHtml('others', OTHERS));
  html += '<section class="sec" data-sec="banner"><div class="banner item" data-kind="banner" data-label="Smart Soundbar"><div class="slides">' +
    BANNERS.map(function(b){ return '<div class="slide" style="background-image:url(\'' + b.img + '\')' + (b.pos ? ';background-position:' + b.pos : '') + '"></div>'; }).join('') + '</div>' +
    '<div class="carr tv-chip l"><img src="' + SA + 'carousel-arrow-left.svg" alt=""></div><div class="carr tv-chip r"><img src="' + SA + 'carousel-arrow-right.svg" alt=""></div>' +
    '<div class="dots">' + BANNERS.map(function(_, i){ return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div></div></section>';
  html += '<section class="sec" data-sec="shortcuts"><div class="shorts">' + SHORTCUTS.map(function(s, i){
    return '<div class="quick-card tv-chip item"' + attrs({ kind:'shortcut', i:i, label:s.t }) + ' data-ring-art=""><span class="qc-sub">' + esc(s.s) + '</span>' +
      '<span class="qc-name"><img src="' + s.ic + '" alt="">' + esc(s.t) + '</span></div>';
  }).join('') + '</div></section>';
  html += '<section class="sec totop" data-sec="totop"><div class="btn item" data-kind="totop" data-ring-art=""><img src="' + SA + 'arrow-up.svg" alt="">Back to Top</div></section>';
  var page = document.getElementById('page');
  page.innerHTML = html;

  /* ---------- focus rows: the top bar, then each rail (a tab bar is a row of its own; each question is one) ---------- */
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  var secs = $('.sec', page);
  var rows = [{ items:$('.topnav .item') }];
  secs.forEach(function(s){
    var key = s.dataset.sec;
    if(s.classList.contains('cat')){
      rows.push({ sec:s, key:key + '-tabs', set:key, tabs:1, items:$('.chip', s) });
      rows.push({ sec:s, key:key, set:key, items:$('.track .item', s) });
    } else rows.push({ sec:s, key:key, set:key, items:$('.item', s) });
  });
  var R = {}; rows.forEach(function(r, i){ if(r.key) R[r.key] = i; });
  var NAV_STORE = rows[0].items.indexOf(document.querySelector('.navtab.active'));
  var cur = { row:R.foryou, col:rows.map(function(){ return 0; }), tab:{ sports:0, movies:0, short:0, value:0 }, from:0 };
  cur.col[0] = NAV_STORE;
  var DYNAMIC_END = R.value;   // For You to Great Value keep the hero (dynamic background)
  var HERO_Y = 600, STATIC_Y = 200;

  // ---- the hero speaks for the focused package ----
  var heroEl = document.querySelector('.hero'), heroBg = document.querySelector('.hero-bg'), heroKey = '';
  var arts = $('.hero-bg .art'), artFront = 0, artCur = null;
  function setArt(src){
    heroBg.classList.toggle('has-art', !!src);
    if((src || null) === artCur) return;
    artCur = src || null;
    arts[artFront].classList.remove('on');
    artFront = 1 - artFront;
    if(src){ arts[artFront].style.backgroundImage = 'url(\'' + src + '\')'; arts[artFront].classList.add('on'); }
  }
  // the list a tab bar is showing: the picked tab's packages (Recommend), Figma's placeholders on the others
  function listOf(set){
    if(cur.tab[set] === undefined || !cur.tab[set]) return ROWS[set];
    if(set === 'movies' || set === 'sports' || set === 'short') return PKG[TAB_OTT[TABS[set][cur.tab[set]]]];   // an OTT's or a league's tab: its own packages
    return ROWS[set].map(function(_, i){ return ph(i ? null : 'Recommend'); });
  }
  function paintHero(r){
    var set = r.set, cards = rows[R[set]];
    var it = listOf(set)[cur.col[R[set]]];   // a tab bar shows the package its rail is on
    if(!it || cards.items[cur.col[R[set]]].dataset.kind === 'viewall') it = listOf(set)[0];
    var key = it.t + it.price + it.per + (it.d || '');
    if(key !== heroKey){
      heroKey = key;
      heroEl.querySelector('.tags').innerHTML = it.tags.map(function(t){ return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      heroEl.querySelector('h1').textContent = it.t;
      heroEl.querySelector('.price b').textContent = it.price + ' baht / ' + it.per;
      heroEl.querySelector('.price span').textContent = '(VAT Included: ' + vat(it.price) + ' baht)';
      heroEl.querySelector('.desc').textContent = it.d;
      heroEl.classList.remove('swap'); void heroEl.offsetWidth; heroEl.classList.add('swap');
    }
    // an OTT package: its brand over the screen, its logos and price on the right (no picture of its own)
    var o = it.ott && OTT[it.ott];
    // a package whose card is its logo on black (PLAY ALL): the same place and look, its logo where an OTT's pair stands
    var lg = !o && it.art && it.art.logo && !it.art.price;
    heroBg.classList.toggle('ott', !!(o || lg));
    if(lg){
      heroBg.querySelector('.brand').style.background = it.brand || 'linear-gradient(118.51deg, rgba(120,200,60,.35) 1%, rgba(150,40,200,.35) 60%, rgba(0,0,0,.4) 99.61%), #101010';
      var lh = heroBg.querySelector('.ott-hero'), lk = it.t + it.price;
      if(lh.dataset.k !== lk){ lh.dataset.k = lk;
        lh.innerHTML = '<div class="logos"><img class="solo" src="' + it.art.logo + '" alt="' + esc(it.t) + '"></div>' +
          '<div class="pr">' + it.price + '<i></i>' + (it.per === 'Month' ? 'Month' : it.per) + '</div>'; }
    }
    if(o){
      heroBg.querySelector('.brand').style.background = o.bg;
      var oh = heroBg.querySelector('.ott-hero'), ok = it.ott + it.price + it.card;
      if(oh.dataset.k !== ok){ oh.dataset.k = ok;
        oh.innerHTML = '<div class="logos">' + ottLogo(o) + '<i></i><img class="ais" src="' + SA + 'ott/ais-playbox.png" alt="AIS PLAYBOX"></div>' +
          '<div class="pr">' + it.price + '<i></i>' + it.card + '</div>'; }
    }
    heroBg.classList.toggle('wide', !!it.wide);
    setArt(o || lg ? null : it.hero || (it.art && it.art.img) || null);
  }

  // ---- keep the focused item in view ----
  // Sideways (Home's "fixed focus"): the focused item sits in the first item's slot and the rail slides under it,
  // until the rail's end is in. Every item before the chosen one is at its resting size, so the slot is a sum.
  function slide(r, el){
    if(!r.set || r.key === 'banner' || r.key === 'shortcuts' || r.key === 'totop') return;
    var track = el.parentElement, i = r.items.indexOf(el), want = 0;
    for(var k = 0; k < i; k++) want += r.items[k].offsetWidth + 32;   // tabs and cards both 32px apart
    want += parseFloat(getComputedStyle(el).marginLeft) || 0;   // an opened PPV Event card's room on its left (expand-card.css)
    var max = Math.max(0, track.scrollWidth - 1920);
    track.style.transform = 'translateX(' + -Math.max(0, Math.min(want, max)) + 'px)';
  }
  // the hero text ends 80px above the focused rail's first line (its title, else its tabs or cards), as on the other pages
  var HERO_GAP = 80, pageY = 0;
  function placeHero(r){
    var y = 0, e = r.sec.querySelector('.sec-title, .item');
    while(e && e !== r.sec){ y += e.offsetTop; e = e.offsetParent; }
    heroEl.style.bottom = 1080 - (r.sec.offsetTop + y - pageY - HERO_GAP) + 'px';
  }
  function pageTop(el){ var y = 0; while(el && el !== page){ y += el.offsetTop; el = el.offsetParent; } return y; }
  function cardsOf(sec){ return sec.querySelector('.track .item'); }
  // Highlight's gap: its cards' bottom to the screen's bottom with the section at HERO_Y (the reference for every rail)
  var GAP = null;
  function cardGap(){
    if(GAP === null){ var hs = page.querySelector('[data-sec="highlight"]'), hc = hs && cardsOf(hs);
      GAP = hc ? 1080 - (pageTop(hc) + hc.offsetHeight - (hs.offsetTop - HERO_Y)) : 120; }
    return GAP;
  }
  function layout(ri){
    var r = rows[ri], top = r.sec.offsetTop, y;
    // a rail under the hero: its cards end as far from the screen's bottom as Highlight's do (CARD_GAP)
    if(ri <= DYNAMIC_END){ var c = cardsOf(r.sec); y = c ? pageTop(c) + c.offsetHeight - (1080 - cardGap()) : top - HERO_Y; }
    else {
      y = Math.min(top - STATIC_Y, page.offsetHeight - 1080);
    }
    pageY = ri <= DYNAMIC_END ? y : Math.max(0, y);   // (For You, the first rail, sits lower than the page's top allows: the page moves down)
    page.style.transform = 'translateY(' + -pageY + 'px)';
    secs.forEach(function(s){ s.classList.toggle('above', s.offsetTop < r.sec.offsetTop); });
    document.body.classList.toggle('static', ri > DYNAMIC_END);
  }

  // the profile panel under the top bar's photo, as on Home (profile-panel.js)
  var profileEl = document.querySelector('.topnav .profile'), prof = ProfilePanel(profileEl, { paint:paint, toast:toast });

  function paint(){
    var inProf = prof.paint(cur.row === 0 && rows[0].items[cur.col[0]] === profileEl);   // focus is in the profile panel
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){ el.classList.toggle('focused', !inProf && ri === cur.row && ci === cur.col[ri]); }); });
    // top-bar tab states (button-theme.css): the current page's tab is Active while the D-pad is on the bar, Active dim in the content
    var curTab = document.querySelector('.topnav .navtab.active, .topnav .navtab.active-dim');
    curTab.classList.toggle('active', cur.row === 0); curTab.classList.toggle('active-dim', cur.row !== 0);
    // tab bars: the picked tab is Active while its bar has focus, Active dim otherwise
    rows.forEach(function(r, ri){ if(r.tabs) r.items.forEach(function(el){ el.classList.toggle('active-dim', el.classList.contains('on') && ri !== cur.row); }); });
    var ri = cur.row === 0 ? cur.from : cur.row;   // on the top bar the page stays as it was
    document.body.classList.toggle('on-nav', cur.row === 0);
    // the top bar, as Home's: gone once focus is past the first rail, back as an overlay (with its scrim) while it has focus
    document.body.classList.toggle('past-first', ri > R.foryou);
    layout(ri);
    var r = rows[ri];
    if(cur.row) slide(r, r.items[cur.col[ri]]);
    if(ri <= DYNAMIC_END){ paintHero(r); placeHero(r); }
    try { sessionStorage.setItem('storeFocus', JSON.stringify(cur)); } catch(e){}
  }

  // a tab picked: its packages in the rail, focus back on the rail's first slot
  function pickTab(set, i){
    if(cur.tab[set] === i) return;
    cur.tab[set] = i;
    var tr = rows[R[set + '-tabs']];
    tr.items.forEach(function(c, ci){ c.classList.toggle('on', ci === i); });
    var track = rows[R[set]].sec.querySelector('.track');
    track.innerHTML = cardsHtml(set, listOf(set), set !== 'short' && set !== 'value');
    track.style.transform = '';
    rows[R[set]].items = $('.item', track);
    rows[R[set]].items.forEach(bindClick(R[set]));
    cur.col[R[set]] = 0;
  }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  // leaving for the package page: its Back lands on the same card here
  function leave(url){ try { sessionStorage.setItem('storeReturn', '1'); } catch(e){} location.href = url; }
  function select(el){
    var k = el.dataset.kind, i = +el.dataset.i;
    el.animate([{ transform:getComputedStyle(el).transform }, { transform:(getComputedStyle(el).transform === 'none' ? '' : getComputedStyle(el).transform + ' ') + 'scale(0.97)' }], { duration:140, easing:'ease-out' });
    if(el.dataset.href){ location.href = el.dataset.href; return; }
    if(el === profileEl) return;   // its panel is already open under it
    if(k === 'pkg'){
      var set = el.dataset.set, it = (set === 'onetime' ? ONETIME : set === 'others' ? OTHERS : listOf(set))[i];
      // an OTT package: Package Detail for it (packages.js), its own price picked
      if(it.ott){ leave('package-detail.html?ott=' + it.ott + '&p=' + PKG[it.ott].map(function(p){ return p.t; }).indexOf(it.t)); return; }
      if(it.pkg) leave('package-detail.html'); else toast(it.t + ' (demo)');
      return;
    }
    if(k === 'tab') return;
    // View All: the All Packages page, on the matching tab (For You, Sports, Movies, Short Drama)
    if(k === 'viewall'){ var tab = { sports:'sports', movies:'movies', short:'shorts' }[el.dataset.set]; leave('all-packages.html' + (tab ? '?tab=' + tab : '')); return; }
    // an event or a rental opens its detail page (content.js) with its price, so Buy works there; a live event still plays live
    // a PPV event (every one premium, a live one too): its detail page, bought there (purchase.html)
    var ci = k === 'event' ? { t:EVENTS[i].t, img:'', ppv:1, g:['Event'] } : k === 'rent' && Content.info(el);
    if(ci){   // the cards are placeholders still: a title and synopsis of their own, until their art arrives
      ci.price = (k === 'event' ? EVENTS : RENTALS)[i].price;
      ci.t = k === 'event' ? EVENTS[i].t + ' ' + (i + 1) : 'Rent or Buy ' + (i + 1);
      ci.d = k === 'event' ? EVENT_SYN : 'Rent it for 48 hours, or buy it to keep.';
      leave(Content.detailUrl(ci)); return;
    }
    if(k === 'event'){ var e = EVENTS[i]; toast(e.kind === 'live' ? 'Buy this event to watch it live (demo)' : e.kind === 'upcoming' ? 'Buy now and watch at ' + e.when.replace('Today ', '') + ' (demo)' : e.kind ? 'Buy this event (demo)' : 'Event (demo)'); return; }
    if(k === 'rent'){ toast('Rent or buy from ' + RENTALS[i].price + ' baht (demo)'); return; }
    if(k === 'banner'){ if(BANNERS[bannerAt].pkg) leave('package-detail.html'); else toast(BANNERS[bannerAt].t + ' (demo)'); return; }
    if(k === 'totop'){ cur.row = R.foryou; cur.col[R.foryou] = 0; return; }
    toast((el.dataset.label || 'Selected') + ' (demo)');
  }
  function back(){
    if(cur.row > R.foryou){ cur.row = R.foryou; paint(); return; }
    try { if(document.referrer && /(home|sport)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    var r = rows[cur.row], n = r.items.length, c = cur.col[cur.row], handled = true;
    // the banner: Left / Right move the carousel (Up / Down leave it)
    if(r.key === 'banner' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')){ e.preventDefault(); goSlide(bannerAt + (e.key === 'ArrowRight' ? 1 : -1), e.key === 'ArrowRight' ? 'r' : 'l'); return; }
    if(e.key === 'ArrowRight') cur.col[cur.row] = Math.min(n - 1, c + 1);
    else if(e.key === 'ArrowLeft'){
      // Left on a rail's first item goes up to the top bar (its Store tab), as on Home
      if(cur.row > 0 && c === 0){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_STORE; }
      else cur.col[cur.row] = Math.max(0, c - 1);
    }
    else if(e.key === 'ArrowUp'){
      if(cur.row === R.foryou){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_STORE; }
      else if(cur.row > 0) cur.row--;
    }
    else if(e.key === 'ArrowDown'){
      if(cur.row === 0) cur.row = cur.from || R.foryou;
      else cur.row = Math.min(rows.length - 1, cur.row + 1);
      // a rail with a tab bar: Down lands on its cards (Up from the cards reaches the tabs)
      if(rows[cur.row].tabs && rows[cur.row + 1]) cur.row++;
    }
    else if(e.key === 'Enter') select(r.items[c]);
    else if(e.key === 'Escape' || e.key === 'Backspace'){ back(); e.preventDefault(); return; }
    else handled = false;
    if(!handled) return;
    e.preventDefault();
    // a tab bar picks the tab it lands on
    if(rows[cur.row].tabs) pickTab(rows[cur.row].set, cur.col[cur.row]);
    paint();
  });
  function bindClick(ri){
    return function(el, ci){
      el.addEventListener('click', function(){
        ci = rows[ri].items.indexOf(el);
        if(ri === 0) cur.from = cur.row || cur.from;
        cur.row = ri; cur.col[ri] = ci;
        if(rows[ri].tabs) pickTab(rows[ri].set, ci);
        paint(); select(el); paint();
      });
    };
  }
  rows.forEach(function(r, ri){ r.items.forEach(bindClick(ri)); });

  // ---- the banner carousel: one bannerAt at a time, wrapping round; it moves on by itself every 6s ----
  var bannerAt = 0, bannerEl = document.querySelector('.banner'), slidesEl = bannerEl.querySelector('.slides');
  var bannerDots = $('.dots i', bannerEl), slideT;
  function goSlide(i, side){
    bannerAt = (i + BANNERS.length) % BANNERS.length;
    slidesEl.style.transform = 'translateX(' + (-bannerAt * 1700) + 'px)';
    bannerDots.forEach(function(d, di){ d.classList.toggle('on', di === bannerAt); });
    bannerEl.dataset.label = BANNERS[bannerAt].t;
    if(side){ var a = bannerEl.querySelector('.carr.' + side); a.classList.add('press'); setTimeout(function(){ a.classList.remove('press'); }, 180); }
    clearInterval(slideT); slideT = setInterval(function(){ goSlide(bannerAt + 1); }, 6000);
  }
  goSlide(0);
  bannerEl.querySelector('.carr.l').addEventListener('click', function(e){ e.stopPropagation(); goSlide(bannerAt - 1, 'l'); });
  bannerEl.querySelector('.carr.r').addEventListener('click', function(e){ e.stopPropagation(); goSlide(bannerAt + 1, 'r'); });

  // Flash Sale countdowns
  setInterval(function(){
    $('[data-timer]', page).forEach(function(b){
      var s = Math.max(0, +b.dataset.timer - 1);
      b.dataset.timer = s;
      b.textContent = 'Flash Sale ' + hms(s);
    });
    ROWS.foryou.forEach(function(it){ if(it.timer) it.timer = Math.max(0, it.timer - 1); });
  }, 1000);

  // coming back (Back from the package page): the same card again
  try {
    var saved = sessionStorage.getItem('storeReturn') && JSON.parse(sessionStorage.getItem('storeFocus') || 'null');
    sessionStorage.removeItem('storeReturn');
    if(saved && saved.col && saved.col.length === rows.length && saved.tab){
      Object.keys(saved.tab).forEach(function(set){ pickTab(set, saved.tab[set]); });
      cur.col = saved.col; cur.row = saved.row; cur.from = saved.from;
      if(cur.row === 0) cur.row = cur.from || R.foryou;
    }
  } catch(e){}
  if(!cur.from) cur.from = R.foryou;
  page.style.transition = 'none';
  paint();
  // fonts change the rows' heights: lay out again once they are in, then let the page glide
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ paint(); requestAnimationFrame(function(){ page.style.transition = ''; }); });
})();
