/*
  hero-video.js: a video behind a page's screen text, over its picture (Sport's matches, News's CNN, District 9 on the
  Movie page and its detail page; Home keeps its own <video>, with the same rule).
    var vid = HeroVideo(hostEl);   // hostEl: the background box; the video fills it, under the box's ::after scrim
    vid.set('video/x.mp4');        // play it (the picture stays underneath until the first frame), or
    vid.set('');                   // nothing: fades out and stops
  The sound rule: muted until the first key press or click (browsers don't allow it sooner), then with sound while it
  shows; muted in another tab and when leaving the page.
*/
window.HeroVideo = function(host){
  var el = document.createElement('video');
  el.className = 'vid'; el.loop = true; el.muted = true; el.playsInline = true; el.preload = 'auto';
  el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s ease;';
  host.appendChild(el);
  var soundOk = false, on = false, cur = '';
  function sync(){ el.muted = !(soundOk && on && !document.hidden); }
  function allow(){ if(!soundOk){ soundOk = true; setTimeout(sync, 0); } }
  el.addEventListener('playing', function(){ if(on) el.style.opacity = '1'; });
  function set(src){
    on = !!src;
    if(!on){ el.style.opacity = '0'; sync(); el.pause(); return; }
    if(src !== cur){ cur = src; el.style.opacity = '0'; el.src = src; }
    else if(!el.paused) el.style.opacity = '1';
    sync();
    el.play().catch(function(){});
  }
  addEventListener('keydown', allow, true);
  addEventListener('pointerdown', allow, true);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', function(){ el.muted = true; });
  return { set:set };
};
