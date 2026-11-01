
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  var $ = function(q){ return Array.prototype.slice.call(document.querySelectorAll(q)); };

  // ---- short drama mode (?short=N&ep=E): Title Details and the viewing passes take the package's place; the payment
  // steps below are the same, with the short's name, the pass and a one-off charge ----
  var SHORT = (location.search.match(/[?&]short=(\d+)/) || [])[1], SH = SHORT !== undefined ? window.SHORTS[+SHORT] : null;
  var EP = +((location.search.match(/[?&]ep=(\d+)/) || [])[1] || 0);
  var PASSES = [
    { name:'24-Hour Pass', hours:24, start:7, amt:'199 baht', vat:'212.93 baht' },
    { name:'48-Hour Pass', hours:48, start:30, amt:'299 baht', vat:'319.93 baht' },
    { name:'100-Hour Pass', hours:100, start:90, amt:'399 baht', vat:'426.93 baht' }
  ];
  if(SH){
    document.body.classList.add('short');
    document.title = SH.t;
    document.querySelector('.left > h1').textContent = 'Title Details';
    document.querySelector('.tdetails .poster').style.backgroundImage = "url('posters/shorts/" + SH.img + "')";
    document.querySelector('.tdetails .nm').textContent = SH.t;
    document.querySelector('.tdetails .meta').innerHTML = Content.metaHtml({s:+SHORT}, true);   // content.js: as the short's own page
    document.querySelector('.tdetails .syn').textContent = SH.d;
    // the passes are the right column's prices (no package prices on this page)
    $('.prices .price').forEach(function(p){ p.remove(); });
    document.querySelector('.passes').innerHTML = PASSES.map(function(p, i){
      return '<div class="price pass item" data-label="' + p.name + '" data-pass="' + i + '"><span class="rd"></span>' +
        '<div class="what"><b>' + p.name + '</b><span><img src="icons/short/pass-clock.svg" alt="">Start anytime in ' + p.start + ' days.</span>' +
        '<span><img src="icons/short/pass-film.svg" alt="">Enjoy ' + p.hours + ' hours of unlimited viewing.</span></div>' +
        '<div class="cost"><div class="amt">' + p.amt + '</div><p class="vat">VAT Included: ' + p.vat + '</p></div></div>';
    }).join('');
    // the popups: a one-off purchase of this short's pass
    document.querySelector('.mtitle b').textContent = 'Confirm Purchase:';
    document.querySelector('.modal').setAttribute('aria-label', 'Confirm Purchase');
    document.querySelector('.mhero .lg').innerHTML = '<img src="posters/shorts/' + SH.img + '" alt="" style="object-fit:cover">';
    document.querySelector('.otpd h2').textContent = SH.t;
    document.querySelector('.okd h2').textContent = 'Your pass is ready';
    document.querySelector('.okd .okhead p').innerHTML = 'Enjoy every episode of ' + SH.t + '.<br>Your viewing time starts when you press Play.';
    document.querySelector('.okcard .n').textContent = SH.t;
    document.querySelector('.tcscroll').innerHTML = ['A viewing pass gives unlimited viewing of every episode of this title for the hours of the pass.',
      '1. The pass is a one-off purchase and does not renew automatically.', '2. The viewing period starts the first time you press Play, and must start within the days shown for the pass.',
      '3. Once started, the pass runs continuously, including while you are not watching, and ends after its hours have passed.',
      '4. Prices include 7% VAT and are charged once to your AIS bill or paid by QR PromptPay. Internet charges are not included.',
      '5. The pass is for this title only and can be watched on the AIS PLAY app, website and supported TVs and devices.',
      '6. Video quality depends on the title, your internet speed and your device.', '7. Fees already charged are non-refundable, except where required by law.',
      '8. For assistance, contact AIS Call Center 1175 (24 hours) or visit any AIS Shop.'].map(function(t){ return '<p>' + t + '</p>'; }).join('');
  }
  // ---- the package (packages.js; nothing on this page is typed in): an OTT one (?ott=netflix&p=0, a Store or package
  // suggestion card), else AIS PLAY's own (Packages.BUNDLES, PLAY ULTIMATE: Figma "AIS PLAY Bundle" / "Full OTT") ----
  var OK = (location.search.match(/[?&]ott=(\w+)/) || [])[1], OB = OK && Packages.OTT[OK], OP = OB ? Packages.PKG[OK] : null;
  var OI = OP ? Math.max(0, Math.min(OP.length - 1, +((location.search.match(/[?&]p=(-?\d+)/) || [])[1] || 0))) : 0;
  var BUNDLE = SH || OB ? null : Packages.BUNDLES.filter(function(b){ return b.detail; })[0];
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
      d:P0.d + ' THB ' + money(P0.price) + ' / ' + P0.per + ', excluding 7% VAT and internet charges. Available to AIS postpaid and prepaid customers.',
      terms:[MONTH ? 'The package renews automatically at the end of each billing cycle until cancelled.' : 'The pass is a one-off purchase and ends after 7 days; it does not renew.',
        'Prices exclude 7% VAT and internet charges.', 'Number of screens and video quality depend on ' + OB.n + ' and your device.',
        'You may need to sign in to ' + OB.n + ' with an account linked to AIS PLAY.', 'AIS reserves the right to change the package terms without prior notice.'],
      tc:['1. This package is available to AIS postpaid and prepaid customers.',
        '2. ' + OB.n + ' is included at no additional charge while the package remains active.', '3. A confirmation SMS is sent once the package is active.',
        '4. Monthly packages renew automatically at the end of each billing cycle; cancel anytime via the myAIS app or by dialling *1185. 7-day passes do not renew.',
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
    document.querySelector('.terms').innerHTML = (PK.terms || []).map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('');
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
        '<div class="pn"><b>' + esc(pl.name) + '</b>' + (pl.renew ? '<span class="chip">Auto renews</span>' : '') + '</div>' +
        '<div class="cost"><div class="amt"><b>' + money(pl.amt) + ' baht</b><span>/ ' + pl.per + '</span></div><div class="vat">VAT Included: ' + vat(pl.amt) + ' baht</div></div></div>';
    }).join('');
    // the popups: this package
    document.querySelector('.mhero .lg').innerHTML = PK.lg;
    document.querySelector('.mhero .nm').textContent = PK.t;
    document.querySelector('.otpd h2').textContent = PK.t;
    document.querySelector('.okcard .n').textContent = PK.t;
    document.querySelector('.tcscroll').innerHTML = (PK.tc || []).map(function(t){ return '<p>' + esc(t) + '</p>'; }).join('');
  }
  // two columns: the tabs (left/right between them), and the right column (prices then payment, up/down)
  var tabs = $('.tab:not(.disabled)'), right = $('.price').concat($('.paybtn'));
  var cur = { col: 1, tab: 0, r: $('.price').length };   // starts on Charge to AIS Bill (after the prices), as in Figma
  function paint(){
    $('.item').forEach(function(e){ e.classList.remove('focused'); });
    (cur.col === 0 ? tabs[cur.tab] : right[cur.r]).classList.add('focused');
    // content switcher: moving onto a tab switches to it straight away (no Enter needed)
    if(cur.col === 0) showTab(cur.tab);
  }
  var toastEl = document.getElementById('toast'), toastT;
  function toast(m){ toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function showTab(i){
    tabs.forEach(function(t, j){ t.classList.toggle('active', j === i); });
    document.body.classList.toggle('show-terms', tabs[i].dataset.tab === 'terms');
  }
  function select(el){
    if(el.classList.contains('tab')){ showTab(tabs.indexOf(el)); return; }
    if(el.classList.contains('price')){ $('.price').forEach(function(p){ p.classList.toggle('selected', p === el); }); toast(el.dataset.label + ' plan selected'); return; }
    if(!document.querySelector('.price.selected')){ cur.r = 0; paint(); toast('Choose an option first'); return; }   // (short mode: none picked yet, as in Figma)
    if(el.dataset.label === 'Charge to AIS Bill'){ openConfirm(); return; }
    var plan = document.querySelector('.price.selected .amt').textContent;
    toast(el.dataset.label + ' · ' + plan + ' (demo)');
  }
  // where Back and a finished purchase return: the page that opened this one. All Packages says so (?from=all-packages);
  // the Store leaves its storeReturn flag (file:// pages get no referrer); otherwise District 9's packages
  var FROM_STORE = /store\.html/.test(document.referrer || '');
  try { FROM_STORE = FROM_STORE || !!sessionStorage.getItem('storeReturn'); } catch(e){}
  var FROM = SH ? 'short' : (location.search.match(/[?&]from=([\w-]+)/) || [])[1] || (FROM_STORE ? 'store' : 'movie-detail');
  // ?ret=: a detail page's View Package (content.js Content.packageUrl): bought, back there with ?subscribed=1
  var RET = (location.search.match(/[?&]ret=([^&#]+)/) || [])[1];
  RET = RET ? decodeURIComponent(RET) : '';
  var RETURN = SH ? 'short-detail.html?s=' + SHORT : RET || { store:'store.html', 'all-packages':'all-packages.html' }[FROM] || 'movie-detail.html#packages';
  function back(){
    try { if(document.referrer && /(movie-detail|store|all-packages|short-detail|package-suggest)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = RETURN;
  }
  // ---- Confirm Subscribe popup ----
  // Opens on Charge to AIS Bill. "I Agree and Confirm" stays disabled until the terms are read to the bottom
  // (Scroll to the bottom, or scrolling with the arrows); then focus moves to it. Cancel / Back closes the popup.
  var tc = document.querySelector('.tcscroll'), tcArrow = document.querySelector('.tcarrow');
  var mBtns = { scroll: document.querySelector('.scrollbtn'), cancel: document.querySelector('.mbtn.cancel'), agree: document.querySelector('.mbtn.agree') };
  var mFocus = 'scroll';
  function readAll(){ return tc.scrollTop + tc.clientHeight >= tc.scrollHeight - 4; }
  function mPaint(){
    var read = document.body.classList.contains('read');
    Object.keys(mBtns).forEach(function(k){ mBtns[k].classList.toggle('focused', k === mFocus); });
    tcArrow.src = read ? 'icons/pkg/c-up.svg' : 'icons/pkg/c-down.svg';
  }
  function markRead(){
    if(document.body.classList.contains('read')) return;
    document.body.classList.add('read');
    if(mFocus === 'scroll') mFocus = 'agree';
    mPaint();
  }
  tc.addEventListener('scroll', function(){ if(tc.scrollTop > 0 && readAll()) markRead(); });
  function openConfirm(){
    // the popup shows the plan picked on the right
    var sel = document.querySelector('.price.selected');
    document.querySelector('.m-amt').textContent = sel.querySelector('.amt').textContent;
    if(SH) document.querySelector('.mhero .nm').textContent = SH.t + ' · ' + sel.dataset.label;
    if(PK && PK.plans.length > 1){ var pn = PK.t + ' · ' + sel.dataset.label; document.querySelector('.mhero .nm').textContent = pn; document.querySelector('.otpd h2').textContent = pn; document.querySelector('.okcard .n').textContent = pn; }
    document.querySelector('.m-vat').textContent = '(' + sel.querySelector('.vat').textContent.replace(',', '') + ')';
    tc.style.scrollBehavior = 'auto'; tc.scrollTop = 0; tc.style.scrollBehavior = '';
    document.body.classList.remove('read');
    document.body.classList.add('confirm');
    mFocus = 'scroll'; mPaint();
  }
  function closeConfirm(){ document.body.classList.remove('confirm'); paint(); }
  function mSelect(k){
    if(k === 'scroll'){ tc.scrollTop = tc.scrollHeight; markRead(); return; }
    if(k === 'cancel'){ closeConfirm(); return; }
    if(k === 'agree'){
      if(!document.body.classList.contains('read')){ toast('Please read the terms to the bottom first'); return; }
      document.body.classList.remove('confirm'); openOtp();
    }
  }
  // ---- OTP popup: a 4-digit code typed on the on-screen keypad (or the number keys); Done unlocks at 4 digits ----
  var otpKeys = $('.key:not(.blank)'), pins = $('.pin'), oBtns = $('.obtn'), code = '', otpT = null;
  // focus: keypad as a 3-column grid (row 3 = del, 0), then the action row
  var oF = { area: 'keys', k: 0, b: 0 };
  function otpPaint(){
    pins.forEach(function(p, i){ p.textContent = code[i] || ''; p.classList.toggle('filled', i < code.length); p.classList.toggle('cur', i === Math.min(code.length, 3) && (code.length < 4 || i === 3)); });
    var ready = code.length === 4;
    document.querySelector('.obtn.done').classList.toggle('ready', ready);
    otpKeys.forEach(function(k, i){ k.classList.toggle('focused', oF.area === 'keys' && i === oF.k); });
    oBtns.forEach(function(b, i){ b.classList.toggle('focused', oF.area === 'btns' && i === oF.b); });
  }
  function startCountdown(){
    var n = 60, el = document.querySelector('.o-sec'); el.textContent = n; clearInterval(otpT);
    otpT = setInterval(function(){ n = Math.max(0, n - 1); el.textContent = n; if(!n) clearInterval(otpT); }, 1000);
  }
  function openOtp(){
    var sel = document.querySelector('.price.selected'), vat = sel.querySelector('.vat').textContent.replace('VAT Included: ', '').replace(/ (฿|baht)$/, '');
    if(SH){   // a pass: charged once
      document.querySelector('.otpd .ohead p').innerHTML = 'You will be charged <b class="o-amt">' + vat + '</b> once for the ' + sel.dataset.label + '.';
    } else if(sel.dataset.period === '7d'){   // a 7-day pass: charged once too
      document.querySelector('.otpd .ohead p').innerHTML = 'You will be charged <b class="o-amt">฿' + vat + '</b> once for 7 days.';
    } else {
      var per = sel.querySelector('.amt').textContent.split('/')[1].trim();
      document.querySelector('.o-amt').textContent = '฿' + vat + ' /' + per;
    }
    code = ''; oF = { area: 'keys', k: 0, b: 0 };
    document.body.classList.add('otp'); startCountdown(); otpPaint();
  }
  function typeKey(k){
    if(k === 'del') code = code.slice(0, -1);
    else if(code.length < 4) code += k;
    if(code.length === 4){ oF = { area: 'btns', k: oF.k, b: 2 }; }   // code complete: jump to Done
    otpPaint();
  }
  function otpAct(a){
    if(a === 'back'){ clearInterval(otpT); document.body.classList.remove('otp'); openConfirm(); markRead(); mFocus = 'agree'; mPaint(); return; }
    if(a === 'req'){ code = ''; startCountdown(); otpPaint(); toast('A new OTP has been sent'); return; }
    if(a === 'done'){
      if(code.length < 4){ toast('Enter the 4-digit OTP first'); return; }
      clearInterval(otpT); document.body.classList.remove('otp');
      // an OTT package: Purchase complete, then its Activation Guide (purchase.html)
      if(OB){ location.href = 'purchase.html?ott=' + OK + '&p=' + OI + (RET ? '&ret=' + encodeURIComponent(RET) : ''); return; }
      openDone();
    }
  }
  function openDone(){
    var sel = document.querySelector('.price.selected');
    document.querySelector('.ok-amt').textContent = sel.querySelector('.amt').textContent;
    document.querySelector('.ok-vat').textContent = sel.querySelector('.vat').textContent;
    // service period: from today until the day before the same date next period
    var d0 = new Date(), d1 = new Date(d0);
    if(SH) d1 = new Date(d0.getTime() + PASSES[+sel.dataset.pass].hours * 3600000);   // a pass: its hours from now
    else if(sel.dataset.period === '7d') d1.setDate(d1.getDate() + 6); else if(sel.dataset.period === 'year'){ d1.setFullYear(d1.getFullYear() + 1); d1.setDate(d1.getDate() - 1); } else { d1.setMonth(d1.getMonth() + 1); d1.setDate(d1.getDate() - 1); }
    var f = function(d){ return d.getDate() + ' ' + d.toLocaleString('en-GB', { month: 'short' }) + ' ' + d.getFullYear(); };
    document.querySelector('.ok-date').textContent = f(d0) + ' | 00:00:00 - ' + f(d1) + ' | 23:59:59';
    document.body.classList.add('done');
  }
  addEventListener('keydown', function(e){
    var b = document.body.classList;
    if(b.contains('done')){
      // any key closes the status popup and returns to the page
      finishPurchase(); e.preventDefault(); e.stopImmediatePropagation(); return;
    }
    if(!b.contains('otp')) return;
    if(/^[0-9]$/.test(e.key)) typeKey(e.key);
    else if(e.key === 'Backspace' && code.length) typeKey('del');
    else if(e.key === 'Escape' || e.key === 'Backspace') otpAct('back');
    else if(oF.area === 'keys'){
      var r = Math.floor(oF.k / 3), c = oF.k % 3, last = otpKeys.length - 1;
      if(e.key === 'ArrowRight' && c < 2 && oF.k < last) oF.k++;
      else if(e.key === 'ArrowLeft' && c > 0) oF.k--;
      else if(e.key === 'ArrowUp' && r > 0) oF.k -= 3;
      else if(e.key === 'ArrowDown'){ if(oF.k + 3 <= last) oF.k += 3; else { oF.area = 'btns'; oF.b = code.length === 4 ? 2 : 0; } }
      else if(e.key === 'Enter' || e.key === ' ') typeKey(otpKeys[oF.k].dataset.k);
    } else {
      if(e.key === 'ArrowRight') oF.b = Math.min(oBtns.length - 1, oF.b + 1);
      else if(e.key === 'ArrowLeft') oF.b = Math.max(0, oF.b - 1);
      else if(e.key === 'ArrowUp'){ oF.area = 'keys'; oF.k = 9; }
      else if(e.key === 'Enter' || e.key === ' ') otpAct(oBtns[oF.b].dataset.o);
    }
    e.preventDefault(); e.stopImmediatePropagation(); otpPaint();
  }, true);
  otpKeys.forEach(function(k, i){ k.addEventListener('click', function(){ oF = { area: 'keys', k: i, b: 0 }; typeKey(k.dataset.k); }); });
  oBtns.forEach(function(bt, i){ bt.addEventListener('click', function(){ oF = { area: 'btns', k: 0, b: i }; otpPaint(); otpAct(bt.dataset.o); }); });
  // success popup closed: back where the package was picked; District 9's page and All Packages show it subscribed
  function finishPurchase(){
    // PLAY ULTIMATE (this page's own package): its premium channels and short dramas, and every title of the platforms it
    // carries (its tags: netflix, hbo, disney, iqiyi, viu) are the viewer's (content.js Content.crown: owned)
    if(BUNDLE){
      try { sessionStorage.setItem('tvSubscribed', '1'); sessionStorage.setItem('shortsSubscribed', '1'); } catch(e){}
      BUNDLE.tags.forEach(function(t){ if(Packages.PKG[t] && !Packages.OTT[t].league) MD.subscribe(t); });
    }
    if(RET && !SH){ location.href = RET + (RET.indexOf('?') < 0 ? '?' : '&') + 'subscribed=1'; return; }   // the detail page that sent it
    if(FROM === 'store'){ location.href = 'store.html'; return; }
    if(FROM === 'all-packages'){ location.href = 'all-packages.html?subscribed=1'; return; }
    if(FROM === 'short'){ location.href = RETURN + '&pass=1'; return; }   // the short, every episode open
    location.href = 'movie-detail.html?subscribed=1';
  }
  document.querySelector('.okd').addEventListener('click', finishPurchase);

  addEventListener('keydown', function(e){
    if(!document.body.classList.contains('confirm')) return;
    var read = document.body.classList.contains('read');
    if(e.key === 'ArrowLeft' && mFocus === 'agree') mFocus = 'cancel';
    else if(e.key === 'ArrowRight' && mFocus === 'cancel' && read) mFocus = 'agree';
    else if(e.key === 'ArrowDown'){ if(mFocus === 'scroll'){ tc.scrollTop += 160; if(readAll()) markRead(); } else if(!read) mFocus = 'scroll'; }
    else if(e.key === 'ArrowUp'){ if(mFocus !== 'scroll' && !read) mFocus = 'scroll'; else tc.scrollTop -= 160; }
    else if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){}
    else if(e.key === 'Enter' || e.key === ' ') mSelect(mFocus);
    else if(e.key === 'Escape' || e.key === 'Backspace') closeConfirm();
    else if(mFocus === 'scroll' && e.key === 'ArrowRight'){}
    e.preventDefault(); e.stopImmediatePropagation(); mPaint();
  }, true);
  Object.keys(mBtns).forEach(function(k){ mBtns[k].addEventListener('click', function(){ mFocus = (k === 'agree' && !document.body.classList.contains('read')) ? mFocus : k; mPaint(); mSelect(k); }); });
  document.querySelector('.scrim').addEventListener('click', function(){ if(document.body.classList.contains('confirm')) closeConfirm(); });

  addEventListener('keydown', function(e){
    var h = true;
    if(cur.col === 0){
      if(e.key === 'ArrowLeft') cur.tab = Math.max(0, cur.tab - 1);
      else if(e.key === 'ArrowRight'){ if(cur.tab < tabs.length - 1) cur.tab++; else cur.col = 1; }
      else h = false;
    } else {
      if(e.key === 'ArrowUp') cur.r = Math.max(0, cur.r - 1);
      else if(e.key === 'ArrowDown') cur.r = Math.min(right.length - 1, cur.r + 1);
      else if(e.key === 'ArrowLeft'){ if(!SH){ cur.col = 0; cur.tab = 0; } }   // from anywhere on the right, Left lands on Details (short mode: none)
      else h = false;
    }
    if(!h){
      if(e.key === 'Enter' || e.key === ' '){ select(cur.col === 0 ? tabs[cur.tab] : right[cur.r]); h = true; }
      else if(e.key === 'Escape' || e.key === 'Backspace'){ back(); h = true; }
    }
    if(h){ e.preventDefault(); paint(); }
  });
  tabs.forEach(function(t, i){ t.addEventListener('click', function(){ cur.col = 0; cur.tab = i; paint(); select(t); }); });
  right.forEach(function(el, i){ el.addEventListener('click', function(){ cur.col = 1; cur.r = i; paint(); select(el); }); });
  paint();
})();
