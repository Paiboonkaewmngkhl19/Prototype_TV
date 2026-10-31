/*
  content.js: every title in the prototype and where it opens. One file for all pages:
    window.MD       movies and series (the Movie page's catalogue, details, prices, progress), below
    window.SHORTS   the short dramas, window.SHORT their episodes, locks and progress, below
    window.Content  the router: any card → its detail page (movie-detail.html for a movie or series, short-detail.html
                    for a short), and a title's player (player.html). See the end of the file.
*/
/*
  MD: the Movie page's titles and lists, shared by movie.html and movie-detail.html (the detail page of any title).
    MD.M            every title: t, p (2:3 poster), w (16:9 picture), plat (platform tag), g (genres), y, len, age, d
    MD.CONTINUE     Continue Watching: k, w (minutes watched) of `of`
    MD.FOR_YOU      For You (PPV): k, price
    MD.RENT         Rent or Buy: k, b (badge)
    MD.MY_RENTAL    titles already rented
    MD.state(k)     what the detail page offers: 'resume' (in Continue Watching), 'play' (rented, bought this session, or
                    in the viewer's package), 'buy' (For You / Rent or Buy, not yet bought); MD.price(k) its price
    MD.own(k)       mark a title bought / its package subscribed (this session)
    MD.cw(k)        where the title was left: this session's progress (player.html), else Continue Watching
    MD.setProgress(k, w, of[, s, e])   remember it (minutes watched of `of`; a series also its season / episode);
                    MD.minutes(k) its length in minutes
  Series (a title whose length reads "N Seasons"): MD.series(k), MD.seasons(k) (up to 3), MD.episodes(k, s) (8 a season:
    n, t, m minutes, d), MD.episode(k, s, e), MD.next(k, s, e) (the one after, or null); MD.cw(k) also gives s / e.
    MD.until(k) the rental's last day ({d, t}) for a rented title, else null.
*/
(function(){
  var PP = 'posters_portrait/', P = 'posters/';
  var M = {
    d9:     {t:'District 9', w:P + 'district9.jpg', plat:'monomax', g:['Sci-Fi', 'Action'], y:2009, len:'1h 52m', age:'16+',
             d:'Aliens stranded over Johannesburg are forced into a slum, until a field agent exposed to their technology starts to become one of them.'},
    topgun: {t:'Top Gun: Maverick', p:PP + 'topgun_m.jpg', w:P + 'topgun-m.jpg', plat:'hbo', g:['Action', 'Drama'], y:2022, len:'2h 11m', age:'13+',
             d:'After thirty years, Maverick trains a new generation of Top Gun graduates for a dangerous mission.'},
    wicked: {t:'Wicked', w:P + 'wicked.jpg', plat:'prime', g:['Musical', 'Fantasy'], y:2024, len:'2h 40m', age:'G',
             d:'The untold story of the witches of Oz: Elphaba and Glinda, long before Dorothy arrived.'},
    superman:{t:'Superman', w:P + 'superman.jpg', plat:'hbo', g:['Action', 'Sci-Fi'], y:2025, len:'2h 9m', age:'13+',
             d:'The Man of Steel balances his Kryptonian heritage with his human upbringing as the ultimate protector of Earth.'},
    house:  {t:'House of the Dragon', p:PP + 'House.jpg', w:P + 'house-of-the-dragon.jpg', plat:'hbo', g:['Fantasy', 'Drama'], y:2024, len:'2 Seasons', age:'18+',
             d:'Set 200 years before Game of Thrones, the Targaryen dynasty tears itself apart in a war for the Iron Throne.'},
    lastofus:{t:'The Last of Us', w:P + 'last-of-us.jpg', plat:'hbo', g:['Drama', 'Thriller'], y:2025, len:'2 Seasons', age:'18+',
             d:'Joel and Ellie journey across a post-pandemic United States, facing new threats and impossible choices.'},
    loki:   {t:'Loki', w:P + 'loki.jpg', plat:'disney', g:['Fantasy', 'Adventure'], y:2023, len:'2 Seasons', age:'13+',
             d:'The God of Mischief must fix a fractured timeline while pursued by the Time Variance Authority.'},
    dragon: {t:'How to Train Your Dragon', w:P + 'how-to-train.jpg', plat:'prime', g:['Family', 'Adventure'], y:2025, len:'2h 5m', age:'G',
             d:'A young Viking and an injured dragon form an unlikely friendship that changes their island for ever.'},
    john:   {t:'John Wick: Chapter 4', p:PP + 'John.jpg', plat:'netflix', g:['Action', 'Thriller'], y:2023, len:'2h 49m', age:'18+',
             d:'John Wick uncovers a path to defeating the High Table, but must face a powerful new enemy first.'},
    venom:  {t:'Venom: Let There Be Carnage', p:PP + 'Venom.jpg', plat:'netflix', g:['Action', 'Sci-Fi'], y:2021, len:'1h 37m', age:'13+',
             d:'Eddie Brock and Venom face Cletus Kasady, a serial killer who becomes host to the symbiote Carnage.'},
    avatar: {t:'Avatar: Fire and Ash', p:PP + 'avatar.jpg', plat:'disney', g:['Sci-Fi', 'Adventure'], y:2025, len:'3h 17m', age:'13+',
             d:'Jake and Neytiri\'s family meet the Ash People, a fierce Na\'vi clan, in a new chapter on Pandora.'},
    f1:     {t:'F1: The Movie', p:PP + 'F1.jpg', w:P + 'f1.jpg', plat:'prime', g:['Action', 'Sport'], y:2025, len:'2h 35m', age:'13+',
             d:'A once-promising Formula 1 driver returns to mentor a young rookie and chase one last shot at glory.'},
    debt:   {t:'The Debt Collector', p:PP + 'debt.jpg', plat:'netflix', g:['Action', 'Crime'], y:2026, len:'1h 52m', age:'18+',
             d:'A debt collector with a violent past takes one last job that drags him back into Bangkok\'s underworld.'},
    lotr:   {t:'The Lord of the Rings: The Return of the King', p:PP + 'lotr/r1.jpg', plat:'disney', g:['Fantasy', 'Adventure'], y:2003, len:'3h 21m', age:'13+',
             d:'Gandalf and Aragorn lead the World of Men against Sauron\'s army as Frodo and Sam near Mount Doom.'},
    hobbit: {t:'The Hobbit: The Battle of the Five Armies', p:PP + 'lotr/r3.jpg', plat:'hbo', g:['Fantasy', 'Adventure'], y:2014, len:'2h 24m', age:'13+',
             d:'Bilbo and the dwarves face the dragon Smaug\'s fury, and five armies march on the Lonely Mountain.'},
    lastking:{t:'The Last Kingdom', p:PP + 'lotr/r5.jpg', plat:'netflix', g:['Drama', 'History'], y:2022, len:'5 Seasons', age:'18+',
             d:'Raised by Vikings, Uhtred of Bebbanburg fights for the birth of England between two worlds.'},
    vikings:{t:'Vikings', p:PP + 'lotr/r6.jpg', plat:'prime', g:['Drama', 'History'], y:2020, len:'6 Seasons', age:'18+',
             d:'The legendary Norse hero Ragnar Lothbrok rises from farmer to king, raiding across the seas.'},
    got:    {t:'Game of Thrones', p:PP + 'lotr/r7.jpg', plat:'hbo', g:['Fantasy', 'Drama'], y:2019, len:'8 Seasons', age:'18+',
             d:'Nine noble families wage war for control of Westeros, while an ancient enemy returns from the north.'},
    thailaw:{t:'Thai Lawyer', p:PP + 'legal/l1.jpg', plat:'netflix', g:['Drama', 'Crime'], y:2026, len:'1 Season', age:'16+',
             d:'A ruthless Bangkok lawyer will defend anyone for the right price, until one case turns personal.'},
    dollar: {t:'One Dollar Lawyer', p:PP + 'legal/l2.jpg', plat:'disney', g:['Comedy', 'Drama'], y:2022, len:'1 Season', age:'13+',
             d:'A brilliant lawyer who charges just one dollar takes on the rich and powerful to protect ordinary people.'},
    judge:  {t:'The Judge from Hell', p:PP + 'legal/l3.jpg', plat:'netflix', g:['Fantasy', 'Drama'], y:2024, len:'1 Season', age:'18+',
             d:'A demon from hell takes over the body of a judge to punish the killers the courts let walk free.'},
    bigmouth:{t:'Big Mouth', p:PP + 'legal/l4.jpg', plat:'disney', g:['Thriller', 'Crime'], y:2022, len:'1 Season', age:'16+',
             d:'A failing lawyer is mistaken for a genius con man and has to survive in a world of the rich and corrupt.'},
    family: {t:'A Model Family', p:PP + 'legal/l5.jpg', plat:'netflix', g:['Thriller', 'Crime'], y:2022, len:'1 Season', age:'18+',
             d:'A broke professor stumbles on a car full of drug money and drags his family into a cartel war.'},
    vincenzo:{t:'Vincenzo', p:PP + 'legal/l6.jpg', plat:'netflix', g:['Comedy', 'Crime'], y:2021, len:'1 Season', age:'16+',
             d:'A mafia consigliere returns to Seoul and uses his methods to bring down a ruthless conglomerate.'},
    lawless:{t:'Lawless Lawyer', p:PP + 'legal/l7.jpg', plat:'viu', g:['Action', 'Drama'], y:2018, len:'1 Season', age:'16+',
             d:'A former gangster turned lawyer takes on a corrupt judge to avenge his mother.'},
    again:  {t:'Again My Life', p:PP + 'legal/l8.jpg', plat:'viu', g:['Fantasy', 'Drama'], y:2022, len:'1 Season', age:'16+',
             d:'A prosecutor killed by a corrupt politician gets a second chance at life, and at taking him down.'},
    sherlock:{t:'Young Sherlock', w:P + 'continue/c1.jpg', plat:'prime', g:['Mystery', 'Drama'], y:2026, len:'1 Season', age:'13+',
             d:'A teenage Sherlock Holmes stumbles into his first real mystery at Oxford, long before Baker Street.'},
    brazil: {t:'All Or Nothing: Brazil National Team', w:P + 'continue/c4.jpg', plat:'netflix', g:['Documentary', 'Sport'], y:2023, len:'1 Season', age:'13+',
             d:'Unprecedented access to the Seleção on their road to the World Cup, on and off the pitch.'},
    endgame:{t:'Avengers: Endgame', w:P + 'continue/c2.jpg', plat:'disney', g:['Action', 'Sci-Fi'], y:2019, len:'3h 1m', age:'13+',
             d:'After Thanos wiped out half of all life, the remaining Avengers assemble once more to undo the snap.'},
    hailmary:{t:'Project Hail Mary', w:P + 'continue/c5.jpg', plat:'netflix', g:['Sci-Fi', 'Drama'], y:2026, len:'2h 36m', age:'13+',
             d:'A lone astronaut wakes up light-years from home with one mission: save humanity from extinction.'},
    spider: {t:'Spider-Man: No Way Home', w:P + 'P10-spiderman.jpg', plat:'disney', g:['Action', 'Adventure'], y:2021, len:'2h 28m', age:'13+',
             d:'With his identity revealed, Peter Parker asks Doctor Strange for help, and the multiverse breaks open.'},
    prada:  {t:'The Devil Wears Prada 2', w:P + 'P10-Devil.jpg', plat:'disney', g:['Comedy', 'Drama'], y:2026, len:'1h 59m', age:'13+',
             d:'Miranda Priestly faces the decline of print, and an old assistant who now holds the purse strings.'},
    odyssey:{t:'The Odyssey', w:P + 'P10_Odyssey.jpg', plat:'prime', g:['Adventure', 'Fantasy'], y:2026, len:'2h 40m', age:'13+',
             d:'Odysseus fights his way home across a hostile sea after the fall of Troy, ten years from his family.'}
  };
  // titles made from a card that had no data of its own (Content.open): back into the catalogue on every page
  try { var ADHOC = JSON.parse(sessionStorage.getItem('contentAdhoc') || '{}'); for(var ak in ADHOC) if(!M[ak]) M[ak] = ADHOC[ak]; } catch(e){}
  var CONTINUE = [{k:'sherlock', s:1, e:5, w:31, of:58}, {k:'endgame', w:122, of:181}, {k:'superman', w:96, of:129}, {k:'brazil', s:1, e:2, w:20, of:55}, {k:'hailmary', w:101, of:156},
                  {k:'spider', w:41, of:148}, {k:'wicked', w:133, of:160}];
  var FOR_YOU = [{k:'d9', price:199}, {k:'avatar', price:249}, {k:'f1', price:199}, {k:'topgun', price:149}, {k:'john', price:149}];
  var RENT = [{k:'avatar', b:'Recommend'}, {k:'f1', b:'Best Seller'}, {k:'topgun', b:'Best Seller'}, {k:'john'}, {k:'venom'}, {k:'lotr'}, {k:'hobbit'}];
  var MY_RENTAL = ['odyssey', 'spider', 'd9', 'f1', 'topgun', 'lastofus', 'vikings'];
  // series sold one by one (Figma "Series MD: First scene": View Package + Buy 279 baht)
  var SERIES_PRICE = { house:279, got:279, loki:199 };
  // a rental's last day (Figma "Package Available until")
  var UNTIL = { lastofus:{d:'13 November 2026', t:'09:00 PM'}, vikings:{d:'20 November 2026', t:'11:59 PM'} };

  // ---- series: seasons and their episodes (the prototype gives every series the same 8 episode names) ----
  var EP_NAMES = ['The Beginning', 'Strangers', 'Old Wounds', 'Crossroads', 'The Long Night', 'Into the Fire', 'Reckoning', 'Homecoming'];
  var EP_MIN = [57, 55, 52, 61, 58, 49, 54, 63];
  var EP_DESC = ['Everything changes when an unexpected arrival sets the story in motion.', 'New faces bring new trouble, and an old secret starts to surface.',
    'A wound from the past reopens, and loyalties are put to the test.', 'Two paths, one choice: the decision that will shape everything to come.',
    'A long night of waiting ends in a confrontation no one saw coming.', 'There is no turning back as the conflict finally catches fire.',
    'Every choice has a price, and tonight the bill comes due.', 'The journey comes full circle, but home is not what it used to be.'];
  function series(k){ return /Season/.test((M[k] && M[k].len) || ''); }
  function seasons(k){ return series(k) ? Math.min(3, parseInt(M[k].len, 10) || 1) : 0; }
  function episodes(k, s){
    return EP_NAMES.map(function(t, i){ var j = (i + s - 1) % 8; return { s:s, n:i + 1, t:EP_NAMES[j], m:EP_MIN[j], d:EP_DESC[j] }; });
  }
  function episode(k, s, e){ return episodes(k, s)[e - 1]; }
  function next(k, s, e){ return e < 8 ? episode(k, s, e + 1) : s < seasons(k) ? episode(k, s + 1, 1) : null; }
  function until(k){ return MY_RENTAL.indexOf(k) >= 0 && UNTIL[k] || null; }

  function owned(){ try { return JSON.parse(sessionStorage.getItem('mdOwned') || '[]'); } catch(e){ return []; } }
  function own(k){ var o = owned(); if(o.indexOf(k) < 0){ o.push(k); try { sessionStorage.setItem('mdOwned', JSON.stringify(o)); } catch(e){} } }
  function find(list, k){ for(var i = 0; i < list.length; i++) if(list[i].k === k) return list[i]; return null; }
  function price(k){ var f = find(FOR_YOU, k); return f ? f.price : find(RENT, k) ? 149 : SERIES_PRICE[k] || (M[k] && M[k].price) || 0; }   // Rent or Buy titles: 149 baht
  // titles that need a package (View Package opens the package view, then the purchase): District 9 (Monomax)
  var PACKAGE = ['d9'];
  function progress(){ try { return JSON.parse(sessionStorage.getItem('mdProgress') || '{}'); } catch(e){ return {}; } }
  function cw(k){
    var p = progress()[k], c = p ? { k:k, w:p.w, of:p.of, s:p.s, e:p.e } : find(CONTINUE, k);
    if(c && series(k) && !c.s){ c.s = 1; c.e = 1; }
    return c;
  }
  function setProgress(k, w, of, s, e){ var p = progress(); p[k] = { w:w, of:of, s:s, e:e, at:Date.now() }; try { sessionStorage.setItem('mdProgress', JSON.stringify(p)); } catch(e){} }
  // Continue Watching (Home, Movie): what was watched this session, latest first, then the list above; finished ones drop out
  function continueList(){
    var p = progress(), seen = {}, out = [];
    Object.keys(p).sort(function(a, b){ return (p[b].at || 0) - (p[a].at || 0); }).forEach(function(k){
      seen[k] = 1; if(M[k] && M[k].w && p[k].w < p[k].of - 1) out.push(cw(k));
    });
    CONTINUE.forEach(function(c){ if(!seen[c.k]) out.push(cw(c.k)); });
    return out;
  }
  function minutes(k){ var l = (M[k] && M[k].len) || '', h = /(\d+)h/.exec(l), mm = /(\d+)m/.exec(l); return (h ? +h[1] * 60 : 0) + (mm ? +mm[1] : 0) || 50; }   // a series ('1 Season'): a 50-minute episode
  function state(k){
    if(cw(k)) return 'resume';
    if(owned().indexOf(k) >= 0) return 'play';
    if(PACKAGE.indexOf(k) >= 0) return 'buy';
    if(MY_RENTAL.indexOf(k) >= 0) return 'play';
    return price(k) ? 'buy' : 'play';
  }
  window.MD = { P:P, PP:PP, M:M, CONTINUE:CONTINUE, FOR_YOU:FOR_YOU, RENT:RENT, MY_RENTAL:MY_RENTAL, state:state, price:price, own:own, cw:cw, setProgress:setProgress, minutes:minutes,
    continueList:continueList, series:series, seasons:seasons, episodes:episodes, episode:episode, next:next, until:until };
})();

