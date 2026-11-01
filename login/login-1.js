
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  var items = Array.prototype.slice.call(document.querySelectorAll('.options .btn')), cur = 0;
  var mobileBtn = document.querySelector('.btn[data-act="mobile"]'), qrBtn = document.querySelector('.btn[data-act="qr"]');
  // Quick sign in: its two buttons (0 Refresh, 1 Back); inQr is where focus is in it (-1: on the options)
  var qrBtns = [document.getElementById('qrRefresh'), document.getElementById('qrBack')], inQr = -1;
  var timerEl = document.getElementById('qrTimer'), qrLeft = 300, qrT = 0;
  // Pay per view: four titles in a loop. bg: the key art's box in the page and the picture's place in it, both in %
  // as in each Figma frame (box: left, top, width, height in px); shade: that frame's darkening over it
  var ppvBtn = document.querySelector('.btn[data-act="ppv"]'), inPpv = false, ppvAt = 0;
  var SHADE = 'linear-gradient(81.96deg, rgba(0,0,0,.768) 1.7%, rgba(0,0,0,.8) 12.76%, rgba(0,0,0,0) 76.43%)';
  var PPV = [
    // (the UCL art's own deep blue instead of black, so the side with the options stays blue)
    {t:'UEFA Champions League', card:'login-assets/ppv/ucl-card.jpg', bg:'login-assets/ppv/ucl-bg.jpg', box:[0, 0, 1920, 1080], img:[0, 0, 100, 100],
      shade:'linear-gradient(81.96deg, rgba(12,26,120,.78) 1.7%, rgba(14,32,150,.62) 20%, rgba(16,40,176,.3) 50%, rgba(16,40,176,0) 76.43%)'},
    {t:'Mo Yu Yun Jian', card:'login-assets/ppv/drama.png', bg:'login-assets/ppv/drama.png', box:[0, -196, 2199, 1276], img:[.02, 14.49, 123.49, 119.78],
      shade:'linear-gradient(82.2deg, rgba(0,0,0,.768) 1.7%, rgba(0,0,0,.8) 12.76%, rgba(0,0,0,0) 76.43%)'},
    {t:'F1 The Movie', card:'login-assets/ppv/f1-card.png', bg:'login-assets/ppv/f1-bg.png', box:[-346, -63, 2316, 1344], img:[1.98, 3.39, 95.96, 92.37],
      shade:'linear-gradient(69.1deg, rgba(0,0,0,.8) 52.51%, rgba(0,0,0,0) 73.97%)'},
    {t:'PLAY Ultimate', card:'login-assets/ppv/play-card.png', bg:'login-assets/ppv/play-bg.png', box:[0, 0, 1920, 1080], img:[-2.22, -1.51, 102.22, 101.51],
      shade:'linear-gradient(-1.28deg, #000 9.23%, rgba(0,0,0,0) 35.21%), ' + SHADE}
  ];
  var ppvBgs = PPV.map(function(c){
    var el = document.createElement('div'), b = c.box, i = c.img;
    el.className = 'ppv-bg';
    el.style.cssText = 'left:' + b[0] + 'px;top:' + b[1] + 'px;width:' + b[2] + 'px;height:' + b[3] + 'px;--shade:' + c.shade;
    el.innerHTML = '<img src="' + c.bg + '" alt="" style="left:' + i[0] + '%;top:' + i[1] + '%;width:' + i[2] + '%;height:' + i[3] + '%;object-fit:cover">';
    document.getElementById('ppvBgs').appendChild(el); return el;
  });
  var ppvCards = PPV.map(function(c, i){
    var el = document.createElement('div');
    el.className = 'ppv-card';
    el.innerHTML = '<div class="shot" data-ring-art=""><img src="' + c.card + '" alt="' + c.t + '"></div>';
    el.querySelector('.shot').addEventListener('click', function(){ ppvAt = i; inPpv = true; paint(); placeCards(); location.href = 'store.html'; });
    document.getElementById('ppvRow').appendChild(el); return el;
  });
  // each card's place: 0 is the focused one's, then 1, 2, 3 to the right (3 is past the screen's edge). No loop: the
  // row stops at either end; cards before the focused one slide out to the left and fade
  var SLOT = 444;
  function setCard(el, slot){ el.style.transform = 'translateX(' + slot * SLOT + 'px)'; el.style.opacity = slot < 0 ? 0 : 1; }
  function placeCards(){
    ppvCards.forEach(function(el, i){ setCard(el, i - ppvAt); });
    ppvBgs.forEach(function(el, i){ el.classList.toggle('on', i === ppvAt); });
  }
  placeCards();
  // the number card: its keypad (3 x 4) then Continue; inCard is where focus is in it (-1: on the options)
  var keys = Array.prototype.slice.call(document.querySelectorAll('.key')), contBtn = document.getElementById('continue');
  var digitsEl = document.getElementById('digits'), number = '', inCard = -1, CONT = keys.length;
  // where signing in leads: Home, or the title picked on the launcher (?next=movie-detail.html)
  var next = (/[?&]next=([^&]*)/.exec(location.search) || [])[1];
  next = next ? decodeURIComponent(next) : 'home.html';
  if(!/^[\w-]+\.html$/.test(next)) next = 'home.html';   // only this prototype's own pages

  function paint(){
    items.forEach(function(el, i){ el.classList.toggle('focused', inCard < 0 && inQr < 0 && !inPpv && i === cur); });
    qrBtns.forEach(function(el, i){ el.classList.toggle('focused', i === inQr); });
    var qrOn = items[cur] === qrBtn;
    document.body.classList.toggle('qr-card', qrOn);
    qrBtn.classList.toggle('open', inQr >= 0);
    document.getElementById('qrPanel').setAttribute('aria-hidden', qrOn ? 'false' : 'true');
    if(qrOn && !qrT) qrT = setInterval(qrTick, 1000);
    var ppvOn = items[cur] === ppvBtn;
    document.body.classList.toggle('ppv-on', ppvOn);
    ppvBtn.classList.toggle('open', inPpv);
    document.getElementById('ppv').setAttribute('aria-hidden', ppvOn ? 'false' : 'true');
    ppvCards.forEach(function(el, i){ el.firstChild.classList.toggle('focused', inPpv && i === ppvAt); });
    keys.forEach(function(el, i){ el.classList.toggle('focused', i === inCard); });
    contBtn.classList.toggle('focused', inCard === CONT);
    var cardOn = items[cur] === mobileBtn;
    document.body.classList.toggle('mobile-card', cardOn);
    mobileBtn.classList.toggle('open', inCard >= 0);
    document.getElementById('card').setAttribute('aria-hidden', cardOn ? 'false' : 'true');
  }

  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1800); }

  function type(k){
    if(k === 'del') number = number.slice(0, -1);
    else if(k === 'clear') number = '';
    else if(number.length < 10) number += k;
    digitsEl.textContent = number;
  }
  function submit(){
    if(number.length === 10) location.href = next;
    else toast('Enter all 10 digits of your mobile or internet number');
  }

  // the code's countdown, running while Quick sign in shows; at 0 the code has run out and Refresh wakes up
  function qrPaint(){
    var mm = ('0' + Math.floor(qrLeft / 60)).slice(-2), ss = ('0' + qrLeft % 60).slice(-2);
    timerEl.innerHTML = qrLeft ? 'QR Code will refresh in <b>' + mm + ':' + ss + '</b>' : 'QR Code has expired. <b>Refresh</b> to get a new one';
    qrBtns[0].classList.toggle('off', qrLeft > 0);
  }
  function qrTick(){
    if(items[cur] !== qrBtn){ clearInterval(qrT); qrT = 0; return; }
    if(qrLeft > 0){ qrLeft--; qrPaint(); }
  }
  function qrKey(k){
    if(k === 'ArrowUp'){ if(!qrLeft) inQr = 0; }
    else if(k === 'ArrowDown') inQr = 1;
    else if(k === 'ArrowLeft') inQr = -1;
    else if(k === 'Enter' || k === ' '){
      if(inQr === 1) inQr = -1;
      else { qrLeft = 300; qrPaint(); inQr = 1; toast('New QR Code'); }
    }
    else return false;
    paint(); return true;
  }

  function activate(el){
    var act = el.dataset.act;
    if(act === 'home') location.href = next;
    else if(act === 'ppv'){ inPpv = true; paint(); }
    else if(act === 'qr'){ inQr = qrLeft ? 1 : 0; paint(); }
    else if(act === 'mobile'){ inCard = 0; paint(); }
  }

  // inside the card: the keypad is a 3-column grid, Continue sits under it; Left off the first column or Back leaves
  function cardKey(k){
    var i = inCard, col = i % 3;
    if(k === 'ArrowLeft'){ if(i === CONT || col === 0) inCard = -1; else inCard = i - 1; }
    else if(k === 'ArrowRight'){ if(i !== CONT && col < 2) inCard = i + 1; }
    else if(k === 'ArrowUp'){ if(i === CONT) inCard = 10; else if(i >= 3) inCard = i - 3; }
    else if(k === 'ArrowDown'){ if(i !== CONT) inCard = i + 3 < CONT ? i + 3 : CONT; }
    else if(k === 'Enter' || k === ' '){ if(i === CONT) submit(); else type(keys[i].dataset.key); }
    else return false;
    paint(); return true;
  }

  document.addEventListener('keydown', function(e){
    var k = e.key;
    // the remote's number keys type straight into the card while it shows
    if(/^[0-9]$/.test(k) && items[cur] === mobileBtn){ type(k); e.preventDefault(); return; }
    if(inPpv){
      if(k === 'ArrowRight' && ppvAt < PPV.length - 1){ ppvAt++; placeCards(); paint(); }
      else if(k === 'ArrowLeft' && ppvAt > 0){ ppvAt--; placeCards(); paint(); }
      // Left on the first title, Up or Back: back to the options
      else if(k === 'ArrowLeft' || k === 'ArrowUp' || k === 'Escape' || k === 'Backspace'){ inPpv = false; paint(); }
      else if(k === 'Enter' || k === ' ') location.href = 'store.html';
      e.preventDefault(); return;
    }
    if(inQr >= 0){
      if(k === 'Escape' || k === 'Backspace'){ inQr = -1; paint(); e.preventDefault(); return; }
      if(qrKey(k)) e.preventDefault();
      return;
    }
    if(inCard >= 0){
      if(k === 'Escape'){ inCard = -1; paint(); e.preventDefault(); return; }
      if(k === 'Backspace'){ if(number) type('del'); else { inCard = -1; paint(); } e.preventDefault(); return; }
      if(cardKey(k)) e.preventDefault();
      return;
    }
    if(k === 'Escape' || k === 'Backspace'){ e.preventDefault(); location.href = 'launcher.html'; return; }
    if(k === 'ArrowUp'){ cur = Math.max(0, cur - 1); paint(); e.preventDefault(); }
    else if(k === 'ArrowDown'){ cur = Math.min(items.length - 1, cur + 1); paint(); e.preventDefault(); }
    else if(k === 'ArrowRight' && items[cur] === mobileBtn){ inCard = 0; paint(); e.preventDefault(); }
    else if(k === 'ArrowRight' && (items[cur] === qrBtn || items[cur] === ppvBtn)){ activate(items[cur]); e.preventDefault(); }
    else if(k === 'Enter' || k === ' '){ activate(items[cur]); e.preventDefault(); }
  });
  items.forEach(function(el, i){ el.addEventListener('click', function(){ cur = i; inCard = -1; inQr = -1; inPpv = false; paint(); activate(el); }); });
  qrBtns.forEach(function(el, i){ el.addEventListener('click', function(){ if(i === 0 && qrLeft) return; inQr = i; qrKey('Enter'); }); });
  keys.forEach(function(el, i){ el.addEventListener('click', function(){ inCard = i; paint(); type(el.dataset.key); }); });
  contBtn.addEventListener('click', function(){ inCard = CONT; paint(); submit(); });

  paint();
})();
