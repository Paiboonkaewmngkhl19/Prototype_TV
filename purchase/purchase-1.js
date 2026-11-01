
(function(){
  var $ = function(q){ return Array.prototype.slice.call(document.querySelectorAll(q)); };
  var K = (location.search.match(/[?&]k=([^&#]+)/) || [])[1], m = K && MD.M[K];
  // an OTT package (packages.js): its name, price and logo stand where a title's are
  var OK = (location.search.match(/[?&]ott=(\w+)/) || [])[1], OB = OK && Packages.OTT[OK];
  var GUIDE = { viu:'viu', netflix:'netflix', hbo:'hbo', iqiyi:'iqiyi', disney:'disney' }[OK];   // the apps the Activation Guide covers
  if(OB){ var OP = Packages.PKG[OK][+((location.search.match(/[?&]p=(\d+)/) || [])[1] || 0)] || Packages.PKG[OK][0];
    m = { t:OP.t, price:OP.price }; }
  if(!m){ location.replace('store.html'); return; }
  var price = OB ? OP.price : MD.price(K) || 0;
  function vat(p){ return (Math.round(p * 107) / 100).toLocaleString('en-US', { minimumFractionDigits:2 }); }
  function day(d){ return d.getDate() + ' ' + 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[d.getMonth()] + ' ' + d.getFullYear(); }
  var now = new Date(), end = new Date(now.getTime() + (OB && OP.card === '7 Days' ? 6 : 29) * 864e5);   // a 7-day pass, else 30 days
  var pic = OB ? null : m.b || m.w || m.p;
  $('.c-nm, .d-nm').forEach(function(e){ e.textContent = m.t; });
  $('.o-nm').forEach(function(e){ e.textContent = m.t; });
  $('.c-amt, .d-amt, .o-amt').forEach(function(e){ e.textContent = price + ' baht'; });
  if(OB) $('.d-amt').forEach(function(e){ e.textContent = price + ' baht / ' + (OP.card === 'Month' ? 'Month' : '7 Days'); });
  $('.c-vat').forEach(function(e){ e.textContent = '(VAT Included: ' + vat(price) + ' baht)'; });
  $('.d-vat').forEach(function(e){ e.textContent = 'VAT Included: ' + vat(price) + ' baht'; });
  // its picture; a title without one (a PPV placeholder): AIS PLAY's mark on black, as its platform tag
  if(OB) $('.d-pic').forEach(function(e){ e.style.background = OB.league ? '#fff' : '#000'; e.innerHTML = OB.league
    ? '<span style="position:relative;display:block;width:100%;height:100%;border-radius:8px;overflow:hidden">' + Leagues.pic(Leagues.list.filter(function(l){ return l.id === OB.league; })[0]) + '</span>'
    : '<img src="' + OB.logo + '" alt="" style="width:100%;height:100%;object-fit:' + (OB.icon ? 'cover' : 'contain') + ';border-radius:8px">'; });
  else $('.c-pic, .d-pic').forEach(function(e){ e.style.background = pic ? "#3a3a3a url('" + pic + "') center / cover no-repeat" : "#000 url('icons/aisplay-mark.png') center / 60% auto no-repeat"; });
  $('.c-until').forEach(function(e){ e.textContent = day(end) + ' | 23:59:59'; });
  $('.d-dur').forEach(function(e){ e.textContent = day(now) + ' | 00:00:00 - ' + day(end) + ' | 23:59:59'; });

  var toastEl = document.getElementById('toast'), toastT;
  function toast(t){ toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  function back(){ location.href = 'movie-detail.html?k=' + K; }

  // ---- steps and focus ----
  var step = 'confirm', f = { confirm:1, done:1 }, code = '', okey = 0, timer = null;
  // Purchase complete: an OTT package with an Activation Guide shows it (and the activation SMS card); a title has
  // nothing to activate, so Watch Now in its place and no activation card
  $('.doneb').forEach(function(b){ if(b.dataset.act === (OB && GUIDE ? 'watch' : 'guide') || (OB && !GUIDE && b.dataset.act === 'watch')) b.remove(); });
  if(!OB) document.querySelector('.guide').remove();
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
    else if(a === 'store') location.href = 'store.html';
    else if(a === 'guide') location.href = 'activation-guide.html?app=' + GUIDE;
    else if(a === 'watch') location.href = 'player.html?k=' + K;
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
    else if(back1){ if(step === 'confirm') back(); else location.href = 'store.html'; }
    else return;
    paint(); e.preventDefault();
  });
  $('.s-confirm .item, .doneb').forEach(function(el){ el.addEventListener('click', function(){ act(el.dataset.act); }); });
  oKeys.forEach(function(el, i){ el.addEventListener('click', function(){ okey = i; type(el.dataset.key); }); });
  f.done = dBtns.length - 1;
  if(OB) go('done'); else paint();
})();
