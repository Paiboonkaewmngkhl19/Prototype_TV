/*
  A toggle icon button on the detail pages (movie-detail.html, short-detail.html: My List, Favorite, Remind, Like,
  Dislike): its outline icon, filled while it is on, and the Live TV player's favourite animation when it changes (on:
  the icon pops, with a ring and sparks; off: a small dip). The button carries data-label (the name below) and the
  class `on` while selected; the styles are button-theme.css's (.tv-btn img.pop / .icon-burst).
    IconToggle.paint(btn)    its icon for its state
    IconToggle.pop(btn, on)  the animation for the change (call after toggling `on`)
*/
window.IconToggle = (function(){
  var ICONS = {
    'My List':['icons/detail-plus.svg', 'icons/detail-check.svg'],
    'Favorite':['icons/tv-guide/heart.svg', 'icons/tv-guide/heart-fill.svg'],
    'Remind':['icons/tv-guide/bell.svg', 'icons/tv-guide/notify.svg'],
    'Like':['icons/detail-like.svg', 'icons/detail-like-fill.svg'],
    'Dislike':['icons/detail-dislike.svg', 'icons/detail-dislike-fill.svg']
  };
  function paint(btn){
    var i = ICONS[btn.dataset.label], img = btn.querySelector('img');
    if(i && img) img.src = i[btn.classList.contains('on') ? 1 : 0];
  }
  function pop(btn, on){
    paint(btn);
    var img = btn.querySelector('img'); if(!img) return;
    img.classList.remove('pop', 'unpop'); void img.offsetWidth;   // restart it
    img.classList.add(on ? 'pop' : 'unpop');
    if(!on) return;
    var b = document.createElement('span'); b.className = 'icon-burst';
    b.innerHTML = '<span class="ring"></span>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function(a){ return '<i style="--a:' + a + 'deg"></i>'; }).join('');
    btn.appendChild(b); setTimeout(function(){ b.remove(); }, 700);
  }
  return { paint:paint, pop:pop };
})();
