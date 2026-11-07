
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o){ return Object.keys(o).filter(function(k){ return o[k] != null; }).map(function(k){ return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }

  /* ---------- content ----------
     Every card is real: the packages (packages.js), the events and titles (content.js MD.M) and AIS's own art (store-assets/). */
  var SA = 'store-assets/';
  // art: how the card shows its picture; hero: the picture behind the hero (a logo on black keeps Figma's placeholder hero)
  var ULTIMATE = { badge:'Recommended', dark:1, t:'PLAY ULTIMATE', price:999, per:'Month', tags:['Monthly', 'Recurring', 'Recommended'],
    d:'HBO Max, Prime Video, Viu, iQIYI and WeTV in one package, with AIS PLAY Premium channels and live sports. Watch on your TV, phone and tablet.',
    art:{ img:SA + 'foryou-play-ultimate.webp' }, hero:SA + 'hero-play-ultimate.webp', wide:1, pkg:1 };   // hero: its 16:9 key art, across the screen
  // PLAY ALL: For You's Best Seller, the Sports rail's first card (Recommended) and Great Value's Asian Games
  var PLAY_ALL = { badge:'Best Seller', dark:1, t:'PLAY ALL', price:1999, per:'Year', tags:['Annual', 'Recurring', 'Best Seller'],
    d:'Every big league live in one package: the Champions League, Europa League, Conference League, Bundesliga, NBA, NFL, MotoGP, LPGA, ATP Masters 1000 and RWS.',
    art:{ img:SA + 'foryou-play-all.webp' }, hero:SA + 'hero-play-all.webp', wide:1, pkg:1 };
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
      PLAY_ALL,
      { badge:'New Release', dark:1, t:'PLAY PREMIUM PLUS Monthly', price:299, per:'Month', tags:['Monthly', 'Recurring', 'New Release'],
        d:'Supergirl from DC Studios and the newest originals: HBO Max, Prime Video, iQIYI, Viu and WeTV in one package on AIS PLAYBOX.',
        art:{ img:SA + 'foryou-supergirl.webp' }, hero:SA + 'hero-supergirl.webp', wide:1, pkg:1 },
      // AIS's own package art (store-assets/): each package once in a rail
      { badge:'Flash Sale', timer:43 * 3600 + 14 * 60 + 38, dark:1, t:'PLAY PREMIUM PLUS Annual', price:2990, per:'Year', tags:['Annual', 'Recurring', 'Flash Sale'],
        d:'A full year of HBO Max, Prime Video, iQIYI, Viu and WeTV for the price of 10 months, with The Rings of Power on Prime Video.',
        art:{ img:SA + 'foryou-premium-plus-annual.webp' }, hero:SA + 'hero-premium-plus-annual.webp', wide:1, pkg:1 },
      { dark:1, t:'PLAY ASIAN PLUS Monthly', price:169, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Viu, iQIYI, WeTV and oneD in one package: Thai, Korean and Chinese series, from Raeng Ngao to every new one31 drama.',
        art:{ img:SA + 'foryou-asian-plus.webp' }, hero:SA + 'hero-asian-plus.webp', wide:1, pkg:1 },
      { dark:1, t:'PLAY ASIAN PLUS Annual', price:1690, per:'Year', tags:['Annual', 'Recurring'],
        d:'A full year of Viu, iQIYI, WeTV and oneD for the price of 10 months: Thai, Korean and Chinese series, new episodes every week.',
        art:{ img:SA + 'foryou-asian-plus-annual.webp' }, hero:SA + 'hero-asian-plus-annual.webp', wide:1, pkg:1 }],
    highlight:[
      // the shows each package brings (AIS's package art, store-assets/)
      { dark:1, t:'PLAY INTER', price:199, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Disney, Pixar, Marvel and Star Wars in one package: Encanto, Turning Red, Moana, Frozen II, Loki, Ms. Marvel and Obi-Wan Kenobi.',
        art:{ img:SA + 'highlight-play-inter.webp' }, hero:SA + 'hero-play-inter.webp', wide:1, pkg:1 },   // hero: its 16:9 key art, across the screen
      { dark:1, t:'PLAY Disney+', price:289, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Disney+ Hotstar in 4K on four screens: Cars, Moana, Finding Nemo, The Lion King and every Disney and Pixar classic, billed to your AIS account.',
        art:{ img:SA + 'highlight-play-disney.webp' }, hero:SA + 'hero-play-disney.webp', wide:1, pkg:1 },
      { dark:1, t:'PLAY PREMIUM', price:199, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Superman from DC Studios and the newest Hollywood hits on HBO Max, with the AIS PLAY Premium channels, on your TV, phone and tablet.',
        art:{ img:SA + 'highlight-play-premium.webp' }, hero:SA + 'hero-play-premium.webp', wide:1, pkg:1 },
      { dark:1, t:'PLAY FAMILY', price:249, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Movies the whole family can watch together, from holiday favorites like The Family Man with Nicolas Cage and Téa Leoni to new family films every month.',
        art:{ img:SA + 'highlight-play-family.webp' }, hero:SA + 'hero-play-family.webp', wide:1, pkg:1 },
      { dark:1, t:'PLAY ShortMax', price:99, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Every short drama on ShortMax, from palace romances to revenge stories, with new episodes every day in a minute or two each.',
        art:{ img:SA + 'highlight-play-shortmax.webp' }, hero:SA + 'hero-play-shortmax.webp', wide:1, pkg:1 },
      { dark:1, t:'Good TV', price:59, per:'Month', tags:['Monthly', 'Recurring'],
        d:'Documentaries and feel-good stories from Good TV, with Next Step and Sarakadee Lok: real people, new ideas and the world around us.',
        art:{ img:SA + 'highlight-good-tv.webp' }, hero:SA + 'hero-good-tv.webp', wide:1, pkg:1 }],
    sports:[
      Object.assign({}, PLAY_ALL, { badge:'Recommended', tags:['Annual', 'Recurring', 'Recommended'] })
      // then one package of each league (packages.js): its disc | AIS PLAYBOX, as the Movies rail's OTT cards
      ].concat(['epl', 'ucl', 'nba', 'thai1', 'rws', 'bundesliga', 'motogp', 'pga'].map(function(k){ return Object.assign({}, PKG[k][0], { badge:null }); })),
    // Popular: one of each OTT, as the Figma's rail
    movies:[ NETFLIX_7D ].concat([PKG.disney[0], PKG.hbo[0], PKG.prime[0], PKG.viu[0], PKG.iqiyi[0], PKG.netflix[1], PKG.monomax[0]].map(function(p){
      return Object.assign({}, p, { badge:null }); })),   // (Recommend: the rail's first only)
    // Popular: both apps' packages, alternating, as the Movies rail (Recommend: the first only)
    short:[ PKG.reelshort[0] ].concat([PKG.dramabox[0], PKG.reelshort[1], PKG.dramabox[1], PKG.reelshort[2], PKG.dramabox[2]].map(function(p){
      return Object.assign({}, p, { badge:null }); })),
    value:null   // Great Value: its first tab's (VALUE below)
  };
  var TABS = {
    sports:['Popular', 'Premier League', 'UEFA Champions League', 'NBA', 'Thai League', 'RWS', 'Bundesliga', 'MotoGP', 'PGA Tour'],
    movies:['Popular', 'Netflix', 'HBO Max', 'Disney+', 'iQIYI', 'Viu', 'MONOMAX'],
    short:['Popular', 'ReelShort', 'DramaBox'],
    value:['< 100 baht Enjoy Asian Movies & Shorts', '< 100 baht Sports Lover', '300 - 500 baht Enjoy Movies & Sports', 'Asian Games']
  };
  // the OTT tabs carry the project's own platform tag logos (Home's cards use the same ones)
  var TAB_LOGO = { 'Netflix':'badges/tag-netflix.png', 'HBO Max':'badges/tag-hbo.png', 'Disney+':'badges/tag-disney.png',
    'iQIYI':'partners/iqiyi.png', 'Viu':'badges/tag-viu.png', 'MONOMAX':'badges/tag-monomax.png',
    'ReelShort':'badges/tag-reelshort.png', 'DramaBox':'badges/tag-dramabox.png' };
  // Great Value: each tab's packages (packages.js), cheapest first; its first card carries the tab's badge
  function allPkgs(){ var a = []; Object.keys(PKG).forEach(function(k){ a = a.concat(PKG[k]); }); return a; }
  function pick(test, badge){
    return allPkgs().filter(test).sort(function(a, b){ return a.price - b.price; })
      .map(function(p, i){ return Object.assign({}, p, { badge:i ? null : badge }); });
  }
  var ASIA = ['iqiyi', 'viu', 'monomax', 'disney', 'reelshort', 'dramabox'], LEAGUE = function(p){ return !!OTT[p.ott].league; };
  var VALUE = [
    pick(function(p){ return p.price < 100 && ASIA.indexOf(p.ott) >= 0; }, 'Best Saver'),                 // < 100 baht Enjoy Asian Movies & Shorts
    pick(function(p){ return p.price < 100 && LEAGUE(p); }, 'Best Saver'),                               // < 100 baht Sports Lover
    pick(function(p){ return p.price >= 300 && p.price <= 500; }, 'Recommended'),                          // 300 - 500 baht Enjoy Movies & Sports
    [ ROWS.sports[0] ]
      .concat(pick(function(p){ return LEAGUE(p) && p.card === 'Month'; }))                              // Asian Games: PLAY ALL, then the leagues
  ];
  ROWS.value = VALUE[0];
  // PPV Event: AIS PLAY's own events (content.js MD.M: its words, pictures and price), as Home's AIS PLAY Exclusive rail,
  // each with its badge
  var EVENTS = [{ k:'assanee', badge:'New Arrival', ppos:'88% center' }, { k:'missuni', badge:'#1 in Thailand', ppos:'90% center' },
    { k:'sophomores', badge:'Rerun' }, { k:'bossckm', badge:'New Arrival' }];
  // Rent or Buy: content.js's list (its badges), then the titles sold on their own only (MD OFFERS pkg 0)
  // a title with only a 16:9 picture: where its people stand (the 2:3 card shows 37.5% of its width)
  var RENT_POS = { superman:'87% center' };
  var RENTALS = MD.RENT.map(function(r){ return { k:r.k, badge:r.b }; })
    .concat(['superman', 'debt', 'medium', 'khemjira'].map(function(k){ return { k:k, ppos:RENT_POS[k] }; }));
  // One Time Package: every 7-day pass, charged once (packages.js), Netflix's first
  var ONETIME = [NETFLIX_7D].concat(pick(function(p){ return p.card === '7 Days' && p !== NETFLIX_7D; }));
  // Others: the add-ons, then AIS's offers with their own art (go: the package it opens)
  var OTHERS = [   // AIS's mobile offers (their own square art); shown only, Enter does nothing (still:1)
    { t:'AIS 5G MAX Experience', price:599, per:'Month', tags:['Monthly', '5G', 'Postpaid'], art:{ img:SA + 'others-5g-max-experience.webp' }, still:1,
      d:'Calls, 5G data and entertainment in one plan, with HBO Max, Prime Video, iQIYI, Viu and WeTV. A new lucky number gets 9GB and 99 minutes free every month for 9 months.' },
    { t:'The One SIM', price:50, per:'SIM', tags:['Prepaid', '5G', 'New SIM'], art:{ img:SA + 'others-the-one-sim.webp' }, still:1,
      d:'A 1-2-Call 5G SIM with 2GB of 5G data the day you open it. Top up 150 baht to get 1GB more 5G data, data for YouTube and TikTok, and free AIS Super WiFi.' },
    { t:'AIS 5G TikTok Shop', price:749, per:'Month', tags:['Monthly', '5G', 'Seller'], art:{ img:SA + 'others-5g-tiktok-shop.webp' }, still:1,
      d:'For live sellers: faster live uploads, SlipOK free for 3 months, MyOrder free for 12 months and FlowAccount free for 2 months.' },
    { t:'AIS 5G Seller', price:699, per:'Month', tags:['Monthly', '5G', 'Seller'], art:{ img:SA + 'others-5g-seller.webp' }, still:1,
      d:'Every tool an online shop needs: SlipOK checks slips in 1 second, MyOrder brings chats and shipping together, and FlowAccount does the books.' },
    { t:'Fam Save', price:299, per:'Month', tags:['Monthly', '5G', 'Family'], art:{ img:SA + 'others-fam-save.webp' }, still:1,
      d:'Add a family number for 299 baht a month (usually 399): 20GB at full speed and 100 minutes of calls, with AIS Secure Net free for 12 months.' },
    { t:'AIS ZEED Movie Lover', price:199, per:'Month', tags:['Monthly', '5G', 'Add-on'], art:{ img:SA + 'others-zeed-movie-lover.webp' }, still:1,
      d:'A free movie at Major Cineplex every month, VIP on iQIYI, Viu, WeTV and AIS PLAY, and 10GB of 5G data. Dial *824# to sign up.' }];
  // the banner carousel's slides: the promotions' own art
  var BANNERS = [{ t:'Smart Soundbar', img:SA + 'banner-soundbar.png', pkg:1 }, { t:'AIS 3BB Fibre3: Refer a Friend', img:SA + 'banner-fibre3-refer.webp', pos:'center 85%' },
    { t:'Home FibreLAN Plus', img:SA + 'banner-fibrelan-plus.webp' }];
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
    var m = MD.M[e.k], wide = m.w || MD.bg(e.k), pr = MD.price(e.k);
    return '<div class="xcard item"' + attrs({ kind:'event', i:i, k:e.k }) + ' data-ring-art="">' +
      '<div class="xc-portrait" style="background-image:url(\'' + m.p + '\')' + (e.ppos ? ';background-position:' + e.ppos : '') + '"></div>' +
      '<div class="xc-wide" style="background-image:url(\'' + wide + '\');background-position:' + (e.pos || 'center') + '"></div>' +
      '<div class="xc-scrim ev-scrim"></div><span class="top-tag ev-top">' + esc(e.when || e.badge) + '</span>' +
      '<div class="xc-content ev-info"><h3>' + esc(m.t) + '</h3>' +
        (pr ? '<div class="cost"><b>' + pr + ' baht</b><span>(VAT Included: ' + vat(pr) + ' baht)</span></div>' : '') +
        '<div class="meta">' + Content.metaHtml({ k:e.k }, true) + '</div><p class="syn">' + esc(m.d) + '</p></div></div>';   // (content.js: its crown in the meta row)
  }
  // a Rent or Buy title: its poster (content.js), its badge and its app's tag (platform-tag.css), as the Movie page's
  function posterCard(p, set, i){
    var m = MD.M[p.k], tag = m.plat === 'ais' ? '<span class="ptag ais"></span>' : '<img class="ptag" src="badges/tag-' + m.plat + '.png" alt="">';
    // (a title with only a 16:9 picture: its people (ppos), else its centre)
    return '<div class="pst item"' + attrs({ kind:set, i:i, k:p.k }) + '><div class="pic" style="background-image:url(\'' + (m.p || m.w) + '\')' + (!m.p && p.ppos ? ';background-position:' + p.ppos : '') + '"></div>' +
      badgeHtml(p) + tag + '</div>';
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
  html += '<section class="sec gene" data-sec="highlight"><h2 class="sec-title">Highlights you shouldn’t miss</h2><div class="rail"><div class="track">' + cardsHtml('highlight', ROWS.highlight) + '</div></div></section>';
  html += catSec('sports', 'Sports', true);
  html += catSec('movies', 'Movies', true);
  html += catSec('short', 'Short Series');
  html += catSec('value', 'Great Value');
  html += railSec('event', 'PPV Event', EVENTS.map(eventCard).join(''));
  html += railSec('rent', 'Rent or Buy', RENTALS.map(function(p, i){ return posterCard(p, 'rent', i); }).join('') + viewAll('rent'), 'rent');
  html += railSec('onetime', 'One-Time Package', cardsHtml('onetime', ONETIME));
  html += railSec('others', 'Others', cardsHtml('others', OTHERS));
  html += '<section class="sec" data-sec="banner"><div class="banner item" data-kind="banner" data-label="Smart Soundbar"><div class="slides">' +
    BANNERS.map(function(b){ return '<div class="slide" style="background-image:url(\'' + b.img + '\')' + (b.pos ? ';background-position:' + b.pos : '') + '"></div>'; }).join('') + '</div>' +
    '<div class="carr tv-chip l"><img src="' + SA + 'carousel-arrow-left.svg" alt=""></div><div class="carr tv-chip r"><img src="' + SA + 'carousel-arrow-right.svg" alt=""></div>' +
    '<div class="dots">' + BANNERS.map(function(_, i){ return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div></div></section>';
  html += '<section class="sec" data-sec="shortcuts"><div class="shorts">' + SHORTCUTS.map(function(s, i){
    return '<div class="quick-card tv-chip item"' + attrs({ kind:'shortcut', i:i, label:s.t }) + ' data-ring-art=""><span class="qc-sub">' + esc(s.s) + '</span>' +
      '<span class="qc-name"><img src="' + s.ic + '" alt="">' + esc(s.t) + '</span></div>';
  }).join('') + '</div></section>';
  html += '<section class="sec totop" data-sec="totop"><div class="tv-btn tv-btn--primary tv-btn--top item" data-kind="totop" data-ring-art=""><i></i>Back to Top</div></section>';
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
  // the list a tab bar is showing: the picked tab's packages (Recommend)
  function listOf(set){
    if(cur.tab[set] === undefined || !cur.tab[set]) return ROWS[set];
    if(set === 'movies' || set === 'sports' || set === 'short') return PKG[TAB_OTT[TABS[set][cur.tab[set]]]];   // an OTT's or a league's tab: its own packages
    if(set === 'value') return VALUE[cur.tab.value];   // Great Value: the tab's price range
  }
  function paintHero(r){
    var set = r.set, cards = rows[R[set]];
    var it = listOf(set)[cur.col[R[set]]];   // a tab bar shows the package its rail is on
    if(!it || cards.items[cur.col[R[set]]].dataset.kind === 'viewall'){ var L = listOf(set); it = L[L.length - 1]; }   // View All: keeps the card just before it (the rail's last)
    var key = it.t + it.price + it.per + (it.d || '');
    if(key !== heroKey){
      heroKey = key;
      heroEl.querySelector('.tags').innerHTML = it.tags.map(function(t){ return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      heroEl.querySelector('h1').textContent = it.t;
      heroEl.querySelector('.price b').textContent = Number(it.price).toLocaleString('en-US') + ' baht / ' + it.per;
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
      if(it.still) return;   // an offer of Others: shown only
      if(it.ott){ leave('package-detail.html?ott=' + it.ott + '&p=' + PKG[it.ott].map(function(p){ return p.t; }).indexOf(it.t)); return; }
      if(it.go){ leave(it.go); return; }   // an offer of Others: the package it is for
      if(it.pkg) leave('package-detail.html'); else toast(it.t + ' (demo)');
      return;
    }
    if(k === 'tab') return;
    // View All: the All Packages page, on the matching tab (For You, Sports, Movies, Short Drama)
    if(k === 'viewall'){ var tab = { sports:'sports', movies:'movies', short:'shorts' }[el.dataset.set]; leave('all-packages.html' + (tab ? '?tab=' + tab : '')); return; }
    // a PPV event or a Rent or Buy title: its detail page (content.js), bought or rented there
    if(k === 'event' || k === 'rent'){ leave(Content.detailUrl({ k:el.dataset.k })); return; }
    if(k === 'banner'){ openQr(); return; }   // its QR Code: scan to continue on the phone
    if(k === 'totop'){ cur.row = R.foryou; cur.col[R.foryou] = 0; return; }
    toast((el.dataset.label || 'Selected') + ' (demo)');
  }
  function back(){
    if(cur.row > R.foryou){ cur.row = R.foryou; paint(); return; }
    try { if(document.referrer && /(home|sport)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  // ---- the banner's QR Code popup (dialog-theme.css): Close (its only button) or Back closes it, focus back on the banner ----
  var qrPop = document.querySelector('.qr-pop'), qrScrim = document.querySelector('.qr-scrim'), qrClose = qrPop.querySelector('.qr-close');
  function qrOpen(){ return qrPop.classList.contains('open'); }
  function openQr(){ qrPop.classList.add('open'); qrScrim.classList.add('open'); clearInterval(slideT); $('.item.focused').forEach(function(e){ e.classList.remove('focused'); }); qrClose.classList.add('focused'); }
  function closeQr(){ qrClose.classList.remove('focused'); qrPop.classList.remove('open'); qrScrim.classList.remove('open'); goSlide(bannerAt); paint(); }
  qrClose.addEventListener('click', closeQr); qrScrim.addEventListener('click', closeQr);
  addEventListener('keydown', function(e){
    if(!qrOpen()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'Backspace') closeQr();
  }, true);

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
