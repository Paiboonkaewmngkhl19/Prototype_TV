
(function(){
  var screen = document.getElementById('screen');
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o){ return Object.keys(o).filter(function(k){ return o[k] != null; }).map(function(k){ return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }

  /* ---------- content: every title is a key in content.js (MD.M, kids:1); the page's own lists below ---------- */
  var M = MD.M, KA = 'kids-assets/';
  var SCENE = ['moana', 'steven', 'dora', 'pinkfong', 'powerpuff', 'bluey'];             // the first rail (16:9)
  var CONTINUE = MD.kidsContinue();                                                      // content.js
  var CW_BADGE = { 2:'Leaving Soon', 4:'Top 10' };
  var TOP10 = ['steven', 'powerpuff', 'phineas', 'pororo', 'dora', 'trolls', 'doraemonart', 'standbyme', 'tomjerry', 'trollsbt'];
  var RANK_COLOR = 10;                                                                   // the kids' coloured numerals: 1-5 Figma's, 6-10 drawn to match (kids-assets/rank-N.svg)
  // a character whose picture changes when focused, in the same disc (Figma For PBR "Tom& Jerry Default" 280:24965 /
  // "Tom& Jerry focus" 280:24966): a: the default (its disc colour, its picture clipped to the circle), b: the focused one
  // (its disc colour, then its pictures over it, not clipped: the characters step out of the circle). box: [left, top,
  // width, height] % of the disc, as Figma places them
  var TJ_SWAP = {
    a:{ bg:'#011e4f', imgs:[{src:'ch-tomjerry-default.png', box:[4.28, -0.19, 91.73, 134.46]}] },
    b:{ bg:'linear-gradient(23.91deg, #ffaf0b 11.68%, #fdd707 81.51%)',
        imgs:[{src:'ch-tomjerry-focus-chars.png', box:[-2.79, 38.67, 105.07, 61.45], cls:'pop'}, {src:'ch-tomjerry-focus-logo.png', box:[-0.1, 12.09, 100, 20.99], cls:'drop'}] }
  };
  // Snowball: his still, then a photo of him with his carrot; both whole pictures (no cut-out), so the focused one stays in
  // the circle (clip), fading in over the first
  var SNOW_SWAP = {
    a:{ bg:'#000', imgs:[{src:'ch-snowball.jpg', cover:'50% 20%'}] },
    b:{ bg:'#000', clip:1, imgs:[{src:'ch-snowball-focus.webp', cover:'50% 45%', cls:'zoom'}] }
  };
  // Finn (Figma For PBR "CardCharacter_3" 280:25038 / "CardCharacterOn_3" 280:25039): arms crossed on navy, then hanging
  // from a dollar bill with Jake on green, stepping out of the circle as Tom & Jerry's
  var FINN_SWAP = {
    a:{ bg:'#011e4f', imgs:[{src:'ch-finn-default.png', box:[-0.09, 2.79, 90.58, 151.25]}] },
    b:{ bg:'linear-gradient(23.91deg, #018841 11.68%, #14de73 81.51%)', imgs:[{src:'ch-finn-focus.png', box:[-1.92, -3.65, 89.92, 108.54], cls:'pop'}] }
  };
  // Woody (Figma For PBR "CardCharacter_4" 280:26612 / "CardCharacterOn_4" 280:26613): arms crossed on navy, then the Toy
  // Story gang (Bullseye, Buzz, Hamm, Mr. Potato Head) on red, stepping out of the circle (Figma's 332 x 333 frame at
  // -9, -12 of the 314.6 disc, as % of the disc)
  var WOODY_SWAP = {
    a:{ bg:'#011e4f', imgs:[{src:'ch-woody-default.png', box:[19.28, 2.02, 72.96, 197.15]}] },
    b:{ bg:'linear-gradient(23.91deg, #a72a2b 11.68%, #ff575a 81.51%)', imgs:[{src:'ch-woody-focus.png', box:[3.6, -1.53, 93.25, 109.5], cls:'pop'}] }
  };
  // Bluey (Figma For PBR "CardCharacterOn_1" 280:24827 / 280:24828): standing on navy, then flying out of the circle over
  // a sky scene that stays in it (inside: clipped to the disc)
  var BLUEY_SWAP = {
    a:{ bg:'#011e4f', imgs:[{src:'ch-bluey-default.png', box:[-11.25, 5.02, 115.15, 115.2]}] },
    b:{ bg:'#86c6fc', imgs:[{src:'ch-bluey-focus-bg.png', box:[-151.49, 0.14, 251.78, 141.62], inside:1},
                            {src:'ch-bluey-focus.png', box:[-39.09, 7.55, 178.04, 104.12], cls:'pop'}] }
  };
  // Phineas: his still, then Phineas, Ferb and Perry surfing (a whole picture: in the circle, as Snowball's)
  var PHINEAS_SWAP = {
    a:{ bg:'#000', imgs:[{src:'ch-phineas.jpg', cover:'50% 20%'}] },
    b:{ bg:'#000', clip:1, imgs:[{src:'ch-phineas-focus.webp', cover:'50% 50%', cls:'zoom'}] }
  };
  // Doraemon: his still, then Doraemon with Nobita, Shizuka, Gian and Suneo on pink (a whole picture: in the circle)
  var DORAEMON_SWAP = {
    a:{ bg:'#000', imgs:[{src:'ch-doraemon.jpg', cover:'50% 20%'}] },
    b:{ bg:'#000', clip:1, imgs:[{src:'ch-doraemon-focus.webp', cover:'50% 40%', cls:'zoom'}] }
  };
  // Mr. Bean: his still, then Mr. Bean in the park pointing (a whole picture: in the circle)
  var BEAN_SWAP = {
    a:{ bg:'#000', imgs:[{src:'ch-mrbean.jpg', cover:'50% 20%'}] },
    b:{ bg:'#000', clip:1, imgs:[{src:'ch-mrbean-focus.webp', cover:'55% 40%', cls:'zoom'}] }
  };
  function swapHtml(sw){
    function layer(l, cls){
      var over = cls === 'sw-b' && !l.clip;   // a cut-out that steps out of the circle: over the focus ring
      // inside: a picture kept in the circle under the cut-outs (its own clipped disc)
      var inside = l.imgs.filter(function(p){ return p.inside; }).map(function(p){ return pic(p, false); }).join('');
      return '<div class="sw ' + cls + (l.clip ? ' clip' : '') + '"><i class="sw-disc" style="background:' + l.bg + '"></i>' +
        (inside ? '<div class="sw-in">' + inside + '</div>' : '') + l.imgs.filter(function(p){ return !p.inside; }).map(function(p){ return pic(p, over); }).join('') + '</div>';
    }
    function pic(p, over){
        // cover: a whole picture filling the disc (its object-position); else Figma's box
        if(p.cover) return '<img class="cover ' + (p.cls || '') + '" src="' + KA + p.src + '" alt="" style="object-position:' + p.cover + '">';
        var b = p.box;
        // the focused picture's parts sit over the focus ring (focus-ring.js data-ring-top), as they step out of the circle
        return '<img class="' + (p.cls || '') + '"' + (over ? ' data-ring-top=""' : '') + ' src="' + KA + p.src + '" alt="" style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%">';
    }
    return layer(sw.a, 'sw-a') + layer(sw.b, 'sw-b');
  }
  // Character (Figma's portraits): who they are and the show they open; fav: the heart (a favourite)
  var CHARS = [{n:'Snowball', img:'ch-snowball.jpg', fav:1, swap:SNOW_SWAP}, {n:'Tom & Jerry', img:'ch-tomjerry.jpg', k:'tomjerry', swap:TJ_SWAP}, {n:'Finn', img:'ch-finn.jpg', swap:FINN_SWAP},
               {n:'Woody', swap:WOODY_SWAP}, {n:'Bluey', k:'bluey', swap:BLUEY_SWAP}, {n:'Phineas Flynn', img:'ch-phineas.jpg', k:'phineas', swap:PHINEAS_SWAP},
               {n:'Doraemon', img:'ch-doraemon.jpg', k:'standbyme', swap:DORAEMON_SWAP}, {n:'Mr. Bean', img:'ch-mrbean.jpg', k:'mrbean', swap:BEAN_SWAP}];
  var FOR_YOU = ['steven', 'doraemonart', 'powerpuff', 'trolls', 'dora'];
  var DORAEMON = ['doraemonart', 'doraemoncastle', 'doraemonsymphony', 'doraemonsky', 'doraemondino', 'doraemonjapan', 'standbyme'];
  var YOUNGER = [{k:'pororo', b:'New'}, {k:'dora'}, {k:'phineas', b:'Best Seller'}, {k:'trollsholiday'}, {k:'standbyme', b:'Leaving Soon'}, {k:'lady'}, {k:'trolls'}];
  var OLDER = [{k:'steven'}, {k:'powerpuff'}, {k:'tomjerry'}, {k:'mrbean', b:'Leaving Soon'}, {k:'trollswt'}, {k:'doraemoncastle', b:'New'}, {k:'trollsbt'}];
  var QUICK = [{k:'tomjerry'}, {k:'pororo', b:'Best Seller'}, {k:'powerpuff'}, {k:'phineas'}, {k:'dora'}, {k:'mrbean', b:'Leaving Soon'}, {k:'trollsholiday'}];
  var TROLLS = ['trollsholiday', 'trollswt', 'trolls', 'trollsbt'];
  // the collection bands' words (Doraemon, Trolls): the collection's own, whichever of its films has focus
  var DORAEMON_TEXT = { t:'Doraemon the Movie', d:'Big adventures with Doraemon, Nobita and friends: magical gadgets, faraway worlds and a friendship that lasts forever.' };
  var TROLLS_TEXT = { t:'Trolls Collection', d:'Sing, dance and hug along with Poppy, Branch and the whole Troll family, from their very first adventure to the holiday special, World Tour and Band Together.' };
  var RENTAL = MD.KIDS_RENTAL;   // content.js: already the viewer's (no gold crown)
  var MY_LIST = [{k:'bluey', b:'New'}, {k:'dora'}, {k:'powerpuff', b:'Leaving Soon'}, {k:'pinkfong'}, {k:'moana'}];
  var COLLECTIONS = [{t:'Trolls Collection', img:KA + 'trolls-collection.webp'}, {t:'Doraemon the Movie', img:KA + 'doraemon-collection.webp'},
                     {t:'Moana & Friends', img:KA + 'moana-bg.jpg'}, {t:'Cartoon Classics', img:KA + 'cartoon-classics.webp'}, {t:'Bluey', img:KA + 'bluey-w.jpg'},
                     {t:'Tom and Jerry', img:KA + 'tomjerry-collection.webp'}];
  // Learn: DLTV's distance-learning classes (Figma's subjects and logos)
  var LEARN = [{s:'English', c:'Grade 1'}, {s:'Math', c:'Grade 2'}, {s:'Thai', c:'Grade 3'}, {s:'Science', c:'Grade 4'},
               {s:'Japanese', c:'Grade 5'}, {s:'Chinese', c:'Grade 6'}, {s:'Chinese', c:'Grade 7'}];   // (Thai Prathom 1-6, Mathayom 1)
  // Kids Channel: the TV Guide's cartoon channels (channels-data.js), lowest number first
  var CHANNELS = TV.CHANNELS.filter(function(c){ return c.cats.indexOf('cartoons') >= 0; }).sort(function(a, b){ return a.no - b.no; });

  /* ---------- markup ---------- */
  function ptag(m){ return m.plat === 'ais' ? '<span class="ptag ais"></span>' : '<img class="ptag" src="badges/tag-' + m.plat + '.png" alt="">'; }
  // a card's bottom-left corner: its platform tag, then the gold crown beside it while a premium title isn't the
  // viewer's (content.js Content.crown). Every card but Continue Watching's
  function corner(k){ return ptag(M[k]) + Content.crownIcon({k:k}, 0, 'crown-tag'); }
  function wide(k, i, set, badge, img, noTitle){
    var m = M[k];
    return '<div class="card item"' + attrs({kind:'title', k:k, set:set, i:i}) + '><div class="thumb" style="background-image:url(\'' + (img || m.w || m.b || m.p) + '\')">' +
      (badge ? '<span class="top-tag">' + esc(badge) + '</span>' : '') + corner(k) + '</div>' +
      (noTitle ? '' : '<div class="t">' + esc(m.t) + '</div>') + '</div>';   // its title under the picture, as Continue Watching's cards (not on the first rail, My Rentals and Purchases or My List: the hero says it, as Home's)
  }
  function poster(k, i, set, badge){
    var m = M[k];
    return '<div class="pst item"' + attrs({kind:'title', k:k, set:set, i:i}) + ' style="background-image:url(\'' + m.p + '\')">' +
      (badge ? '<span class="top-tag">' + esc(badge) + '</span>' : '') + corner(k) + '</div>';
  }
  function sec(key, title, body, cls){
    return '<section class="sec' + (cls ? ' ' + cls : '') + '" data-row="' + key + '">' + (title ? '<h2 class="sec-title">' + esc(title) + '</h2>' : '') +
      '<div class="rail"><div class="track">' + body + '</div></div></section>';
  }
  function logoHtml(c){
    var b = c.box, img = b ? '<img src="' + TV.logoSrc(c) + '"' + TV.logoAttrs(c) + ' style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%;object-fit:contain;">'
                          : '<img class="' + (c.logo ? c.fit || 'cover' : 'cover') + '" src="' + TV.logoSrc(c) + '"' + TV.logoAttrs(c) + '>';
    return '<div class="logo"' + (c.bg ? ' style="background:' + c.bg + '"' : '') + '>' + img + '</div>';
  }
  var html = '';
  html += sec('scene', '', SCENE.map(function(k, i){ return wide(k, i, 'scene', '', '', 1); }).join(''));
  if(CONTINUE.length) html += '<section class="sec" data-row="cw"><h2 class="sec-title">Continue Watching</h2><div class="rail"><div class="track">' + CONTINUE.map(function(c, i){
    var m = M[c.k], left = c.of - c.w;
    return '<div class="card item"' + attrs({kind:'title', k:c.k, set:'cw', i:i}) + '><div class="thumb" style="background-image:url(\'' + (c.img || m.w) + '\')">' +
      (CW_BADGE[i] ? '<span class="top-tag">' + CW_BADGE[i] + '</span>' : '') +
      '<span class="left corner-tag">' + (left >= 60 ? Math.floor(left / 60) + 'h ' + left % 60 + 'm' : left + 'm') + ' left</span>' +
      '<div class="prog"><i style="width:' + Math.round(c.w / c.of * 100) + '%"></i></div></div><div class="t">' + esc(m.t) + '</div></div>';
  }).join('') + '</div></div></section>';
  html += Top10.defs();
  html += '<section class="sec top10" data-row="top10"><h2 class="sec-title">Top 10</h2><div class="rail"><div class="track">' + TOP10.map(function(k, i){
    var m = M[k];
    return '<div class="rank-wrap">' + Top10.numeral(i + 1) + (i < RANK_COLOR ? '<img class="rank-color" src="' + KA + 'rank-' + (i + 1) + '.svg" alt="">' : '') +
      '<div class="rank-poster item"' + attrs({kind:'title', k:k, set:'top10', i:i}) + ' style="background-image:url(\'' + m.p + '\')">' + corner(k) + '</div></div>';
  }).join('') + '</div></div></section>';
  html += sec('chars', 'Characters', CHARS.map(function(c, i){
    return '<div class="char"><div class="ph item' + (c.swap ? ' swap' : '') + '"' + attrs({kind:'char', i:i}) + ' data-ring-art=""' + (c.swap ? '' : ' style="background-image:url(\'' + KA + c.img + '\')"') + '>' + (c.swap ? swapHtml(c.swap) : '') +
      (c.fav ? '<span class="cfav" data-ring-top="styled"><img src="icons/tv-guide/heart-fill.svg" alt="Favorite"></span>' : '') + '</div><div class="nm">' + esc(c.n) + '</div></div>';
  }).join(''), 'chars');
  html += sec('foryou', 'For You', FOR_YOU.map(function(k, i){
    var m = M[k];
    // Movie's For You (expand-card.css): the poster at rest; open, the title's meta row and synopsis over its picture
    return '<div class="xcard item"' + attrs({kind:'title', k:k, set:'foryou', i:i}) + ' data-ring-art="">' +
      '<div class="xc-portrait" style="background-image:url(\'' + (m.p || m.w) + '\')">' + corner(k) + '</div>' +
      '<div class="xc-wide" style="background-image:url(\'' + MD.bg(k) + '\')"></div><div class="xc-scrim ev-scrim"></div>' +
      '<div class="xc-content ev-info"><h3>' + esc(m.t) + '</h3><div class="meta">' + Content.metaHtml({k:k}, true) + '</div><p class="syn">' + esc(m.d) + '</p></div></div>';
  }).join(''));
  html += '<section class="sec band" data-row="doraemon"><div class="b-pic" style="background-image:url(\'' + KA + 'doraemon-band.jpg\')"></div><div class="b-t"></div><p class="b-d"></p><div class="rail"><div class="track">' +
    DORAEMON.map(function(k, i){ return poster(k, i, 'doraemon'); }).join('') + '</div></div></section>';
  html += sec('younger', 'Younger Kids (Ages 4–8)', YOUNGER.map(function(c, i){ return poster(c.k, i, 'younger', c.b); }).join(''), 'tall');
  html += sec('older', 'Older Kids (Ages 9–12)', OLDER.map(function(c, i){ return poster(c.k, i, 'older', c.b); }).join(''), 'tall');
  html += sec('quick', 'Quick Watch: 20 Minutes or Less', QUICK.map(function(c, i){ return poster(c.k, i, 'quick', c.b); }).join(''), 'tall');
  html += '<section class="sec band side" data-row="trolls"><div class="b-pic" style="background-image:url(\'' + KA + 'trolls-band.jpg\')"></div><div class="b-text"><div class="b-t"></div><p class="b-d"></p></div>' +
    '<div class="rail"><div class="track">' + TROLLS.map(function(k, i){ return poster(k, i, 'trolls'); }).join('') + '</div></div></section>';
  html += sec('rental', 'My Rentals and Purchases', RENTAL.map(function(k, i){ return wide(k, i, 'rental', '', '', 1); }).join(''));
  html += sec('mylist', 'My List', MY_LIST.map(function(c, i){ return wide(c.k, i, 'mylist', c.b, '', 1); }).join(''));
  html += '<section class="sec coll" data-row="coll"><div class="stage">' + COLLECTIONS.map(function(c, i){
    return '<div class="coll-card item"' + attrs({kind:'coll', i:i}) + ' data-ring-art="" style="background-image:url(\'' + c.img + '\')"><span>' + esc(c.t) + '</span></div>';
  }).join('') + '</div><div class="coll-dots">' + COLLECTIONS.map(function(){ return '<i></i>'; }).join('') + '</div></section>';
  html += sec('learn', 'Learn', LEARN.map(function(l, i){
    return '<div class="lc"><div class="pst item"' + attrs({kind:'learn', i:i}) + ' data-ring-art="" style="background-image:url(\'' + KA + 'dltv-' + (i + 1) + '.png\')">' +
      '<span class="top-tag">' + esc(l.s) + '</span></div><div class="nm">DLTV ' + (i + 1) + ': ' + esc(l.c) + '</div></div>';
  }).join(''), 'tall learn');
  html += '<section class="sec" data-row="channels"><h2 class="sec-title">Kids Channels</h2><div class="rail"><div class="track chan-track">' + CHANNELS.map(function(c, i){
    return '<div class="ch-card tv-glass item"' + attrs({kind:'chan', i:i}) + ' data-ring-art=""><div class="ch-slot"><div class="ava">' + logoHtml(c) + '</div></div>' +
      '<div class="ch-name">' + esc(c.n) + '</div><div class="ch-meta">' + (TV.isFav(c) ? '<img class="ic20" src="icons/tv-guide/heart-fill.svg" alt="Favorite">' : '') +
      Content.crownIcon({ch:c.n}, 0, 'ic20') + '<div class="ch-no">' + c.no + '</div></div></div>';
  }).join('') + '</div></div></section>';
  html += '<section class="sec totop" data-row="totop"><div class="tv-btn tv-btn--primary tv-btn--top item" data-kind="totop" data-ring-art=""><i></i>Back to Top</div></section>';
  var page = document.getElementById('page');
  page.innerHTML = html;
  Top10.ready(page);

  /* ---------- focus rows: the top bar, then one row per section ---------- */
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  var secs = $('.sec', page);
  var rows = [{ items:$('.topnav .item') }].concat(secs.map(function(s){ return { sec:s, key:s.dataset.row, items:$('.item', s) }; }));
  var R = {}; rows.forEach(function(r, i){ if(r.key) R[r.key] = i; });
  var homeTab = document.querySelector('.navtab.active'), NAV_HOME = rows[0].items.indexOf(homeTab);
  var cur = { row:R.scene, col:rows.map(function(){ return 0; }), from:R.scene };
  cur.col[0] = NAV_HOME;
  cur.col[R.coll] = Math.floor(rows[R.coll].items.length / 2);   // the carousel opens on its middle card, a full stack either side
  var DYNAMIC_END = R.top10;   // the first rail to Top 10 keep the hero (Figma 210:51775: Top 10 over its title's picture)
  var ROW_Y = 600;

  // ---- the hero speaks for the focused title (content.js: its words, meta row, picture; a logo when it has one) ----
  var heroEl = document.querySelector('.hero'), heroKey = '';
  var pics = $('.hero-bg .pic'), picFront = 0, picCur = null;
  function setBg(img){
    if((img || null) === picCur) return;
    picCur = img || null;
    pics[picFront].classList.remove('on');
    picFront = 1 - picFront;
    if(img){ pics[picFront].style.backgroundImage = 'url(\'' + img + '\')'; pics[picFront].classList.add('on'); }
  }
  function paintHero(el){
    var k = el && el.dataset.k;
    if(!k || !M[k]) return;
    var noTag = el.dataset.set === 'cw', m = M[k], key = k + (noTag ? '|cw' : '');   // Continue Watching: no platform logo
    if(key !== heroKey){
      heroKey = key;
      heroEl.classList.toggle('has-logo', !!m.logo);
      heroEl.querySelector('.logo-t').src = m.logo || '';
      heroEl.querySelector('.logo-t').alt = m.t;
      heroEl.querySelector('h1').textContent = m.t;
      var wd = noTag ? CONTINUE[+el.dataset.i] : null;   // how far in: Continue Watching only
      heroEl.querySelector('.watched').innerHTML = wd ? '<span class="bar"><i style="width:' + Math.round(wd.w / wd.of * 100) + '%"></i></span>' + wd.w + 'm of ' + wd.of + 'm' : '';
      heroEl.querySelector('.meta').innerHTML = Content.metaHtml({k:k}, !noTag);
      heroEl.querySelector('.desc').textContent = m.d || '';
      heroEl.classList.remove('swap'); void heroEl.offsetWidth; heroEl.classList.add('swap');
    }
    setBg(MD.bg(k));
  }
  // ---- the mood: the focused artwork's colour (RingColor, focus-ring.js) over the whole screen, its deep shade in the hero's fade ----
  var moodUrl = '';
  function artOf(el){
    var n = [el].concat($('.xc-wide, .thumb, *', el));
    for(var i = 0; i < n.length; i++){ var b = n[i].style && n[i].style.backgroundImage; if(b && b !== 'none') return b.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); }
    var img = el.querySelector('img');
    return img ? img.getAttribute('src') : '';
  }
  function mood(el){
    var url = el && !el.closest('.topnav') ? artOf(el) : '';
    if(!url || url === moodUrl) return;
    moodUrl = url;
    RingColor.colorOf(url, function(c){
      if(!c || moodUrl !== url) return;
      var v = c.split(',').map(Number);
      // the page's colour: a bright mid-tone of the artwork's (never dark: kids' pages are fresh), the hero's shade the same
      var bg = v.map(function(x){ return Math.round(x * .62); }).join(',');
      screen.style.setProperty('--mood', c);
      screen.style.setProperty('--bg', bg);
      screen.style.setProperty('--wash', bg);
    });
  }
  // ---- a band's words speak for its focused poster ----
  function paintBand(r, el){
    var m = r.key === 'trolls' ? TROLLS_TEXT : r.key === 'doraemon' ? DORAEMON_TEXT : M[el.dataset.k], t = r.sec.querySelector('.b-t'), d = r.sec.querySelector('.b-d');   // (Trolls, Doraemon: one text for the collection)
    if(t.textContent !== m.t){ t.textContent = m.t; if(d) d.textContent = m.d; }
  }
  rows.forEach(function(r){ if(r.sec && r.sec.classList.contains('band')) paintBand(r, r.items[0]); });
  // ---- Seasonal / Collection: the chosen card in the middle, the others stacked behind it on either side ----
  // A loop: every card has the others on both sides (two each way for five), from the first look on, so the stack is
  // always full; a card that wraps round to the other side jumps there unseen, without sliding across the middle
  function paintColl(){
    var r = rows[R.coll], at = cur.col[R.coll], n = r.items.length, half = Math.floor(n / 2);
    r.items.forEach(function(el, i){
      var d = ((i - at) % n + n + half) % n - half, a = Math.abs(d);
      var jump = el.dataset.d !== undefined && Math.abs(d - +el.dataset.d) > 1;
      el.dataset.d = d;
      el.style.transition = jump ? 'none' : '';
      el.style.transform = 'translateX(' + (d * 170) + 'px) scale(' + (1 - a * .1) + ')';
      el.style.zIndex = 10 - a;
      el.style.opacity = a > 2 ? 0 : 1;
      el.style.filter = a ? 'brightness(' + (1 - a * .25) + ')' : '';
    });
    $('.coll-dots i', r.sec).forEach(function(d, i){ d.classList.toggle('on', i === at); });
  }

  // ---- keep the focused item in view (Movie's) ----
  var pageY = 0;
  function slide(r, el){
    if(!r.sec || r.key === 'totop' || r.key === 'coll') return;
    var track = el.closest('.track');
    if(!track) return;
    var first = r.items[0], at = function(x){ return x.closest('.rank-wrap, .char, .lc') || x; };
    var want = at(el).offsetLeft - at(first).offsetLeft;
    var max = Math.max(0, track.scrollWidth - (r.sec.classList.contains('side') ? track.parentElement.offsetWidth : 1920));
    track.style.transform = 'translateX(' + -Math.max(0, Math.min(want, max)) + 'px)';
  }
  var HERO_GAP = 80;
  function placeHero(r){
    if(r.key === 'scene'){ heroEl.style.bottom = ''; return; }
    var y = 0, e = r.sec.querySelector('.sec-title, .item');
    while(e && e !== r.sec){ y += e.offsetTop; e = e.offsetParent; }
    heroEl.style.bottom = 1080 - (r.sec.offsetTop + y - pageY - HERO_GAP) + 'px';
  }
  function layout(ri){
    var r = rows[ri], y = 0;
    if(r.sec && ri !== R.scene){
      var top = r.sec.offsetTop, h = r.sec.offsetHeight;
      if(ri <= DYNAMIC_END) y = top - Math.min(ROW_Y, 1080 - 40 - h);
      else {
        // below the hero: the focused card centred on the screen (its row's title above it), whatever the row's shape
        var el = r.items[cur.col[ri]] || r.items[0], cy = el.offsetHeight / 2;
        for(var e = el; e && e !== r.sec; e = e.offsetParent) cy += e.offsetTop;
        y = top + cy - 540;
      }
      y = Math.min(y, page.offsetHeight - 1080);
    }
    pageY = Math.max(0, y);
    page.style.transform = 'translateY(' + -pageY + 'px)';
    rows.forEach(function(x, xi){ if(x.sec) x.sec.classList.toggle('above', xi < ri); });
    document.body.classList.toggle('scene', ri === R.scene);
    document.body.classList.toggle('static', ri > DYNAMIC_END);
    rows[R.top10].sec.classList.toggle('lit', ri === R.top10);
  }

  var profileEl = document.querySelector('.topnav .profile'), prof = ProfilePanel(profileEl, { paint:paint, toast:toast });

  function paint(){
    var inProf = prof.paint(cur.row === 0 && rows[0].items[cur.col[0]] === profileEl);
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){ el.classList.toggle('focused', !inProf && ri === cur.row && ci === cur.col[ri]); }); });
    homeTab.classList.toggle('active', cur.row === 0);
    homeTab.classList.toggle('active-dim', cur.row !== 0);
    var ri = cur.row === 0 ? cur.from : cur.row;
    document.body.classList.toggle('on-nav', cur.row === 0);
    document.body.classList.toggle('past-first', ri > R.scene);
    layout(ri);
    var r = rows[ri], el = r.items[cur.col[ri]];
    if(cur.row) slide(r, el);
    paintColl();
    if(r.sec && r.sec.classList.contains('band')) paintBand(r, el);
    if(ri <= DYNAMIC_END){ paintHero(el); placeHero(r); }
    mood(cur.row ? el : null);
    try { sessionStorage.setItem('kidsFocus', JSON.stringify(cur)); } catch(e){}
  }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function leave(url){ try { sessionStorage.setItem('kidsReturn', '1'); } catch(e){} location.href = url; }
  function toScene(){ cur.row = R.scene; cur.col[R.scene] = 0; }
  function select(el){
    var k = el.dataset.kind, i = +el.dataset.i;
    el.animate([{ transform:getComputedStyle(el).transform }, { transform:(getComputedStyle(el).transform === 'none' ? '' : getComputedStyle(el).transform + ' ') + 'scale(0.97)' }], { duration:140, easing:'ease-out' });
    if(el === homeTab){ location.href = 'home.html'; return; }
    if(el.dataset.href){ leave(el.dataset.href); return; }
    if(el === profileEl) return;
    if(k === 'title'){ leave(Content.detailUrl({ k:el.dataset.k })); return; }   // its detail page (movie-detail.html)
    if(k === 'char'){ var c = CHARS[i]; if(c.k){ leave(Content.detailUrl({ k:c.k })); return; } toast('Shows with ' + c.n + ' (demo)'); return; }
    if(k === 'coll'){ toast(COLLECTIONS[i].t + ' (demo)'); return; }               // a collection: a mockup with no page (as Movie's)
    if(k === 'learn'){ toast('DLTV ' + (i + 1) + ': ' + LEARN[i].s + ' (demo)'); return; }
    if(k === 'chan'){ leave('tv-guide.html?play=' + encodeURIComponent(CHANNELS[i].n) + '&from=kids'); return; }
    if(k === 'totop'){ toScene(); paint(); return; }
    toast((el.dataset.label || 'Selected') + ' (demo)');
  }
  function back(){
    if(cur.row !== R.scene){ toScene(); paint(); return; }
    try { if(document.referrer && /home\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }
    var r = rows[cur.row], n = r.items.length, handled = true;
    // the carousel wraps round both ways (it never hands Left to the top bar)
    if(cur.row === R.coll && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) cur.col[cur.row] = (cur.col[cur.row] + (e.key === 'ArrowRight' ? 1 : n - 1)) % n;
    else if(e.key === 'ArrowRight') cur.col[cur.row] = Math.min(n - 1, cur.col[cur.row] + 1);
    else if(e.key === 'ArrowLeft'){
      // Left on a rail's first item goes up to the top bar (its Home tab), as on Home and Movie
      if(cur.row > 0 && cur.col[cur.row] === 0){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_HOME; }
      else cur.col[cur.row] = Math.max(0, cur.col[cur.row] - 1);
    }
    else if(e.key === 'ArrowUp'){
      if(cur.row === R.scene){ cur.from = R.scene; cur.row = 0; cur.col[0] = NAV_HOME; }
      else if(cur.row > 0) cur.row--;
    }
    else if(e.key === 'ArrowDown'){
      if(cur.row === 0) cur.row = cur.from || R.scene;
      else cur.row = Math.min(rows.length - 1, cur.row + 1);
    }
    else if(e.key === 'Enter') select(r.items[cur.col[cur.row]]);
    else if(e.key === 'Escape' || e.key === 'Backspace') back();
    else handled = false;
    if(handled){ e.preventDefault(); paint(); }
  });
  rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){
    el.addEventListener('click', function(){ if(ri === 0) cur.from = cur.row || cur.from; cur.row = ri; cur.col[ri] = ci; paint(); select(el); });
  }); });

  // coming back (Back from a title's page or the TV Guide): the same item again
  try {
    var saved = sessionStorage.getItem('kidsReturn') && JSON.parse(sessionStorage.getItem('kidsFocus') || 'null');
    sessionStorage.removeItem('kidsReturn');
    if(saved && saved.col && saved.col.length === rows.length){ cur = saved; if(cur.row === 0) cur.row = cur.from || R.scene; }
  } catch(e){}
  if(!cur.from) cur.from = R.scene;
  page.style.transition = 'none';
  paint();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ paint(); requestAnimationFrame(function(){ page.style.transition = ''; }); });
})();