/*
  The short dramas: Home's Shorts row (the same titles and posters, posters/shorts/), shared by short-detail.html
  (each short's page) and package-detail.html (its payment, ?short=N).
*/
window.SHORTS = [
  { t:'Seven Days Back, Old Love Ends', img:'s1.jpg', gen:['Romance', 'Period'], rate:'13+',
    d:'Seven days before her wedding, a palace maid wakes up in the past with one chance to undo the love that ruined her, and the courage to finally walk away.' },
  { t:'Grandma Takes Over the Family II', img:'s2.jpg', gen:['Comedy', 'Family'], rate:'13+',
    d:'Back in a young body, the family matriarch returns to set her spoiled heirs straight and save the business they nearly lost.' },
  { t:'Ink and Rain', img:'s3.jpg', gen:['Romance', 'Fantasy'], rate:'13+',
    d:'A painter whose brush brings ink to life and a guarded swordsman cross paths in a city of rain, where every painting hides a promise.' },
  { t:"The Secretary's Forbidden Love", img:'s4.jpg', gen:['Romance', 'Drama'], rate:'16+',
    d:'A new secretary falls for the CEO she was hired to watch, and has to choose between the job, the truth and her heart.' },
  { t:"The Mafia Boss's Spoiled Secretary", img:'s5.jpg', gen:['Romance', 'Crime'], rate:'18+',
    d:'Hired by the most feared man in the city, a quiet secretary finds out she is the only one he will not let go.' },
  { t:"The Healer's Comeback", img:'s6.jpg', gen:['Drama', 'Period'], rate:'13+',
    d:'Cast out of the imperial clinic, a young healer comes back under a new name to cure the court and expose the ones who framed her.' },
  { t:'Back to the Moonlight Promise', img:'s7.jpg', gen:['Romance', 'Drama'], rate:'13+',
    d:'Two strangers keep meeting under the same full moon, until they remember the promise they made in another life.' },
  { t:'Short Drama #8', img:'s8.jpg', gen:['Romance', 'Drama'], rate:'13+',
    d:'A short drama in bite-size episodes: new episodes every day, the first ten free.' }
];

