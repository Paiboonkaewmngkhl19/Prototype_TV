
(function(){
  "use strict";

  // the first scene's first slide: a live match (content.js LIVE, by its title); home.html starts on its picture and video
  var FIRST_SLIDE = 'Real Madrid vs RB Leipzig';

  // every card's title, synopsis, platform and picture are its catalogue entry's (content.js MD.M, by data-k): one place
  function M(k){ return MD.M[k]; }
  function pic(k){ var m = M(k); return m.p || m.w; }   // a poster card: the 2:3 poster, else its 16:9 picture
  function cover(src){ return "background-image:url('" + src + "');background-size:cover;background-position:center;"; }
  // hero provider name ('HBO MAX', 'DISNEY+', ...) -> its tag logo file
  function heroTagFile(name){
    var n = (name || '').toUpperCase();
    if(n.indexOf('NETFLIX') >= 0) return 'tag-netflix.png';
    if(n.indexOf('DISNEY') >= 0) return 'tag-disney.png';
    if(n.indexOf('HBO') >= 0) return 'tag-hbo.png';
    if(n.indexOf('PRIME') >= 0) return 'tag-prime.png';
    if(n.indexOf('VIU') >= 0) return 'tag-viu.png';
    if(n.indexOf('REELSHORT') >= 0) return 'tag-reelshort.png';   // the short dramas' apps
    if(n.indexOf('DRAMABOX') >= 0) return 'tag-dramabox.png';
    if(n.indexOf('SHORTMAX') >= 0) return 'tag-shortmax.png';
    return 'tag-monomax.png';
  }
  function badgeImg(name, cls){
    var files = {netflix:'tag-netflix.png', prime:'tag-prime.png', disney:'tag-disney.png', hbo:'tag-hbo.png', viu:'tag-viu.png', monomax:'tag-monomax.png', reelshort:'tag-reelshort.png', dramabox:'tag-dramabox.png', shortmax:'tag-shortmax.png'};
    var f = files[name];
    if(!f) return '';
    return '<img src="badges/'+f+'" class="'+(cls||'badge-logo')+'" alt="'+name+'">';
  }
  function platformTag(name){
    var map = {
      netflix:['N','#000'], prime:['prime video','#1a98ff'], disney:['D+','#0a3161'],
      hbo:['max','#000'], viu:['viu','#0f8a8a'], def:['TV','#333']
    };
    var v = map[name] || map.def;
    var logo = badgeImg(name);
    if(logo) return '<span class="card-tag has-logo">' + logo + '</span>';
    return '<span class="card-tag" style="background:' + v[1] + ';">' + v[0] + '</span>';
  }
  function platformPill(name){
    var map = {
      netflix:['N','#000'], prime:['prime video','#0578ff'], disney:['D+','#0a3161'],
      hbo:['max','#000'], viu:['viu','#0f8a8a'], def:['TV','#333']
    };
    var v = map[name] || map.def;
    var logo = badgeImg(name);
    if(logo) return '<span class="platform has-logo">' + logo + '</span>';
    return '<span class="platform" style="background:' + v[1] + ';">' + v[0] + '</span>';
  }

  var root = document.getElementById('rows-root');
  var rowDefs = []; // {el, itemsEl:[...], scrollEl (rail-track) or null}

  function addRow(html, opts){
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var node = wrap.firstElementChild;
    root.appendChild(node);
    rowDefs.push({ el: node, track: node.querySelector('.rail-track') || null });
  }

  /* ---------- Row: the first scene's cards (as Sport's first rail) ----------
     This row also drives the dynamic hero banner above it: whichever card
     is focused here updates the hero background/title/description. */
  (function(){
    // the slides: a live match (content.js LIVE, by its title) or a title (content.js MD.M, by its key); their words,
    // tag and picture come from there, so the slide and the detail page it opens say the same
    var SLIDES = [{live:FIRST_SLIDE}, {k:'d9'}, {k:'loki'}, {k:'lastofus'}, {k:'wicked'}, {k:'superman'}, {k:'topgun'}, {k:'dragon'},
                  {k:'f1'}];
    function attr(v){ return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }   // e.g. Pete "Maverick" Mitchell
    var items = SLIDES.map(function(s){
      if(s.live){ var p = LIVE.find(s.live); return { t:p.t, img:p.img, crown:{tv:p.tv}, href:LIVE.href(p, 'home'), hero:{logo:'monomax', channel:'', live:true, tv:p.tv, desc:p.d}, bg:p.bg || p.img }; }
      var h = Content.hero({k:s.k}), m = M(s.k);
      return { k:s.k, t:h.t, img:m.w || h.bg, crown:{k:s.k}, hero:{logo:h.plat, channel:h.meta, live:false, desc:h.d}, bg:h.bg };
    });
    var cards = items.map(function(it){
      return '<div class="card card-content item'+(it.hero.live ? ' has-ribbon' : '')+'" data-title="'+attr(it.t)+'"'+
        ' data-hero-title="'+attr(it.t)+'" data-hero-logo="'+attr(it.hero.logo)+'" data-hero-channel="'+attr(it.hero.channel)+'"'+
        ' data-hero-live="'+(it.hero.live?'1':'0')+'"'+(it.hero.tv?' data-hero-tv="'+attr(it.hero.tv)+'"':'')+' data-hero-desc="'+attr(it.hero.desc)+'" data-hero-img="'+it.bg+'"'+
        (it.k ? ' data-k="'+it.k+'"' : ' data-href="'+attr(it.href)+'"')+'>'+   // Enter: its detail page (content.js)
        '<div class="thumb" style="background-image:url(\''+it.img+'\');background-size:cover;background-position:center;">'+Content.crownIcon(it.crown, 0, 'crown-tag')+'</div>'+
        // (no title under the first rail's cards: the hero above says it)
        (it.hero.live ? '<span class="live-ribbon">Live</span>' : '')+
      '</div>';
    }).join('');
    addRow('<div class="row-block hero-row"><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();

  /* ---------- Row: Quick menu chips ---------- */
  (function(){
    var chips = [
      {label:'Live TV', href:'tv-guide.html?play=MUTV&from=home'}, {label:'News', href:'news.html'}, {label:'Short', href:'short.html'}, {label:'Kids', href:'kids.html'},
      {label:'Lifestyle'}, {label:'Music'}, {label:'IoT'}   // Figma Category (3256:175126)
    ];
    var html = chips.map(function(c, i){
      return '<div class="chip tv-chip item" data-title="'+c.label+'"'+(c.href ? ' data-href="'+c.href+'"' : '')+'>'+c.label+'</div>';   // Live TV: Enter plays the channel in the Live TV player (via the TV Guide); News opens news.html
    }).join('');
    addRow('<div class="row-block chip-row"><div class="rail-viewport"><div class="rail-track">'+html+'</div></div></div>');
  })();

  /* ---------- Row: Jump Right Back In (continue watching, with progress) ---------- */
  (function(){
    // Continue Watching from content.js: this session's viewing first, each with its real progress (and episode)
    // only titles with a full-screen picture of their own (MD.M b) are shown: it fills the screen while a card is focused
    var items = MD.continueList().filter(function(c){ return M(c.k).b; }).map(function(c){
      var m = M(c.k), left = Math.max(1, c.of - c.w);
      return {k:c.k, t:m.t + (c.s ? ' S' + c.s + ':E' + c.e : ''), plat:m.plat, img:m.w || m.p, pct:Math.round(c.w / c.of * 100), dur:c.of, s:left + ' mins left'};
    });
    function q(v){ return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
    var cards = items.map(function(it,i){
      return '<div class="card card-content item" data-k="'+it.k+'" data-title="'+q(it.t)+'">'+
        '<div class="thumb" style="background-image:url(\''+it.img+'\');background-size:cover;background-position:center;">'+platformTag(it.plat)+
          '<span class="cw-left corner-tag s">'+it.s+'</span>'+
          '<div class="progress"><i class="play-prog" data-dur="'+it.dur+'" style="width:'+it.pct+'%"></i></div></div>'+
      '</div>';
    }).join('');
    addRow('<div class="row-block"><div class="row-title">Jump Right Back In</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();

  /* ---------- Row: TV Guide ---------- */
  (function(){
    // Figma "TV guide": channel logo, programme now (with progress) and next, read from the TV Guide's own schedule
    // (channels-data.js), so the card, the hero text and the player (Enter) show the same programme at the same time.
    // MUTV and CNN have Time Shift on what's on now: the Time Shift icon next to the heart.
    // the logos are the TV Guide's (channels-data.js), on their discs' colours
    var items = [{ch:'MUTV'}, {ch:'CNN'}, {ch:'Real Madrid TV'}, {ch:'BBC News'}, {ch:'W-Sports'}];
    function clock(d){ var h = d.getHours(), m = d.getMinutes(); return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM'); }
    function attrQ(v){ return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
    var nowT = new Date();
    items.forEach(function(it){
      var c = window.TV.byName(it.ch), i = window.TV.onAt(c, nowT);
      it.prog = c.progs[i]; it.nextProg = c.progs[i + 1]; it.heart = window.TV.isFav(c); it.c = c;   // its own, or as changed this session in the TV Guide / player
    });
    var epgCards = items.map(function(it,i){
      var p = it.prog, n = it.nextProg, pct = Math.round((nowT - p.start) / (p.end - p.start) * 100);
      // Enter plays the channel in the Live TV player (via the TV Guide, which has its programmes and the mini EPG)
      return '<div class="epg-card tv-glass item" data-title="'+attrQ(p.t)+'" data-href="tv-guide.html?play='+encodeURIComponent(it.ch)+'&from=home">'+
        '<div class="epg-now">'+
          window.TV.logoHtml(it.c, 'epg-avatar round')+
          '<div class="epg-prog-data"><div class="epg-title">'+p.t+'</div><div class="epg-sub">Started at '+clock(p.start)+'</div></div>'+
          '<span class="epg-icons">'+(p.ts?'<img class="epg-ts" src="icons/tv-guide/timeshift.svg" alt="Time Shift">':'')+
            (it.heart?'<span class="epg-heart"><img src="icons/epg/heart.svg" alt=""></span>':'')+'</span>'+
          '<div class="progress" style="background:#8a8a8a;"><i class="epg-prog" data-s="'+p.start.getTime()+'" data-e="'+p.end.getTime()+'" style="width:'+pct+'%"></i></div>'+
        '</div>'+
        '<div class="epg-next"><div class="epg-title">'+n.t+'</div><div class="epg-sub">Starts at '+clock(n.start)+'</div></div>'+
      '</div>';
    }).join('');
    // the programmes' bars follow the real clock; each Jump Right Back In title starts at a random point and keeps
    // playing: +1% every 3s, starting over when it ends, its "mins left" following its bar
    setInterval(function(){
      document.querySelectorAll('.epg-prog').forEach(function(bar){
        bar.style.width = Math.min(100, (Date.now() - bar.dataset.s) / (bar.dataset.e - bar.dataset.s) * 100) + '%';
      });
      document.querySelectorAll('.play-prog').forEach(function(bar){
        var w = parseFloat(bar.style.width) + 1;
        if(w > 100) w = 2;
        bar.style.width = w + '%';
        if(bar.dataset.dur){
          var s = bar.closest('.card').querySelector('.s');
          s.textContent = Math.max(1, Math.round(bar.dataset.dur * (100 - w) / 100)) + ' mins left';
          if(bar.closest('.card').classList.contains('focused') && typeof showHeroWatched === 'function') showHeroWatched(bar.closest('.card'));
        }
      });
    }, 3000);
    var countdown = '<div class="epg-countdown tv-chip item" data-title="TV Guide – View All" data-href="tv-guide.html"><b>TV Guide</b><span>View All</span></div>';
    // back from the player out of the browser's page cache: each card's heart as it is now (a favourite added there)
    addEventListener('pageshow', function(e){
      if(!e.persisted) return;
      document.querySelectorAll('.epg-card').forEach(function(card){
        var m = /[?&]play=([^&]+)/.exec(card.dataset.href || ''), c = m && window.TV.byName(decodeURIComponent(m[1]));
        if(!c) return;
        var icons = card.querySelector('.epg-icons'), h = icons.querySelector('.epg-heart'), on = window.TV.isFav(c);
        if(on && !h) icons.insertAdjacentHTML('beforeend', '<span class="epg-heart"><img src="icons/epg/heart.svg" alt=""></span>');
        else if(!on && h) h.remove();
      });
    });
    addRow('<div class="row-block epg-row"><div class="rail-viewport"><div class="rail-track">'+countdown+epgCards+'</div></div></div>');
  })();

  /* ---------- Row: Partner / All Apps ---------- */
  (function(){
    var apps = ['NETFLIX','HBO MAX','PRIME VIDEO','DISNEY+','VIU','WeTV','YouTube','Monomax','iQIYI','TrueID'];
    // Partner logo tiles from Figma ("logo apps", For-PBR node 625:57140), in the design's order; each logo image fills
    // its 230 x 111 card (object-fit: cover)
    var LOGO_TILES = [
      {t:'Netflix', img:'netflix.png'}, {t:'HBO Max', img:'hbo.png'}, {t:'Disney+ Hotstar', img:'disney.png'},
      {t:'Prime Video', img:'prime.png'}, {t:'Viu', img:'viu.png'}, {t:'MONOMAX', img:'monomax.png'},
      {t:'WeTV', img:'wetv.png'}, {t:'YouTube', img:'youtube.png'}, {t:'iQIYI', img:'iqiyi.png'}, {t:'TrueID', img:'trueid.png'}
    ];
    var cards = LOGO_TILES.map(function(a){
      return '<div class="partner-card partner-logo-tile item" data-title="'+a.t+'"><img src="partners/'+a.img+'" alt="'+a.t+'"></div>';
    }).join('');
    addRow('<div class="row-block partner-row"><div class="rail-viewport"><div class="rail-track">'+
      '<div class="partner-allapps tv-chip item" data-title="All Apps">All Apps</div>'+cards+
    '</div></div></div>');
  })();

  /* ---------- Generic poster rail helper ---------- */
  // a rail of posters, each a catalogue title (content.js MD.M, by key): its poster and platform tag; badge: a top tag
  // the rail adds ('Leaving Soon', 'Top 10')
  function posterRail(title, list){
    var cards = list.map(function(x){
      var k = x.k || x, m = M(k);
      return '<div class="card card-poster item" data-k="'+k+'" data-title="'+m.t.replace(/"/g, '&quot;')+'" style="'+cover(pic(k))+'">'+
        platformPill(m.plat)+(x.badge ? '<span class="time-pill top-tag">'+x.badge+'</span>' : '')+'</div>';
    }).join('');
    addRow('<div class="row-block"><div class="row-title">'+title+'</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  }

  posterRail('Hot Off the Big Screen', ['f1', 'house', 'john', 'venom', 'avatar', 'debt', 'topgun']);

  /* ---------- Row: Live and Upcoming ---------- */
  (function(){
    // the programmes: content.js (LIVE.list). A card on a Movie or Sport channel opens its detail page; any other plays
    // its channel in the Live TV player (via the TV Guide, which has its programmes and the mini EPG)
    function q(v){ return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
    var cards = LIVE.list.filter(function(p){ return !p.heroOnly && !p.hidden; }).map(function(p){
      var tv = window.TV.byName(p.tv), meta = tv ? 'Channel '+tv.no+': '+tv.n : '';
      return '<div class="card card-content item'+(p.live ? ' has-ribbon' : '')+'" data-title="'+q(p.t)+'" data-href="'+q(LIVE.href(p, 'home'))+'"'+
          (tv ? ' data-ch="'+q(tv.n)+'" data-meta="'+q(meta)+'"' : '')+(p.bg ? ' data-hero-bg="'+q(p.bg)+'"' : '')+' data-desc="'+q(p.d)+'">'+   // hero-bg: its detail page's picture
        '<div class="thumb" style="background-image:url(\''+p.img+'\');background-size:cover;background-position:center;">'+
          (p.live ? '' : '<span class="time-pill top-tag">'+p.when+'</span>')+
          Content.crownIcon({tv:p.tv}, 0, 'crown-tag')+'</div>'+   // premium, not the viewer's yet: gold (content.js)
        '<div class="strip"><div class="t">'+p.t+'</div></div>'+
        (p.live ? '<span class="live-ribbon">Live</span>' : '')+
      '</div>';
    }).join('');
    addRow('<div class="row-block"><div class="row-title">Live and Upcoming</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();

  /* ---------- Row: Top 10 in Thailand Today ---------- */
  (function(){
    var TOP10 = ['d9', 'house', 'john', 'venom', 'avatar', 'debt', 'topgun', 'thailaw', 'lotr', 'dollar'];   // content.js MD.M
    var cards = TOP10.map(function(k, i){
      var m = M(k);
      return '<div class="rank-wrap item" data-k="'+k+'" data-title="#'+(i+1)+' '+m.t.replace(/"/g, '&quot;')+'">'+
        Top10.numeral(i+1)+   // top10.js
        '<div class="card card-poster rank-poster" style="'+cover(pic(k))+'">'+platformPill(m.plat)+'</div>'+
      '</div>';
    }).join('');
    addRow('<div class="row-block">'+
      Top10.defs()+
      '<div class="row-title">Top 10 in Thailand Today</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
    // size the numerals; again once their font arrives, when the ring may already sit on a Top 10 poster
    Top10.ready(document, function(){ try{ placeHomeRing(true); }catch(e){} });
  })();


  /* ---------- Row: My List (landscape) ----------
     Each card keeps the pool picture it always had; the title, platform, meta line and synopsis behind each picture
     fill the screen text when it is focused (updateHeroFromCard: data-title / data-tag / data-meta / data-desc). */
  (function(){
    var MY_LIST = ['loki', 'lastofus', 'wicked', 'superman', 'topgun', 'dragon', 'odyssey', 'siralex'];   // content.js MD.M
    function attr(v){ return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
    var cards = MY_LIST.map(function(k){
      var m = M(k);
      return '<div class="card card-landscape item" data-k="'+k+'" data-title="'+attr(m.t)+'" style="'+cover(m.w || m.p)+'"></div>';
    }).join('');
    addRow('<div class="row-block"><div class="row-title">My List</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();

  /* ---------- Row: Shorts (Figma For-PBR "Short", 718:92507) ----------
     A dim artwork band behind the rail (30% opacity, fading into the page top and bottom), 220 x 330 short-drama
     poster cards, then a View All pill. Same band spacing as before: 56px above the title, cards centred. */
  (function(){
    // the first eight short dramas (content.js SHORTS, by data-s): Enter opens each one's page (Content.detailUrl); its
    // app's tag bottom-left (ReelShort / DramaBox / ShortMax), as the other poster rails
    var cards = SHORTS.slice(0, 8).map(function(c, i){
      return '<div class="card clip-card item" data-s="'+i+'" data-title="'+c.t.replace(/"/g, '&quot;')+'" style="background-image:url(\'posters/shorts/'+c.img+'\');">'+platformPill(c.plat)+'</div>';
    }).join('') + '<div class="clip-viewall tv-chip item" data-title="Shorts – View All" data-href="short.html" data-ring-art=""><b>Shorts</b><span>View All</span></div>';
    addRow('<div class="row-block clips-row"><div class="clips-bg"></div><div class="clips-bg band-full"></div><div class="row-title">Shorts</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();


  posterRail('Because You Watched “The Lord of the Rings: The Fellowship of the Ring”', ['lotr', 'twotowers', 'hobbit', 'smaug', 'lastking', 'vikings', 'got', 'huntsman', 'stardust', 'pirates', 'readyornot']);

  /* ---------- Row: AIS PLAY Exclusive ---------- */
  (function(){
    // Expanding cards, like Top Pick For You: portrait posters that widen into the feature card when focused; open, the
    // Store's PPV Event details (event-card.css): a tag top left (a match's kick-off, else the rail's badge), then over a
    // dark fade its title, its price with VAT (MD.price), the meta row (content.js Content.metaHtml: its platform tag,
    // Premium with its crown, as the PPV card, gold until bought) and synopsis.
    // Each a catalogue title (content.js MD.M, AIS PLAY's own); the rail adds its badge, kick-off and where the pictures sit
    var picks = [
      {k:'assanee', badges:['New Arrival'], ppos:'88% center'}, {k:'missuni', badges:['#1 in Thailand'], ppos:'90% center'},
      {k:'sophomores', badges:['Rerun']}, {k:'bossckm', badges:['New Arrival']}
    ];
    function vat(n){ return (Math.round(n * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2 }); }
    var cards = picks.map(function(it){
      var m = M(it.k), wide = m.w || MD.bg(it.k);
      return '<div class="card xcard item" data-k="'+it.k+'" data-title="'+m.t+'" data-ring-art="url(&quot;'+wide+'&quot;)">'+
        '<div class="xc-portrait" style="background-image:url(\''+m.p+'\');'+(it.ppos?'background-position:'+it.ppos+';':'')+'"></div>'+
        '<div class="xc-wide" style="background-image:url(\''+wide+'\');background-position:'+(it.pos || 'center')+';"></div>'+
        '<div class="xc-scrim ev-scrim"></div><span class="top-tag ev-top">'+(it.when || it.badges[0])+'</span>'+
        '<div class="xc-content ev-info">'+
          '<h3>'+m.t+'</h3>'+
          (MD.price(it.k) ? '<div class="cost"><b>'+MD.price(it.k)+' baht</b><span>(VAT Included: '+vat(MD.price(it.k))+' baht)</span></div>' : '')+
          '<div class="meta">'+Content.metaHtml({k:it.k}, true)+'</div>'+
          '<p class="syn">'+m.d+'</p>'+
        '</div>'+
      '</div>';
    }).join('');
    addRow('<div class="row-block toppick-row"><div class="row-title">AIS PLAY Exclusive</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();

  addRow('<div class="row-block"><div class="row-title">Grab the Mic!</div><div class="rail-viewport"><div class="rail-track"></div></div></div>');
  /* replace last row's plain posters with karaoke styled cards */
  (function(){
    var last = rowDefs[rowDefs.length-1];
    var songs = [
      ['First Love','Nont Tanont',7], ['Polaroid','Unknown Artist',8], ['Recently Deleted','Atom',9],
      ['Sabai Sabi','Thongchai McIntyre',1], ['Mae','Loso',2],
      ['Do You Want Me to Stay With You','Asanee-Wasan',3], ['Let It Be','The Beatles',4],
      ['Take Me Home, Country Roads','John Denver',5], ['Wanipok','Carabao',6]
    ];
    var cards = songs.map(function(s){
      return '<div class="card-karaoke tv-glass item" data-title="'+s[0]+' – '+s[1]+'">'+
        '<img class="art" src="posters/karaoke/k'+s[2]+'.jpg" alt="">'+
        '<div class="meta"><div class="song">'+s[0]+'</div><div class="artist">'+s[1]+'</div></div>'+
      '</div>';
    }).join('');
    last.track.innerHTML = cards;
    last.track.classList.add('karaoke-track');
  })();


  /* ---------- Row: Quick Access (Figma "Rail - My Subscription", 3258:337279) ----------
     Four 407 x 180 cards: a short status line, then the icon and the name. */
  (function(){
    var cards = [
      {t:'My Subscription', sub:'4 Subscriptions', ic:'subscription'}, {t:'My Rentals', sub:'8 items', ic:'rental'},
      {t:'FAQs', sub:'Billing, devices, how to watch', ic:'faqs'}, {t:'Settings', sub:'Manage your account and preferences', ic:'setting'}
    ];
    addRow('<div class="row-block quick-row"><div class="rail-viewport"><div class="rail-track">'+
      cards.map(function(c){ return '<div class="quick-card tv-chip item" data-title="'+c.t+'" data-ring-art="">'+
        '<span class="qc-sub">'+c.sub+'</span><span class="qc-name"><img src="icons/quick/'+c.ic+'.svg" alt="">'+c.t+'</span></div>'; }).join('')+
    '</div></div></div>');
  })();

  /* ================= Rails added from Figma Home (3256:172369) =================
     Built after every older rail, so the pool posters those take stay where they were; the rail order below puts
     each one in its place. */

  /* ---------- Row: Hot Channel Program (Live and Upcoming's cards, crown on premium, the Live ribbon: all on now) ----------
     The News page's programme pictures (news-assets/), with their titles, channels and descriptions there; focused,
     a card's picture and text fill the screen (updateHeroFromCard: data-meta / data-desc). */
  (function(){
    // the programmes: content.js LIVE.hot, each on its TV Guide channel (number, name, round logo and Premium)
    function attrQ(v){ return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
    var cards = LIVE.hot.map(function(p){
      var pic = "background-image:url('"+p.img+"');background-position:center;" +
        (p.logo ? 'background-size:67% auto;background-repeat:no-repeat;background-color:#fff;' : 'background-size:cover;');   // CNN: its logo on white, as on News
      // Enter as any channel's programme (content.js LIVE.href: a Movie / Sport channel's detail page, else the channel
      // in the Live TV player)
      var chName = p.tv, tv = window.TV.byName(chName), prog = p;
      return '<div class="card card-content item has-ribbon" data-title="'+attrQ(p.t)+'" data-live="1" data-href="'+attrQ(LIVE.href(prog, 'home'))+'"'+
        (tv ? ' data-ch="'+attrQ(tv.n)+'" data-meta="'+attrQ('Channel '+tv.no+': '+tv.n)+'"' : '')+(p.bg ? ' data-hero-bg="'+attrQ(p.bg)+'"' : '')+' data-desc="'+attrQ(p.d)+'">'+
        '<div class="thumb" style="'+pic+'">'+Content.crownIcon({tv:chName}, 0, 'crown-tag')+'</div>'+
        '<div class="strip"><div class="t">'+p.t+'</div></div>'+   // the Live and Upcoming card
        '<span class="live-ribbon">Live</span></div>';   // on now, as its hero's LIVE: the Live and Upcoming cards' ribbon
    }).join('');
    addRow('<div class="row-block"><div class="row-title">Hot Channel Program</div><div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();

  /* ---------- Row: Recommended Apps ---------- */
  (function(){
    var apps = [
      {t:'Google Play', img:'google-play.png', bg:'app-google-play.webp'}, {t:'YouTube', img:'youtube-white.jpg', white:true, bg:'app-youtube.webp'},
      {t:'YouTube Music', img:'youtube-music.jpg', bg:'app-youtube-music.webp'}, {t:'Google Play Games', img:'google-play-games.jpg', bg:'app-google-play-games.webp'}
    ];
    var cards = apps.map(function(a){
      return '<div class="partner-card partner-logo-tile item'+(a.white?' on-white':'')+'" data-title="'+a.t+'" data-app-bg="posters/hero/'+a.bg+'"><img src="partners/'+a.img+'" alt="'+a.t+'"></div>';
    }).join('');
    addRow('<div class="row-block recapps-row"><div class="row-title">Recommended Apps</div><div class="rail-viewport"><div class="rail-track">'+
      cards+'</div></div></div>');
  })();

  /* ---------- Row: Highlight (LPGA golf) ---------- */
  (function(){
    // the golf highlights (content.js MD.M, AIS PLAY's own), with the rail's badges
    var list = [['hl1'], ['hl2','Top 10'], ['hl5'], ['hl3','New'], ['hl4'], ['hl6','New'], ['hl7','Top 10']];
    var cards = list.map(function(x){
      var m = M(x[0]);
      return '<div class="card card-poster item" data-k="'+x[0]+'" data-title="'+m.t+'" style="'+cover(m.p)+'">'+
        (x[1] ? '<span class="time-pill top-tag">'+x[1]+'</span>' : '')+'</div>';
    }).join('');
    addRow('<div class="row-block hl-row"><div class="hl-bg"></div><div class="hl-bg band-full"></div>'+
      '<div class="hl-info"><h3>LPGA Golf</h3><p>Every round from the LPGA tour in Thailand and beyond: Honda LPGA Thailand 2024, the LPGA Lotte Championship and the season\'s best match-play moments.</p></div>'+
      '<div class="rail-viewport"><div class="rail-track">'+cards+'</div></div></div>');
  })();

  /* ---------- Rows: genre rails ---------- */
  posterRail('Worlds in Chaos', ['y2012', 'westfront', 'wotw', 'wwz', 'khemjira', 'medium', 'thailaw', {k:'debt', badge:'Leaving Soon'}, 'judge', {k:'bigmouth', badge:'Leaving Soon'}, {k:'vincenzo', badge:'Top 10'}]);
  posterRail('We think you’ll love this', ['anne', 'trauma', 'blackbird', 'cmbyn', 'weakhero', 'anyonebut', 'myname', 'bbcsherlock', 'gooddoctor', 'wolfws']);
  posterRail('Date Night Picks', ['oneday', 'family', {k:'again', badge:'Leaving Soon'}, 'lawless', 'purple', 'sunrise', 'holidate', 'lalaland', 'oxford', 'starborn', 'meangirls', 'ideaofyou']);

  /* ---------- Row: Seasonal / Collection ---------- */
  (function(){
    var sets = [
      {t:'Summer Blockbusters', img:'posters_portrait/collection/summer.jpg'}, {t:'Halloween Night', img:'posters_portrait/collection/halloween.jpg'},
      {t:'Fantasy Worlds', img:'posters_portrait/collection/fantasy.jpg'}, {t:'Action Collection', img:'posters_portrait/collection/action.jpg'},
      {t:'Speed & Racing', img:'posters_portrait/collection/racing.jpg'}
    ];
    addRow('<div class="row-block seasonal-row"><div class="row-title">Seasonal/Collection</div><div class="rail-viewport"><div class="rail-track">'+sets.map(function(c){
      return '<div class="season-card item" data-title="'+c.t+'" style="background-image:url(\''+c.img+'\');"><span>'+c.t+'</span></div>';
    }).join('')+'</div></div></div>');
  })();

  /* ---------- Row: Choose what you like (genre tabs on the left, a five-column grid on the right, then Skip / Continue) ---------- */
  (function(){
    // each genre reuses the closest of the 12 topic pictures (posters/genres/g1..g12)
    var cats = [
      {name:'Entertainment', items:[['Action',1],['Adult',3],['Animal',8],['Anime',12],['Cartoon',5],['Classic',3],['Comedy',5],['Concert',6],
        ['Crime',1],['Dark',2],['Drama',3],['Esports',9],['Family',11],['Fantasy',4],['Food',10],['Game show',11],['History',8],['Horror',2],
        ['LGBTQ',3],['Martial arts',12],['Music',6],['Musical',6],['Mystery',2],['Reality',11],['Religious',8],['Romance',3],['Sci-fi',4],
        ['Sports',7],['Talk show',9],['Thriller',2],['Travel',10],['Variety',11]]},
      {name:'Sports', items:[['Football',7],['Tennis',7],['Golf',7],['Basketball',7],['Boxing',7],['NFL',7],['Rugby',7],['International Tournament',7],['Other',7]]},
      {name:'Live TV', items:[['Movies & Series',12],['Cartoons',5],['Variety',11],['Sports',7],['News',9],['Education',8],['Shopping',10],['Documentary',8]]}
    ];
    function esc(t){ return t.replace(/&/g,'&amp;'); }
    addRow('<div class="row-block gc-picker"><div class="gc-title"><h2>Choose what you like</h2>'+
      '<p>Pick up to 7 in each category. Your Home will show rails for the topics you choose.</p></div>'+
      '<div class="gc-body"><div class="gc-tabs">'+cats.map(function(c, i){
        return '<div class="gc-tab tv-tab item'+(i ? '' : ' active-dim')+'" data-act="genre-tab" data-cat="'+i+'" data-title="'+c.name+'" data-ring-art=""><b>'+c.name+'</b><small></small></div>';
      }).join('')+'</div>'+
      '<div class="gc-pane"><div class="gc-vp">'+cats.map(function(c, ci){
        return '<div class="gc-grid'+(ci ? '' : ' cur')+'">'+c.items.map(function(g, i){
          return '<div class="genre item" data-act="genre" data-cat="'+ci+'" data-i="'+i+'" data-title="'+esc(g[0])+'" style="background-image:url(\'posters/genres/g'+g[1]+'.jpg\');">'+
            '<span class="gchk" aria-hidden="true"></span><span>'+esc(g[0])+'</span></div>';
        }).join('')+'</div>';
      }).join('')+'</div></div></div>'+
      '<div class="gc-actions">'+
        '<div class="gc-btn tv-btn tv-btn--secondary item" data-act="genre-skip" data-title="Skip" data-ring-art="">Skip</div>'+
        '<div class="gc-btn tv-btn tv-btn--primary off item" data-act="genre-continue" data-title="Continue" data-ring-art="">Continue</div>'+
      '</div></div>');
  })();

  /* ---------- Row: Choose What I See (Figma 572:57330): its Customize button opens Choose what you like in its place ---------- */
  addRow('<div class="row-block gc-cta open"><div class="gc-cta-panel"><div class="gc-cta-posters">'+
    [5,4,3,2,1].map(function(n){ return '<img src="posters/customize/c'+n+'.jpg" alt="">'; }).join('')+'</div>'+
    '<div class="gc-cta-shade"></div><div class="gc-cta-text"><h2>Choose What I See</h2>'+
    '<div class="tv-btn tv-btn--primary item" data-act="customize" data-title="Customize" data-ring-art="">Customize</div></div></div></div>');

  /* ---------- Row: Back to Top ---------- */
  addRow('<div class="row-block back-row"><div class="rail-viewport"><div class="rail-track">'+
    '<div class="back-top tv-btn tv-btn--primary tv-btn--top item" data-act="top" data-title="Back to Top" data-ring-art=""><i></i>Back to Top</div></div></div></div>');

  /* ---------- Rail order: Figma Home (3258:337279) ----------
     The rails are built above in their old order (so each keeps the pool posters it always had), then moved into
     the design's order: '.x' matches a rail by class or contents, anything else by the start of its title. Rails
     the list doesn't name keep their place at the end. */
  (function(){
    var ORDER = ['.hero-row', '.chip-row', 'Jump Right Back In', 'Top 10 in Thailand Today', '.partner-row', '.epg-row',
      'Live and Upcoming', 'Hot Channel Program', 'Hot Off the Big Screen', 'My List', 'Recommended Apps',
      'AIS PLAY Exclusive', '.clips-row', '.hl-row', 'Worlds in Chaos', 'We think you', 'Date Night Picks',
      'Because You Watched', '.seasonal-row', '.karaoke-track', '.gc-cta', '.gc-picker', '.quick-row', '.back-row'];
    function rank(d){
      var t = d.el.querySelector('.row-title'), title = t ? t.textContent.trim() : '';
      for(var i = 0; i < ORDER.length; i++){
        var m = ORDER[i];
        if(m.charAt(0) === '.' ? (d.el.matches(m) || d.el.querySelector(m)) : title.indexOf(m) === 0) return i;
      }
      return ORDER.length;
    }
    rowDefs = rowDefs.map(function(d, i){ return {d:d, r:rank(d), i:i}; })
      .sort(function(a, b){ return a.r - b.r || a.i - b.i; })
      .map(function(x){ root.appendChild(x.d.el); return x.d; });
  })();

  var spacer = document.createElement('div');
  spacer.className = 'end-spacer';
  root.appendChild(spacer);

  /* ================= Focus / navigation engine ================= */
  var rows = rowDefs.map(function(r){
    return { el: r.el, items: Array.prototype.slice.call(r.el.querySelectorAll('.item')), track: r.track };
  }).filter(function(r){ return r.items.length > 0; });
  // Choose what you like isn't a rail of its own: it waits off the page until Customize opens it (openPicker)
  var pickerRow = rows.filter(function(r){ return r.el.classList.contains('gc-picker'); })[0];
  rows.splice(rows.indexOf(pickerRow), 1);
  var ctaRow = rows.filter(function(r){ return r.el.classList.contains('gc-cta'); })[0];

  // prepend the nav row (already in DOM, not created via addRow)
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.topnav .item'));
  rows.unshift({ el: document.querySelector('.topnav'), items: navItems, track: document.querySelector('.topnav .center') });
  var NAV_HOME_COL = Math.max(0, navItems.indexOf(document.querySelector('.navtab[data-label="Home"]')));
  // the profile panel under the photo: profAt is the focused button in it (-1: focus is not in the panel)
  var profileEl = document.querySelector('.topnav .profile'), profPanel = document.getElementById('profPanel');
  var profBtns = Array.prototype.slice.call(profPanel.querySelectorAll('.prof-btn')), profAt = -1;
  function profAction(b){
    var act = b.dataset.act;
    if(act === 'exit'){ window.location.href = 'launcher.html'; return; }
    toast(b.textContent.trim() + ' isn\'t part of this prototype yet');
  }
  // keys while the photo or its panel has focus; returns true when handled
  function profKey(k){
    var onPhoto = curRow === 0 && navItems[colByRow[0]] === profileEl;
    if(!onPhoto) return false;
    if(profAt < 0){
      if(k === 'ArrowDown' || k === 'Enter'){ profAt = 0; updateFocus(); return true; }
      return false;
    }
    if(k === 'ArrowDown') profAt = Math.min(profBtns.length - 1, profAt + 1);
    else if(k === 'ArrowUp') profAt--;   // up from My Account: back on the photo
    else if(k === 'Enter'){ profAction(profBtns[profAt]); return true; }
    else if(k === 'Escape' || k === 'Backspace') profAt = -1;
    else return true;   // Left / Right stay in the panel
    updateFocus(); return true;
  }
  profBtns.forEach(function(b, i){ b.addEventListener('click', function(e){ e.stopPropagation(); profAt = i; updateFocus(); profAction(b); }); });

  // first focus: the first card of the hero row (row 1; row 0 is the top nav)
  var curRow = 1;
  // the rail the top nav was reached from with Left (0: reached the normal way, from the first rail). While the nav
  // is focused the page stays as that rail left it, and Down goes back to it.
  var navFrom = 0;
  function ctxRow(){ return curRow === 0 && navFrom ? navFrom : curRow; }
  var colByRow = rows.map(function(){ return 0; });
  // Customize swaps the banner for the picker, in the same place on the page; Back swaps them again
  function swapRow(from, to){
    var at = rows.indexOf(from);
    from.el.classList.remove('open'); to.el.classList.add('open');
    from.items[colByRow[at]].classList.remove('focused');
    rows[at] = to; colByRow[at] = 0;
    updateFocus();
  }
  // Choose what you like: once Continue (after the loading) or Skip is pressed, it leaves the page with its banner; both
  // are back the next time Home loads (nothing is remembered, so the demo repeats)
  function removePicker(){
    ctaRow.el.remove();
    for(var i = rows.length - 1; i > 0; i--){
      if(isPicker(i)){ rows[i].el.remove(); rows.splice(i, 1); colByRow.splice(i, 1); }
    }
  }
  colByRow[0] = NAV_HOME_COL;

  function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

  var RING_W_DESIGN = 8 + 4;   // the ring's band + its gap
  // the scale an item grows to when focused (matches the .focused rules in the CSS)
  function focusScale(el){
    if(el.matches('.prof-btn')) return 1;
    if(el.closest('.topnav')) return 1.06;
    if(el.closest('.toppick-row, .seasonal-row')) return 1.05;
    return 1.08;   // every rail item, Top 10 posters included
  }
  function updateTrackTransform(rowIdx){
    var r = rows[rowIdx];
    if(!r.track) return;
    var viewport = r.track.parentElement;
    var item = r.items[colByRow[rowIdx]];
    if(!item) return;
    // "Fixed focus": the focused item sits at the first item's slot (the anchor) and the rail slides under it. The
    // rail stops at maxScroll, where the last item ends the same distance from the right edge as the first starts
    // from the left (the rail's left inset), allowing for its focus scale-up and ring; past that the focus (and
    // the ring) moves on alone to the last items. Short rails never scroll.
    var pad = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
    var first = r.items[0], last = r.items[r.items.length - 1];
    var lastRight = last.offsetLeft + last.offsetWidth;
    var extra = last.offsetWidth * (focusScale(last) - 1) / 2 + RING_W_DESIGN;
    var maxScroll = Math.max(0, lastRight + extra + 2 * pad - viewport.clientWidth);
    var desired = item.offsetLeft - first.offsetLeft;
    var x = -clamp(desired, 0, maxScroll);
    r.track.style.transform = 'translateX(' + x + 'px)';
  }

  function toast(msg){
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(function(){ t.classList.remove('show'); }, 1400);
  }

  /* ---------- Dynamic hero: reflects whichever card is focused in the
     "Jump Right Back In" row (rows[1]) — crossfades the background and
     swaps title/description, like a TV home-screen "top shelf". ---------- */
  var HERO_ROW_INDEX = 1;
  // rows[1..]: the hero cards, the category chips, Continue watching, Top 10, Apps, TV Guide, Live and Upcoming,
  // Hot Channel Program, Hot Off the Big Screen, My List and Recommended Apps — the "dynamic background" zone.
  // AIS PLAY Exclusive onward has no dynamic background driving the screen, so center-lock scrolling takes over.
  // FULLSCREEN_FROM: the first rail that takes the whole screen (hero picture and text fade out); every rail above it
  // sits over the pinned hero picture. Found by its title, so adding rows above it keeps working.
  var FULLSCREEN_FROM_TITLE = 'AIS PLAY Exclusive';
  var FULLSCREEN_FROM = (function(){
    for(var i = 0; i < rows.length; i++){
      var t = rows[i].el && rows[i].el.querySelector('.row-title');
      if(t && t.textContent.trim() === FULLSCREEN_FROM_TITLE) return i;
    }
    return 9;
  })();
  var HERO_ZONE_LAST_ROW = FULLSCREEN_FROM - 1;
  // Must match .hero's CSS height (design px) — used to keep rows clear of
  // the pinned hero's bottom edge.
  var HERO_HEIGHT = 600;
  var heroBgA = document.querySelector('.hero-bg-a');
  var heroBgB = document.querySelector('.hero-bg-b');
  var heroBgActive = 'a';
  var heroContent = document.querySelector('.hero-content');
  var heroTitleEl = document.querySelector('.hero-title');
  var heroLogoEl = document.querySelector('.hero-logo');
  var heroChannelEl = document.querySelector('.hero-channel');
  var heroChLogoEl = document.querySelector('.hero-chlogo');   // a channel card's round logo (else hidden)
  var heroDescEl = document.querySelector('.hero-desc');
  var heroUpEl = document.querySelector('.hero-mbadge.up'), heroPremEl = document.querySelector('.hero-mbadge.prem'), heroRangeEl = document.querySelector('.hero-range');
  // a channel's programme (content.js LIVE, else null): Upcoming, Premium and its time on air, as its detail page's meta row
  function showHeroProg(p){
    heroUpEl.style.display = p && !p.live ? '' : 'none';
    var prem = p ? Content.crownIcon({tv:p.tv}) : '';   // gold only (content.js)
    heroPremEl.style.display = prem ? '' : 'none';
    if(prem) heroPremEl.innerHTML = prem+'Premium';
    heroRangeEl.style.display = p ? '' : 'none';
    if(p) heroRangeEl.textContent = LIVE.range(p);
  }
  var heroWatchedEl = document.querySelector('.hero-watched');
  // a Jump Right Back In card in the hero: its bar and "33m of 58m" under the title (null: none shown)
  // how far in: a title being watched (content.js MD.watched, as its detail page), else the card's own bar
  function showHeroWatched(el, k){
    var wd = k && MD.watched(k), bar = !wd && el && el.querySelector('.play-prog[data-dur]');
    if(bar){ var dur = +bar.dataset.dur, pct = parseFloat(bar.style.width); wd = { w:Math.round(dur * pct / 100), of:dur, pct:pct }; }
    heroWatchedEl.style.display = wd ? '' : 'none';
    if(wd) heroWatchedEl.innerHTML = '<span class="bar"><i style="width:' + wd.pct + '%"></i></span>' + wd.w + 'm of ' + wd.of + 'm';
  }
  var heroLiveEl = document.querySelector('.hero .badge-live');
  var currentHeroImgKey = LIVE.find(FIRST_SLIDE).bg;   // home.html starts on this slide's picture and video
  var heroVideo = document.querySelector('.hero-bg-video');
  if(heroVideo) heroVideo.addEventListener('playing', function(){ if(heroVideos[currentHeroImgKey]) heroVideo.classList.remove('off'); });

  // the screen pictures that have a video (content.js v): any live match (the first slide, Live and Upcoming) or title with one
  var heroVideos = {};
  LIVE.list.concat(LIVE.hot).forEach(function(p){ if(p.v && p.bg && !p.hidden) heroVideos[p.bg] = p.v; });
  Object.keys(MD.M).forEach(function(k){ if(MD.M[k].v) heroVideos[MD.bg(k)] = MD.M[k].v; });
  function isVideoSlide(it){ return !!(heroVideo && it && heroVideos[it.dataset.heroImg]); }
  // is the focused item showing a video? A first-scene slide, or a rail's card for a title with one (District 9)
  function videoInFocus(atScene){
    if(atScene) return isVideoSlide(rows[HERO_ROW_INDEX].items[colByRow[HERO_ROW_INDEX]]);
    var el = rows[curRow] && rows[curRow].items[colByRow[curRow]];
    if(!el || !(el.classList.contains('card') || el.classList.contains('rank-wrap')) || ctxRow() > HERO_ZONE_LAST_ROW) return false;   // (a Top 10 item: its .rank-wrap)
    if(el.dataset.ch) return !!heroVideos[el.dataset.heroBg];   // a channel's programme with a video (Live and Upcoming, Hot Channel Program)
    var ci = Content.info(el.closest('.rank-wrap') || el), h = ci && Content.hero(ci);
    return !!(h && heroVideos[h.bg]);
  }
  // The video's sound: on while its slide is on screen in the first scene (focus on its card, or on the top bar
  // above it) or a rail's card shows a title's video, muted anywhere else, on another slide, or in another tab. Browsers only allow sound after a key press or
  // click on the page, so it comes on with the first one; until then the video plays muted.
  var heroSoundOk = false;
  function syncHeroSound(){
    if(!heroVideo) return;
    var atScene = curRow === HERO_ROW_INDEX || (curRow === 0 && !navFrom);
    var on = heroSoundOk && !document.hidden && videoInFocus(atScene);
    if(heroVideo.muted === !on) return;
    heroVideo.muted = !on;
    if(on && heroVideo.paused && !heroVideo.ended) heroVideo.play().catch(function(){});
  }
  function allowHeroSound(){ if(heroSoundOk) return; heroSoundOk = true; setTimeout(syncHeroSound, 0); }
  addEventListener('keydown', allowHeroSound, true);
  addEventListener('pointerdown', allowHeroSound, true);
  document.addEventListener('visibilitychange', syncHeroSound);
  addEventListener('pagehide', function(){ if(heroVideo) heroVideo.muted = true; });
  // crossfade the screen background to a new picture (key: anything identifying it, css: a CSS url(...))
  function setHeroBg(key, css){
    if(!key || key === currentHeroImgKey || !heroBgA || !heroBgB) return;
    currentHeroImgKey = key;
    if(heroVideo){
      var vsrc = heroVideos[key];
      if(!vsrc) heroVideo.classList.add('off');
      else {
        if(heroVideo.getAttribute('src') !== vsrc){ heroVideo.classList.add('off'); heroVideo.src = vsrc; }   // the picture shows until its first frame
        else if(!heroVideo.paused) heroVideo.classList.remove('off');
        heroVideo.play().catch(function(){});
      }
    }
    var to = heroBgActive === 'a' ? heroBgB : heroBgA, from = heroBgActive === 'a' ? heroBgA : heroBgB;
    to.style.backgroundImage = css;
    to.style.opacity = '1';
    from.style.opacity = '0';
    heroBgActive = heroBgActive === 'a' ? 'b' : 'a';
  }
  // A content card focused in a rail under the hero (Jump Right Back In, Hot Off the Big Screen, Live and Upcoming,
  // Top 10): its own picture becomes the screen background and its title the screen title (no channel/description)
  function updateHeroFromCard(el){
    if(curRow <= HERO_ROW_INDEX || curRow > HERO_ZONE_LAST_ROW || !el) return;
    heroChLogoEl.style.display = 'none';   // (a channel's programme shows it again below)
    showHeroProg(null);
    if(el.classList.contains('rank-wrap')) el = el.querySelector('.card') || el;
    showHeroWatched(el.classList.contains('card') ? el : null);
    // TV Guide rail: its own dark backdrop; the "View All" tile introduces the guide, a programme card shows what's on
    if(el.closest('.epg-row')){
      setHeroBg('tvguide', "url('posters/tvguide-bg.jpg')");
      var isAll = el.classList.contains('epg-countdown');
      heroTitleEl.textContent = isAll ? 'TV Guide' : el.dataset.title;
      heroLogoEl.style.display = 'none';
      var next = el.querySelector('.epg-next .epg-title');
      heroChannelEl.textContent = isAll ? '' : (el.querySelector('.epg-now .epg-sub').textContent + (next ? '  ·  Next: ' + next.textContent : ''));
      heroLiveEl.style.display = 'none';   // no Live tag for TV Guide programmes
      heroChannelEl.parentElement.style.display = isAll ? 'none' : '';   // no info line under "TV Guide"
      heroDescEl.textContent = isAll ? 'See what\'s on now and next across all your channels, and never miss a live moment.' : '';
      heroDescEl.style.display = isAll ? '' : 'none';
      heroSection.classList.add('card-mode');
      return;
    }
    // All Apps rail: the apps backdrop; the "All Apps" tile introduces the apps, a logo tile names its app
    if(el.closest('.partner-row, .recapps-row')){
      if(el.dataset.appBg) setHeroBg(el.dataset.appBg, "url('" + el.dataset.appBg + "')");   // Recommended Apps: each app's own backdrop
      else setHeroBg('allapps', "url('posters/allapps-bg.jpg?v=2')");
      var isApps = el.classList.contains('partner-allapps');
      heroTitleEl.textContent = isApps ? 'All Apps' : el.dataset.title;
      heroLogoEl.style.display = 'none';
      heroLiveEl.style.display = 'none';
      heroChannelEl.parentElement.style.display = 'none';
      heroDescEl.textContent = isApps ? 'All your favorite streaming apps in one place.\nNetflix, HBO Max, Disney+ Hotstar, Prime Video and more, ready to watch.'
                                      : 'Open ' + el.dataset.title + ' and pick up right where you left off.';
      heroDescEl.style.display = '';
      heroSection.classList.add('card-mode');
      return;
    }
    if(!el.classList.contains('card')) return;
    var art = artOf(el);
    if(!art) return;
    // a title (movie, series, short, AIS PLAY's own): word for word what its detail page shows (content.js Content.hero)
    var ci = !el.dataset.ch && Content.info(el.closest('.rank-wrap') || el), h = ci && Content.hero(ci);
    if(h){
      if(h.bg) setHeroBg(h.bg, "url('" + h.bg + "')");
      heroTitleEl.textContent = h.t;
      heroLogoEl.classList.toggle('ais', h.plat === 'ais');
      heroLogoEl.src = h.plat === 'ais' ? 'icons/aisplay-mark.png' : 'badges/' + heroTagFile(h.plat);
      heroLogoEl.style.display = '';
      // after the tag: Premium and the meta row, as the detail page (content.js)
      if(h.k){ heroChannelEl.innerHTML = Content.metaHtml({k:h.k}); showHeroWatched(el, h.k); }
      else heroChannelEl.innerHTML = Content.metaHtml({s:h.s});
      heroLiveEl.style.display = 'none';
      heroChannelEl.parentElement.style.display = '';
      heroDescEl.textContent = h.d; heroDescEl.style.display = '';
      heroSection.classList.add('card-mode');
      return;
    }
    if(el.dataset.heroBg) setHeroBg(el.dataset.heroBg, "url('" + el.dataset.heroBg + "')");
    else setHeroBg(art, art);
    // a channel's programme (data-ch: Live and Upcoming, Hot Channel Program): its own words (content.js LIVE)
    var ownTitle = (el.dataset.title || (el.parentElement && el.parentElement.dataset.title) || '').replace(/^#\d+\s+/, '');
    if(heroTitleEl && ownTitle) heroTitleEl.textContent = ownTitle;
    // tag: the card's provider tag logo (or a data-tag); info line: data-meta, else the card's "mins left" / time
    var tagImg = el.querySelector('img[src*="badges/tag-"]');
    var tag = el.dataset.tag ? 'badges/' + el.dataset.tag : (tagImg ? tagImg.getAttribute('src') : '');
    // a channel's programme (data-ch): the channel's round logo in place of an OTT's square tag
    var chc = el.dataset.ch && window.TV.byName(el.dataset.ch);
    if(chc){ tag = ''; heroChLogoEl.innerHTML = window.TV.logoHtml(chc); }
    heroChLogoEl.style.display = chc ? '' : 'none';
    // its programme: the Live and Upcoming rail's (content.js LIVE), else what's on now (Hot Channel Program: data-live)
    var prog = chc && (LIVE.find(ownTitle) || (el.dataset.live ? {t:ownTitle, tv:chc.n, live:true} : null));
    showHeroProg(prog);
    heroLogoEl.style.display = tag ? '' : 'none';
    if(tag) heroLogoEl.src = tag;
    var sub = el.querySelector('.s, .time-pill');
    heroChannelEl.textContent = el.dataset.meta || (sub ? sub.textContent : '');
    if(el.querySelector('.play-prog[data-dur]')) heroChannelEl.textContent = '';   // the bar above says how far in: no "mins left" again
    heroLiveEl.style.display = el.querySelector('.live-ribbon') || (prog && prog.live) ? '' : 'none';
    heroChannelEl.parentElement.style.display = tag || chc || heroChannelEl.textContent || heroLiveEl.style.display === '' ? '' : 'none';   // nothing to say: no empty line
    var desc = el.dataset.desc || '';
    heroDescEl.textContent = desc;
    heroDescEl.style.display = desc ? '' : 'none';
    heroSection.classList.add('card-mode');
  }
  function updateHeroFromItem(item){
    if(!item || !item.dataset || !item.dataset.heroTitle) return;
    heroChLogoEl.style.display = 'none';
    showHeroProg(null);
    showHeroWatched(null);
    var img = item.dataset.heroImg;
    if(img) setHeroBg(img, "url('" + img + "')");
    if(heroSection) heroSection.classList.add('card-mode');
    if(heroLogoEl) heroLogoEl.style.display = '';
    if(heroDescEl) heroDescEl.style.display = '';
    if(heroChannelEl) heroChannelEl.parentElement.style.display = '';
    if(heroTitleEl) heroTitleEl.textContent = item.dataset.heroTitle;
    if(heroLogoEl){ heroLogoEl.classList.remove('ais'); heroLogoEl.src = 'badges/' + heroTagFile(item.dataset.heroLogo); heroLogoEl.alt = item.dataset.heroLogo; }
    // a title's slide: its meta row and how far in, as its detail page (content.js); a live slide: below
    if(heroChannelEl){ if(item.dataset.k) heroChannelEl.innerHTML = Content.metaHtml({k:item.dataset.k}); else heroChannelEl.textContent = item.dataset.heroChannel; }
    if(item.dataset.k) showHeroWatched(null, item.dataset.k);
    if(heroDescEl) heroDescEl.textContent = item.dataset.heroDesc;
    if(heroLiveEl) heroLiveEl.style.display = (item.dataset.heroLive === '1') ? '' : 'none';
    // a live slide is a channel's programme: the channel's round logo and its TV Guide number and name, not an OTT tag
    var tvc = item.dataset.heroTv && window.TV.byName(item.dataset.heroTv);
    if(tvc){
      heroLogoEl.style.display = 'none';
      heroChLogoEl.innerHTML = window.TV.logoHtml(tvc); heroChLogoEl.style.display = '';
      heroChannelEl.textContent = 'Channel ' + tvc.no + ': ' + tvc.n;
      showHeroProg(LIVE.find(item.dataset.heroTitle));
    }
  }

  function updateFocus(prevRow){
    if(isPicker(curRow)) gcSync();
    // the first rail has focus (or the top bar above it): the hero text sits 80px over its cards (home.css .at-scene)
    if(heroSection) heroSection.classList.toggle('at-scene', curRow === HERO_ROW_INDEX || (curRow === 0 && !navFrom));
    rows.forEach(function(r,ri){
      r.items.forEach(function(it,ci){
        it.classList.toggle('focused', profAt < 0 && ri===curRow && ci===colByRow[ri]);
      });
    });
    // top bar: the current page (Home) is Active while the D-pad is on the bar, Active dim while it's in the content
    var homeTab = navItems[NAV_HOME_COL];
    homeTab.classList.toggle('active', curRow === 0);
    homeTab.classList.toggle('active-dim', curRow !== 0);
    // the profile panel: open while the photo (or something in the panel) has focus
    var profOn = curRow === 0 && navItems[colByRow[0]] === profileEl;
    if(!profOn) profAt = -1;
    profileEl.parentElement.classList.toggle('prof-open', profOn);
    profileEl.classList.toggle('open', profAt >= 0);
    profPanel.setAttribute('aria-hidden', profOn ? 'false' : 'true');
    profBtns.forEach(function(b, i){ b.classList.toggle('focused', i === profAt); });
    updateTrackTransform(curRow);
    // The hero is pinned (position:fixed, never scrolls) for as long as
    // focus is anywhere in the dynamic-background zone (rows 0-8), so it
    // never gets pushed away while browsing those rows. Past that zone
    // there's no more dynamic background driving the screen, so it fades
    // out instead of scrolling off.
    var cr = ctxRow();
    // the top bar: hidden once focus is past the first rail, back as an overlay while it has focus (woken with Left)
    if(topnavFixed){
      topnavFixed.classList.toggle('nav-away', curRow !== 0 && cr > HERO_ROW_INDEX);
      topnavFixed.classList.toggle('nav-overlay', curRow === 0 && cr > HERO_ROW_INDEX);
    }
    if(heroFixed) heroFixed.classList.toggle('hero-hidden', cr > HERO_ZONE_LAST_ROW);
    if(heroBackdrop) heroBackdrop.classList.toggle('hero-hidden', cr > HERO_ZONE_LAST_ROW);
    applyRowsMask(getScale());
    // While the hero shows, rails above the focused one are hidden entirely (they fade out), so none of them peeks
    // out above the focused rail; in the full-screen state the previous rail stays visible as usual.
    rows.forEach(function(r, ri){
      if(ri > 0 && r.el) r.el.classList.toggle('row-above', cr <= HERO_ZONE_LAST_ROW && ri < cr);
    });
    if(curRow === HERO_ROW_INDEX){
      updateHeroFromItem(rows[HERO_ROW_INDEX].items[colByRow[HERO_ROW_INDEX]]);
    }
    syncHeroSound();
    // Three scroll modes, split by where the row sits relative to the dynamic
    // hero-background zone (rows[1..HERO_ZONE_LAST_ROW]):
    //  - The hero-linked row itself (row 1): minimal, edge-based scrolling —
    //    normally no scroll at all, since it's the "locked first screen"
    //    resting position where hero + first rail are both fully visible.
    //  - Every other zone row (2..HERO_ZONE_LAST_ROW): top-locked — always
    //    snaps its top flush to right below the hero, so whichever row was
    //    focused before it is always fully scrolled out of view rather than
    //    left peeking.
    //  - Past the zone (no more dynamic background driving the screen):
    //    TV-style center-lock, gliding the focused row to screen center.
    // The nav row itself (curRow 0) is always visible via position:absolute
    // pinning within the tv-frame, so it never needs a scroll adjustment.
    // Nothing here ever touches the real page/window scroll — the frame
    // never scrolls natively (see the TV-frame section below); all of this
    // just shifts #stage's own transform, exclusively in response to focus.
    var rowEl = rows[curRow].el;
    if(curRow > 0 && rowEl){
      var stageScale = getScale();
      var fTop = frameRect().top;
      var frameH = tvFrame.clientHeight;
      var navH = 90 * stageScale;
      if(curRow === HERO_ROW_INDEX){
        // The pinned hero occupies the top HERO_HEIGHT px (design space) of
        // the screen the whole time we're in this zone, so rows must always
        // be revealed below IT, not just below the thin nav.
        var edgeMargin = HERO_HEIGHT * stageScale + 12 * stageScale;
        var bottomPad = 12 * stageScale;
        var rowRectEdge = rowScreenBox(rowEl);
        var edgeTop = rowRectEdge.top, edgeBottom = rowRectEdge.bottom;
        if(edgeTop < edgeMargin){
          scrollStageBy(edgeTop - edgeMargin);
        } else if(edgeBottom > frameH - bottomPad){
          scrollStageBy(edgeBottom - (frameH - bottomPad));
        }
      } else if(curRow <= HERO_ZONE_LAST_ROW){
        // Always lock the row's top flush right below the hero — never
        // higher than that. Pulling it up further would tuck part of the
        // row's own top (its title, the start of its cards) behind the
        // opaque hero, which reads as the rail being cut off/obscured. A
        // row taller than the remaining space instead simply runs past the
        // bottom of the screen, same as any normal below-the-fold content —
        // less content shown, but never hidden behind something else.
        var edgeMarginLock = HERO_HEIGHT * stageScale + 18 * stageScale;
        var lockTop = rowScreenBox(rowEl).top;
        var lockDelta = lockTop - edgeMarginLock;
        if(Math.abs(lockDelta) > 1){
          scrollStageBy(lockDelta);
        }
      } else if(isPicker(curRow)){
        // Choose what you like fills the screen and stays put while the focus moves inside it
        var gcDelta = rowScreenBox(rowEl).top;
        if(Math.abs(gcDelta) > 1) scrollStageBy(gcDelta);
      } else if(rowEl.querySelector('.band-full')){
        // an artwork band (Shorts, LPGA) fills the screen: its cards always end 121px above the screen's bottom edge
        // (where LPGA's land when centred), so a shorter band doesn't leave an empty strip under its cards
        var bandDelta = rowScreenBox(rowEl.querySelector('.rail-viewport')).bottom - (frameH - 121 * stageScale);
        if(Math.abs(bandDelta) > 1) scrollStageBy(bandDelta);
      } else {
        var targetCenter = navH + (frameH - navH) / 2;
        var rowRect = rowScreenBox(rowEl);
        var rowCenter = rowRect.top + rowRect.height / 2;
        var delta = rowCenter - targetCenter;
        if(Math.abs(delta) > 1){
          scrollStageBy(delta);
        }
      }
    }
  }

  // Choose what you like: one row whose items are the tabs, every tab's tiles and the two buttons. Moving on a tab switches
  // the grid; Right or OK enters it. In the grid, the left edge returns to the tab, the right edge and the bottom row go
  // to the buttons. Each tab takes up to GC_MAX picks; Continue can be reached from the first pick. Up off the top and Down off the buttons leave for the
  // rails around the picker.
  var GC_COLS = 5, GC_ROWS = 4, GC_MAX = 7, gc = { cat:0, last:[0,0,0], top:[0,0,0], from:null };
  function isPicker(i){ var el = rows[i] && rows[i].el; return !!(el && el.classList.contains('gc-picker')); }
  function gcEl(sel){ return rows[curRow].el.querySelector(sel); }
  function gcTiles(c){ return rows[curRow].el.querySelectorAll('.gc-grid')[c].children; }
  function gcPicked(){ return document.querySelectorAll('.genre.on').length; }
  function gcNextBtn(){ return gcEl(gcPicked() ? '[data-act="genre-continue"]' : '[data-act="genre-skip"]'); }
  function gcGo(el){
    var from = rows[curRow].items[colByRow[curRow]];
    if(el.classList.contains('gc-btn') && !from.classList.contains('gc-btn')) gc.from = from;
    colByRow[curRow] = rows[curRow].items.indexOf(el);
    updateFocus();
    return true;
  }
  function gcBackFromBtn(){ return gc.from || gcTiles(gc.cat)[gc.last[gc.cat]]; }
  // shows the focused item's tab (Active while the D-pad is on it, Active dim while it's in the grid or on the buttons:
  // button-theme.css tv-tab) and keeps a focused tile inside the grid's four visible rows
  function gcSync(){
    var r = rows[curRow], el = r.items[colByRow[curRow]], c = el.dataset.cat, onTab = el.classList.contains('gc-tab');
    if(c !== undefined) gc.cat = +c;
    Array.prototype.forEach.call(r.el.querySelectorAll('.gc-tab'), function(t, i){
      t.classList.toggle('active', onTab && i === gc.cat);
      t.classList.toggle('active-dim', !onTab && i === gc.cat);
    });
    Array.prototype.forEach.call(r.el.querySelectorAll('.gc-grid'), function(g, i){ g.classList.toggle('cur', i === gc.cat); });
    if(!el.classList.contains('genre')) return;
    gc.last[gc.cat] = +el.dataset.i;
    var row = Math.floor(gc.last[gc.cat] / GC_COLS), tiles = gcTiles(gc.cat);
    if(row < gc.top[gc.cat]) gc.top[gc.cat] = row;
    else if(row > gc.top[gc.cat] + GC_ROWS - 1) gc.top[gc.cat] = row - GC_ROWS + 1;
    el.parentElement.style.transform = 'translateY(' + -gc.top[gc.cat] * (tiles[GC_COLS].offsetTop - tiles[0].offsetTop) + 'px)';
  }
  // returns true when the move stayed in the picker (false: Up / Down leaves for the rail above / below)
  function gcMove(d){
    var el = rows[curRow].items[colByRow[curRow]], c = +el.dataset.cat;
    if(el.classList.contains('genre')){
      var i = +el.dataset.i, tiles = gcTiles(c), n = tiles.length, col = i % GC_COLS, row = Math.floor(i / GC_COLS), lastRow = Math.floor((n - 1) / GC_COLS);
      if(d === 'left') return gcGo(col > 0 ? tiles[i - 1] : gcEl('.gc-tab[data-cat="' + c + '"]'));
      if(d === 'right') return gcGo(col < GC_COLS - 1 && i + 1 < n ? tiles[i + 1] : gcNextBtn());
      if(d === 'up') return row > 0 ? gcGo(tiles[i - GC_COLS]) : false;
      return gcGo(row < lastRow ? tiles[Math.min(i + GC_COLS, n - 1)] : gcNextBtn());
    }
    if(el.classList.contains('gc-tab')){
      if(d === 'right') return gcGo(gcTiles(c)[gc.last[c]]);
      if(d === 'up') return c > 0 ? gcGo(gcEl('.gc-tab[data-cat="' + (c - 1) + '"]')) : false;
      if(d === 'down') return c < 2 ? gcGo(gcEl('.gc-tab[data-cat="' + (c + 1) + '"]')) : gcGo(gcEl('[data-act="genre-skip"]'));
      // Left: the top bar, as on a rail's first card (only the focus moves; the tab dims)
      el.classList.remove('active'); el.classList.add('active-dim');
      navFrom = curRow; curRow = 0; colByRow[0] = NAV_HOME_COL; updateFocus();
      return true;
    }
    var onSkip = el.dataset.act === 'genre-skip';
    if(d === 'right') return onSkip && gcPicked() ? gcGo(gcEl('[data-act="genre-continue"]')) : true;
    if(d === 'left') return gcGo(onSkip ? gcBackFromBtn() : gcEl('[data-act="genre-skip"]'));
    if(d === 'up') return gcGo(gcBackFromBtn());
    return false;
  }
  // Back steps out of the picker's levels (buttons to grid to tab); on a tab it is Home's own Back (returns false)
  function gcBack(){
    var el = rows[curRow].items[colByRow[curRow]];
    if(el.classList.contains('gc-btn')) return gcGo(gcBackFromBtn());
    if(el.classList.contains('genre')) return gcGo(gcEl('.gc-tab[data-cat="' + el.dataset.cat + '"]'));
    swapRow(pickerRow, ctaRow);   // on a tab: back to the banner
    return true;
  }
  function moveCol(dir){
    var r = rows[curRow];
    if(isPicker(curRow)){ gcMove(dir > 0 ? 'right' : 'left'); return; }
    // Left on a rail's first card jumps up to the top nav bar (its Home tab)
    // (only the focus moves: the page stays where it is, and Down returns to this rail)
    if(dir < 0 && curRow > 0 && colByRow[curRow] === 0){
      navFrom = curRow; curRow = 0; colByRow[0] = NAV_HOME_COL; updateFocus(); return;
    }
    var n = clamp(colByRow[curRow] + dir, 0, r.items.length-1);
    if(n === colByRow[curRow]) return;
    colByRow[curRow] = n;
    updateFocus();
  }
  function moveRow(dir){
    if(isPicker(curRow) && gcMove(dir > 0 ? 'down' : 'up')) return;
    var n = clamp(curRow + dir, 0, rows.length-1);
    if(curRow === 0 && navFrom){ if(dir < 0) return; n = navFrom; }
    navFrom = 0;
    if(n === curRow) return;
    curRow = n;
    if(isPicker(n) && dir < 0) colByRow[n] = rows[n].items.indexOf(gcNextBtn());   // from the rail below: onto the buttons
    updateFocus();
  }
  function keepPlace(){ try { sessionStorage.setItem('homeReturn', JSON.stringify({row:curRow, col:colByRow[curRow]})); } catch(e){} }
  function selectCurrent(){
    var r = rows[curRow];
    var it = r.items[colByRow[curRow]];
    if(!it) return;
    var label = it.getAttribute('data-title') || it.textContent.trim() || 'Selected';
    // the Home tab: we're already here, so the focus goes to the first scene's first card, page back at the top
    if(curRow === 0 && colByRow[0] === NAV_HOME_COL){ navFrom = 0; curRow = HERO_ROW_INDEX; updateFocus(); return; }
    // Back to Top: the first rail, hero showing (as Back does)
    var act = it.getAttribute('data-act');
    if(act === 'top'){ navFrom = 0; curRow = HERO_ROW_INDEX; updateFocus(); return; }
    if(act === 'customize'){ swapRow(ctaRow, pickerRow); return; }
    // Choose what you like: Enter on a tab enters its grid; on a tile picks / unpicks it (up to GC_MAX per tab); Continue wakes up at the first pick
    if(act === 'genre-tab'){ gcMove('right'); return; }
    if(act === 'genre'){
      var tabEl = gcEl('.gc-tab[data-cat="' + it.dataset.cat + '"]');
      if(!it.classList.contains('on') && it.parentElement.querySelectorAll('.genre.on').length >= GC_MAX){
        toast('You can pick up to ' + GC_MAX + ' in ' + tabEl.dataset.title);
        return;
      }
      it.classList.toggle('on');
      var inTab = it.parentElement.querySelectorAll('.genre.on').length;
      tabEl.querySelector('small').textContent = inTab ? 'Selected ' + inTab + '/' + GC_MAX : '';
      gcEl('[data-act="genre-continue"]').classList.toggle('off', !gcPicked());
      return;
    }
    if(act === 'genre-continue'){
      var n = gcPicked();
      if(!n){ toast('Pick at least one to continue'); return; }
      // the full-screen loading, then Home again from the top without the picker
      var rf = document.getElementById('refresh');
      rf.querySelector('.in').style.transform = 'scale(' + (tvFrame.clientWidth / 1920) + ')';
      rf.classList.add('on'); refreshing = true;
      setTimeout(function(){
        finishPicker();
        navFrom = 0; curRow = HERO_ROW_INDEX;
        stage.style.transition = 'none'; updateFocus(); stage.offsetHeight; stage.style.transition = '';
        rf.classList.remove('on'); refreshing = false;
        toast('Your Home now shows rails for your ' + n + (n === 1 ? ' topic' : ' topics'));
      }, 2800);
      return;
    }
    // Skip: the picker goes away and the focus moves on to the rail after it
    if(act === 'genre-skip'){ var at = curRow; finishPicker(); curRow = Math.min(at, rows.length - 1); updateFocus(); toast('You can choose topics any time in Settings'); return; }
    // cards with a detail page open it: their own link, else the title's page (content.js: a movie or series, a short,
    // or a title made from the card). Live cards still play live.
    // Grab the Mic! (karaoke) and Seasonal / Collection cards have no page: a mockup, OK only presses them.
    var href = it.getAttribute('data-href'), ci = Content.info(it);
    if(!href && ci && it.matches('.card, .rank-wrap')) href = Content.detailUrl(ci);
    if(href){
      keepPlace();   // Back from there lands on the same card
      it.animate([{transform:getComputedStyle(it).transform},{transform:'scale(0.97)'}], {duration:140, easing:'ease-out'}); setTimeout(function(){ window.location.href = href; }, 140); return; }
    it.animate([{transform:getComputedStyle(it).transform},{transform:'scale(0.97)'},{transform:'scale(1.08)'}], {duration:220, easing:'ease-out'});
    toast('Now playing: ' + label);
  }

  var refreshing = false;
  function finishPicker(){ removePicker(); }
  document.addEventListener('keydown', function(e){
    if(refreshing){ e.preventDefault(); return; }   // the loading screen: the remote waits
    if(profKey(e.key)){ e.preventDefault(); return; }
    if(e.key === 'Escape' || e.key === 'Backspace'){
      if(isPicker(curRow) && gcBack()){ e.preventDefault(); return; }
      // scrolled down the page: Back first returns to the top (the first rail, hero showing)
      if(ctxRow() > HERO_ROW_INDEX){ navFrom = 0; curRow = HERO_ROW_INDEX; updateFocus(); e.preventDefault(); return; }
      // at the top Back leaves the app for the TV's home screen (launcher.html), which comes back to the AIS PLAY tile
      e.preventDefault();
      window.location.href = 'launcher.html';
      return;
    }
    switch(e.key){
      case 'ArrowRight': moveCol(1); e.preventDefault(); break;
      case 'ArrowLeft': moveCol(-1); e.preventDefault(); break;
      case 'ArrowDown': moveRow(1); e.preventDefault(); break;
      case 'ArrowUp': moveRow(-1); e.preventDefault(); break;
      case 'Enter': selectCurrent(); e.preventDefault(); break;
    }
  });

  // mouse/touch: clicking an item focuses + selects it
  rows.forEach(function(r,ri){
    r.items.forEach(function(it,ci){
      it.addEventListener('click', function(){
        navFrom = 0; curRow = ri; colByRow[ri] = ci;
        updateFocus();
        if(it.dataset.act === 'genre-tab') return;   // the mouse: clicking a tab only opens it
        selectCurrent();
      });
    });
  });

  /* ================= Fixed 16:9 "TV screen" + focus-only internal scroll =================
     The whole app now lives inside #tv-frame, a box JS sizes to be the
     largest 16:9 rectangle that fits the real window (letterboxed with
     black bars otherwise) — like an actual television, the screen's shape
     never changes with the browser window's shape. The frame itself has
     overflow:hidden and the real page (html/body) never scrolls at all;
     the only thing that ever moves is #stage's own transform (a translateY
     tracked in `stageScrollY`), and the only thing that ever changes that
     is updateFocus() reacting to D-pad/keyboard navigation. There is no
     free/independent scrolling — no wheel, trackpad, touch-drag, or
     scrollbar can move the screen. */
  var tvFrame = document.getElementById('tv-frame');
  var stage = document.getElementById('stage');
  var viewport = document.getElementById('viewport');
  var topnavFixed = document.querySelector('.topnav');
  var heroFixed = document.querySelector('.hero');
  var heroBackdrop = document.querySelector('.hero-backdrop');
  var topScrim = document.querySelector('.top-scrim');
  function heroHiddenNow(){ return heroFixed && heroFixed.classList.contains('hero-hidden'); }
  // While the hero shows, the rails above the focused one are hidden by .row-above (opacity 0), so nothing of the
  // previous rail peeks out under the hero text. No mask on the rows: a mask would cut the chips' backdrop blur off from
  // the hero picture behind them. In the full-screen state the top scrim does this job.
  function applyRowsMask(scale){
    // a band with a full-screen layer (Shorts, LPGA) fills the screen while it has focus, and still while the top bar
    // is woken over it (ctxRow), so the rail above never shows through; it brings no top scrim
    var bandOn = false, cr = ctxRow();
    document.querySelectorAll('.band-full').forEach(function(b){
      var row = b.parentElement, on = !!(rows[cr] && rows[cr].el === row);
      row.classList.toggle('band-on', on); bandOn = bandOn || on;
    });
    if(topScrim) topScrim.classList.toggle('on', heroHiddenNow() && !bandOn && !isPicker(cr));   // the picker fills the screen too: nothing above it to hide
  }
  var TV_RATIO = 16 / 9;

  function applyFrameSize(){
    var ww = window.innerWidth, wh = window.innerHeight;
    var w, h;
    if(ww / wh > TV_RATIO){ h = wh; w = Math.round(h * TV_RATIO); }
    else { w = ww; h = Math.round(w / TV_RATIO); }
    tvFrame.style.width = w + 'px';
    tvFrame.style.height = h + 'px';
  }
  // The frame needs real dimensions before any layout math below runs.
  applyFrameSize();

  // "Locked" first screen: the hero + first rail (measured here, before any
  // transform is applied, in the untransformed 1920-wide coordinate space)
  // must always fit within the frame's height, so the first rail never
  // gets clipped below the fold on short/wide frames. Everything below
  // that point is fine to require (focus-driven) scrolling for.
  var firstScreenHeight = (function(){
    var r = rows[HERO_ROW_INDEX];
    if(r && r.el){
      return r.el.getBoundingClientRect().bottom + 16;
    }
    return 1040;
  })();

  // Tracked in DESIGN-space units (the unscaled 1920-wide coordinate
  // system), not real/post-scale px. That makes it independent of `scale`,
  // so a window resize (which changes scale) never has to rescale this —
  // the same design-space position is still correct at any scale, and a
  // resize simply re-renders at the new scale with zero drift. (Tracking
  // this in real px instead — and re-deriving it from window.scrollY, the
  // way plain document scroll would — is exactly what caused the old
  // window-scroll approach to visibly jump to the wrong row after a resize;
  // this sidesteps that class of bug entirely.)
  var stageScrollDesign = 0;

  function getScale(){
    var wScale = tvFrame.clientWidth / 1920;
    var hScale = tvFrame.clientHeight / firstScreenHeight;
    return Math.min(wScale, hScale);
  }
  function maxScrollDesign(scale){
    return Math.max(0, stage.scrollHeight - tvFrame.clientHeight / scale);
  }
  function frameRect(){ return tvFrame.getBoundingClientRect(); }

  function renderStageTransform(scale){
    // When height is the binding constraint (short/wide frames), the
    // scaled 1920px stage becomes narrower than the frame; center it
    // horizontally instead of leaving the gap on one side only.
    var offsetX = Math.max(0, (tvFrame.clientWidth - 1920 * scale) / 2);
    var pinnedT = 'translateX(' + offsetX + 'px) scale(' + scale + ')';
    if(topnavFixed) topnavFixed.style.transform = pinnedT;
    if(heroFixed) heroFixed.style.transform = pinnedT;
    if(heroBackdrop) heroBackdrop.style.transform = pinnedT;
    if(topScrim) topScrim.style.transform = pinnedT;
    applyRowsMask(scale);
    var scrollRealPx = stageScrollDesign * scale;
    stage.style.transform = 'translateX(' + offsetX + 'px) translateY(' + (-scrollRealPx) + 'px) scale(' + scale + ')';
  }

  // Scale changes (first layout, resize, window load) are applied instantly: animating #stage from scale(1) let the
  // first-screen check and the focus ring measure a half-scaled page, which scrolled the first rail under the hero
  // and put the ring in the wrong place.
  function applyScale(){
    applyFrameSize();
    var scale = getScale();
    stageScrollDesign = clamp(stageScrollDesign, 0, maxScrollDesign(scale));
    stage.style.transition = 'none';
    renderStageTransform(scale);
    stage.offsetHeight;   // commit without a transition
    stage.style.transition = '';
    if(typeof placeHomeRing === 'function' && homeRingReady) placeHomeRing(true);
  }

  // The only way #stage ever moves: called exclusively from updateFocus()'s
  // scroll modes above, driven purely by which item currently has focus.
  // `deltaRealPx` is in the currently-rendered (post-scale) pixel space —
  // convert to design-space before accumulating.
  // Where a row sits on screen (px from the frame's top) at the stage's TARGET scroll, from layout offsets. Reading
  // getBoundingClientRect here measured the page mid-glide when keys were pressed quickly, so the scroll drifted
  // and could push the focused row up under the hero.
  function rowScreenBox(rowEl){
    var y = 0, el = rowEl;
    while(el && el !== stage){ y += el.offsetTop; el = el.offsetParent; }
    var sc = getScale(), top = (y - stageScrollDesign) * sc;
    return { top:top, bottom:top + rowEl.offsetHeight * sc, height:rowEl.offsetHeight * sc };
  }
  function scrollStageBy(deltaRealPx){
    var scale = getScale();
    stageScrollDesign = clamp(stageScrollDesign + deltaRealPx / scale, 0, maxScrollDesign(scale));
    renderStageTransform(scale);
  }

  window.addEventListener('resize', function(){
    // Resizing shouldn't play the focus-scroll transition — jump instantly.
    stage.style.transition = 'none';
    applyScale();
    stage.offsetHeight; // force reflow so the transition-none takes effect
    stage.style.transition = '';
  });

  // Belt-and-suspenders: the frame already has overflow:hidden and the page
  // can't scroll, but explicitly swallow wheel/touch gestures too so no
  // trackpad, mouse wheel, or touch-drag can ever nudge the screen — the
  // D-pad/keyboard are the only way to move.
  ['wheel', 'touchmove'].forEach(function(evt){
    document.addEventListener(evt, function(e){
      e.preventDefault();
    }, {passive:false});
  });


  // place the ring after updateFocus has set every target (rail, page scroll, focus scale), in the same frame
  var homeRingReady = false;
  var updateFocusBase = updateFocus;
  var heroLiveTvBg = document.querySelector('.hero-bg-livetv'), heroSection = document.querySelector('.hero');
  var chipBoxEl = document.querySelector('.chip-screen-box');
  var chipTitleEl = document.querySelector('.hero-livetv-content .hero-title'), chipDescEl = document.querySelector('.hero-livetv-content .hero-desc');
  // the screen text for each chip-rail button: its label as the title, plus this line
  var CHIP_COPY = {
    'Live TV':     {d:'Stream live channels, tailored to your viewing.<br>Stay up to date with news, sports, and entertainment as it happens.', bg:'posters/chip-bg-live-tv.webp'},
    'Sports':      {d:'Every match, every moment.<br>Catch live games, highlights and replays from the leagues you love.'},
    'Movies':      {d:'Blockbusters, new releases and timeless classics.<br>Find your next movie night, all in one place.'},
    'News':        {d:'Breaking stories and in-depth coverage.<br>Follow local and world news around the clock.', bg:'posters/chip-bg-news.webp'},
    'Short':       {d:'Bite-size dramas you can binge in minutes.<br>New episodes of the most talked-about short series every day.', bg:'posters/chip-bg-short.webp'},
    'Kids':        {d:'Cartoons, adventures and learning fun.<br>Safe, colorful shows the whole family can enjoy.', bg:'posters/chip-bg-kids.webp'},
    'IoT':         {d:'Your smart home on the big screen.<br>Check cameras, lights and devices without leaving the sofa.', bg:'posters/chip-bg-iot.webp'},
    'Game':        {d:'Esports tournaments, game shows and live streams.<br>Watch the biggest plays as they happen.'},
    'Lifestyle':   {d:'Food, travel, home and well-being.<br>Fresh ideas and inspiration for everyday living.', bg:'posters/chip-bg-lifestyle.webp'},
    'Music':       {d:'Concerts, music videos and karaoke hits.<br>Turn it up with the artists you love.', bg:'posters/chip-bg-music.webp'},
    'Documentary': {d:'Real stories that move and inspire.<br>Explore nature, history, science and the people behind them.'},
    'Comedy':      {d:'Sitcoms, stand-up and feel-good films.<br>Sit back and enjoy a good laugh.'},
    'Horror':      {d:'Chilling thrillers and spine-tingling scares.<br>Dare to watch with the lights off.'},
    'Anime':       {d:'Top series and films from Japan.<br>From epic adventures to slice-of-life favorites.'}
  };
  // loaded up front, so a button's picture is there the first time it gets focus
  Object.keys(CHIP_COPY).forEach(function(k){ if(CHIP_COPY[k].bg) new Image().src = CHIP_COPY[k].bg; });
  function updateLiveTvBg(){
    var cr = ctxRow(), r = rows[cr], el = r && r.items[colByRow[cr]];
    var on = !!(el && el.classList.contains('chip'));   // any button in the chip rail shows the Live TV screen
    heroLiveTvBg.classList.toggle('on', on);
    heroSection.classList.toggle('livetv', on);
    if(on){
      var c = CHIP_COPY[el.dataset.title] || {d:'Explore ' + el.dataset.title + ', picked for you.'};
      chipTitleEl.textContent = el.dataset.title;
      chipBoxEl.textContent = el.dataset.title;
      // its own screen picture if it has one, else the Live TV one
      var bg = "url('" + (c.bg || 'posters/livetv-bg.jpg') + "')";
      if(heroLiveTvBg.style.backgroundImage.replace(/"/g, "'") !== bg) heroLiveTvBg.style.backgroundImage = bg;
      heroLiveTvBg.classList.toggle('own-art', !!c.bg);   // only the Live TV picture has the label the box covers
      chipDescEl.innerHTML = c.d;
    }
  }
  updateFocus = function(prevRow){
    updateFocusBase(prevRow); updateLiveTvBg();
    var r = rows[curRow]; updateHeroFromCard(r && r.items[colByRow[curRow]]);
    placeHeroText();
    placeHomeRing();
  };
  // A rail's own hero text (card-mode, or the chips' Live TV screen) ends 80px above the focused rail's first line
  // (its title, else its cards), whatever the text's length.
  var HERO_TEXT_GAP = 80;
  var cardTextEl = document.querySelector('.hero-content:not(.hero-livetv-content)'), chipTextEl = document.querySelector('.hero-livetv-content');
  function placeHeroText(){
    var cr = ctxRow(), r = rows[cr], el = null;
    if(cr >= HERO_ROW_INDEX && r && r.el) el = r.el.querySelector('.row-title') || r.items[0];
    var on = heroSection.classList.contains('card-mode') || heroSection.classList.contains('livetv');
    [cardTextEl, chipTextEl].forEach(function(t){ t.style.top = ''; t.style.bottom = ''; });
    if(!el || !on) return;
    var y = 0, e = el;
    while(e && e !== stage){ y += e.offsetTop; e = e.offsetParent; }
    [cardTextEl, chipTextEl].forEach(function(t){
      // measured to the last line shown, not the block's edge (a last line's bottom margin isn't part of the gap)
      t.style.top = 'auto';
      var last = Array.prototype.filter.call(t.children, function(c){ return c.offsetHeight; }).pop();
      var trail = last ? t.offsetHeight - last.offsetTop - last.offsetHeight : 0;
      t.style.bottom =heroSection.clientHeight - (y - stageScrollDesign - HERO_TEXT_GAP) - trail + 'px';
    });
  }

  /* ---------------- sliding glass focus ring ---------------- */
  // The ring lives in the tv-frame (screen pixels, above the pinned nav and hero) and chases the focused item's
  // on-screen rect every animation frame with a short ease-out, so it glides from item to item AND stays locked to
  // items that are themselves moving (a rail sliding, the page scrolling, the card's own scale-up).
  var homeRingReady = true;
  var homeRing = document.createElement('div');
  homeRing.className = 'home-ring';
  homeRing.setAttribute('aria-hidden', 'true');
  homeRing.innerHTML = '<div class="glass"><i></i><i></i></div><div class="ring-badge"></div>';
  tvFrame.appendChild(homeRing);
  var ringLayers = homeRing.querySelectorAll('.glass i'), ringFront = 0, ringArt = null;
  var ringCur = null, ringRaf = 0, ringLastT = 0, ringBusyUntil = 0;
  var RING_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RING_W = 8, RING_GAP = 4;   // design px: the glass band, and the gap between it and the item (as focus-ring.js)

  function ringTarget(){
    if(profAt >= 0) return profBtns[profAt];   // inside the profile panel
    var r = rows[curRow]; if(!r) return null;
    var el = r.items[colByRow[curRow]]; if(!el) return null;
    if(el.classList.contains('rank-wrap')) el = el.querySelector('.card') || el;   // the poster, not the numeral
    return el;
  }
  // the item's artwork: its own or a descendant's background image, or an <img>
  function artOf(el){
    if(el.dataset.ringArt !== undefined) return el.dataset.ringArt;
    var found = '', nodes = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*'), 0, 25));
    for(var i = 0; i < nodes.length && !found; i++){
      var bg = getComputedStyle(nodes[i]).backgroundImage;
      if(bg && bg.indexOf('url(') === 0) found = bg.split(')')[0] + ')';
      else if(nodes[i].tagName === 'IMG' && nodes[i].currentSrc && nodes[i].naturalWidth > 120) found = 'url("' + nodes[i].currentSrc + '")';
    }
    el.dataset.ringArt = found;
    return found;
  }
  // translateX / translateY values out of a transform string (the inline style holds the TARGET values; the
  // computed style holds where a running transition is right now)
  function tx(str){ var m = /translateX\((-?[\d.]+)px\)/.exec(str || ''); return m ? +m[1] : 0; }
  function ty(str){ var m = /translateY\((-?[\d.]+)px\)/.exec(str || ''); return m ? +m[1] : 0; }
  function liveTranslate(el){ var m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return { x:m.m41, y:m.m42 }; }
  // The item's rect once everything has settled: its live rect, shifted by what the rail and the page still have
  // to travel, sized at its final focus scale (from its layout size, not mid-animation)
  function ringRect(el){
    var f = frameRect(), b = el.getBoundingClientRect(), sc = getScale();
    var dx = 0, dy = 0;
    var track = el.closest('.rail-track');
    if(track) dx += (tx(track.style.transform) - liveTranslate(track).x / 1) * sc;
    var grid = el.closest('.gc-grid');
    if(grid) dy += (ty(grid.style.transform) - liveTranslate(grid).y) * sc;
    if(el.closest('#stage')) dy += ty(stage.style.transform) - liveTranslate(stage).y;
    var target = el.classList.contains('card') && el.parentElement.classList.contains('rank-wrap') ? el.parentElement : el;
    var fs = focusScale(target);
    var w = el.offsetWidth * fs * sc, h = el.offsetHeight * fs * sc;
    var cx = (b.left + b.right) / 2 + dx - f.left, cy = (b.top + b.bottom) / 2 + dy - f.top;
    var o = RING_W * sc, g = RING_GAP * sc;
    var rad = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, el.offsetHeight / 2) * sc * fs + o + g;
    return { x:cx - w/2 - o - g, y:cy - h/2 - o - g, w:w + 2*(o+g), h:h + 2*(o+g), r:rad, pad:o };
  }
  // cubic-bezier(.2,0,0,1), the curve the rails, page and focus scale use
  function ease(t){
    var x1 = .2, y1 = 0, x2 = 0, y2 = 1, u = t;
    for(var n = 0; n < 8; n++){
      var xu = 3*(1-u)*(1-u)*u*x1 + 3*(1-u)*u*u*x2 + u*u*u - t;
      var d = 3*(1-u)*(1-u)*x1 + 6*(1-u)*u*(x2-x1) + 3*u*u*(1-x2);
      if(Math.abs(xu) < 1e-5 || !d) break;
      u = Math.min(1, Math.max(0, u - xu / d));
    }
    return 3*(1-u)*(1-u)*u*y1 + 3*(1-u)*u*u*y2 + u*u*u;
  }
  function drawRing(c){
    homeRing.style.width = c.w + 'px'; homeRing.style.height = c.h + 'px';
    homeRing.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
    homeRing.style.borderRadius = c.r + 'px';
    homeRing.firstChild.style.padding = c.pad + 'px';
  }
  var ringFrom = null, ringTo = null, ringT0 = 0, RING_MS = 220;
  function ringTick(t){
    var el = ringTarget();
    if(!el){ homeRing.classList.remove('on'); ringCur = null; ringRaf = 0; return; }
    var p = RING_REDUCED || !ringFrom ? 1 : Math.min(1, (t - ringT0) / RING_MS), e = ease(p);
    ringCur = {};
    ['x','y','w','h','r','pad'].forEach(function(k){ ringCur[k] = ringFrom ? ringFrom[k] + (ringTo[k] - ringFrom[k]) * e : ringTo[k]; });
    drawRing(ringCur);
    homeRing.classList.add('on');
    if(p < 1) ringRaf = requestAnimationFrame(ringTick);
    else { ringRaf = 0; ringFrom = null; showRingBadge(el); }
  }
  // Once the ring has settled on a card with a hanging badge (the Live ribbon), show a copy of that badge inside
  // the ring at the same spot, scaled like the card, so it overlaps the ring instead of being covered by it.
  var ringBadge = homeRing.querySelector('.ring-badge');
  function showRingBadge(el){
    var b = el.querySelector(':scope > .live-ribbon');   // Live ribbon
    if(!b){ ringBadge.classList.remove('on'); return; }
    var k = getScale() * focusScale(el), pad = (RING_W + RING_GAP) * getScale();
    ringBadge.innerHTML = b.outerHTML;
    ringBadge.style.transform = 'translate(' + pad + 'px,' + pad + 'px) scale(' + k + ')';
    ringBadge.classList.add('on');
  }
  function placeHomeRing(snap){
    var el = ringTarget(); if(!el) return;
    ringBadge.classList.remove('on');
    var art = artOf(el);
    if(art !== ringArt){
      if(ringCur && !snap) ringFront = 1 - ringFront;
      ringLayers[ringFront].style.setProperty('--img', art || 'linear-gradient(135deg, #9aa3b5, #5c6478)');
      ringLayers[ringFront].classList.toggle('ring-plain', !art);
      RingColor.tint(homeRing, art);
      ringLayers[ringFront].style.opacity = 1;
      ringLayers[1 - ringFront].style.opacity = 0;
      ringArt = art;
    }
    // tween from wherever the ring is now (so fast presses retarget) to the item's final rect, starting this frame
    // together with the rail / page / scale transitions that updateFocus just set
    ringTo = ringRect(el);
    ringFrom = (snap || !ringCur) ? null : ringCur;
    ringT0 = performance.now();
    if(!ringRaf) ringRaf = requestAnimationFrame(ringTick);
  }
  window.addEventListener('resize', function(){ placeHomeRing(true); });

  // coming back from a page a card opened (the player, the TV Guide, a detail page): focus that card again
  try {
    var ret = JSON.parse(sessionStorage.getItem('homeReturn') || 'null');
    sessionStorage.removeItem('homeReturn');
    // left from the top bar (another page's tab): coming back starts on the first scene's primary button (Play) instead
    if(ret && ret.row > 0 && rows[ret.row] && rows[ret.row].items[ret.col]){ curRow = ret.row; colByRow[ret.row] = ret.col; }
  } catch(e){}
  applyScale();
  updateFocus();
  placeHomeRing(true);
  setTimeout(applyScale, 50);
  window.addEventListener('load', applyScale);
})();

