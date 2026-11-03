/*
  Focus ring, as on Home (home.html): ONE ring that glides from item to item instead of each item drawing its own.
  An 8px band of frosted glass made from the focused item's own artwork (plain grey-blue glass for items without a
  picture), with a thin white rim and a soft glow in the artwork's dominant colour. Its look: focus-ring.css.

  Shared by the pages that run on a 1920x1080 #screen (tv-guide.html, movie-detail.html, package-detail.html).
  Nothing to call: it watches the `focused` class inside #screen and follows whichever element gained it last
  (so a dialog's button wins over the page behind it), falling back to any other visible focused element when that
  one loses it.
  Home has no #screen and draws its own ring: it loads this file only for RingColor.
*/
// The ring's glow colour, from the artwork: RingColor.tint(ring, 'url("...")') sets --ring-color and .ring-tinted on the
// ring, or takes them off (the fixed glow) when there is no artwork or the picture can't be read. Each image is sampled once.
window.RingColor = (function(){
  var SIZE = 24, MIN_PIXELS = 12, MIN_VALUE = 200, cache = {}, ctx = null;
  // its most saturated common colour: pixels sorted into 12 hues (skipping near-black, near-white and grey), the hue with
  // the most saturation-weighted pixels wins, lifted to MIN_VALUE so a dark poster's colour still shows as a glow
  function sample(img){
    var d;
    try {
      if(!ctx){ var cv = document.createElement('canvas'); cv.width = cv.height = SIZE; ctx = cv.getContext('2d', { willReadFrequently:true }); }
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      d = ctx.getImageData(0, 0, SIZE, SIZE).data;
    } catch(e){ return ''; }   // file:// or a cross-origin image: the canvas may not read it
    var hues = [], best = null;
    for(var i = 0; i < d.length; i += 4){
      var r = d[i], g = d[i+1], b = d[i+2], max = Math.max(r, g, b), min = Math.min(r, g, b), c = max - min;
      if(d[i+3] < 128 || max < 48 || min > 224 || c < 24 || c / max < .25) continue;
      var h = max === r ? (g - b) / c : max === g ? 2 + (b - r) / c : 4 + (r - g) / c;
      var n = Math.floor((h * 60 + 375) % 360 / 30), w = (c / max) * (c / max);
      var o = hues[n] || (hues[n] = { n:0, w:0, r:0, g:0, b:0 });
      o.n++; o.w += w; o.r += r * w; o.g += g * w; o.b += b * w;
    }
    hues.forEach(function(o){ if(o.n >= MIN_PIXELS && (!best || o.w > best.w)) best = o; });
    if(!best) return '';
    var R = best.r / best.w, G = best.g / best.w, B = best.b / best.w, k = Math.max(1, MIN_VALUE / Math.max(R, G, B));
    return Math.round(R * k) + ',' + Math.round(G * k) + ',' + Math.round(B * k);
  }
  // no crossOrigin on the image: a cross-origin one still loads, and the canvas refuses it quietly instead of a Console error
  function colorOf(url, done){
    var c = cache[url];
    if(typeof c === 'string') return done(c);
    if(c) return c.push(done);
    var waiting = cache[url] = [done], img = new Image();
    img.onload = img.onerror = function(e){
      var col = e.type === 'load' ? sample(img) : '';
      cache[url] = col;
      waiting.forEach(function(f){ f(col); });
    };
    img.src = url;
  }
  function tint(ring, art){
    var m = /^url\(["']?(.*?)["']?\)$/.exec(art || ''), url = m ? m[1] : '';
    ring.dataset.tintUrl = url;
    function paint(c){
      if(c) ring.style.setProperty('--ring-color', c);
      ring.classList.toggle('ring-tinted', !!c);
    }
    if(!url) return paint('');
    colorOf(url, function(c){ if(ring.dataset.tintUrl === url) paint(c); });   // focus may have moved on meanwhile
  }
  return { tint:tint };
})();

(function(){
  var screen = document.getElementById('screen');
  if(!screen) return;

  var look = document.createElement('link');
  look.rel = 'stylesheet'; look.href = 'focus-ring.css';
  document.head.appendChild(look);

  var css = document.createElement('style');
  css.textContent =
    '.fring{ position:absolute; left:0; top:0; z-index:50; pointer-events:none; opacity:0; will-change:transform, width, height; }' +
    '.fring.on{ opacity:1; }' +
    '.fring .glass{ position:absolute; inset:0; padding:8px; border-radius:inherit; overflow:hidden;' +
    '  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor;' +
    '  mask:linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0); }' +
    '.fring .glass i{ position:absolute; inset:0; opacity:0; background:var(--img, linear-gradient(135deg, #9aa3b5, #5c6478)) center / cover no-repeat;' +
    '  transition:opacity .22s cubic-bezier(.2,0,0,1); }' +
    '.fring .glass i.front{ opacity:1; }' +
    '.fring .tops{ position:absolute; left:0; top:0; }' +
    '.fring .tops > *{ position:absolute; margin:0; max-width:none; }';
  document.head.appendChild(css);

  var ring = document.createElement('div');
  ring.className = 'fring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<div class="glass"><i></i><i></i></div><div class="tops"></div>';
  screen.appendChild(ring);

  var layers = ring.querySelectorAll('.glass i'), front = 0, art = null;
  // parts of the focused item that sit on top of the ring (a badge over its edge): marked data-ring-top, copied into
  // the ring and kept over the originals every frame, as Home does with a card's badge. data-ring-top="styled" keeps
  // the copy's class (a styled tag such as the Live ribbon, live-ribbon.css) and scales it like the original
  var tops = ring.querySelector('.tops'), topSrc = [];
  function setTops(el){
    tops.innerHTML = '';
    topSrc = Array.prototype.slice.call(el.querySelectorAll('[data-ring-top]'));
    topSrc.forEach(function(s){ var c = s.cloneNode(true); if(s.getAttribute('data-ring-top') !== 'styled') c.removeAttribute('class'); tops.appendChild(c); });
  }
  function placeTops(){
    if(!topSrc.length) return;
    var k = scale(), sr = screen.getBoundingClientRect();
    topSrc.forEach(function(s, i){
      var b = s.getBoundingClientRect(), c = tops.children[i];
      c.style.left = (b.left - sr.left) / k - cur.x + 'px'; c.style.top = (b.top - sr.top) / k - cur.y + 'px';
      if(s.getAttribute('data-ring-top') === 'styled'){
        c.style.width = s.offsetWidth + 'px'; c.style.height = s.offsetHeight + 'px';
        c.style.transformOrigin = '0 0'; c.style.transform = 'scale(' + b.width / k / (s.offsetWidth || 1) + ')';
      } else { c.style.width = b.width / k + 'px'; c.style.height = b.height / k + 'px'; }
      c.style.opacity = getComputedStyle(s).opacity;
    });
  }
  var target = null, cur = null, from = null, t0 = 0, until = 0, raf = 0, W = 8, MS = 220, FOLLOW_MS = 700;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scale(){ return screen.getBoundingClientRect().width / screen.offsetWidth || 1; }
  // shown on screen: laid out, not inside something faded out (a closed dialog, a hidden view), not covered
  function visible(el){
    if(!el.isConnected || !el.getClientRects().length) return false;
    for(var n = el; n && n !== screen; n = n.parentElement) if(getComputedStyle(n).opacity === '0') return false;
    // still being scrolled into view (a scroller on its way to data-scroll-*-to): it shows once that ends, so the ring
    // goes there now, not hiding while the item is still under what it is scrolling out from behind
    if(scrolling(el)) return true;
    // and not covered: a dialog's backdrop over it means the page behind keeps its focus, but the ring belongs to the dialog
    var b = el.getBoundingClientRect(), cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
    if(cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return true;
    var hit = document.elementFromPoint(cx, cy);
    return !hit || el.contains(hit) || hit.contains(el);
  }
  function scrolling(el){
    for(var n = el.parentElement; n && n !== screen; n = n.parentElement){
      if(n.dataset.scrollTopTo !== undefined && Math.abs(n.scrollTop - Math.min(parseFloat(n.dataset.scrollTopTo), n.scrollHeight - n.clientHeight)) > 1) return true;
      if(n.dataset.scrollLeftTo !== undefined && Math.abs(n.scrollLeft - Math.min(parseFloat(n.dataset.scrollLeftTo), n.scrollWidth - n.clientWidth)) > 1) return true;
    }
    return false;
  }
  // a page can ask for the plain ring everywhere (no artwork reflected in it): <div id="screen" data-ring-plain>
  var PLAIN = screen.hasAttribute('data-ring-plain');
  // the gap between the item and the ring, in #screen px: 4 on every page (as Home's ring); a page can change it
  // with <div id="screen" data-ring-gap="0">
  var GAP = screen.dataset.ringGap !== undefined ? parseFloat(screen.dataset.ringGap) || 0 : 4;
  // the item's artwork: its own or a descendant's background image, or a large enough <img>
  function artOf(el){
    if(PLAIN) return '';
    if(el.dataset.ringArt !== undefined) return el.dataset.ringArt;
    var found = '', nodes = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*'), 0, 25));
    for(var i = 0; i < nodes.length && !found; i++){
      var bg = getComputedStyle(nodes[i]).backgroundImage;
      if(bg && bg.indexOf('url(') === 0) found = bg.split(')')[0] + ')';
      else if(nodes[i].tagName === 'IMG' && nodes[i].naturalWidth > 120 && !/\.svg/.test(nodes[i].src)) found = 'url("' + nodes[i].currentSrc + '")';
    }
    el.dataset.ringArt = found;
    return found;
  }
  // where the ring goes: the item's rect (in #screen px) once everything has settled, 8px bigger all round (+ the gap), corners
  // concentric with it. A scroller that is still on its way (pages mark the target with data-scroll-left-to /
  // data-scroll-top-to) counts as already there, so the ring heads straight for the item's final place, as on Home.
  // the item's corner radius in px, at its unscaled size (a % radius is of its width: 50% makes a circle)
  function radiusOf(el){
    var v = getComputedStyle(el).borderTopLeftRadius, n = parseFloat(v) || 0;
    if(/%$/.test(v)) n = n / 100 * el.offsetWidth;
    return Math.min(n, el.offsetHeight / 2);
  }
  function rectOf(el){
    // a page can also say outright where the item will end up (data-ring-rect="x,y,w,h" in #screen px), when the item
    // is still growing / sliding into a fixed place (the player's mini EPG): the ring goes there and stays put
    if(el.dataset.ringRect){
      var q = el.dataset.ringRect.split(',').map(Number), qr = radiusOf(el);
      return { x:q[0] - W - GAP, y:q[1] - W - GAP, w:q[2] + 2 * (W + GAP), h:q[3] + 2 * (W + GAP), r:qr + W + GAP };
    }
    var k = scale(), sr = screen.getBoundingClientRect(), b = el.getBoundingClientRect(), dx = 0, dy = 0;
    for(var n = el.parentElement; n && n !== screen; n = n.parentElement){
      // (a target past the scroller's real end is where the browser will actually stop)
      if(n.dataset.scrollLeftTo !== undefined) dx += (n.scrollLeft - Math.min(parseFloat(n.dataset.scrollLeftTo), n.scrollWidth - n.clientWidth)) * k;
      if(n.dataset.scrollTopTo !== undefined) dy += (n.scrollTop - Math.min(parseFloat(n.dataset.scrollTopTo), n.scrollHeight - n.clientHeight)) * k;
    }
    var r = radiusOf(el) * (b.height / k / (el.offsetHeight || 1));
    return { x:(b.left + dx - sr.left) / k - W - GAP, y:(b.top + dy - sr.top) / k - W - GAP, w:b.width / k + 2 * (W + GAP), h:b.height / k + 2 * (W + GAP), r:r + W + GAP };
  }
  function ease(t){   // cubic-bezier(.2,0,0,1), the curve Home's rails and ring use
    var u = t;
    for(var n = 0; n < 8; n++){
      var xu = 3*(1-u)*(1-u)*u*.2 + u*u*u - t, d = 3*(1-u)*(1-u)*.2 + 6*(1-u)*u*(-.2) + 3*u*u;
      if(Math.abs(xu) < 1e-5 || !d) break;
      u = Math.min(1, Math.max(0, u - xu / d));
    }
    return 3*(1-u)*u*u + u*u*u;
  }
  // every frame: ease from where the ring was toward the item's live rect, so it also stays locked to an item that is
  // itself moving (scaling up, a rail or page scrolling, a card widening); stops once everything has settled
  function lastVisibleFocused(){
    var all = Array.prototype.filter.call(screen.querySelectorAll('.focused'), visible);
    return all.length ? all[all.length - 1] : null;
  }
  function tick(){
    // its dialog / view went away: move to what is focused underneath, if anything
    if(!target || !visible(target)){ raf = 0; cur = null; target = null; settle(); return; }
    // the newest focus was still fading in (a dialog opening): go to it as soon as it shows
    if(wanted && wanted !== target && wanted.classList.contains('focused') && visible(wanted)){ raf = 0; place(wanted); return; }
    var t = performance.now(), to = rectOf(target);
    var p = REDUCED || !from ? 1 : Math.max(0, Math.min(1, (t - t0) / MS)), e = ease(p);
    cur = {};
    ['x','y','w','h','r'].forEach(function(k){ cur[k] = from ? from[k] + (to[k] - from[k]) * e : to[k]; });
    ring.style.width = cur.w + 'px'; ring.style.height = cur.h + 'px';
    ring.style.transform = 'translate(' + cur.x + 'px,' + cur.y + 'px)';
    ring.style.borderRadius = cur.r + 'px';
    placeTops();
    ring.classList.add('on');
    raf = t < until ? requestAnimationFrame(tick) : 0;   // keep following while things around it still move
  }
  // keep the ring locked on for a while longer, without restarting its glide
  function follow(ms){ until = Math.max(until, performance.now() + (ms || FOLLOW_MS)); if(!raf) raf = requestAnimationFrame(tick); }
  function place(el){
    if(el === target){ follow(); return; }   // same item: just keep it locked on
    var a = artOf(el);
    if(a !== art){
      if(cur) front = 1 - front;   // crossfade to the new artwork on the other layer
      layers[front].style.setProperty('--img', a || 'linear-gradient(135deg, #9aa3b5, #5c6478)');
      layers[front].classList.toggle('ring-plain', !a);
      RingColor.tint(ring, a);
      layers[0].classList.toggle('front', front === 0); layers[1].classList.toggle('front', front === 1);
      art = a;
    }
    from = cur && target && visible(target) ? cur : null;   // the first placement (or after a hidden spell) snaps
    target = el; t0 = performance.now();
    setTops(el);
    follow();
  }

  // which item the ring belongs on: the one that gained focus last, once it shows (uncovered); else the current one;
  // else the last focused one that shows
  var wanted = null;
  function choose(){
    if(wanted && wanted.classList.contains('focused') && visible(wanted)) return wanted;
    if(target && target.classList.contains('focused') && visible(target)) return target;
    return lastVisibleFocused();
  }
  function settle(){
    var el = choose();
    if(el) place(el); else { target = null; ring.classList.remove('on'); }
  }

  var mo = new MutationObserver(function(muts){
    muts.forEach(function(m){
      var el = m.target;
      if(el === ring || !el.classList) return;
      if(el.classList.contains('focused') && !(m.oldValue || '').match(/(^|\s)focused(\s|$)/)) wanted = el;
    });
    // several changes land in one batch: wait a frame so layout (a view switch, a dialog opening) has settled
    requestAnimationFrame(settle);
  });
  mo.observe(screen, { subtree:true, attributes:true, attributeFilter:['class'], attributeOldValue:true });
  mo.observe(document.body, { attributes:true, attributeFilter:['class'] });   // pages open dialogs / views with a body class

  // the screen rescales with the window; dialogs and views fade in after their buttons get focus
  window.addEventListener('resize', function(){ if(target){ from = null; follow(); } });
  screen.addEventListener('transitionend', function(){ if(target) follow(300); else settle(); });
  screen.addEventListener('scroll', function(){ if(target) follow(300); }, true);

  // whatever is focused when the page starts
  requestAnimationFrame(settle);
})();