/*
  Episodes of a short, shared by short-detail.html and the vertical player (player.html?short=N&ep=E):
    SHORT.EPS episodes (the first SHORT.FREE free), SHORT.open(s, n) whether episode n of short s can be watched (free,
    unlocked this session, a pass, or the Short Drama package), SHORT.secs(n) its length in seconds (1-3 minutes),
    SHORT.at(s) / SHORT.setAt(s, ep, sec) where the short was left.
*/
window.SHORT = (function(){
  var EPS = 160, FREE = 10;
  function get(k, d){ try { return JSON.parse(sessionStorage.getItem(k) || d); } catch(e){ return JSON.parse(d); } }
  function open(s, n){
    var u = get('shortUnlocked' + s, '{}');
    return n <= FREE || !!sessionStorage.getItem('shortsSubscribed') || !!u.all || !!u[n];
  }
  function secs(n){ return 75 + (n * 37) % 105; }
  function at(s){ return get('shortProgress', '{}')[s] || null; }
  function setAt(s, ep, sec){ var p = get('shortProgress', '{}'); p[s] = { ep:ep, sec:Math.floor(sec) }; try { sessionStorage.setItem('shortProgress', JSON.stringify(p)); } catch(e){} }
  return { EPS:EPS, FREE:FREE, open:open, secs:secs, at:at, setAt:setAt };
})();

