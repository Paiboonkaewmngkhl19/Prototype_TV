/*
  packages.js: the streaming (OTT) packages sold in the Store (store.html's Movies rail and tabs) and opened in
  Package Detail (package-detail.html?ott=netflix&p=0), so both show the same package:
    Packages.OTT[k]     a brand: n (name), logo, tile (a logo on white), bg (its screen gradient, Figma Store frames);
                        a sport's league (league: its leagues.js id) shows its logo disc instead, in its own colour
    Packages.PKG[k]     its packages: t, price, per, card ("7 Days" / "Month"), tags, d, screens, q (quality), devices
    Packages.AIS        the AIS PLAYBOX logo that sits next to every brand's
*/
window.Packages = (function(){
  // the OTT packages (Figma Store 5472:228410 Netflix, 228753 Disney+, 229116 HBO Max, 229476 Prime Video, 230211 Viu,
  // 229848 iQIYI): each brand's logo (store-assets/ott/) and gradient, and its packages; MONOMAX has no frame yet, so its
  // own orange in the same recipe
  var OTT = {
    netflix:{ n:'Netflix', logo:'store-assets/ott/netflix.svg', bg:'linear-gradient(118.2deg, rgba(229,9,20,.5) 1.57%, rgba(0,0,0,.5) 143.42%), #000' },
    disney: { n:'Disney+', logo:'store-assets/ott/disney.svg', bg:'linear-gradient(118.51deg, rgba(43,67,130,.4) 1.21%, rgba(7,192,225,.4) 38.92%, rgba(0,0,0,.4) 99.61%), #101010' },
    hbo:    { n:'HBO Max', logo:'store-assets/ott/hbo.png', bg:'linear-gradient(119.16deg, rgba(196,196,196,.2) 68.92%, rgba(94,94,94,.2) 100%), #101010' },
    prime:  { n:'Prime Video', logo:'store-assets/ott/prime.svg', bg:'linear-gradient(118.51deg, rgba(0,168,225,.4) 52.7%, rgba(255,255,255,.4) 99.15%), #101010' },
    viu:    { n:'Viu', logo:'store-assets/ott/viu.svg', bg:'linear-gradient(118.51deg, rgba(255,191,0,.7) .41%, #000 99.61%)' },
    iqiyi:  { n:'iQIYI', logo:'store-assets/ott/iqiyi.svg', bg:'linear-gradient(119.36deg, rgba(0,173,71,.4) 64.03%, rgba(0,71,29,.4) 100%), #101010' },
    monomax:{ n:'MONOMAX', logo:'partners/monomax.png', tile:1, bg:'linear-gradient(118.51deg, rgba(232,78,27,.45) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    // the Short Series rail (store.html): the short drama apps, their square icon (badges/tag-*.png, icon) in their colours
    reelshort: { n:'ReelShort', logo:'badges/tag-reelshort.png', icon:1, bg:'linear-gradient(118.51deg, rgba(240,40,110,.5) 1%, rgba(255,120,40,.35) 50%, rgba(0,0,0,.4) 99.61%), #101010' },
    dramabox:  { n:'DramaBox', logo:'badges/tag-dramabox.png', icon:1, bg:'linear-gradient(118.51deg, rgba(255,20,80,.5) 1%, rgba(255,140,30,.35) 50%, rgba(0,0,0,.4) 99.61%), #101010' },
    // the Sports rail (store.html): each league's packages, its disc (leagues.js) where an OTT has its logo, in its colour
    epl:       { n:'Premier League', league:'epl', bg:'linear-gradient(118.51deg, rgba(110,40,160,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    ucl:       { n:'UEFA Champions League', league:'ucl', bg:'linear-gradient(118.51deg, rgba(20,60,200,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    bundesliga:{ n:'Bundesliga', league:'bundesliga', bg:'linear-gradient(118.51deg, rgba(210,10,17,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    thai1:     { n:'Thai League', league:'thai1', bg:'linear-gradient(118.51deg, rgba(225,40,40,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    nba:       { n:'NBA', league:'nba', bg:'linear-gradient(118.51deg, rgba(29,66,138,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    rws:       { n:'RWS', league:'rws', bg:'linear-gradient(118.51deg, rgba(230,30,30,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    motogp:    { n:'MotoGP', league:'motogp', bg:'linear-gradient(118.51deg, rgba(200,20,40,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' },
    pga:       { n:'PGA Tour', league:'pga', bg:'linear-gradient(118.51deg, rgba(0,51,102,.5) 1%, rgba(0,0,0,.4) 99.61%), #101010' }
  };
  // a package: price per period; a 7-day pass is charged once, a monthly one recurs (the card reads "99 | 7 Days")
  function op(ott, t, price, days, d, badge){
    var wk = days === 7;
    var mobile = wk || /Mobile/.test(t), top = !mobile && /Premium|Ultimate|Diamond/.test(t);
    return { ott:ott, badge:badge, t:t, price:price, per:wk ? '7 days' : 'Month', card:wk ? '7 Days' : 'Month',
      tags:wk ? ['7 Days', 'One-time'] : ['Monthly', 'Recurring'], d:d, pkg:1,
      screens:mobile ? 1 : top ? 4 : 2, q:top ? '4K' : 'Full HD', devices:mobile ? ['phone', 'tablet'] : ['phone', 'tablet', 'laptop', 'tv'] };
  }
  var PKG = {
    netflix:[
      op('netflix', 'Netflix Mobile 7 Days', 99, 7, 'Netflix on your phone and tablet for 7 days, charged once to your AIS bill. Series, films and anime, with no recurring charge.', 'Recommend'),
      op('netflix', 'Netflix Mobile Monthly', 199, 30, 'Netflix on your phone and tablet every month, billed to your AIS account. Cancel at any time.'),
      op('netflix', 'Netflix Standard', 349, 30, 'Netflix in Full HD on two screens at a time, on your TV and every other device, billed to your AIS account.'),
      op('netflix', 'Netflix Premium', 419, 30, 'Netflix in 4K HDR with spatial audio on four screens at a time, billed to your AIS account.')],
    disney:[
      op('disney', 'Disney+ Hotstar 7 Days', 59, 7, 'Disney, Pixar, Marvel, Star Wars and Thai and Asian series for 7 days, charged once to your AIS bill.', 'Recommend'),
      op('disney', 'Disney+ Hotstar Mobile', 99, 30, 'Disney+ Hotstar on one phone or tablet, every month, billed to your AIS account.'),
      op('disney', 'Disney+ Hotstar Premium', 289, 30, 'Disney+ Hotstar in 4K on four screens at a time, with live sport, billed to your AIS account.')],
    hbo:[
      op('hbo', 'HBO Max 7 Days', 79, 7, 'HBO originals, Warner Bros. films and the DC universe for 7 days, charged once to your AIS bill.', 'Recommend'),
      op('hbo', 'HBO Max Standard', 199, 30, 'HBO Max in Full HD on two screens at a time, billed to your AIS account every month.'),
      op('hbo', 'HBO Max Ultimate', 349, 30, 'HBO Max in 4K Dolby Vision on four screens at a time, with downloads on every device.')],
    prime:[
      op('prime', 'Prime Video Monthly', 149, 30, 'Amazon Originals, blockbuster films and live sport on Prime Video, billed to your AIS account every month.', 'Recommend'),
      op('prime', 'Prime Video 7 Days', 39, 7, 'Prime Video for 7 days, charged once to your AIS bill. Amazon Originals and blockbuster films.')],
    viu:[
      op('viu', 'Viu Premium 7 Days', 49, 7, 'K-dramas the same day as Korea, Thai series and Asian variety shows, ad-free for 7 days.', 'Recommend'),
      op('viu', 'Viu Mobile', 79, 30, 'Viu Premium on your phone and tablet every month: K-dramas fast from Korea, ad-free, billed to your AIS account.'),
      op('viu', 'Viu Standard', 119, 30, 'Viu Premium every month: K-dramas fast from Korea, ad-free and in Full HD, billed to your AIS account.'),
      op('viu', 'Viu Premium', 199, 30, 'Everything in Viu Standard, plus Thai and Asian originals first, on four screens at a time.')],
    iqiyi:[
      op('iqiyi', 'iQIYI VIP 7 Days', 49, 7, 'Chinese and Asian dramas, anime and variety shows, ad-free in Full HD for 7 days.', 'Recommend'),
      op('iqiyi', 'iQIYI VIP Monthly', 119, 30, 'iQIYI VIP every month: the newest episodes first, ad-free, billed to your AIS account.'),
      op('iqiyi', 'iQIYI VIP Diamond', 199, 30, 'Everything in VIP, plus 4K, Dolby Atmos and four screens at a time.')],
    monomax:[
      op('monomax', 'MONOMAX Monthly', 99, 30, 'Thai and Hollywood films, Chinese series and Premier League on the MONOMAX app, billed to your AIS account.', 'Recommend'),
      op('monomax', 'MONOMAX 7 Days', 39, 7, 'MONOMAX films and series for 7 days, charged once to your AIS bill.')],
    // the short drama packages: every episode unlocked, no ads, while the pass lasts
    reelshort:[
      op('reelshort', 'ReelShort VIP 7 Days', 59, 7, 'Every episode of every ReelShort drama unlocked and ad-free for 7 days, charged once to your AIS bill.', 'Recommend'),
      op('reelshort', 'ReelShort VIP Monthly', 149, 30, 'Every ReelShort drama unlocked and ad-free, with new episodes every day, billed to your AIS account every month.'),
      op('reelshort', 'ReelShort SVIP Monthly', 249, 30, 'Everything in VIP, plus early access to new series and Full HD on every screen.')],
    dramabox:[
      op('dramabox', 'DramaBox VIP 7 Days', 49, 7, 'Every DramaBox short drama unlocked and ad-free for 7 days, charged once to your AIS bill.', 'Recommend'),
      op('dramabox', 'DramaBox VIP Monthly', 129, 30, 'All of DramaBox unlocked and ad-free, with new dramas every week, billed to your AIS account every month.'),
      op('dramabox', 'DramaBox SVIP Monthly', 199, 30, 'Everything in VIP, plus early episodes of new series and Full HD on every screen.')],
    // the sports packages: every match of the league live, with replays and highlights
    epl:[
      op('epl', 'Premier League 7 Days', 99, 7, 'Every Premier League match for 7 days, live in Full HD with Thai and English commentary, charged once to your AIS bill.', 'Recommend'),
      op('epl', 'Premier League Monthly', 299, 30, 'All 380 Premier League matches live, with full replays, highlights and the weekend\'s goals, billed to your AIS account.'),
      op('epl', 'Premier League Premium', 399, 30, 'Every Premier League match in 4K on four screens at a time, with multi-camera views and the FA Cup.')],
    ucl:[
      op('ucl', 'UEFA Champions League 7 Days', 99, 7, 'Every Champions League match of the matchday, live, for 7 days, charged once to your AIS bill.', 'Recommend'),
      op('ucl', 'UEFA Champions League Monthly', 299, 30, 'The Champions League, Europa League and Conference League live, with replays and the best goals of every matchday.')],
    bundesliga:[
      op('bundesliga', 'Bundesliga Monthly', 199, 30, 'Every Bundesliga and Bundesliga 2 match live, with Der Klassiker, replays and highlights, billed to your AIS account.', 'Recommend'),
      op('bundesliga', 'Bundesliga 7 Days', 59, 7, 'A week of Bundesliga live and on demand, charged once to your AIS bill.')],
    thai1:[
      op('thai1', 'Thai League Monthly', 149, 30, 'Every Thai League 1 match live, plus Thai League 2 and 3, the Muangthai Cup and the PEA Youngster League.', 'Recommend'),
      op('thai1', 'Thai League 7 Days', 49, 7, 'A week of Thai League football live, with Thai commentary, charged once to your AIS bill.')],
    nba:[
      op('nba', 'NBA League Pass 7 Days', 79, 7, 'Every NBA game live and on demand for 7 days, with condensed games and highlights, charged once to your AIS bill.', 'Recommend'),
      op('nba', 'NBA League Pass Monthly', 249, 30, 'Every NBA game of the season live, the playoffs and the Finals, billed to your AIS account every month.'),
      op('nba', 'NBA League Pass Premium', 349, 30, 'NBA League Pass in 4K on four screens, ad-free, with in-arena feeds and multi-game view.')],
    rws:[
      op('rws', 'RWS Muay Thai Monthly', 99, 30, 'Every Rajadamnern World Series fight night live from Rajadamnern Stadium, with replays and the knockouts of the week.', 'Recommend'),
      op('rws', 'RWS 7 Days', 39, 7, 'A week of RWS Muay Thai live and on demand, charged once to your AIS bill.')],
    motogp:[
      op('motogp', 'MotoGP Monthly', 199, 30, 'Every MotoGP session live, practice, qualifying, the sprint and the race, with onboard cameras and race replays.', 'Recommend'),
      op('motogp', 'MotoGP 7 Days', 69, 7, 'A Grand Prix weekend of MotoGP live and on demand, charged once to your AIS bill.')],
    pga:[
      op('pga', 'PGA Tour Monthly', 149, 30, 'Every round of the PGA Tour live, the majors and featured groups, with round highlights.', 'Recommend'),
      op('pga', 'PGA Tour 7 Days', 49, 7, 'A tournament week of the PGA Tour live, charged once to your AIS bill.')]
  };
  return { OTT:OTT, PKG:PKG, AIS:'store-assets/ott/ais-playbox.png' };
})();
