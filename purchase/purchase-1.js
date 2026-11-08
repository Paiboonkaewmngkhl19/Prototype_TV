
(function(){
  var $ = function(q){ return Array.prototype.slice.call(document.querySelectorAll(q)); };
  var K = (location.search.match(/[?&]k=([^&#]+)/) || [])[1], m = K && MD.M[K];
  // ?rc=: the receipt of a purchase paid on package-detail.html (its OTP): this page opens on Purchase complete with it
  // (t name, pic, amt, vat, dl / dur its period, watch: Watch Now's player), and ?next= is where Done goes
  var RC = null; try { var rm = /[?&]rc=([^&#]*)/.exec(location.search); if(rm) RC = JSON.parse(decodeURIComponent(rm[1])); } catch(e){}
  var NEXT = (location.search.match(/[?&]next=([^&#]+)/) || [])[1]; NEXT = NEXT ? decodeURIComponent(NEXT) : '';
  if(RC && !m) m = { t:RC.t };
  // an OTT package (packages.js): its name, price and logo stand where a title's are
  var OK = (location.search.match(/[?&]ott=(\w+)/) || [])[1], OB = OK && Packages.OTT[OK];
  var GUIDE = { viu:'viu', netflix:'netflix', hbo:'hbo', iqiyi:'iqiyi', disney:'disney' }[OK];   // the apps the Activation Guide covers
  if(OB){ var OP = Packages.PKG[OK][+((location.search.match(/[?&]p=(\d+)/) || [])[1] || 0)] || Packages.PKG[OK][0];
    m = { t:RC ? RC.t : OP.t, price:OP.price }; }
  if(!m){ location.replace('store.html'); return; }
  // ?ret=: bought from a detail page's View Package (package-detail.html passes it on): Done goes back there, subscribed
  var RET = (location.search.match(/[?&]ret=([^&#]+)/) || [])[1];
  RET = RET ? decodeURIComponent(RET) : '';
  function leave(){ location.href = NEXT || (RET ? RET + (RET.indexOf('?') < 0 ? '?' : '&') + 'subscribed=1' : 'store.html'); }
  // an OTT package is bought by the time this page opens (package-detail.html's OTP): its titles and shorts are the
  // viewer's now (content.js MD.subscribe: their crowns turn owned)
  if(OB) MD.subscribe(OK);
  if(OB && OB.league) Content.subscribeTv('sports');   // a league's package: the sports premium channels too (channels-data.js pkg)
  var price = OB ? OP.price : MD.price(K) || 0;
  function vat(p){ return (Math.round(p * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2 }); }
  function day(d){ return d.getDate() + ' ' + 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[d.getMonth()] + ' ' + d.getFullYear(); }
  var now = new Date(), end = new Date(now.getTime() + (OB && OP.card === '7 Days' ? 6 : 29) * 864e5);   // a 7-day pass, else 30 days
  var pic = OB ? null : m.b || m.w || m.p;
  $('.c-nm, .d-nm').forEach(function(e){ e.textContent = m.t; });
  $('.o-nm').forEach(function(e){ e.textContent = m.t; });
  // Premium beside the title's name, with its crown (content.js: gold until bought); an OTT package has none
  $('.prem').forEach(function(e){ var ic = OB ? '' : Content.crownIcon({k:K}); if(ic) e.innerHTML = ic + 'Premium'; else e.remove(); });
  $('.c-amt, .d-amt, .o-amt').forEach(function(e){ e.textContent = price + ' baht'; });
  $('.c-vat').forEach(function(e){ e.textContent = '(VAT Included: ' + vat(price) + ' baht)'; });
  // its picture; a title without one (a PPV placeholder): AIS PLAY's mark on black, as its platform tag
  if(OB) $('.d-pic').forEach(function(e){ e.style.background = OB.league ? '#fff' : '#000'; e.innerHTML = OB.league
    ? '<span style="position:relative;display:block;width:100%;height:100%;border-radius:8px;overflow:hidden">' + Leagues.pic(Leagues.list.filter(function(l){ return l.id === OB.league; })[0]) + '</span>'
    : '<img src="' + OB.logo + '" alt="" style="width:100%;height:100%;object-fit:' + (OB.icon ? 'cover' : 'contain') + ';border-radius:8px">'; });
  else $('.c-pic, .d-pic').forEach(function(e){ e.style.background = pic ? "#3a3a3a url('" + pic + "') center / cover no-repeat" : "#000 url('icons/aisplay-mark.png') center / 60% auto no-repeat"; });
  $('.c-until').forEach(function(e){ e.textContent = day(end) + ' | 23:59:59'; });
  $('.d-dur').forEach(function(e){ e.textContent = day(now) + ' | 00:00:00 - ' + day(end) + ' | 23:59:59'; });
  // the receipt from package-detail.html: its own name, price (the plan picked), picture (a package's logo: whole, on
  // black) and period
  if(RC){
    $('.d-nm').forEach(function(e){ e.textContent = RC.t; });
    if(!OB) $('.d-pic').forEach(function(e){ e.style.background = RC.pic ? (RC.logo ? "#000 url('" + RC.pic + "') center / contain no-repeat" : "#3a3a3a url('" + RC.pic + "') center / cover no-repeat") : "#000 url('icons/aisplay-mark.png') center / 60% auto no-repeat"; });
    if(RC.pm) $('.d-pm').forEach(function(e){ e.textContent = RC.pm; });   // how it was paid (package-detail.html: QR PromptPay)
    $('.d-dur').forEach(function(e){ e.textContent = RC.dur; });
  }

  var toastEl = document.getElementById('toast'), toastT;
  function toast(t){ toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function back(){ location.href = 'movie-detail.html?k=' + K; }

  // ---- steps and focus ----
  var step = 'confirm', f = { confirm:1, done:1 }, code = '', okey = 0, timer = null;
  // Purchase Complete has two designs. Have Activate: a package with apps to activate (PLAY ULTIMATE, an OTT with an
  // Activation Guide). No Activate: the rest (PLAY ALL, a league's, another app's) and a title, ready to watch.
  var AISPKG = RC && !OB && !RC.watch, BUNDLE = AISPKG ? Packages.BUNDLES[RC.bi || 0] : null;
  var ACTIVATE = OB ? !!GUIDE : !!(BUNDLE && BUNDLE.services);
  if(ACTIVATE && !GUIDE) GUIDE = 'netflix';   // a bundle's guide opens on its first app
  var PACKAGE = !!(OB || AISPKG);
  // the receipt: the price, then with VAT and per what; a recurring package says it renews
  var AMT = RC ? RC.amt : OB ? price + ' baht / ' + (OP.card === 'Month' ? 'Month' : '7 Days') : price + ' baht',
      VATS = RC ? RC.vat : vat(price) + ' baht', PER = AMT.split(' / ')[1], BASE = AMT.split(' / ')[0];
  $('.d-base').forEach(function(e){ e.textContent = BASE; });
  $('.d-amt').forEach(function(e){ e.textContent = ((VATS.match(/[\d,.]+ baht/) || [BASE])[0]) + (PER ? ' / ' + PER : ''); });
  $('.d-renew').forEach(function(e){ if(!PACKAGE) e.remove(); else e.textContent = PER === 'Month' ? 'Renews monthly' : PER === 'Year' ? 'Renews yearly' : 'One-time'; });
  $('.d-period').forEach(function(e){ e.textContent = document.querySelector('.d-dur').textContent.replace(/ \| \d\d:\d\d(:\d\d)?/g, ''); });
  $('.d-pmask').forEach(function(e){ e.textContent = document.querySelector('.d-pm').textContent.replace(/\d+$/, function(n){ return '****' + n.slice(-4); }); });
  // the line under the receipt (Activate: after the Next Step badge)
  document.querySelector('.d-lead').textContent = ACTIVATE ? 'Activate your app to start watching content'
    : PACKAGE ? 'You’re all set. No activation needed. Sign in to watch now.' : 'You’re all set. No activation needed. Start watching now.';
  // the apps it brings: a bundle's, or the one app or league bought
  function appTile(img, cls){ return '<span class="app-t ' + (cls || '').replace('pad', '') + '"><img src="' + img + '" alt=""></span>'; }   // (.pad here is the OTP keypad)
  var appsHtml = '';
  if(OB) appsHtml = OB.league ? '<span class="app-t white"><span class="disc">' + Leagues.pic(Leagues.list.filter(function(l){ return l.id === OB.league; })[0]) + '</span></span>'
    : appTile(OB.logo, OB.icon ? 'cover' : OB.tile ? 'white' : '');
  else if(BUNDLE) appsHtml = (BUNDLE.services ? BUNDLE.services.filter(function(a){ return a.logo; }).slice(0, 8).map(function(a){ return appTile(a.logo, a.cls); })
    : BUNDLE.grid.filter(function(a){ return a.img; }).slice(0, 3).map(function(a){ return appTile(a.img, a.cls); })).join('');
  $('.d-apps').forEach(function(e){ if(appsHtml) e.innerHTML = appsHtml; else e.remove(); });
  if(!ACTIVATE) $('.only-act').forEach(function(e){ e.remove(); });
  document.querySelector('.result').classList.add(ACTIVATE ? 'act' : 'no');
  var KEEP = ['back', ACTIVATE ? 'guide' : 'watch'];   // Back, then Activation Guide or Start watching
  $('.doneb').forEach(function(b){ if(KEEP.indexOf(b.dataset.act) < 0) b.remove(); });
  var cBtns = $('.s-confirm .item'), dBtns = $('.doneb'), oKeys = $('.otpk');   // oKeys: 12 pad keys, then Resend, Confirm
  function go(s){ step = s; document.body.dataset.step = s; if(s === 'otp'){ code = ''; okey = 0; countdown(); } paint(); }
  function paint(){
    $('.focused').forEach(function(e){ e.classList.remove('focused'); });
    if(step === 'confirm') cBtns[f.confirm].classList.add('focused');
    if(step === 'done') dBtns[f.done].classList.add('focused');
    if(step === 'otp'){
      oKeys[okey].classList.add('focused');
      $('.pin').forEach(function(p, i){ p.textContent = code[i] || ''; p.classList.toggle('cur', i === Math.min(code.length, 3)); });
      oKeys[13].classList.toggle('off', code.length < 4);
    }
  }
  function countdown(){
    var n = 60, el = document.querySelector('.o-sec'); el.textContent = n; clearInterval(timer);
    timer = setInterval(function(){ n = Math.max(0, n - 1); el.textContent = n; if(!n) clearInterval(timer); }, 1000);
  }
  function type(k){
    if(k === 'del') code = code.slice(0, -1);
    else if(k === 'clear') code = '';
    else if(k === 'resend'){ code = ''; countdown(); toast('A new OTP was sent to 081-XXX-0082'); }
    else if(k === 'done'){ if(code.length < 4){ toast('Enter the 4-digit OTP'); return; } finish(); return; }
    else if(code.length < 4) code += k;
    if(code.length === 4 && okey < 12) okey = 13;   // four digits in: on to Confirm
    paint();
  }
  function finish(){
    clearInterval(timer);
    MD.own(K);   // the title is now playable (its detail page shows Play)
    go('done');
  }
  function act(a){
    if(a === 'cancel') back();
    else if(a === 'confirm') go('otp');
    else if(a === 'back'){ if(K && !PACKAGE && !NEXT && !RET) location.href = 'movie-detail.html?k=' + K; else leave(); }   // back where it was bought (a title: its page, now the viewer's)
    else if(a === 'guide') location.href = 'activation-guide.html?app=' + GUIDE;
    else if(a === 'watch'){ if(PACKAGE) leave(); else location.href = RC && RC.watch || 'player.html?k=' + K; }   // a package: back where it was bought, now subscribed
  }
  document.addEventListener('keydown', function(e){
    var k = e.key, back1 = k === 'Escape' || k === 'Backspace';
    if(step === 'otp'){
      if(/^[0-9]$/.test(k)){ type(k); e.preventDefault(); return; }
      if(k === 'Backspace' && code.length){ type('del'); e.preventDefault(); return; }
      if(back1){ go('confirm'); e.preventDefault(); return; }
      // the 3 x 4 keypad, then the two buttons under it
      if(okey < 12){
        var r = Math.floor(okey / 3), c = okey % 3;
        if(k === 'ArrowLeft' && c > 0) okey--;
        else if(k === 'ArrowRight' && c < 2) okey++;
        else if(k === 'ArrowUp' && r > 0) okey -= 3;
        else if(k === 'ArrowDown') okey = r < 3 ? okey + 3 : (c < 2 ? 12 : 13);
      } else {
        if(k === 'ArrowLeft') okey = 12; else if(k === 'ArrowRight') okey = 13; else if(k === 'ArrowUp') okey = okey === 12 ? 9 : 11;
      }
      if(k === 'Enter') type(oKeys[okey].dataset.key);
      paint(); e.preventDefault(); return;
    }
    var n = step === 'confirm' ? cBtns.length : dBtns.length;
    if(k === 'ArrowLeft') f[step] = Math.max(0, f[step] - 1);
    else if(k === 'ArrowRight') f[step] = Math.min(n - 1, f[step] + 1);
    else if(k === 'Enter') act((step === 'confirm' ? cBtns : dBtns)[f[step]].dataset.act);
    else if(back1){ if(step === 'confirm') back(); else leave(); }
    else return;
    paint(); e.preventDefault();
  });
  $('.s-confirm .item, .doneb').forEach(function(el){ el.addEventListener('click', function(){ act(el.dataset.act); }); });
  oKeys.forEach(function(el, i){ el.addEventListener('click', function(){ okey = i; type(el.dataset.key); }); });
  f.done = 1;   // the design's focus: Activation Guide, or Start watching
  if(OB || RC) go('done'); else paint();   // paid already (package-detail.html's OTP): Purchase complete
})();