/*
  Content: where a card goes. Pages pass what the card shows (Content.info(el) reads it from the element):
    k (a catalogue key) or s (a short's index), else t (title), img (its picture), d (synopsis), plat, price.
  Content.find(info)  the catalogue title (by key, then picture, then name) or short it is, or null
  Content.open(info)  its detail page. A card the catalogue doesn't have becomes a title of its own (its picture, title
                      and synopsis, kept for the session), so every card opens a detail page, then the player.
  Content.play(info)  straight into the player
  Content.info(el)    what an element shows: data-k / data-s / data-title / data-label / data-desc / data-price, and
                      the picture of the element or the first child with one; null for live cards (they play live)
*/
window.Content = (function(){
  function base(src){ return String(src || '').split('/').pop().split('?')[0].toLowerCase(); }
  function norm(t){ return String(t || '').toLowerCase().replace(/\s+s\d+\s*:\s*e\d+$/, '').replace(/[^a-z0-9]/g, ''); }
  function find(info){
    if(!info) return null;
    if(info.k && window.MD.M[info.k]) return { k:info.k };
    if(info.s !== undefined && info.s !== '' && window.SHORTS[+info.s]) return { s:+info.s };
    var b = base(info.img), n = norm(info.t), k;
    for(k in window.MD.M){ var m = window.MD.M[k]; if(b && (base(m.w) === b || base(m.p) === b)) return { k:k }; }
    for(var i = 0; i < window.SHORTS.length; i++) if(b && base(window.SHORTS[i].img) === b) return { s:i };
    if(n){
      for(k in window.MD.M) if(norm(window.MD.M[k].t) === n) return { k:k };
      for(i = 0; i < window.SHORTS.length; i++) if(norm(window.SHORTS[i].t) === n) return { s:i };
    }
    return null;
  }
  // a card the catalogue doesn't know: a movie made from what it shows
  function adhoc(info){
    var t = info.t || 'Untitled', id = t + '|' + base(info.img);   // title + picture: cards that share a placeholder title stay apart
    var k = 'x' + Math.abs(id.split('').reduce(function(h, c){ return (h * 31 + c.charCodeAt(0)) | 0; }, 7)).toString(36);
    if(!window.MD.M[k]){
      var portrait = /portrait|shorts\//.test(info.img || '');
      var m = { t:t, plat:info.plat || 'monomax', g:info.g || ['Featured'], y:2026, len:info.len || '1h 45m', age:'13+', adhoc:1,
        d:info.d || t + ': watch it now on AIS PLAY.' };
      if(info.img){ if(portrait) m.p = info.img; else m.w = info.img; }
      if(info.price) m.price = +info.price;
      window.MD.M[k] = m;
      try { var a = JSON.parse(sessionStorage.getItem('contentAdhoc') || '{}'); a[k] = m; sessionStorage.setItem('contentAdhoc', JSON.stringify(a)); } catch(e){}
    }
    return { k:k };
  }
  function target(info){ return find(info) || adhoc(info || {}); }
  function detailUrl(info){ var f = target(info); return f.s !== undefined ? 'short-detail.html?s=' + f.s : 'movie-detail.html?k=' + f.k; }
  function playUrl(info){ var f = target(info); return f.s !== undefined ? 'player.html?short=' + f.s : 'player.html?k=' + f.k; }
  function info(el){
    if(!el || el.closest('.has-ribbon, .xc-ribbon, [data-live="1"]') || el.querySelector('.live-ribbon')) return null;
    var d = el.dataset, img = '', n = [el].concat([].slice.call(el.querySelectorAll('*')));
    for(var i = 0; i < n.length && !img; i++){
      var bg = n[i].style && (n[i].style.backgroundImage || n[i].style.getPropertyValue('--img'));
      if(bg && bg !== 'none') img = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      else if(n[i].tagName === 'IMG' && !/badge|logo|tag|icon/.test(n[i].className + n[i].src)) img = n[i].getAttribute('src');
    }
    return { k:d.k, s:d.s, t:d.heroTitle || d.title || d.label || (el.textContent || '').trim().split('\n')[0], img:d.heroImg || img, d:d.heroDesc || d.desc, price:d.price };
  }
  return { find:find, info:info, detailUrl:detailUrl, playUrl:playUrl,
    open:function(i){ location.href = detailUrl(i); }, play:function(i){ location.href = playUrl(i); } };
})();
