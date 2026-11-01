/*
  content.js: every title in the prototype and where it opens. One file for all pages:
    window.MD       movies and series (the Movie page's catalogue, details, prices, progress), below
    window.SHORTS   the short dramas (plat: their app, ReelShort or DramaBox: badges/tag-*.png), window.SHORT their
                    episodes, locks and progress, below
    window.Content  the router: any card → its detail page (movie-detail.html for a movie or series, short-detail.html
                    for a short), and a title's player (player.html); Content.hero(info) what the card's screen text
                    shows, word for word what that detail page shows; Content.related(info, n) its You May Also
                    Like (the same type only); Content.metaHtml(info, tag) its meta row. See the end of the file.
*/
/*
  MD: the Movie page's titles and lists, shared by movie.html and movie-detail.html (the detail page of any title).
    MD.M            every title: t, p (2:3 poster), w (16:9 picture), plat (platform tag), g (genres), y, len, age, d
    MD.CONTINUE     Continue Watching: k, w (minutes watched) of `of`
    MD.FOR_YOU      For You (PPV): k, price
    MD.RENT         Rent or Buy: k, b (badge)
    MD.MY_RENTAL    titles already rented
    MD.state(k)     what the detail page offers: 'soon' (not out yet: MD.soon(k) its release), 'resume' (in Continue Watching), 'play' (rented, bought this session, or
                    in the viewer's package), 'buy' (For You / Rent or Buy, not yet bought); MD.price(k) its price
    MD.own(k)       mark a title bought / its package subscribed (this session)
    MD.subscribe(plat), MD.subscribed(plat)   a platform's package bought this session (packages.js: netflix, hbo, ...,
                    reelshort, dramabox): its premium titles and shorts are the viewer's (sessionStorage ottSubscribed)
    m.premium       a premium title: sold on its own or in a package; Content.crown(info) says whether the viewer has
                    it ('owned') or not ('gold'). Its cards show no crown; its detail page's meta row says Premium
    MD.cw(k)        where the title was left: this session's progress (player.html), else Continue Watching
    MD.setProgress(k, w, of[, s, e])   remember it (minutes watched of `of`; a series also its season / episode);
                    MD.minutes(k) its length in minutes
  Series (a title whose length reads "N Seasons"): MD.series(k), MD.seasons(k) (up to 3), MD.episodes(k, s) (8 a season:
    n, t, m minutes, d), MD.episode(k, s, e), MD.next(k, s, e) (the one after, or null); MD.cw(k) also gives s / e.
    MD.until(k) the rental's last day ({d, t}) for a rented title, else null.
    MD.buyPrice(k), MD.rentPrice(k)   what Buy / Rent cost on its detail page (0: no such option); MD.price(k) the
                    buy price, else the rent price. MD.rent(k) rent it (this session, 48 hours: MD.MY_RENTAL, MD.until)
    m.buy, m.rent, m.pkg   a title's own options (its detail page: View Package if m.pkg, Buy, Rent); a title without
                    them keeps its price from the lists below (For You, Rent or Buy, series)
    MD.metaHtml(m)  its meta row (genres, year, length, age pill, quality tag); MD.watched(k) how far in, or null
    MD.qtag(m)  its quality tag: 4K Dolby (m.q '4k') or the HD pill
    MD.bg(k)    the title's full-screen picture (its b, else w, else p): every page's screen text and its detail page
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
    thailaw:{t:'The Evil Lawyer', p:PP + 'legal/l1.jpg', plat:'netflix', g:['Drama', 'Crime'], y:2026, len:'1 Season', age:'16+',
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
    encanto:{t:'Encanto', w:P + 'hero/encanto.jpg', plat:'disney', g:['Animation', 'Family'], y:2021, len:'1h 42m', age:'G',
             d:'The Madrigals live in a magical house in the mountains of Colombia, where every child has a gift, except Mirabel.'},
    stranger:{t:'Stranger Things', w:P + 'hero/stranger-things.jpg', plat:'netflix', g:['Sci-Fi', 'Horror'], y:2016, len:'1 Season', age:'16+',
             d:'When a young boy vanishes, a small town uncovers secret experiments, terrifying forces and one strange little girl.'},
    spider: {t:'Spider-Man: No Way Home', w:P + 'P10-spiderman.jpg', plat:'disney', g:['Action', 'Adventure'], y:2021, len:'2h 28m', age:'13+',
             d:'With his identity revealed, Peter Parker asks Doctor Strange for help, and the multiverse breaks open.'},
    prada:  {t:'The Devil Wears Prada 2', w:P + 'P10-Devil.jpg', plat:'disney', g:['Comedy', 'Drama'], y:2026, len:'1h 59m', age:'13+',
             d:'Miranda Priestly faces the decline of print, and an old assistant who now holds the purse strings.'},
    // Thai horror (Figma For PBR 8:11038)
    khemjira:{t:'Khemjira', p:PP + 'khemjira.jpg', plat:'monomax', g:['Horror', 'Thriller'], y:2025, len:'1h 58m', age:'18+', soon:19,   // out in 19 days
             d:'A young man haunted by a curse on his family\'s bloodline turns to an ancient ritual, and the spirit it wakes will not let him go.'},
    medium: {t:'The Medium', p:PP + 'the-medium.jpg', plat:'monomax', g:['Horror', 'Mystery'], y:2021, len:'2h 10m', age:'18+',
             d:'A documentary crew follows a shaman in rural north-east Thailand, until her niece starts to show signs of something far darker.'},
    // The Lord of the Rings / The Hobbit (Home's Because You Watched)
    twotowers:{t:'The Lord of the Rings: The Two Towers', p:PP + 'lotr/r2.jpg', plat:'disney', g:['Fantasy', 'Adventure'], y:2002, len:'2h 59m', age:'13+',
             d:'The Fellowship is broken, but its members fight on to defend Middle-earth against Saruman and Sauron.'},
    smaug:  {t:'The Hobbit: The Desolation of Smaug', p:PP + 'lotr/r4.jpg', plat:'hbo', g:['Fantasy', 'Adventure'], y:2013, len:'2h 41m', age:'13+',
             d:'Bilbo, Gandalf and the dwarves press on toward Erebor, where the dragon Smaug guards a lost kingdom.'},
    siralex:{t:'Sir Alex Ferguson: Never Give In', w:P + 'maxresdefault.jpg', plat:'prime', g:['Documentary', 'Sport'], y:2021, len:'1h 52m', age:'13+',
             d:'The life of Manchester United\'s legendary manager, told by his son: from the Govan shipyards to 26 years at Old Trafford, and the fight back from a brain haemorrhage.'},
    // AIS PLAY Exclusive (Home): AIS PLAY's own; p its poster, b its wide picture
    missuni:{t:'Miss Universe Thailand 2026', p:P + 'miss-universe.jpg', b:P + 'miss-universe.jpg', plat:'ais', g:['Pageant', 'Live Event'], y:2026, len:'1h 55m', age:'G',
             d:'The Miss Universe Thailand 2026 pageant is underway with provincial preliminaries and delegate selections, highlighted by Tharina Botes winning Miss Universe Krung Thep Maha Nakhon (Bangkok).'},
    sophomores:{t:'Happy Boss Day: The Sophomores – D-Day', p:PP + 'ex1.jpg', b:P + 'hero/ex-sophomores.jpg', plat:'ais', g:['Concert'], y:2026, len:'2h 30m', age:'G',
             d:'Relive The Sophomores\' sold-out D-Day concert, exclusively on AIS PLAY. Rerun from 1 February to 30 April 2026.'},
    bossckm:{t:'BossCKM: Dream Warrior Concert', p:PP + 'ex2.jpg', b:P + 'hero/ex-bossckm.jpg', plat:'ais', g:['Concert', 'Music'], y:2026, len:'2h 5m', age:'G',
             d:'BossCKM takes the stage for Dream Warrior, a night of rock anthems, fan favourites and a few surprises.'},
    cityars:{t:'Man City vs Arsenal', p:PP + 'ex3.jpg', b:PP + 'ex3.jpg', plat:'ais', g:['Football'], y:2026, len:'1h 55m', age:'G',
             d:'Haaland\'s Manchester City host Arsenal at the Etihad in a title clash that could decide the Premier League race.'},
    mufcche:{t:'Match Day: Man Utd vs Chelsea', p:PP + 'ex4.jpg', b:P + 'hero/ex-mufc-chelsea.jpg', plat:'ais', g:['Football'], y:2026, len:'1h 55m', age:'G',
             d:'Manchester United welcome Chelsea at Old Trafford for a place in the next round of the Emirates FA Cup.'},
    mufcars:{t:'Match Day: Man Utd vs Arsenal', p:PP + 'ex5.jpg', b:P + 'hero/ex-mufc-arsenal.jpg', plat:'ais', g:['Football'], y:2026, len:'1h 55m', age:'G',
             d:'Manchester United face Arsenal under the Old Trafford lights in one of the Premier League\'s fiercest rivalries.'},
    // LPGA golf highlights (Home's Highlight band): AIS PLAY's own
    hl1:    {t:'Honda LPGA Thailand 2024', p:P + 'highlight/h1.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2024, len:'15m', age:'G',
             d:'The best shots from Siam Country Club in Pattaya, as the world\'s top women battle for the Honda LPGA Thailand title.'},
    hl2:    {t:'BGC Betagro Match Play', p:P + 'highlight/h2.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2024, len:'12m', age:'G',
             d:'Head-to-head drama from the BGC Betagro Match Play: every hole won, halved and conceded on the way to the final.'},
    hl3:    {t:'The Champion', p:P + 'highlight/h3.jpg', plat:'ais', g:['Golf', 'Documentary'], y:2025, len:'48m', age:'G',
             d:'A season with a champion: the practice, the pressure and the putt that won it all.'},
    hl4:    {t:'LPGA Lotte Championship', p:P + 'highlight/h4.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2024, len:'14m', age:'G',
             d:'Final-round highlights from Hawaii at the LPGA Lotte Championship, from the opening tee shot to the winning putt.'},
    hl5:    {t:'DP World Tour: Career Grand Slam', p:P + 'highlight/h5.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2025, len:'18m', age:'G',
             d:'The rounds that completed a career Grand Slam, and the DP World Tour stars chasing the same history.'},
    hl6:    {t:'Masters Tournament', p:P + 'highlight/h6.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2025, len:'20m', age:'G',
             d:'Four days at Augusta National: Amen Corner, the back-nine charges and the green jacket ceremony.'},
    hl7:    {t:'Masters Tournament: Round Highlights', p:P + 'highlight/h7.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2025, len:'10m', age:'G',
             d:'Round-by-round highlights from the Masters, with every eagle, chip-in and clutch putt.'},
    odyssey:{t:'The Odyssey', w:P + 'P10_Odyssey.jpg', plat:'prime', g:['Adventure', 'Fantasy'], y:2026, len:'2h 40m', age:'13+',
             d:'Odysseus fights his way home across a hostile sea after the fall of Troy, ten years from his family.'}
  };
  // b: the full-screen picture (posters/hero/) a title shows behind the screen text on Home, the Movie page and its
  // detail page alike (Content.hero / MD.bg); a title without one uses its 16:9 picture, else its poster
  var B = { topgun:'topgun-m', wicked:'wicked', superman:'superman', house:'house-of-the-dragon', lastofus:'last-of-us', loki:'loki',
            dragon:'how-to-train', john:'john-wick', venom:'venom', f1:'f1', lotr:'lotr', thailaw:'evil-lawyer', dollar:'one-dollar-lawyer',
            sherlock:'young-sherlock', endgame:'endgame', hailmary:'hailmary', encanto:'encanto', stranger:'stranger-things', spider:'spiderman' };
  for(var bk in B) M[bk].b = P + 'hero/' + B[bk] + '.jpg';
  // q: the titles in 4K with Dolby Atmos (a 4K pill and the Dolby mark, MD.qtag); every other title is HD
  ['avatar', 'topgun', 'f1', 'house', 'got', 'lotr', 'spider', 'endgame', 'odyssey', 'superman', 'stranger', 'wicked']
    .forEach(function(k){ M[k].q = '4k'; });
  // premium: the titles sold on their own or in a package (For You, Rent or Buy, the series sold one by one, District 9's
  // package, the rentals) and AIS PLAY Exclusive; Content.crown(info) their crown (Premium on the detail page)
  ['d9', 'avatar', 'f1', 'topgun', 'john', 'venom', 'lotr', 'hobbit', 'house', 'got', 'loki', 'odyssey', 'spider', 'lastofus', 'vikings',
   'missuni', 'sophomores', 'bossckm', 'cityars', 'mufcche', 'mufcars']
    .forEach(function(k){ M[k].premium = true; });
  // the titles with their own options, so a detail page has 1, 2 or 3 buttons (View Package, Buy N ฿, Rent N ฿); pkg 0:
  // no package has it (Content.packageFor: none)
  var OFFERS = { avatar:{ pkg:1, buy:399, rent:229 }, f1:{ pkg:1, buy:199 }, topgun:{ pkg:1, rent:149 }, john:{ pkg:0, buy:149, rent:99 },
                 venom:{ pkg:1 }, lotr:{ pkg:0, buy:299 }, hobbit:{ pkg:0, rent:99 } };
  for(var ok in OFFERS){ M[ok].pkg = !!OFFERS[ok].pkg; M[ok].buy = OFFERS[ok].buy || 0; M[ok].rent = OFFERS[ok].rent || 0; }
  // titles made from a card that had no data of its own (Content.open): back into the catalogue on every page
  try { var ADHOC = JSON.parse(sessionStorage.getItem('contentAdhoc') || '{}'); for(var ak in ADHOC) if(!M[ak]) M[ak] = ADHOC[ak]; } catch(e){}
  var CONTINUE = [{k:'sherlock', s:1, e:5, w:31, of:58}, {k:'endgame', w:122, of:181}, {k:'encanto', w:61, of:102}, {k:'brazil', s:1, e:2, w:20, of:55}, {k:'hailmary', w:101, of:156},
                  {k:'spider', w:41, of:148}, {k:'stranger', s:1, e:3, w:34, of:50}];
  var FOR_YOU = [{k:'d9', price:199}, {k:'avatar', price:399}, {k:'f1', price:199}, {k:'topgun', price:149}, {k:'john', price:149}];
  var RENT = [{k:'avatar', b:'Recommend'}, {k:'f1', b:'Best Seller'}, {k:'topgun', b:'Best Seller'}, {k:'john'}, {k:'venom'}, {k:'lotr'}, {k:'hobbit'}];
  var MY_RENTAL = ['odyssey', 'spider', 'd9', 'lastofus', 'vikings'];   // (F1 and Top Gun are for sale: OFFERS)
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
  // rented this session (purchase.html, Rent): 48 hours from then, first in My Rental, with its last day
  var RENT_HOURS = 48;
  function fmtUntil(t){ var d = new Date(t), h = d.getHours();
    return { d:d.getDate() + ' ' + 'January February March April May June July August September October November December'.split(' ')[d.getMonth()] + ' ' + d.getFullYear(),
             t:((h % 12) || 12) + ':' + ('0' + d.getMinutes()).slice(-2) + ' ' + (h < 12 ? 'AM' : 'PM') }; }
  function rented(){ try { return JSON.parse(sessionStorage.getItem('mdRented') || '{}'); } catch(e){ return {}; } }
  (function(r){ Object.keys(r).forEach(function(k){ if(MY_RENTAL.indexOf(k) < 0) MY_RENTAL.unshift(k); UNTIL[k] = fmtUntil(r[k]); }); })(rented());
  function rent(k){
    var r = rented(); if(!r[k]) r[k] = Date.now() + RENT_HOURS * 36e5;
    try { sessionStorage.setItem('mdRented', JSON.stringify(r)); } catch(e){}
    if(MY_RENTAL.indexOf(k) < 0) MY_RENTAL.unshift(k);
    UNTIL[k] = fmtUntil(r[k]);
  }

  function owned(){ try { return JSON.parse(sessionStorage.getItem('mdOwned') || '[]'); } catch(e){ return []; } }
  function own(k){ var o = owned(); if(o.indexOf(k) < 0){ o.push(k); try { sessionStorage.setItem('mdOwned', JSON.stringify(o)); } catch(e){} } }
  // a platform's package bought this session (purchase.html?ott=, or a detail page's View Package): read fresh each call
  function subs(){ try { return JSON.parse(sessionStorage.getItem('ottSubscribed') || '[]'); } catch(e){ return []; } }
  function subscribed(plat){ return !!plat && subs().indexOf(plat) >= 0; }
  function subscribe(plat){ var s = subs(); if(plat && s.indexOf(plat) < 0){ s.push(plat); try { sessionStorage.setItem('ottSubscribed', JSON.stringify(s)); } catch(e){} } }
  function find(list, k){ for(var i = 0; i < list.length; i++) if(list[i].k === k) return list[i]; return null; }
  function listPrice(k){ var f = find(FOR_YOU, k); return f ? f.price : find(RENT, k) ? 149 : SERIES_PRICE[k] || (M[k] && M[k].price) || 0; }   // Rent or Buy titles: 149 baht
  function offers(k){ return !!M[k] && 'pkg' in M[k]; }
  function buyPrice(k){ return offers(k) ? M[k].buy : listPrice(k); }
  function rentPrice(k){ return offers(k) ? M[k].rent : 0; }
  function price(k){ return buyPrice(k) || rentPrice(k); }
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
      seen[k] = 1; if(M[k] && M[k].w && p[k].w < p[k].of - 1 && state(k) !== 'buy') out.push(cw(k));   // (not one still for sale)
    });
    CONTINUE.forEach(function(c){ if(!seen[c.k]) out.push(cw(c.k)); });
    return out;
  }
  function minutes(k){ var l = (M[k] && M[k].len) || '', h = /(\d+)h/.exec(l), mm = /(\d+)m/.exec(l); return (h ? +h[1] * 60 : 0) + (mm ? +mm[1] : 0) || 50; }   // a series ('1 Season'): a 50-minute episode
  // soon: a title not out yet (days from today; MD.soon(k) its release, ms), else null
  function soon(k){ var m = M[k]; if(!m || !m.soon) return null; var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() + m.soon * 864e5; }
  function state(k){
    if(soon(k)) return 'soon';   // not out yet: its detail page has no Play (Remind instead)
    // a title for sale stays 'buy' until it is the viewer's (bought this session, its platform's package, a rental),
    // even if it was played before: progress alone never makes it theirs (Content.crown stays gold)
    var bought = owned().indexOf(k) >= 0 || !!(M[k] && M[k].premium && subscribed(M[k].plat));
    if(!bought && PACKAGE.indexOf(k) >= 0) return 'buy';
    if(!bought && MY_RENTAL.indexOf(k) < 0 && (price(k) || (offers(k) && M[k].pkg))) return 'buy';   // (View Package only: for sale too)
    return cw(k) ? 'resume' : 'play';
  }
  window.MD = { P:P, PP:PP, M:M, CONTINUE:CONTINUE, FOR_YOU:FOR_YOU, RENT:RENT, MY_RENTAL:MY_RENTAL, state:state, price:price, own:own, cw:cw, setProgress:setProgress, minutes:minutes,
    subscribe:subscribe, subscribed:subscribed, buyPrice:buyPrice, rentPrice:rentPrice, rent:rent,
    soon:soon, continueList:continueList, series:series, seasons:seasons, episodes:episodes, episode:episode, next:next, until:until,
    bg:function(k){ var m = M[k]; return m ? m.b || m.w || m.p : ''; },
    // the quality tag every page shows in a title's meta row: 4K Dolby (platform-tag.css .qtag), else the HD pill
    // a title's meta row, the same on every page (Home's screen text, the Movie page's hero, the detail page): its
    // genres, year, length, age pill and quality tag (the platform tag goes before it, as each page draws it)
    metaHtml:function(m){ return '<strong>' + m.g.join(' · ') + '</strong><span>' + m.y + '</span><span>' + m.len + '</span><span class="pill">' + m.age + '</span>' + window.MD.qtag(m); },
    // how far in a title is (a title being watched: MD.state 'resume'), else null: {w, of, pct}
    watched:function(k){ var c = state(k) === 'resume' && cw(k); return c ? { w:c.w, of:c.of, pct:Math.round(c.w / c.of * 100) } : null; },
    // 4K: the same pill as the age's, then the Dolby Atmos mark (icons/tag-dolby.svg)
    qtag:function(m){ return m && m.q === '4k' ? '<span class="pill">4K</span><img class="qtag" src="icons/tag-dolby.svg" alt="Dolby Atmos">' : '<span class="pill">HD</span>'; } };
})();

/*
  The short dramas: Home's Shorts row (the same titles and posters, posters/shorts/), shared by short-detail.html
  (each short's page) and package-detail.html (its payment, ?short=N).
*/
window.SHORTS = [
  { t:'Seven Days Back, Old Love Ends', img:'s1.jpg', plat:'reelshort', gen:['Romance', 'Period'], rate:'13+', premium:true,
    d:'Seven days before her wedding, a palace maid wakes up in the past with one chance to undo the love that ruined her, and the courage to finally walk away.' },
  { t:'Grandma Takes Over the Family II', img:'s2.jpg', plat:'dramabox', gen:['Comedy', 'Family'], rate:'13+', premium:true,
    d:'Back in a young body, the family matriarch returns to set her spoiled heirs straight and save the business they nearly lost.' },
  { t:'Ink and Rain', img:'s3.jpg', plat:'reelshort', gen:['Romance', 'Fantasy'], rate:'13+', premium:true,
    d:'A painter whose brush brings ink to life and a guarded swordsman cross paths in a city of rain, where every painting hides a promise.' },
  { t:"The Secretary's Forbidden Love", img:'s4.jpg', plat:'dramabox', gen:['Romance', 'Drama'], rate:'16+', premium:true,
    d:'A new secretary falls for the CEO she was hired to watch, and has to choose between the job, the truth and her heart.' },
  { t:"The Mafia Boss's Spoiled Secretary", img:'s5.jpg', plat:'reelshort', gen:['Romance', 'Crime'], rate:'18+', premium:true,
    d:'Hired by the most feared man in the city, a quiet secretary finds out she is the only one he will not let go.' },
  { t:"The Healer's Comeback", img:'s6.jpg', plat:'dramabox', gen:['Drama', 'Period'], rate:'13+', premium:true,
    d:'Cast out of the imperial clinic, a young healer comes back under a new name to cure the court and expose the ones who framed her.' },
  { t:'Back to the Moonlight Promise', img:'s7.jpg', plat:'reelshort', gen:['Romance', 'Drama'], rate:'13+', premium:true,
    d:'Two strangers keep meeting under the same full moon, until they remember the promise they made in another life.' },
  { t:'The Contract Bride\'s Revenge', img:'s8.jpg', plat:'dramabox', gen:['Romance', 'Drama'], rate:'13+', premium:true,
    d:'Married by contract to the heir who ruined her family, a quiet bride plays the perfect wife while she plans her revenge.' }
];

