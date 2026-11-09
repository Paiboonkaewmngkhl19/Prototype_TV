
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  var $ = function(q){ return Array.prototype.slice.call(document.querySelectorAll(q)); };

  // ---- title mode (Figma Store "Package details use cases"): Title Details on the left (poster, title, meta row, Synopsis /
  // Terms and Conditions), Options on the right, then the same payment, a one-time charge:
  //   ?short=N[&ep=E]       a short's viewing passes ("Rent": 24 / 48 / 100 hours), from its Unlock Episode popup
  //   ?short=N&opt=buy      the whole short ("Vertical Content Full Series"), its detail page's Buy N Baht (content.js SHORTS buy)
  //   ?short=N&opt=ep&ep=E  one locked episode (its Unlock this content popup: Buy episode E, content.js SHORT.EP_PRICE)
  //   ?k=K&opt=buy          a title's Buy ("Buy": its quality, MD.buyPrice); a PPV event or AIS PLAY Exclusive (m.ev / m.ppv:
  //                         "PPV Event": an Event Pass)
  //   ?k=K&opt=rent         a title's Rent ("Rent": an MD.RENT_HOURS pass, MD.rentPrice)
  // bought: back to its detail page (?bought=1 / ?rented=1; a pass: ?pass=1), the title the viewer's ----
  var OPT = (location.search.match(/[?&]opt=(buy|rent|ep)/) || [])[1] || '';
  var PV = null;   // what the details view shows (Enter on the card): dt (its first heading), d, terms
  var SHORT = (location.search.match(/[?&]short=(\d+)/) || [])[1], SH = SHORT !== undefined ? window.SHORTS[+SHORT] : null;
  var TK = (location.search.match(/[?&]k=([\w-]+)/) || [])[1]; if(!(TK && MD.M[TK] && OPT)) TK = null;
  var FULL = !!(SH && OPT === 'buy' && SH.buy);   // a short bought whole, not a pass
  var TITLE = !!(SH || TK), KIND = '';   // KIND: 'pass' (a short's passes), 'buy', 'rent', 'event'
  var EP = +((location.search.match(/[?&]ep=(\d+)/) || [])[1] || 0);
  var PASSES = [
    { name:'24-Hour Pass', hours:24, start:7, amt:'199 Baht', vat:'212.93 Baht' },
    { name:'48-Hour Pass', hours:48, start:30, amt:'299 Baht', vat:'319.93 Baht' },
    { name:'100-Hour Pass', hours:100, start:90, amt:'399 Baht', vat:'426.93 Baht' }
  ];
  function vatOf(n){ return (Math.round(n * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  var CLOCK = 'icons/short/pass-clock.svg', FILM = 'icons/short/pass-film.svg';
  if(TITLE){
    var TM = TK ? MD.M[TK] : null, H = MD.RENT_HOURS;
    var TV = SH ? { t:SH.t, pic:'posters/shorts/' + SH.img, meta:Content.metaHtml({s:+SHORT}, true), d:SH.d }
                : { t:TM.t, pic:TM.p || TM.w || TM.b, meta:Content.metaHtml({k:TK}, true), d:TM.d };
    KIND = SH ? (FULL ? 'buy' : OPT === 'ep' && EP ? 'ep' : 'pass') : OPT === 'rent' ? 'rent' : TM.ev || TM.ppv ? 'event' : 'buy';
    // its options: a pass (its hours and when to start it), an Event Pass, or the quality it is bought in
    var OPTS = KIND === 'pass' ? PASSES.map(function(p){ return { name:p.name, lines:[[CLOCK, 'Start anytime within ' + p.start + ' days.'], [FILM, 'Enjoy ' + p.hours + ' hours of unlimited viewing.']], amt:p.amt, vat:p.vat }; })
      : KIND === 'rent' ? [{ name:H + '-Hour Pass', lines:[[CLOCK, 'Start anytime within 7 days.'], [FILM, 'Enjoy ' + H + ' hours of unlimited viewing.']], amt:MD.rentPrice(TK) }]
      : KIND === 'ep' ? [{ name:'Episode ' + EP, lines:[[FILM, 'Watch episode ' + EP + ' as many times as you like.']], amt:window.SHORT.EP_PRICE }]
      : KIND === 'event' ? [{ name:'Event Pass', lines:[[CLOCK, 'Watch live at the scheduled time']], amt:MD.buyPrice(TK) }]
      : [{ name:(SH ? 'Full HD' : TM.q === '4k' ? '4K' : 'Full HD'), lines:[], amt:SH ? SH.buy : MD.buyPrice(TK) }];
    OPTS.forEach(function(o){ if(typeof o.amt === 'number'){ o.vat = vatOf(o.amt) + ' Baht'; o.amt = o.amt + ' Baht'; } });
    document.body.classList.add('short');   // (the Title Details layout)
    document.body.classList.toggle('no-note', KIND === 'buy' || KIND === 'ep');   // Figma "Buy" (and one episode): no viewing-period note
    document.title = TV.t;
    // (the heading stays "Package Details" (package-detail.html) in every mode)
    document.querySelector('.tdetails .poster').style.backgroundImage = "url('" + TV.pic + "')";
    document.querySelector('.tdetails .nm').textContent = TV.t;
    document.querySelector('.tdetails .meta').innerHTML = TV.meta;   // content.js: as its own detail page
    document.querySelector('.tdetails .syn').textContent = TV.d;
    // the options are the right column's prices (no package prices on this page); one option: already picked
    $('.prices .price').forEach(function(p){ p.remove(); });
    document.querySelector('.passes').innerHTML = OPTS.map(function(o, i){
      return '<div class="price pass item' + (OPTS.length === 1 ? ' selected' : '') + '" data-label="' + o.name + '" data-pass="' + i + '"><span class="rd"></span>' +
        '<div class="what"><b>' + o.name + '</b>' + o.lines.map(function(l){ return '<span><img src="' + l[0] + '" alt="">' + l[1] + '</span>'; }).join('') + '</div>' +
        '<div class="cost"><div class="amt">' + o.amt + '</div><p class="vat">VAT Included: ' + o.vat + '</p></div></div>';
    }).join('');
    // its terms: Terms and Conditions here and in the Confirm popup
    var TERMS = KIND === 'pass' ? ['A viewing pass gives unlimited viewing of every episode of this title for the hours of the pass.',
        'The pass is a one-time purchase and does not renew automatically.', 'The viewing period starts the first time you press Play, and must start within the days shown for the pass.',
        'Once started, the pass runs continuously, including while you are not watching, and ends after its hours have passed.']
      : KIND === 'rent' ? ['A rental is a one-time purchase and does not renew automatically.', 'Start watching within 7 days; once started you have ' + H + ' hours to finish.',
        'The rental is for this title only, on the AIS PLAY app, website and supported TVs and devices.']
      : KIND === 'ep' ? ['A one-time purchase of episode ' + EP + ' of ' + TV.t + ' only; its other locked episodes stay locked.', 'The purchase does not renew automatically.']
      : KIND === 'event' ? ['An Event Pass is a one-time purchase for this event only.', 'Watch it live at its scheduled time, and its replay afterwards while it is available.',
        'The pass does not renew automatically.']
      : ['A one-time purchase: ' + TV.t + ' is yours to watch again any time in My Rentals and Purchases.', 'The purchase does not renew automatically.'];
    TERMS = TERMS.concat(['Prices include 7% VAT and are charged once to your AIS bill or paid by QR PromptPay. Internet charges are not included.',
      'Video quality depends on the title, your internet speed and your device.', 'Fees already charged are non-refundable, except where required by law.',
      'For assistance, contact AIS Call Center 1175 (24 hours) or visit any AIS Shop.']);
    PV = { dt:'Synopsis', d:TV.d, terms:TERMS };   // its details view (Enter on its card)
  }
  // ---- the package (packages.js; nothing on this page is typed in): an OTT one (?ott=netflix&p=0, a Store or package
  // suggestion card), else AIS PLAY's own (Packages.BUNDLES, PLAY ULTIMATE: Figma "AIS PLAY Bundle" / "Full OTT") ----
  var OK = (location.search.match(/[?&]ott=(\w+)/) || [])[1], OB = OK && Packages.OTT[OK], OP = OB ? Packages.PKG[OK] : null;
  var OI = OP ? Math.max(0, Math.min(OP.length - 1, +((location.search.match(/[?&]p=(-?\d+)/) || [])[1] || 0))) : 0;
  // ?bundle=N: that one of AIS PLAY's packages (PLAY ALL: 2); else PLAY ULTIMATE
  var BI = (location.search.match(/[?&]bundle=(\d+)/) || [])[1];
  var BUNDLE = TITLE || OB ? null : Packages.BUNDLES[+BI] && Packages.BUNDLES[+BI].plans ? Packages.BUNDLES[+BI] : Packages.BUNDLES.filter(function(b){ return b.detail; })[0];
  function ottLg(){
    if(OB.league)   // a league's package: its disc (leagues.js), on white
      return '<span style="position:relative;display:block;width:100%;height:100%;border-radius:50%;background:#fff;overflow:hidden">' +
        Leagues.pic(Leagues.list.filter(function(l){ return l.id === OB.league; })[0]) + '</span>';
    return '<img src="' + OB.logo + '" alt="' + OB.n + '" style="object-fit:contain;' + (OB.tile ? '' : OB.icon ? 'object-fit:cover' : 'background:#000;padding:8px;box-sizing:border-box') + '">';
  }
  function esc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function vat(n){ return (Math.round(n * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }); }
  function money(n){ return Number(n).toLocaleString('en-US', { maximumFractionDigits:2 }); }
  // what the page shows, the same shape for both: t, lg (its logo), services, sports, channels, devices, d, terms, tc, plans
  var PK = null;
  if(OB){
    var P0 = OP[OI], MONTH = P0.card === 'Month';
    PK = { t:P0.t, lg:ottLg(),
      services:[{ n:OB.n, html:ottLg(), screens:P0.screens, q:P0.q === '4K' ? '4K' : 'Full HD', dolby:P0.q === '4K' }],   // the app it is
      devices:P0.devices,
      d:P0.d + ' ' + money(P0.price) + ' Baht / ' + P0.per + ', excluding 7% VAT and internet charges. Available to AIS postpaid and prepaid customers.',
      terms:[MONTH ? 'The package renews automatically at the end of each billing cycle until canceled.' : 'The pass is a one-time purchase and ends after 7 days; it does not renew.',
        'Prices exclude 7% VAT and internet charges.', 'Number of screens and video quality depend on ' + OB.n + ' and your device.',
        'You may need to sign in to ' + OB.n + ' with an account linked to AIS PLAY.', 'AIS reserves the right to change the package terms without prior notice.'],
      tc:['1. This package is available to AIS postpaid and prepaid customers.',
        '2. ' + OB.n + ' is included at no additional charge while the package remains active.', '3. A confirmation SMS is sent once the package is active.',
        '4. Monthly packages renew automatically at the end of each billing cycle; cancel anytime via the myAIS app or by dialing *1185. 7-day passes do not renew.',
        '5. Video quality and the number of screens depend on ' + OB.n + ', the content, your internet speed and your device.',
        '6. You may need to sign in or create an ' + OB.n + ' account and link it to your AIS PLAY account.',
        '7. Content availability is determined by ' + OB.n + ' and may change without prior notice.', '8. Fees already charged are non-refundable, except where required by law.',
        '9. For assistance, contact AIS Call Center 1175 (24 hours) or visit any AIS Shop.'],
      // its plans; a package with one price: that price as its plan (a monthly one renews, a 7-day pass doesn't)
      plans:P0.plans || [{ name:MONTH ? 'Monthly plan' : '7-day pass', amt:P0.price, per:MONTH ? 'Monthly' : '7 Days', period:MONTH ? 'month' : '7d', renew:MONTH }] };
  } else if(BUNDLE){
    PK = { t:BUNDLE.title, lg:'<img src="' + BUNDLE.logo + '" alt="">', services:BUNDLE.services, sports:BUNDLE.sports, channels:BUNDLE.channels,
      devices:BUNDLE.devices, d:BUNDLE.d, terms:BUNDLE.terms, tc:BUNDLE.tc, plans:BUNDLE.plans };
  }
  if(PK){
    document.title = PK.t + ' · Package Detail';
    document.querySelector('.phead .lg').innerHTML = PK.lg;
    document.querySelector('.pnm').textContent = PK.t;
    document.querySelector('.fine').textContent = PK.d || '';
    // its details view: the description, then its full terms (packages.js tc, the long ones, else terms)
    PV = { dt:'Package Description', d:PK.d || '', terms:(PK.tc && PK.tc.length ? PK.tc : PK.terms || []).map(function(t){ return String(t).replace(/^\d+\.\s*/, ''); }) };
    // its apps: the logo, or its name on a box while it has none (as TV.logoSrc does for a channel)
    var SV = PK.services || [];
    document.querySelector('.services').innerHTML = SV.map(function(v){
      var ic = v.html ? '<span class="ic">' + v.html + '</span>' : v.logo ? '<span class="ic ' + (v.cls || '') + '"><img src="' + v.logo + '" alt="' + esc(v.n) + '"></span>' : '<span class="ic txt">' + esc(v.txt || v.n) + '</span>';
      return '<div class="svc">' + ic + '<div class="info"><b>' + esc(v.n) + '</b><div class="tags">' + v.screens + ' screens<span class="q">' + v.q + '</span>' +
        (v.dolby ? '<img src="icons/pkg/d-badge-b.svg" alt="Dolby Atmos">' : '') + '</div></div></div>';
    }).join('');
    if(!SV.length) document.querySelector('.services').remove();
    if(!SV.some(function(v){ return v.q === '4K'; })) document.querySelector('.note4k').remove();
    // Sports, Free & Premium Channels, Available on: only the ones the package has
    function tiles(g){ return g.tiles.map(function(x, i){ return '<span class="sq ' + x.cls + '"><img src="' + x.img + '" alt="' + esc((g.names || [])[i] || '') + '"></span>'; }).join('') + (g.more ? '<span class="sq more">' + g.more + '</span>' : ''); }
    var DEV = { tv:'TV', phone:'Phone', tablet:'Tablet', laptop:'Laptop' };
    document.querySelector('.groups').innerHTML = (PK.sports ? '<div class="group"><h3>Sports</h3><div class="logos">' + tiles(PK.sports) + '</div></div>' : '') +
      (PK.channels ? '<div class="group"><h3>Free &amp; Premium Channels</h3><div class="logos">' + tiles(PK.channels) + '</div></div>' : '') +
      (PK.devices ? '<div class="group"><h3>Available on</h3><div class="logos devices">' + ['tv', 'phone', 'tablet', 'laptop'].filter(function(d){ return PK.devices.indexOf(d) >= 0; })
        .map(function(d){ return '<span class="dev"><img src="icons/pkg/d-' + d + '.svg" alt="">' + DEV[d] + '</span>'; }).join('') + '</div></div>' : '');
    // Package Options: its plans, the first picked
    document.querySelector('.prices').innerHTML = PK.plans.map(function(pl, i){
      return '<div class="price item' + (i ? '' : ' selected') + '" data-label="' + esc(pl.name) + '" data-period="' + pl.period + '"><span class="rd"></span>' +
        '<div class="pn"><b>' + esc(pl.name) + '</b>' + (pl.renew ? '<span class="chip">Auto-renews</span>' : '') + '</div>' +
        '<div class="cost"><div class="amt"><b>' + money(pl.amt) + ' Baht</b><span>/ ' + pl.per + '</span></div><div class="vat">VAT Included: ' + vat(pl.amt) + ' Baht</div></div></div>';
    }).join('');
  }
  // ---- focus: two columns. The left one: its card (Package Details / Title Details: logo or poster, name, the chips as
  // labels, the description), whose Enter opens its details view (Figma Prototype 165:56217: Back, then Scroll to the
  // bottom / top and the arrow); the right one: the options, then payment (up / down) ----
  var CARD = document.querySelector(TITLE ? '.tbox' : '.phead');
  var right = $('.price').concat($('.paybtn'));
  var cur = { col: 1, l: 0, r: $('.price').length };   // starts on Charge to AIS Bill (after the prices), as in Figma
  function pvOpen(){ return document.body.classList.contains('pv'); }
  function leftItems(){ return pvOpen() ? $('.pview .item').filter(function(e){ return e.offsetParent; }) : [CARD]; }   // (text that fits: Back only)
  function paint(){
    $('.item').forEach(function(e){ e.classList.remove('focused'); });
    (cur.col === 0 ? leftItems()[Math.min(cur.l, leftItems().length - 1)] : right[cur.r]).classList.add('focused');
  }
  // the details view: its text scrolls in its window; at the bottom, Scroll to the top and the arrow points up
  var PS = document.querySelector('.pscroll');
  function atEnd(){ return PS.scrollTop + PS.clientHeight >= PS.scrollHeight - 4; }
  function pvPaint(){
    var end = atEnd();
    document.querySelector('.pv-jump span').textContent = end ? 'Scroll to the top' : 'Scroll to the bottom';
    document.querySelector('.pv-jump').classList.toggle('up', end);
    document.querySelector('.pv-step img').src = end ? 'icons/pkg/c-up.svg' : 'icons/pkg/c-down.svg';
  }
  PS.addEventListener('scroll', pvPaint);
  function openPv(){
    document.querySelector('.pv-dt').textContent = PV.dt;
    document.querySelector('.pv-d').textContent = PV.d;
    document.querySelector('.pv-terms').innerHTML = PV.terms.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('');
    document.querySelector('.pv-terms').previousElementSibling.hidden = !PV.terms.length;   // no terms in packages.js: no heading
    document.body.classList.add('pv'); PS.scrollTop = 0; cur.col = 0; cur.l = 0;
    document.body.classList.toggle('pv-fit', PS.scrollHeight <= PS.clientHeight + 4); pvPaint();   // nothing to scroll: no Scroll to the bottom
  }
  function closePv(){ document.body.classList.remove('pv'); cur.col = 0; cur.l = 0; }   // back on its card
  var toastEl = document.getElementById('toast'), toastT;
  function toast(m){ toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function select(el){
    if(el === CARD){ openPv(); return; }
    if(el.dataset.act === 'pback'){ closePv(); return; }
    if(el.dataset.act === 'pjump'){ PS.scrollTop = atEnd() ? 0 : PS.scrollHeight; pvPaint(); return; }
    if(el.dataset.act === 'pstep'){ PS.scrollTop += atEnd() ? -PS.clientHeight * .8 : PS.clientHeight * .8; pvPaint(); return; }
    if(el.classList.contains('price')){ $('.price').forEach(function(p){ p.classList.toggle('selected', p === el); }); toast(el.dataset.label + ' plan selected'); return; }
    if(!document.querySelector('.price.selected')){ cur.r = 0; paint(); toast('Choose an option first'); return; }   // (short mode: none picked yet, as in Figma)
    if(el.dataset.label === 'Charge to AIS Bill' || el.dataset.label === 'QR PromptPay'){ openConfirm(el.dataset.label); return; }
    var plan = document.querySelector('.price.selected .amt').textContent;
    toast(el.dataset.label + ' · ' + plan + ' (demo)');
  }
  // where Back and a finished purchase return: the page that opened this one. All Packages says so (?from=all-packages);
  // the Store leaves its storeReturn flag (file:// pages get no referrer); otherwise District 9's packages
  var FROM_STORE = /store\.html/.test(document.referrer || '');
  try { FROM_STORE = FROM_STORE || !!sessionStorage.getItem('storeReturn'); } catch(e){}
  var FROM = TITLE ? 'title' : (location.search.match(/[?&]from=([\w-]+)/) || [])[1] || (FROM_STORE ? 'store' : 'movie-detail');
  // ?ret=: a detail page's View Package (content.js Content.packageUrl): bought, back there with ?subscribed=1
  var RET = (location.search.match(/[?&]ret=([^&#]+)/) || [])[1];
  RET = RET ? decodeURIComponent(RET) : '';
  var RETURN = TK ? 'movie-detail.html?k=' + TK : SH ? 'short-detail.html?s=' + SHORT : RET || { store:'store.html', 'all-packages':'all-packages.html' }[FROM] || 'movie-detail.html#packages';
  function back(){
    try { if(document.referrer && /(movie-detail|store|all-packages|short-detail|package-suggest)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = RETURN;
  }
  // ---- the OTP popup (Figma Store 5555:183690, in this page's popup style): the Confirm popup's Confirm opens it for
  // Charge to AIS Bill (no terms popup: they are on the page, Terms and Conditions). The 4th digit pays: the purchase is kept (content.js),
  // then the Purchase complete page (purchase.html), whose Done comes back where the item was picked ----
  var otpKeys = $('.key'), pins = $('.pin'), oBtns = $('.obtn'), code = '', paying = false;
  var oF = { area:'keys', k:0, b:0 };   // focus: the keypad, a 3 x 4 grid (its last row: delete, 0, clear), then Cancel / Resend OTP
  function picked(){ return document.querySelector('.price.selected'); }
  function otpPaint(){
    pins.forEach(function(p, i){ p.textContent = code[i] || ''; p.classList.toggle('filled', i < code.length); p.classList.toggle('cur', i === Math.min(code.length, 3) && (code.length < 4 || i === 3)); });
    otpKeys.forEach(function(k, i){ k.classList.toggle('focused', oF.area === 'keys' && i === oF.k); });
    oBtns.forEach(function(b, i){ b.classList.toggle('focused', oF.area === 'btns' && i === oF.b); });
  }
  // the amount (VAT included) and how it is charged: the OTP and QR popups' heading
  function amountText(){
    var sel = picked(), per = sel.dataset.period, vat = sel.querySelector('.vat').textContent.replace('VAT Included: ', '').replace(/ Baht$/, '');
    $('.o-amt').forEach(function(e){ e.textContent = vat + ' Baht'; });
    $('.o-how').forEach(function(e){ e.textContent = KIND === 'buy' ? 'Charged once for ' + TV.t : KIND === 'ep' ? 'Charged once for episode ' + EP + ' of ' + TV.t : TITLE || per === '7d' ? 'Charged once for the ' + sel.dataset.label
      : 'Renews every ' + (per === 'year' ? 'year' : 'month') + ' until you cancel'; });
  }
  // ---- Confirm (Figma Store 5875:184049): either payment button opens it with the picked option; Confirm goes on to
  // that payment's OTP or QR popup. Focus starts on Confirm; Cancel (or Back) returns to the page ----
  var cBtns = $('.cbtn'), cAt = 1, cVia = '';
  function cPaint(){ cBtns.forEach(function(b, i){ b.classList.toggle('focused', i === cAt); }); }
  function openConfirm(via){
    amountText();
    var sel = picked(), bill = via === 'Charge to AIS Bill', per = sel.querySelector('.amt span'), base = sel.querySelector('.amt b') || sel.querySelector('.amt'), lg = document.querySelector('.cfd .lg');
    cVia = via;
    document.querySelector('.c-title').textContent = !TITLE ? 'Confirm Subscribe' : KIND === 'rent' ? 'Confirm Rental' : 'Confirm Purchase';
    lg.innerHTML = TITLE ? '' : PK.lg;
    lg.style.backgroundImage = TITLE ? "url('" + TV.pic + "')" : '';
    document.querySelector('.c-name').innerHTML = esc(TITLE ? TV.t : PK.t) + (TITLE || PK.plans.length > 1 ? '<br>' + esc(sel.dataset.label.replace(/ plan$/i, ' Package')) : '');   // (a package with one plan: its name says it, as the receipt)
    document.querySelector('.c-base').textContent = base.textContent;
    document.querySelector('.c-per').textContent = per ? ' / ' + per.textContent.replace(/^\/\s*/, '').replace(/^(Month|Year)ly$/, '$1') : '';
    document.querySelector('.c-via').textContent = bill ? 'Charge to AIS Bill: 880XXX0088' : 'Pay with QR PromptPay';
    document.querySelector('.c-next').innerHTML = bill ? "Next, we'll send a 4-digit OTP code to <b>081XXX0082</b>.<br>You won't be charged until you enter it."
      : "Next, we'll show a QR code to scan.<br>You won't be charged until you pay.";
    cAt = 1; document.body.classList.add('cfm'); cPaint();
  }
  function closeConfirm(){ document.body.classList.remove('cfm'); cBtns.forEach(function(b){ b.classList.remove('focused'); }); }
  function confirmAct(a){
    closeConfirm();
    if(a !== 'ok'){ paint(); return; }
    if(cVia === 'QR PromptPay') openQr(); else openOtp();
  }
  addEventListener('keydown', function(e){
    if(!document.body.classList.contains('cfm')) return;
    if(e.key === 'ArrowLeft') cAt = 0;
    else if(e.key === 'ArrowRight') cAt = 1;
    else if(e.key === 'Enter' || e.key === ' '){ confirmAct(cBtns[cAt].dataset.c); e.preventDefault(); e.stopImmediatePropagation(); return; }
    else if(e.key === 'Escape' || e.key === 'Backspace'){ confirmAct('back'); e.preventDefault(); e.stopImmediatePropagation(); return; }
    e.preventDefault(); e.stopImmediatePropagation(); cPaint();
  }, true);
  cBtns.forEach(function(b){ b.addEventListener('click', function(){ confirmAct(b.dataset.c); }); });

  function openOtp(){
    amountText();
    code = ''; paying = false; oF = { area:'keys', k:0, b:0 };
    document.body.classList.add('otp'); otpPaint();
  }
  function closeOtp(){ document.body.classList.remove('otp'); paint(); }
  function typeKey(k){
    if(paying) return;
    if(k === 'del') code = code.slice(0, -1);
    else if(k === 'clear') code = '';
    else if(code.length < 4) code += k;
    otpPaint();
    if(code.length === 4){ paying = true; setTimeout(pay, 400); }   // the code is in: pay
  }
  function otpAct(a){
    if(a === 'back'){ closeOtp(); return; }
    if(a === 'req'){ code = ''; otpPaint(); toast('A new OTP has been sent to 081XXX0082'); }
  }
  // what was bought is the viewer's now (content.js Content.crown: owned), before the Purchase complete page
  function keep(){
    if(BUNDLE){   // PLAY ULTIMATE / PLAY ALL: its premium channels and every title of the platforms it carries (its tags)
      Content.subscribeTv(BUNDLE.tv);
      BUNDLE.tags.forEach(function(t){ if(Packages.PKG[t] && !Packages.OTT[t].league) MD.subscribe(t); });
    }
    if(OB){ MD.subscribe(OK); if(OB.league) Content.subscribeTv('sports'); }
    if(TITLE){
      if(KIND === 'pass' || KIND === 'ep'){   // a pass: every episode; one episode: just that one (content.js SHORT.open)
        try { var u = JSON.parse(sessionStorage.getItem('shortUnlocked' + SHORT) || '{}'); if(KIND === 'ep') u[EP] = 1; else u.all = 1; sessionStorage.setItem('shortUnlocked' + SHORT, JSON.stringify(u)); } catch(e){} }
      else if(SH) window.SHORT.own(+SHORT); else if(KIND === 'rent') MD.rent(TK); else MD.own(TK);
    }
  }
  // where Done on the Purchase complete page goes: the detail page that sent it (bought / rented / subscribed), else back
  function dest(){
    if(TITLE) return RETURN + '&' + (KIND === 'ep' ? 'epbought=' + EP : (KIND === 'pass' ? 'pass' : KIND === 'rent' ? 'rented' : 'bought') + '=1');
    if(RET) return RET + (RET.indexOf('?') < 0 ? '?' : '&') + 'subscribed=1';
    if(FROM === 'store') return 'store.html';
    if(FROM === 'all-packages') return 'all-packages.html?subscribed=1';
    return 'movie-detail.html?subscribed=1';
  }
  // the receipt the Purchase complete page shows: its name (and the option, when there was a choice), picture, price,
  // its period (a package's dates, a rental's or pass's hours, a purchase's date) and Watch Now (a title or short)
  var payVia = '';   // QR PromptPay: the receipt's payment method (else the AIS bill, purchase.html's own)
  function pay(){
    var sel = picked(), lbl = sel.dataset.label, d0 = new Date(), d1 = null, dl, dur;
    var f = function(d){ return d.getDate() + ' ' + d.toLocaleString('en-GB', { month:'short' }) + ' ' + d.getFullYear(); };
    var hm = function(d){ return d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2); };
    keep();
    if(TITLE && (KIND === 'pass' || KIND === 'rent')){
      var hrs = KIND === 'pass' ? PASSES[+sel.dataset.pass].hours : MD.RENT_HOURS; d1 = new Date(d0.getTime() + hrs * 36e5);
      dl = KIND === 'pass' ? 'Viewing pass' : 'Rental period'; dur = f(d0) + ' | ' + hm(d0) + ' - ' + f(d1) + ' | ' + hm(d1) + ' (' + hrs + ' hours)';
    } else if(TITLE){ dl = 'Purchased on'; dur = f(d0) + ' | ' + hm(d0); }
    else {
      d1 = new Date(d0);
      if(sel.dataset.period === '7d') d1.setDate(d1.getDate() + 6); else if(sel.dataset.period === 'year'){ d1.setFullYear(d1.getFullYear() + 1); d1.setDate(d1.getDate() - 1); } else { d1.setMonth(d1.getMonth() + 1); d1.setDate(d1.getDate() - 1); }
      dl = 'Package duration'; dur = f(d0) + ' | 0:00 - ' + f(d1) + ' | 23:59';
    }
    var name = TITLE ? TV.t + ' · ' + lbl : PK.t + (PK.plans.length > 1 ? ' · ' + lbl : '');
    // its price as the receipt says it: "999 Baht / Month" (a plan's per: Monthly → Month, Yearly → Year)
    var ab = sel.querySelector('.amt b'), ap = sel.querySelector('.amt span');
    var amt = ab ? ab.textContent + (ap ? ' / ' + ap.textContent.replace(/^\/\s*/, '').replace(/^(Month|Year)ly$/, '$1') : '') : sel.querySelector('.amt').textContent.replace(/\s+/g, ' ').trim();
    var rc = { bi:BUNDLE ? Packages.BUNDLES.indexOf(BUNDLE) : -1, t:name, pic:TITLE ? TV.pic : BUNDLE ? BUNDLE.logo : '', logo:!TITLE && !!BUNDLE, amt:amt,
      vat:sel.querySelector('.vat').textContent, dl:dl, dur:dur, pm:payVia, watch:TITLE ? (SH ? 'player.html?short=' + SHORT + '&ep=' + (EP || 1) : 'player.html?k=' + TK) : '' };
    location.href = 'purchase.html?' + (OB ? 'ott=' + OK + '&p=' + OI + '&' : '') + 'rc=' + encodeURIComponent(JSON.stringify(rc)) + '&next=' + encodeURIComponent(dest());
  }
  // ---- Scan QR PromptPay (Figma Store 5510:189647): QR PromptPay opens it; the QR counts down from 5:00 (its disabled
  // button); this demo's payment arrives 5 s in: the purchase is kept, then the Purchase complete page, as the OTP's.
  // Cancel (or Back) closes it ----
  var qrPay = 0, qrTick = 0, QR_PAID_MS = 5000;
  function openQr(){
    amountText();
    var end = Date.now() + 5 * 60e3, left = document.querySelector('.q-left');
    function show(){ var s = Math.max(0, Math.ceil((end - Date.now()) / 1000)); left.textContent = 'QR expires in ' + Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
    show(); clearInterval(qrTick); qrTick = setInterval(show, 1000);
    clearTimeout(qrPay); qrPay = setTimeout(function(){ payVia = 'QR PromptPay'; pay(); }, QR_PAID_MS);
    document.querySelector('.qbtn.back').classList.add('focused');   // Cancel: its only focus stop (the countdown is disabled)
    document.body.classList.add('qrpay');
  }
  function closeQr(){ clearTimeout(qrPay); clearInterval(qrTick); document.querySelector('.qbtn.back').classList.remove('focused'); document.body.classList.remove('qrpay'); paint(); }
  addEventListener('keydown', function(e){
    if(!document.body.classList.contains('qrpay')) return;
    if(e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'Backspace') closeQr();
    e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  document.querySelector('.qbtn.back').addEventListener('click', closeQr);

  addEventListener('keydown', function(e){
    if(!document.body.classList.contains('otp')) return;
    if(/^[0-9]$/.test(e.key)) typeKey(e.key);
    else if(e.key === 'Backspace' && code.length) typeKey('del');
    else if(e.key === 'Escape' || e.key === 'Backspace') otpAct('back');
    else if(oF.area === 'keys'){
      var r = Math.floor(oF.k / 3), c = oF.k % 3;
      if(e.key === 'ArrowRight' && c < 2) oF.k++;
      else if(e.key === 'ArrowLeft' && c > 0) oF.k--;
      else if(e.key === 'ArrowUp' && r > 0) oF.k -= 3;
      else if(e.key === 'ArrowDown'){ if(r < 3) oF.k += 3; else { oF.area = 'btns'; oF.b = c === 0 ? 0 : 1; } }
      else if(e.key === 'Enter' || e.key === ' ') typeKey(otpKeys[oF.k].dataset.k);
    } else {
      if(e.key === 'ArrowRight') oF.b = Math.min(oBtns.length - 1, oF.b + 1);
      else if(e.key === 'ArrowLeft') oF.b = Math.max(0, oF.b - 1);
      else if(e.key === 'ArrowUp'){ oF.area = 'keys'; oF.k = oF.b === 0 ? 9 : 10; }
      else if(e.key === 'Enter' || e.key === ' ') otpAct(oBtns[oF.b].dataset.o);
    }
    e.preventDefault(); e.stopImmediatePropagation(); otpPaint();
  }, true);
  otpKeys.forEach(function(k, i){ k.addEventListener('click', function(){ oF = { area:'keys', k:i, b:0 }; typeKey(k.dataset.k); }); });
  oBtns.forEach(function(bt, i){ bt.addEventListener('click', function(){ oF = { area:'btns', k:0, b:i }; otpPaint(); otpAct(bt.dataset.o); }); });
  document.querySelector('.scrim').addEventListener('click', function(){ if(document.body.classList.contains('cfm')) confirmAct('back'); if(document.body.classList.contains('otp')) closeOtp(); if(document.body.classList.contains('qrpay')) closeQr(); });

  addEventListener('keydown', function(e){
    var h = true;
    if(cur.col === 0 && pvOpen() && document.body.classList.contains('pv-fit')){   // the text fits: Back only
      if(e.key === 'ArrowRight') cur.col = 1;
      else if(e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft') h = false;
    } else if(cur.col === 0 && pvOpen()){   // the details view: Back (0) over Scroll to the bottom (1) and the arrow (2)
      if(e.key === 'ArrowUp') cur.l = 0;
      else if(e.key === 'ArrowDown'){ if(cur.l === 0) cur.l = 1; else { PS.scrollTop += 160; pvPaint(); } }   // on the bottom row: scrolls the text
      else if(e.key === 'ArrowLeft'){ if(cur.l === 2) cur.l = 1; }
      else if(e.key === 'ArrowRight'){ if(cur.l === 1) cur.l = 2; else cur.col = 1; }
      else h = false;
    } else if(cur.col === 0){   // its card
      if(e.key === 'ArrowRight') cur.col = 1;
      else h = false;
    } else {
      if(e.key === 'ArrowUp') cur.r = Math.max(0, cur.r - 1);
      else if(e.key === 'ArrowDown') cur.r = Math.min(right.length - 1, cur.r + 1);
      else if(e.key === 'ArrowLeft'){ cur.col = 0; cur.l = pvOpen() && leftItems().length > 1 ? 1 : 0; }   // from anywhere on the right, Left lands on the card (open: Scroll to the bottom)
      else h = false;
    }
    if(!h){
      if(e.key === 'Enter' || e.key === ' '){ select(cur.col === 0 ? leftItems()[cur.l] : right[cur.r]); h = true; }
      else if(e.key === 'Escape' || e.key === 'Backspace'){ if(pvOpen()) closePv(); else back(); h = true; }
    }
    if(h){ e.preventDefault(); paint(); }
  });
  [CARD].concat($('.pview .item')).forEach(function(el){ el.addEventListener('click', function(){ cur.col = 0; cur.l = Math.max(0, leftItems().indexOf(el)); select(el); paint(); }); });
  right.forEach(function(el, i){ el.addEventListener('click', function(){ cur.col = 1; cur.r = i; paint(); select(el); }); });
  paint();
})();
