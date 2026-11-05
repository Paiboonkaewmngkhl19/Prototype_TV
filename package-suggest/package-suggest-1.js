(function(){
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  function esc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  // ---- the item: ?k= (a movie or series), ?s= (a short), ?prog= (a channel's programme, as movie-detail.html has it);
  //      ret: the detail page View Package came from, where a finished purchase returns ----
  var q = location.search;
  var K = (q.match(/[?&]k=([\w-]+)/) || [])[1], S = (q.match(/[?&]s=(\d+)/) || [])[1], PROG = null;
  try { var pm = /[?&]prog=([^&#]*)/.exec(q); if(pm) PROG = JSON.parse(decodeURIComponent(pm[1])); } catch(e){}
  var RET = (q.match(/[?&]ret=([^&#]+)/) || [])[1];
  RET = RET ? decodeURIComponent(RET) : '';
  var info = PROG ? { tv:PROG.tv } : S !== undefined && window.SHORTS[+S] ? { s:+S } : { k:K && MD.M[K] ? K : 'd9' };
  var CH = PROG && TV.byName(PROG.tv);
  if(!RET) RET = PROG ? 'movie-detail.html?prog=' + encodeURIComponent(JSON.stringify(PROG)) : Content.detailUrl(info);

  // ---- left: its title, its detail page's meta row (content.js), the platform an account can already have ----
  var title, pic, plat = '', where;
  if(PROG){
    title = PROG.t; pic = PROG.bg || PROG.img; where = CH ? CH.n : PROG.tv;
    document.getElementById('meta').innerHTML = (Content.crownIcon(info) ? '<span class="mbadge prem">' + Content.crownIcon(info) + 'Premium</span>' : '') +
      (CH ? '<span class="chan">' + TV.logoHtml(CH) + 'Channel ' + CH.no + ': ' + esc(CH.n) + '</span>' : '') + '<span class="pill">' + LIVE.range(PROG) + '</span>';   // as its detail page's
  } else {
    var h = Content.hero(info);
    title = h.t; pic = h.bg; plat = h.plat;
    where = Packages.OTT[plat] ? Packages.OTT[plat].n : plat === 'ais' ? 'AIS PLAY' : '';
    document.getElementById('meta').innerHTML = Content.metaHtml(info, true);
  }
  document.title = 'Get Access to ' + title;
  document.getElementById('title').textContent = title;
  if(pic) document.getElementById('bg').style.backgroundImage = "url('" + pic + "')";
  var bring = document.getElementById('bring');
  if(where){ bring.textContent = 'Take me to  ' + where; bring.dataset.label = 'Take me to ' + where; }
  else document.getElementById('account').remove();

  // ---- right: the packages that include it (packages.js), each to its purchase, which comes back to the detail page ----
  var CARDS = Packages.suggest(PROG ? { channel:1, sport:!!CH && CH.pkg === 'sports', league:PROG.lg } : { plat:plat });
  document.getElementById('cards').innerHTML = CARDS.map(function(c, i){ return Packages.cardHtml(c, ' data-i="' + i + '"'); }).join('');

  var toastEl = document.getElementById('toast'), toastT;
  function toast(m){ toastEl.textContent = m; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1800); }
  function withRet(u){ return u + (u.indexOf('?') < 0 ? '?' : '&') + 'ret=' + encodeURIComponent(RET); }
  function back(){
    try { if(document.referrer && /(home|movie|movie-detail|short-detail)\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = RET;
  }
  function select(el){
    if(el === bring){ toast('Opening ' + el.dataset.label.replace(/^Take me to /, '') + ' (demo)'); return; }
    if(el.id === 'seeall'){ location.href = withRet('all-packages.html'); return; }
    var c = CARDS[+el.dataset.i];
    if(c.href){ location.href = withRet(c.href); return; }   // Confirm, OTP, done: back to the detail page, subscribed
    toast('Subscribe to ' + c.title + ' (demo)');
  }

  // ---- focus: "bring me to" and the cards along one row, See all Packages under them; it opens on the first card ----
  function rows(){ return [$('.account .item').concat($('.pcard')), $('#seeall')]; }
  var FIRST = $('.account .item').length, cur = { row:0, col:FIRST }, cardCol = FIRST;
  function paint(){
    var R = rows();
    cur.row = Math.max(0, Math.min(R.length - 1, cur.row));
    cur.col = Math.max(0, Math.min(R[cur.row].length - 1, cur.col));
    $('.item.focused').forEach(function(e){ e.classList.remove('focused'); });
    R[cur.row][cur.col].classList.add('focused');
  }
  addEventListener('keydown', function(e){
    var R = rows(), k = e.key;
    if(k === 'ArrowRight' && cur.row === 0) cur.col++;
    else if(k === 'ArrowLeft' && cur.row === 0) cur.col--;
    else if(k === 'ArrowDown' && cur.row === 0){ cardCol = Math.max(FIRST, cur.col); cur = { row:1, col:0 }; }
    else if(k === 'ArrowUp' && cur.row === 1) cur = { row:0, col:cardCol };
    else if(k === 'Enter' || k === ' ') select(R[cur.row][cur.col]);
    else if(k === 'Escape' || k === 'Backspace') back();
    else return;
    e.preventDefault(); paint();
  });
  document.getElementById('screen').addEventListener('click', function(e){
    var el = e.target.closest('.item'); if(!el) return;
    rows().forEach(function(r, ri){ var c = r.indexOf(el); if(c >= 0) cur = { row:ri, col:c }; });
    paint(); select(el);
  });
  addEventListener('pageshow', function(e){ if(e.persisted) location.reload(); });
  paint();
})();
