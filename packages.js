/*
  packages.js: the streaming (OTT) packages sold in the Store (store.html's Movies rail and tabs) and opened in
  Package Detail (package-detail.html?ott=netflix&p=0), so both show the same package:
    Packages.OTT[k]     a brand: n (name), logo, tile (a logo on white), bg (its screen gradient, Figma Store frames)
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
    monomax:{ n:'MONOMAX', logo:'partners/monomax.png', tile:1, bg:'linear-gradient(118.51deg, rgba(232,78,27,.45) 1%, rgba(0,0,0,.4) 99.61%), #101010' }
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
      op('monomax', 'MONOMAX 7 Days', 39, 7, 'MONOMAX films and series for 7 days, charged once to your AIS bill.')]
  };
  return { OTT:OTT, PKG:PKG, AIS:'store-assets/ott/ais-playbox.png' };
})();