/*
  Episodes of a short, shared by short-detail.html and the vertical player (player.html?short=N&ep=E):
    SHORT.EPS episodes (the first SHORT.FREE free), SHORT.open(s, n) whether episode n of short s can be watched (free,
    unlocked this session, a pass, or the Short Drama package), SHORT.secs(n) its length in seconds (1-3 minutes),
    SHORT.at(s) / SHORT.setAt(s, ep, sec) where the short was left. SHORT.owned(s) every episode is the viewer's: the
    Short Drama package (All Packages), its app's package (MD.subscribed), a pass, or each locked episode unlocked.
*/
window.SHORT = (function(){
  var EPS = 160, FREE = 10;
  function get(k, d){ try { return JSON.parse(sessionStorage.getItem(k) || d); } catch(e){ return JSON.parse(d); } }
  function owned(s){
    var u = get('shortUnlocked' + s, '{}'), sh = window.SHORTS[s];
    if(sessionStorage.getItem('shortsSubscribed') || u.all || (sh && window.MD.subscribed(sh.plat))) return true;
    for(var n = FREE + 1; n <= EPS; n++) if(!u[n]) return false;
    return true;
  }
  function open(s, n){ return n <= FREE || !!get('shortUnlocked' + s, '{}')[n] || owned(s); }
  function secs(n){ return 75 + (n * 37) % 105; }
  function at(s){ return get('shortProgress', '{}')[s] || null; }
  function setAt(s, ep, sec){ var p = get('shortProgress', '{}'); p[s] = { ep:ep, sec:Math.floor(sec) }; try { sessionStorage.setItem('shortProgress', JSON.stringify(p)); } catch(e){} }
  return { EPS:EPS, FREE:FREE, open:open, owned:owned, secs:secs, at:at, setAt:setAt };
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
  Content.crown(info) 'gold' | 'owned' | '': the premium crown of a channel, programme, movie, series or short; every
                      page asks this, never c.crown / MD.state itself. Content.crownIcon(info, size, cls) its <img>
  Content.packageFor(info)   the package that includes it; Content.packageUrl(info, ret) View Package's page
                      (package-suggest.html: the packages that include it, then their purchase, back to ret)
*/
window.Content = (function(){
  function base(src){ return String(src || '').split('/').pop().split('?')[0].toLowerCase(); }
  function norm(t){ return String(t || '').toLowerCase().replace(/\s+s\d+\s*:\s*e\d+$/, '').replace(/[^a-z0-9]/g, ''); }
  function find(info){
    if(!info || info.own) return null;   // own: a page's own video (Sport's highlights, News's episodes), never a catalogue title that shares its picture
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
    var t = info.t || 'Untitled', id = t + '|' + base(info.img) + '|' + (info.len || '');   // title + picture + length: cards that share a placeholder title stay apart
    var k = 'x' + Math.abs(id.split('').reduce(function(h, c){ return (h * 31 + c.charCodeAt(0)) | 0; }, 7)).toString(36);
    // made again each time from what the card shows, so it never keeps words the card no longer has
    var portrait = /portrait|shorts\//.test(info.img || '');
    var m = { t:t, plat:info.plat || 'monomax', g:info.g || ['Featured'], y:info.y || 2026, len:info.len || '1h 45m', age:info.age || '13+', adhoc:1,
      d:info.d || t + ': watch it now on AIS PLAY.' };
    if(info.img){ if(portrait) m.p = info.img; else m.w = info.img; }
    if(info.bg) m.b = info.bg;
    if(info.price){ m.price = +info.price; m.premium = true; }   // sold on its own: premium (Content.crown)
    if(info.ppv) m.ppv = 1;   // a PPV event: premium, bought on its own (purchase.html)
    window.MD.M[k] = m;
    try { var a = JSON.parse(sessionStorage.getItem('contentAdhoc') || '{}'); a[k] = m; sessionStorage.setItem('contentAdhoc', JSON.stringify(a)); } catch(e){}
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
    var o = { k:d.k, s:d.s, t:(d.heroTitle || d.title || d.label || (el.textContent || '').trim().split('\n')[0]).replace(/^#\d+\s+/, ''),   // (a Top 10 card's "#3 ")
              img:d.heroImg || img, d:d.heroDesc || d.desc, price:d.price };
    var inner = el.querySelector('[data-hero-bg], [data-desc]');   // a Top 10 card: its poster carries them
    if(!o.d && inner) o.d = inner.dataset.desc;
    var heroBg = d.heroBg || (inner && inner.dataset.heroBg);
    // what else the card says about itself (Home's My List: data-tag / data-meta; AIS PLAY's own: data-plat="ais" ...)
    var tag = el.querySelector('img[src*="badges/tag-"]'), pm = /tag-([a-z]+)\./.exec(d.tag || (tag ? tag.getAttribute('src') : ''));
    if(d.plat || pm) o.plat = d.plat || pm[1];
    if(heroBg) o.bg = heroBg;
    if(d.meta) meta(o, d.meta);
    if(d.g) o.g = d.g.split(',');
    if(d.y) o.y = +d.y;
    if(d.len) o.len = d.len;
    if(d.age) o.age = d.age;
    return o;
  }
  // "Documentary · Sport · 2021 · 1h 52m" → its genres, year and length
  function meta(o, line){
    var g = [];
    String(line).split(/\s*·\s*/).forEach(function(p){
      if(/^\d{4}$/.test(p)) o.y = +p;
      else if(/^\d+h|^\d+m|Seasons?$/.test(p)) o.len = p;
      else if(p && !/^(Series|Movie)$/.test(p)) g.push(p);
    });
    if(g.length) o.g = g;
  }
  // what a card's screen text shows, the same as the detail page it opens: {t, d, plat, meta, bg, s (a short)}
  function hero(info){
    if(!info) return null;
    var f = target(info);
    if(f.s !== undefined){ var sh = window.SHORTS[f.s];
      return { t:sh.t, d:sh.d, plat:sh.plat, meta:sh.gen.join(' · ') + ' · ' + sh.rate, bg:'posters/shorts/' + sh.img, s:f.s }; }
    var m = window.MD.M[f.k];
    return { t:m.t, d:m.d, plat:m.plat, meta:m.g.join(' · ') + ' · ' + m.y + ' · ' + m.len + ' · ' + m.age, bg:window.MD.bg(f.k), k:f.k };
  }
  // You May Also Like: up to n items of the SAME type as `info`, never another type (fewer if there aren't n):
  //   a short ({s}) → other shorts; a series ({k}, MD.series) → other series; a movie ({k}) → other movies;
  //   a LIVE / Upcoming programme ({t} of content.js LIVE) → other programmes, same league, then same sport, first.
  // Titles rank by most shared genres, then the same platform, then the newest. Never the item itself, no repeats.
  // Returns [{k}] / [{s}] / [programme], each for Content.open / LIVE.href.
  function related(info, n){
    n = n || 18;
    function shared(a, b){ return (a || []).filter(function(x){ return (b || []).indexOf(x) >= 0; }).length; }
    function rank(list, me, g, plat, y){
      return list.map(function(x, i){ return { x:x, i:i, g:shared(g(x), g(me)), p:plat(x) === plat(me) ? 1 : 0, y:y(x) || 0 }; })
        .sort(function(a, b){ return b.g - a.g || b.p - a.p || b.y - a.y || a.i - b.i; }).map(function(r){ return r.x; });
    }
    if(info && info.s !== undefined && info.s !== '' && window.SHORTS[+info.s]){   // a short drama
      var me = +info.s, shorts = window.SHORTS.map(function(x, i){ return i; }).filter(function(i){ return i !== me; });
      return rank(shorts, me, function(i){ return window.SHORTS[i].gen; }, function(i){ return window.SHORTS[i].plat; }, function(){ return 0; })
        .slice(0, n).map(function(i){ return { s:i }; });
    }
    if(info && info.k && window.MD.M[info.k]){   // a movie or a series: the same kind only
      var K = info.k, SER = window.MD.series(K), M = window.MD.M;
      var keys = Object.keys(M).filter(function(k){ return k !== K && !M[k].adhoc && window.MD.series(k) === SER; });
      return rank(keys, K, function(k){ return M[k].g; }, function(k){ return M[k].plat; }, function(k){ return M[k].y; })
        .slice(0, n).map(function(k){ return { k:k }; });
    }
    if(info && info.t && window.LIVE){   // a LIVE / Upcoming programme: the others, same league then same sport first
      var p = window.LIVE.find(info.t) || info;
      return window.LIVE.list.filter(function(q){ return q.t !== p.t; }).map(function(q, i){
        return { q:q, i:i, s:(p.lg && q.lg === p.lg ? 2 : 0) + (p.sp && q.sp === p.sp ? 1 : 0) };
      }).sort(function(a, b){ return b.s - a.s || (b.q.live ? 1 : 0) - (a.q.live ? 1 : 0) || a.i - b.i; }).slice(0, n).map(function(r){ return r.q; });
    }
    return [];
  }
  // a title's or short's meta row, the same on every screen and its detail page: (tag: its platform tag first) then
  // Premium (a premium one: its crown, gold or owned, platform-tag.css .mbadge.prem), then a title's genres, year,
  // length, age pill and quality tag (MD.metaHtml), or a short's genres, year, episodes, rating pill and HD
  function ptag(plat){ return plat === 'ais' ? '<span class="ptag ais" aria-label="AIS PLAY"></span>' : '<img class="ptag" src="badges/tag-' + plat + '.png" alt="">'; }
  function premTag(f){ return crown(f) ? '<span class="mbadge prem">' + crownIcon(f) + 'Premium</span>' : ''; }
  function metaHtml(info, tag){
    var f = target(info);
    if(f.s !== undefined){ var sh = window.SHORTS[f.s];
      return (tag ? ptag(sh.plat) : '') + premTag(f) + '<strong>' + sh.gen.join(' · ') + '</strong><span>2026</span><span>' + window.SHORT.EPS + ' Episodes</span>' +
        '<span class="pill">' + sh.rate + '</span><span class="pill">HD</span>'; }
    var m = window.MD.M[f.k];
    return (tag ? ptag(m.plat) : '') + premTag(f) + window.MD.metaHtml(m);
  }
  // the channel `info` is or is on, or null: {tv: name} (a LIVE / Upcoming programme), {ch: channel or name}, or a channel
  // itself (channels-data.js, or a page's copy of one: n plus its crown); the TV Guide's own entry when there is one
  function channelOf(info){
    var c = info.tv !== undefined ? info.tv : info.ch !== undefined ? info.ch : info.n !== undefined && 'crown' in info ? info : null;
    if(c === null || c === '') return null;
    var name = typeof c === 'string' ? c : c.n, d = window.TV && TV.byName ? TV.byName(name) : null;
    return d || (typeof c === 'string' ? { n:c, crown:'' } : c);
  }
  // the crown, one status for every kind of content: '' not premium, 'owned' premium and the viewer has it, 'gold' premium
  // and they don't. Read fresh each call (sessionStorage), so a purchase shows on the next page load:
  //   a channel / programme  its crown (channels-data.js); 'owned' too once a package with the premium channels is
  //                          bought (tvSubscribed)
  //   a movie / series       m.premium (or a PPV event); 'owned' while MD.state is 'play' or 'resume' (bought, rented,
  //                          its platform's package)
  //   a short                'owned' once SHORT.owned (a package, a pass, every episode unlocked)
  function crown(info){
    if(!info) return '';
    var c = channelOf(info);
    if(c){
      if(!c.crown) return '';
      var sub = false; try { sub = sessionStorage.getItem('tvSubscribed') === '1'; } catch(e){}
      return c.crown === 'owned' || sub ? 'owned' : 'gold';
    }
    var f = find(info);
    if(f && f.s !== undefined) return window.SHORTS[f.s].premium ? (window.SHORT.owned(f.s) ? 'owned' : 'gold') : '';
    if(f){ var m = window.MD.M[f.k], st = window.MD.state(f.k);
      return m.premium || m.ppv ? (st === 'play' || st === 'resume' ? 'owned' : 'gold') : ''; }
    return info.ppv || info.premium ? 'gold' : '';   // a PPV card not opened yet: nothing bought
  }
  // the crown's <img> (nothing when not premium): gold the plain gold crown, owned the crown with the green play mark.
  // size: its width and height in px (else the page's CSS sizes it); cls: the page's class for it (crown-tag, ic20 ...)
  var CROWN_SRC = { gold:'icons/crown-gold.svg', owned:'icons/tv-guide/crown.svg' };
  function crownIcon(info, size, cls){
    var st = crown(info);
    return st ? '<img class="crown-ic ' + st + (cls ? ' ' + cls : '') + '" src="' + CROWN_SRC[st] + '" alt="' + (st === 'owned' ? 'Premium: yours' : 'Premium') + '"' +
      (size ? ' width="' + size + '" height="' + size + '"' : '') + '>' : '';
  }
  // the package that includes `info` (View Package): {n, url}. A channel or programme: PLAY ULTIMATE (its premium
  // channels, package-detail.html's own); a movie or series: its platform's packages (packages.js, ?ott=), AIS PLAY's
  // own titles PLAY ULTIMATE; a short: its app's Short Drama packages (ReelShort / DramaBox). Anything else (a PPV
  // event): All Packages. A page without packages.js gets All Packages for a platform.
  var ULTIMATE = { n:'PLAY ULTIMATE Monthly Package', url:'package-detail.html' };
  function packageFor(info){
    if(!info) return { n:'All Packages', url:'all-packages.html' };
    if(channelOf(info)) return ULTIMATE;
    var f = find(info), plat = f && f.s !== undefined ? window.SHORTS[f.s].plat : f ? window.MD.M[f.k].plat : '';
    if(f && f.k && window.MD.M[f.k].pkg === false) return null;   // sold on its own only (MD OFFERS: no View Package)
    if(f && f.k && window.MD.M[f.k].ppv) plat = '';
    if(plat === 'ais') return ULTIMATE;
    var P = window.Packages;
    if(plat && P && P.PKG[plat]) return { n:P.OTT[plat].n, url:'package-detail.html?ott=' + plat + '&p=0', ott:plat };
    return { n:'All Packages', url:'all-packages.html' };
  }
  // View Package: the package suggestion page (package-suggest.html: the packages that include it), whose purchases come
  // back to `ret` (the detail page) with ?subscribed=1. A channel's programme: info.prog (movie-detail.html's), else its
  // channel's packages only
  function packageUrl(info, ret){
    info = info || {};
    var c = !info.prog && channelOf(info), f = !info.prog && !c && target(info);
    var q = info.prog || c ? 'prog=' + encodeURIComponent(JSON.stringify(info.prog || { t:c.n, tv:c.n, live:1 }))
      : f.s !== undefined ? 's=' + f.s : 'k=' + f.k;
    return 'package-suggest.html?' + q + '&ret=' + encodeURIComponent(ret || location.pathname.split('/').pop() + location.search);
  }
  // a title's or short's main button, as its detail page has it (a screen's own Play button says the same):
  //   gold (premium, not the viewer's)  View Package (ic-pkg): its package, which comes back to the detail page bought;
  //                                     a title no package has: Buy N ฿ / Rent N ฿ (its purchase)
  //   being watched                     Resume (a series: "Resume S1: Ep.5"), else Play (a short: "Play Ep.N")
  // {act:'package' | 'play', label, icon (the <i> class), url}
  function mainAction(info){
    var f = target(info);
    if(crown(f) === 'gold'){
      // no package has it: its first own option, as its detail page's first button (Buy, else Rent)
      var b = f.k && !packageFor(f) && (window.MD.buyPrice(f.k) ? 'buy' : window.MD.rentPrice(f.k) ? 'rent' : '');
      if(b) return { act:b, label:(b === 'buy' ? 'Buy ' + window.MD.buyPrice(f.k) : 'Rent ' + window.MD.rentPrice(f.k)) + ' ฿', icon:'ic-pkg', url:'purchase.html?k=' + f.k + '&opt=' + b };
      return { act:'package', label:'View Package', icon:'ic-pkg', url:packageUrl(f, detailUrl(f)) };
    }
    if(f.s !== undefined){ var ep = (window.SHORT.at(f.s) || {}).ep || 1;
      return { act:'play', label:'Play Ep.' + ep, icon:'ic-play', url:'player.html?short=' + f.s + '&ep=' + ep }; }
    var c = window.MD.state(f.k) === 'resume' && window.MD.cw(f.k);
    return { act:'play', label:c ? (window.MD.series(f.k) ? 'Resume S' + c.s + ': Ep.' + c.e : 'Resume') : 'Play', icon:'ic-play', url:playUrl(f) };
  }
  return { find:find, info:info, hero:hero, metaHtml:metaHtml, related:related, detailUrl:detailUrl, playUrl:playUrl,
    crown:crown, crownIcon:crownIcon, packageFor:packageFor, packageUrl:packageUrl, mainAction:mainAction,
    open:function(i){ location.href = detailUrl(i); }, play:function(i){ location.href = playUrl(i); } };
})();

/*
  LIVE and Upcoming programmes on the TV channels (Home's Live and Upcoming rail, Sport's matches, and the related rails on
  their detail pages). A programme on a Movie or Sport channel has a detail page (movie-detail.html?prog=, Figma "MD LIVE
  State" / "Upcoming Has Access (MD)"), opened only from a picture card; the TV Guide and the EPGs always play the channel.
    LIVE.list          the programmes: t, img, tv (the TV Guide channel), live, or in (minutes from when the page opened,
                       so the demo's upcoming ones are always upcoming), d; heroOnly: shown in Home's first scene, not its rail
    LIVE.start(p)      when an upcoming programme starts (ms): from in, or a label ("Start in 16:12", "Today 20:30 PM",
                       "Tomorrow 02:30 AM"; a time today that has gone by is taken as tomorrow's)
    LIVE.label(p)      its card's label: "Start in 58:12" in the last hour, else "Today 20:30" / "Tomorrow 18:00" / "2 Nov 20:30"
    LIVE.hasMD(tv)     whether the channel's programmes have a detail page: a Sports channel, or a Movies one that isn't Digital
                       TV (channels-data.js)
    LIVE.href(p, from) the card's link: its detail page, else the channel in the Live TV player (via the TV Guide)
    LIVE.hot          Home's Hot Channel Program: news channels' programmes on now (t, img, logo, tv, d)
    LIVE.range(p), LIVE.find(title)   its time on air, a programme by its title (Home's screen text and the detail
                       page's meta row say the same); its Premium: Content.crown({tv:p.tv})
*/
window.LIVE = (function(){
  var U = 'posters/upcoming/';
  var list = [
    {t:'Liverpool vs Brentford', img:U + 'live.jpg', bg:'posters/liver-ben.jpg', v:'posters/homapage.mp4', tv:'MONOMAX 1', live:true, sp:'football', lg:'epl',   // bg: Home's first scene and the detail page; v: its video, Home's and the player's
     d:'Liverpool host Brentford at Anfield in a big Premier League clash. Follow every moment live, from kick-off to the final whistle.'},
    {t:'Arsenal vs Chelsea', img:'posters/arsenal.jpg', bg:'posters/hero/arsenal.jpg', tv:'MONOMAX SPORTS', live:true, heroOnly:true, sp:'football', lg:'epl',   // Home's first scene only
     d:'A fierce London derby as Arsenal host Chelsea in a top-of-the-table Premier League showdown.'},
    {t:'Masterchef Thailand', img:U + 'u1.jpg', tv:'CH7 HD', in:58.2, sp:'', lg:'',
     d:'Thailand\'s best home cooks battle it out in the kitchen for the title of MasterChef. Season 7 premieres soon.'},
    {t:'Leipzig vs Gladbach', img:U + 'u2.jpg', tv:'PLAY SPORTS (Football)', in:150, sp:'football', lg:'bundesliga',
     d:'RB Leipzig welcome Borussia Mönchengladbach in a Bundesliga clash with European places on the line.'},
    {t:'Dortmund vs Hamburg', img:U + 'u3.jpg', tv:'PLAY SPORTS (Football)', in:180, sp:'football', lg:'bundesliga',
     d:'The Yellow Wall awaits as Borussia Dortmund host Hamburger SV at Signal Iduna Park.'},
    {t:'CT14 Eala vs Jovic (R1)', img:U + 'u4.png', tv:'FutureChannel Tennis', in:1260, sp:'tennis', lg:'wta',
     d:'Alex Eala takes on Iva Jovic in the first round, live from the WTA tour.'}
  ];
  var LOADED = Date.now();   // "Start in" counts from when the page was opened, as the card's label does
  function start(p){
    if(p.start) return +p.start;
    if(p.in) return LOADED + p.in * 60000;
    var w = p.when || '', m = /Start in (\d+):(\d+)/i.exec(w);
    if(m) return LOADED + (+m[1] * 60 + +m[2]) * 1000;
    m = /(Today|Tomorrow)\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(w);
    if(!m) return LOADED + 3600000;
    var d = new Date(), h = +m[2];
    if(m[4] && /PM/i.test(m[4]) && h < 12) h += 12;
    if(m[4] && /AM/i.test(m[4]) && h === 12) h = 0;
    d.setHours(h, +m[3], 0, 0);
    if(/Tomorrow/i.test(m[1]) || d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  function hm(t){ var d = new Date(t); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  function label(p){
    var t = start(p), left = t - Date.now();
    if(left < 3600000){ var s = Math.max(0, Math.floor(left / 1000)); return 'Start in ' + Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + s % 60; }
    var a = new Date(t), b = new Date(); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0);
    var dd = Math.round((a - b) / 864e5), d = new Date(t);
    return (dd === 0 ? 'Today ' : dd === 1 ? 'Tomorrow ' : d.getDate() + ' ' + 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[d.getMonth()] + ' ') + hm(t);
  }
  // a Sports channel, or a Movies one that isn't a free-to-air Digital TV channel (those carry Movies & Series among
  // everything else: CH7 HD's Masterchef plays the channel)
  function hasMD(tv){ var c = window.TV && TV.byName(tv), has = function(k){ return c.cats.indexOf(k) >= 0; };
    return !!c && (has('sports') || (has('movies') && !has('digital'))); }
  function href(p, from){
    if(hasMD(p.tv)){
      var o = {t:p.t, img:p.img, tv:p.tv, d:p.d || ''};
      if(p.bg) o.bg = p.bg;
      if(p.live) o.live = 1; else o.start = start(p);
      if(p.range) o.range = p.range;
      return 'movie-detail.html?prog=' + encodeURIComponent(JSON.stringify(o));
    }
    return 'tv-guide.html?play=' + encodeURIComponent(p.tv) + '&from=' + (from || 'home') + (p.live ? '&t=' + encodeURIComponent(p.t) : '');
  }
  list.forEach(function(p){ if(!p.live) p.when = label(p); });   // the card's label, as the page opens
  // the same meta on Home's screen text and the detail page: the time on air (a LIVE one: what the channel's TV Guide has
  // on now; an Upcoming one: from its start, 2h15m)
  function range(p){
    if(p.range) return p.range;
    var c = window.TV && TV.byName(p.tv);
    if(p.live && c){ var o = TV.onNow(c); return hm(o.now.start) + ' – ' + hm(o.now.end); }
    var t = start(p); return hm(t) + ' – ' + hm(t + 135 * 60000);
  }
  function find(t){ return list.filter(function(p){ return p.t === t; })[0] || null; }
  // Hot Channel Program (Home): what's on now on the news channels, pictures from the News page (news-assets/); logo: a
  // logo on white rather than a photo
  var N = 'news-assets/';
  var hot = [
    {t:'CNN News', img:N + 'dm-cnn.png', logo:1, tv:'CNN', live:true,
     d:'CNN Primetime brings the day\u2019s biggest stories from around the world, with live reports from CNN\u2019s correspondents and in-depth analysis.'},
    {t:'Morning Stories', img:N + 'dm-rueng.png', tv:'3 HD', live:true, d:'The morning news that tells the stories around you, with every hot topic from the crack of dawn.'},
    {t:'BBC News', img:N + 'dm-bbc.png', tv:'BBC News', live:true, d:'The latest from BBC News: the stories that matter in the UK and around the world, live.'},
    {t:'Channel 7 News Insight', img:N + 'dm-sanam7.png', tv:'CH7 HD', live:true, d:'Follow every move in the day\u2019s biggest stories, live every day on Channel 7.'},
    {t:'World Update with Thai PBS', img:N + 'lc-1.png', tv:'TPBS', live:true, d:'The day\u2019s international news in one round-up, digging into the stories the whole world is watching.'},
    {t:'Open News Desk', img:N + 'lc-2.png', tv:'PPTV HD', live:true, d:'The PPTV news team opens the desk on every hot topic of the day.'},
    {t:'Komchadluek', img:N + 'lc-4.png', tv:'Nation TV', live:true, d:'Komchadluek goes straight to the heart of Thai politics and society, with frank, in-depth interviews.'}
  ];
  return { list:list, hot:hot, start:start, label:label, hasMD:hasMD, href:href, range:range, find:find };
})();
