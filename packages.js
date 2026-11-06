/*
  packages.js: the streaming (OTT) packages sold in the Store (store.html's Movies rail and tabs) and opened in
  Package Detail (package-detail.html?ott=netflix&p=0), so both show the same package:
    Packages.OTT[k]     a brand: n (name), logo, tile (a logo on white), bg (its screen gradient, Figma Store frames);
                        a sport's league (league: its leagues.js id) shows its logo disc instead, in its own colour
    Packages.PKG[k]     its packages: t, price, per, card ("7 Days" / "Month"), tags, d, screens, q (quality), devices
                        (plans: its payment options when there are several, else its own price as one plan)
    Packages.AIS        the AIS PLAYBOX logo that sits next to every brand's
    Packages.BUNDLES    AIS PLAY's own packages (All Packages' cards, the package suggestion page): PLAY ULTIMATE, HBO MAX
                        Standard, PLAY ALL: title, badge, logo, grid / row (service and channel tiles), count, feats, amt,
                        per, tags (what they carry: the filters, and Packages.suggest), href (their purchase page, or none)
    Packages.cardHtml(card, attrs)   a package card (package-card.css), the same on every page; Subscribe shows when focused
    Packages.ottCard(k, i)  PKG[k][i] as such a card (its logo, quality, screens, price; href its Package Detail)
    Packages.suggest(o) up to 3 cards for what an item needs (package-suggest.html, View Package): o.plat (a title's
                        platform or a short's app: the bundles that carry it, then its own packages), o.channel (a
                        channel's programme: PLAY ULTIMATE; a sports one, o.sport: PLAY ALL, then o.league's packages)
    bundle.tv           what buying it unlocks: the premium channels of that package (channels-data.js pkg); no
                        bundle unlocks short dramas (their app's package, a pass or Buy does)
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
      op('netflix', 'Netflix Mobile 7 Days', 99, 7, 'Netflix on your phone and tablet for 7 days, charged once to your AIS bill. Series, films and anime, with no recurring charge.', 'Recommended'),
      op('netflix', 'Netflix Mobile Monthly', 199, 30, 'Netflix on your phone and tablet every month, billed to your AIS account. Cancel at any time.'),
      op('netflix', 'Netflix Standard', 349, 30, 'Netflix in Full HD on two screens at a time, on your TV and every other device, billed to your AIS account.'),
      op('netflix', 'Netflix Premium', 419, 30, 'Netflix in 4K HDR with spatial audio on four screens at a time, billed to your AIS account.')],
    disney:[
      op('disney', 'Disney+ Hotstar 7 Days', 59, 7, 'Disney, Pixar, Marvel, Star Wars and Thai and Asian series for 7 days, charged once to your AIS bill.', 'Recommended'),
      op('disney', 'Disney+ Hotstar Mobile', 99, 30, 'Disney+ Hotstar on one phone or tablet, every month, billed to your AIS account.'),
      op('disney', 'Disney+ Hotstar Premium', 289, 30, 'Disney+ Hotstar in 4K on four screens at a time, with live sports, billed to your AIS account.')],
    hbo:[
      op('hbo', 'HBO Max 7 Days', 79, 7, 'HBO originals, Warner Bros. films and the DC universe for 7 days, charged once to your AIS bill.', 'Recommended'),
      op('hbo', 'HBO Max Standard', 199, 30, 'HBO Max in Full HD on two screens at a time, billed to your AIS account every month.'),
      op('hbo', 'HBO Max Ultimate', 349, 30, 'HBO Max in 4K Dolby Vision on four screens at a time, with downloads on every device.'),
      // Figma Store "Standalone Streaming": HBO Max on its own, paid monthly or yearly (VAT included: 299 / 2,090 baht)
      Object.assign(op('hbo', 'HBO Max Standalone', 279.44, 30, 'HBO Max on its own, in 4K on four screens at a time, billed to your AIS account monthly or yearly.'),
        { screens:4, q:'4K', plans:[{ name:'Monthly plan', amt:279.44, per:'Monthly', period:'month', renew:1 }, { name:'Yearly plan', amt:1953.27, per:'Yearly', period:'year', renew:1 }] })],
    prime:[
      op('prime', 'Prime Video Monthly', 149, 30, 'Amazon Originals, blockbuster films and live sports on Prime Video, billed to your AIS account every month.', 'Recommended'),
      op('prime', 'Prime Video 7 Days', 39, 7, 'Prime Video for 7 days, charged once to your AIS bill. Amazon Originals and blockbuster films.')],
    viu:[
      op('viu', 'Viu Premium 7 Days', 49, 7, 'K-dramas the same day as Korea, Thai series and Asian variety shows, ad-free for 7 days.', 'Recommended'),
      op('viu', 'Viu Mobile', 79, 30, 'Viu Premium on your phone and tablet every month: K-dramas fast from Korea, ad-free, billed to your AIS account.'),
      op('viu', 'Viu Standard', 119, 30, 'Viu Premium every month: K-dramas fast from Korea, ad-free and in Full HD, billed to your AIS account.'),
      op('viu', 'Viu Premium', 199, 30, 'Everything in Viu Standard, plus Thai and Asian originals first, on four screens at a time.')],
    iqiyi:[
      op('iqiyi', 'iQIYI VIP 7 Days', 49, 7, 'Chinese and Asian dramas, anime and variety shows, ad-free in Full HD for 7 days.', 'Recommended'),
      op('iqiyi', 'iQIYI VIP Monthly', 119, 30, 'iQIYI VIP every month: the newest episodes first, ad-free, billed to your AIS account.'),
      op('iqiyi', 'iQIYI VIP Diamond', 199, 30, 'Everything in VIP, plus 4K, Dolby Atmos and four screens at a time.')],
    monomax:[
      op('monomax', 'MONOMAX Monthly', 99, 30, 'Thai and Hollywood films, Chinese series and Premier League on the MONOMAX app, billed to your AIS account.', 'Recommended'),
      op('monomax', 'MONOMAX 7 Days', 39, 7, 'MONOMAX films and series for 7 days, charged once to your AIS bill.')],
    // the short drama packages: every episode unlocked, no ads, while the pass lasts
    reelshort:[
      op('reelshort', 'ReelShort VIP 7 Days', 59, 7, 'Every episode of every ReelShort drama unlocked and ad-free for 7 days, charged once to your AIS bill.', 'Recommended'),
      op('reelshort', 'ReelShort VIP Monthly', 149, 30, 'Every ReelShort drama unlocked and ad-free, with new episodes every day, billed to your AIS account every month.'),
      op('reelshort', 'ReelShort SVIP Monthly', 249, 30, 'Everything in VIP, plus early access to new series and Full HD on every screen.')],
    dramabox:[
      op('dramabox', 'DramaBox VIP 7 Days', 49, 7, 'Every DramaBox short drama unlocked and ad-free for 7 days, charged once to your AIS bill.', 'Recommended'),
      op('dramabox', 'DramaBox VIP Monthly', 129, 30, 'All of DramaBox unlocked and ad-free, with new dramas every week, billed to your AIS account every month.'),
      op('dramabox', 'DramaBox SVIP Monthly', 199, 30, 'Everything in VIP, plus early episodes of new series and Full HD on every screen.')],
    // the sports packages: every match of the league live, with replays and highlights
    epl:[
      op('epl', 'Premier League 7 Days', 99, 7, 'Every Premier League match for 7 days, live in Full HD with Thai and English commentary, charged once to your AIS bill.', 'Recommended'),
      op('epl', 'Premier League Monthly', 299, 30, 'All 380 Premier League matches live, with full replays, highlights and the weekend\'s goals, billed to your AIS account.'),
      op('epl', 'Premier League Premium', 399, 30, 'Every Premier League match in 4K on four screens at a time, with multi-camera views and the FA Cup.')],
    ucl:[
      op('ucl', 'UEFA Champions League 7 Days', 99, 7, 'Every Champions League match of the matchday, live, for 7 days, charged once to your AIS bill.', 'Recommended'),
      op('ucl', 'UEFA Champions League Monthly', 299, 30, 'The Champions League, Europa League and Conference League live, with replays and the best goals of every matchday.')],
    bundesliga:[
      op('bundesliga', 'Bundesliga Monthly', 199, 30, 'Every Bundesliga and Bundesliga 2 match live, with Der Klassiker, replays and highlights, billed to your AIS account.', 'Recommended'),
      op('bundesliga', 'Bundesliga 7 Days', 59, 7, 'A week of Bundesliga live and on demand, charged once to your AIS bill.')],
    thai1:[
      op('thai1', 'Thai League Monthly', 149, 30, 'Every Thai League 1 match live, plus Thai League 2 and 3, the Muangthai Cup and the PEA Youngster League.', 'Recommended'),
      op('thai1', 'Thai League 7 Days', 49, 7, 'A week of Thai League football live, with Thai commentary, charged once to your AIS bill.')],
    nba:[
      op('nba', 'NBA League Pass 7 Days', 79, 7, 'Every NBA game live and on demand for 7 days, with condensed games and highlights, charged once to your AIS bill.', 'Recommended'),
      op('nba', 'NBA League Pass Monthly', 249, 30, 'Every NBA game of the season live, plus the playoffs and the Finals, billed to your AIS account every month.'),
      op('nba', 'NBA League Pass Premium', 349, 30, 'NBA League Pass in 4K on four screens, ad-free, with in-arena feeds and multi-game view.')],
    rws:[
      op('rws', 'RWS Muay Thai Monthly', 99, 30, 'Every Rajadamnern World Series fight night live from Rajadamnern Stadium, with replays and the knockouts of the week.', 'Recommended'),
      op('rws', 'RWS 7 Days', 39, 7, 'A week of RWS Muay Thai live and on demand, charged once to your AIS bill.')],
    motogp:[
      op('motogp', 'MotoGP Monthly', 199, 30, 'Every MotoGP session live: practice, qualifying, the sprint and the race, with onboard cameras and race replays.', 'Recommended'),
      op('motogp', 'MotoGP 7 Days', 69, 7, 'A Grand Prix weekend of MotoGP live and on demand, charged once to your AIS bill.')],
    pga:[
      op('pga', 'PGA Tour Monthly', 149, 30, 'Every round of the PGA Tour live, including the majors and featured groups, with round highlights.', 'Recommended'),
      op('pga', 'PGA Tour 7 Days', 49, 7, 'A tournament week of the PGA Tour live, charged once to your AIS bill.')]
  };
  // ---- AIS PLAY's own packages, as cards (moved here from All Packages, which shows them too) ----
  var P = 'icons/pkg/';
  var F4K = [P + 'i4k.svg', 'Up to 4K Ultra HD Resolution'], FHD = [P + 'ihd.svg', 'Full HD 1080p'],
      FDOLBY = [P + 'idolby.svg', '5.1 Audio, up to Dolby Atmos'];
  function fscreen(n){ return [P + 'iscreen.svg', n + (n === 1 ? ' Screen' : ' Screens') + ' at once']; }   // (Figma's words)
  function t(img, cls){ return { img:P + img, cls:cls || '' }; }
  var BUNDLES = [   // (BUNDLES[2], PLAY ALL: its sports / channels / plans from its card, below)
    { title:'PLAY ULTIMATE Monthly Package', badge:'Recommended', logo:P + 'l1.png', detail:1, href:'package-detail.html',
      grid:[t('l2.png'), t('l3.png'), t('l4.png'), t('l5.png', 'cover'), t('l6.png', 'cover')],
      count:'99 Premium Channels', row:['l7', 'l8', 'l9', 'l10', 'l11', 'l12'].map(function(l){ return t(l + '.png', 'cover'); }),
      feats:[F4K, FDOLBY, fscreen(4)], amt:'999', per:'/Month',
      tags:['netflix', 'hbo', 'disney', 'iqiyi', 'viu', 'football', 'epl', 'ucl', 'ultimate'],
      tv:'ultimate',   // bought: the premium channels that aren't sports (channels-data.js pkg); short dramas stay for sale
      // its detail page (package-detail.html, Figma Store "AIS PLAY Bundle" / "Full OTT"): the apps (screens, quality,
      // Dolby; txt: no logo yet, a name box), sports, channels, devices, description, terms (the page) and tc (the
      // Confirm popup), and its plans
      services:[
        { n:'AIS PLAY', txt:'AIS PLAY', screens:4, q:'4K', dolby:1 },
        { n:'Netflix', logo:P + 'l2.png', screens:4, q:'4K', dolby:1 },
        { n:'HBO Max', logo:P + 'l3.png', screens:4, q:'4K', dolby:1 },
        { n:'Disney+ Hotstar', logo:P + 'l4.png', screens:4, q:'Full HD', dolby:1 },
        { n:'iQIYI', logo:P + 'l5.png', cls:'cover', screens:2, q:'4K' },
        { n:'viu', logo:P + 'l6.png', cls:'cover', screens:4, q:'Full HD', dolby:1 },
        { n:'WeTV', logo:P + 'd-wetv.png', cls:'white', screens:2, q:'Full HD' },
        { n:'MONOMAX', logo:'partners/monomax.png', cls:'white', screens:4, q:'4K', dolby:1 },
        { n:'OneD', txt:'OneD', screens:4, q:'4K', dolby:1 },
        { n:'3 Plus', txt:'3 Plus', screens:4, q:'4K', dolby:1 }],
      sports:{ tiles:[t('d-ucl.png', 'pad'), t('l19.png'), t('d-motogp.png', 'pad'), t('l21.png', 'pad')], more:'13+', names:['UEFA Champions League', 'Bundesliga', 'MotoGP', 'NBA'] },
      channels:{ tiles:[t('d-cn.png'), t('d-cnn.png', 'pad'), t('d-eurosport.png', 'pad'), t('d-discovery.png', 'pad')], more:'99+', names:['Cartoon Network', 'CNN', 'Eurosport', 'Discovery'] },
      devices:['tv', 'phone', 'tablet', 'laptop'],
      d:"Enjoy Netflix, HBO Max, Disney+ Hotstar, iQIYI, Viu, and WeTV in one PLAY ULTIMATE package. THB 999/month for 12 billing cycles, excluding 7% VAT and internet charges. Available to individual AIS postpaid customers with at least 3 months of active service.",
      terms:[
        "The package renews automatically at the end of each billing cycle until canceled.",
        "Prices exclude 7% VAT and internet charges.",
        "Available to individual AIS postpaid customers with at least 3 months of active service.",
        "Number of screens and video quality depend on each streaming service and your device.",
        "Partner apps may require you to sign in with an account linked to AIS PLAY.",
        "AIS reserves the right to change the package terms without prior notice."],
      tc:[
        "1. This package is available to AIS postpaid customers who have been active for at least 3 months and are registered as individual customers only.",
        "2. The PLAY ULTIMATE package is priced at THB 999/month for 12 billing cycles. The price excludes 7% VAT and internet charges.",
        "3. The package includes access to Netflix, HBO Max, Disney+ Hotstar, iQIYI, Viu, and WeTV at no additional charge while the package remains active.",
        "4. Once the subscription is successfully activated, a confirmation SMS will be sent with subscription details.",
        "5. If the PLAY ULTIMATE package is canceled, access to all included streaming services will be terminated immediately.",
        "6. AIS PLAY supports streaming on up to 4 devices simultaneously via the AIS PLAY app, website, and supported devices such as Apple TV, Samsung Smart TV, and Chromecast.",
        "7. Netflix Premium supports streaming on up to 4 devices simultaneously, subject to Netflix Household terms and conditions.",
        "8. HBO Max Ultimate supports streaming on up to 4 devices simultaneously via the HBO Max app or website.",
        "9. Disney+ Hotstar Premium supports streaming on up to 4 devices simultaneously via the Disney+ Hotstar app or website.",
        "10. iQIYI VIP supports streaming on up to 2 devices simultaneously via the iQIYI app or website.",
        "11. Viu Premium supports streaming on up to 5 devices simultaneously via the Viu app or website.",
        "12. WeTV VIP supports streaming on up to 2 devices simultaneously via the WeTV app or website.",
        "13. Video quality (HD, Full HD or 4K) depends on the content, your internet speed, and the capability of your device and screen.",
        "14. Dolby Atmos and Dolby Vision are available only on supported titles and compatible devices.",
        "15. Subscribing to this package does not change or cancel any existing partner subscription you pay for directly; please cancel those separately to avoid double charges.",
        "16. To use partner services, you may need to sign in or create an account with each partner and link it to your AIS PLAY account.",
        "17. Content availability, titles, and release schedules are determined by each partner and may change or be removed without prior notice.",
        "18. The package renews automatically at the end of each billing cycle. You can cancel anytime via the myAIS app or by dialing *1185; cancellation takes effect at the end of the current cycle.",
        "19. Fees already charged are non-refundable, including for partial billing cycles, except where required by law.",
        "20. Internet data used for streaming is charged according to your mobile or AIS Fibre plan unless a separate data package applies.",
        "21. Using a VPN or streaming from outside Thailand may restrict access to some content.",
        "22. Accounts are for personal, non-commercial use only. Sharing account details outside your household may lead to suspension of the service.",
        "23. Payment is charged to your AIS postpaid bill and appears as a separate line item. Late payment may result in temporary suspension of the package.",
        "24. Promotional prices, if any, apply only during the stated period, after which the standard package price applies.",
        "25. Your personal data is processed in accordance with the AIS Privacy Policy and the privacy policies of each partner service.",
        "26. For assistance, contact AIS Call Center 1175 (24 hours) or visit any AIS Shop.",
        "The company reserves the right to change the package details, benefits, and terms and conditions without prior notice."],
      plans:[{ name:'Monthly plan', amt:999, per:'Monthly', period:'month', renew:1 }] },
    { title:'HBO Max Standard Package', badge:'Best Seller', logo:P + 'l3.png', href:'package-detail.html?ott=hbo&p=1',
      grid:[t('l3.png')], count:'6 Premium Channels', row:[t('l13.png'), t('l14.png', 'cover'), t('l15.png'), t('l16.png'), t('l17.png')],
      feats:[F4K, FDOLBY, fscreen(4)], amt:'199', per:'/Month', tags:['hbo', 'premium'] },
    { title:'PLAY ALL', logo:P + 'l18.png',
      grid:[t('l19.png', 'white cover'), t('l20.png', 'white pad'), t('l21.png', 'white pad'), t('l22.png', 'white cover'), t('l23.png', 'white pad'),
        t('l24.png', 'white cover'), t('l25.png', 'white pad'), { more:'13+' }],
      count:'99 Premium Channels', row:['l28', 'l29', 'l30', 'l31', 'l32'].map(function(l){ return t(l + '.png', 'white cover'); }).concat([t('l33.png', 'white pad')]),
      feats:[FHD, FDOLBY, fscreen(4)], amt:'1,999', per:'/Year',
      tags:['football', 'golf', 'basketball', 'tennis', 'motorsports', 'bundesliga', 'nba', 'nfl', 'lpga', 'atp', 'motogp', 'rws', 'premiumplus'],
      // its detail page (package-detail.html?bundle=2): the same leagues and channels as its card, its yearly plan;
      // bought: the sports premium channels (channels-data.js pkg 'sports')
      href:'package-detail.html?bundle=2', tv:'sports' }
  ];
  (function(A){ A.sports = { tiles:A.grid.filter(function(x){ return !x.more; }), more:'13+' }; A.channels = { tiles:A.row, more:'99+' };
    A.plans = [{ name:'Yearly plan', amt:1999, per:'Yearly', period:'year', renew:1 }]; })(BUNDLES[2]);
  // a brand's package (PKG) as a card: its logo (a league's: its logo, leagues.js), its quality and screens, its price; bought on package-detail.html
  function ottCard(k, i){
    var p = PKG[k][i], b = OTT[k], lg = b.league && window.Leagues && Leagues.list.filter(function(l){ return l.id === b.league; })[0];
    var logo = lg ? lg.logo : b.logo, cls = lg || b.tile ? 'white' : b.icon ? 'cover' : '';
    return { title:p.t, badge:p.badge, logo:logo, logoCls:cls, href:'package-detail.html?ott=' + k + '&p=' + i,
      grid:[{ img:logo, cls:cls }], count:'', row:[],
      feats:(p.q === '4K' ? [F4K, FDOLBY] : [FHD]).concat([fscreen(p.screens)]), amt:String(p.price), per:'/' + (p.card === 'Month' ? 'Month' : '7 Days') };
  }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function tileHtml(x){
    if(x.more) return '<span class="tile more">' + esc(x.more) + '</span>';
    if(x.ph) return '<span class="tile ph' + (x.half ? ' half' : '') + '"></span>';
    return '<span class="tile ' + x.cls + '"><img src="' + x.img + '" alt=""></span>';
  }
  // attrs: the page's own attributes on the card (its index ...); the chanlist only when the package has channels
  function cardHtml(c, attrs){
    return '<div class="pcard item' + (c.badge ? ' has-badge' : '') + '"' + (attrs || '') + ' data-label="' + esc(c.title) + '" data-ring-art="">' +   // the plain ring (Figma's white rim)
      (c.badge ? '<div class="badge">' + esc(c.badge) + '</div>' : '') +
      '<div class="body"><div class="ptitle"><span class="lg' + (c.ph ? ' ph' : '') + (c.logoCls ? ' ' + c.logoCls : '') + '">' + (c.ph ? '' : '<img src="' + c.logo + '" alt="">') + '</span><b>' + esc(c.title) + '</b></div>' +
      '<div class="mid"><div class="chans"><div class="grid">' + c.grid.map(tileHtml).join('') + '</div>' +
      (c.count ? '<div class="chanlist"><div class="small">' + esc(c.count) + '</div><div class="row40">' + c.row.map(tileHtml).join('') + '</div></div>' : '') + '</div>' +
      '<div class="feats">' + c.feats.map(function(f){ return '<div class="feat"><img src="' + f[0] + '" alt="">' + esc(f[1]) + '</div>'; }).join('') + '</div></div>' +
      '<div class="price"><div class="amtwrap"><div class="amt' + (String(c.amt).length > 4 ? ' long' : '') + '"><b>' + esc(c.amt) + ' baht</b><span>' + esc(c.per) + '</span></div><div class="vat">(Exclude VAT)</div></div>' +
      '<div class="subscribe tv-btn tv-btn--primary tv-btn--lit">Subscribe<img src="' + P + 'ichev.svg" alt=""></div></div></div></div>';
  }
  function suggest(o){
    var out = [], U = BUNDLES[0], H = BUNDLES[1], A = BUNDLES[2];
    function add(c){ if(c && out.length < 3 && out.indexOf(c) < 0) out.push(c); }
    // a channel's programme: the package its channel comes with (channels-data.js pkg): a sports one PLAY ALL, then its
    // league's packages; any other PLAY ULTIMATE
    if(o.channel){
      if(o.sport){ add(A); if(o.league && PKG[o.league]) PKG[o.league].forEach(function(p, i){ add(ottCard(o.league, i)); }); }
      else add(U);
    }
    else if(o.plat && PKG[o.plat]){
      BUNDLES.forEach(function(b){ if(b.tags.indexOf(o.plat) >= 0) add(b); });
      PKG[o.plat].forEach(function(p, i){ add(ottCard(o.plat, i)); });
    } else { add(U); add(H); add(A); }
    // one Recommend: the first card's
    return out.map(function(c, i){ return i && c.badge === 'Recommended' ? Object.assign({}, c, { badge:'' }) : c; });
  }
  return { OTT:OTT, PKG:PKG, AIS:'store-assets/ott/ais-playbox.png', BUNDLES:BUNDLES, cardHtml:cardHtml, ottCard:ottCard, suggest:suggest };
})();
