/*
  toast.js: the shared toast (toast.css, Figma "Toast and snackbar"). Every page keeps its own toast(msg), which writes
  the message into its #toast and shows it (.on, Home's .show); this watches that element and shows each new message as
  a toast in the stack, bottom right: the newest on top, at most 3 (a 4th drops the oldest), each with its own timer
  (3.5s; a message with a key hint, "Press …", 7s). Never focusable. Not loaded by the VOD player (player.html), which shows none; the Live TV player uses it.
*/
(function(){
  var src = document.getElementById('toast');
  if(!src) return;
  var box = document.createElement('div');
  box.className = 'toasts'; box.setAttribute('aria-live', 'polite');
  src.parentNode.appendChild(box);
  function items(){ return Array.prototype.filter.call(box.children, function(t){ return !t.classList.contains('out'); }); }
  function restack(){ items().forEach(function(t, i){ t.classList.toggle('p2', i === 1); t.classList.toggle('p3', i === 2); }); }
  function drop(t){
    if(t.classList.contains('out')) return;
    t.classList.add('out'); restack();
    setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 260);
  }
  function push(msg){
    var t = document.createElement('div'); t.className = 'toast-i';
    t.innerHTML = '<i></i><p></p>'; t.querySelector('p').textContent = msg;
    box.insertBefore(t, box.firstChild);
    var all = items(); if(all.length > 3) drop(all[all.length - 1]);   // a 4th: the oldest goes, whatever its time left
    restack();
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ t.classList.add('in'); }); });
    setTimeout(function(){ drop(t); }, /\bPress\b/i.test(msg) ? 7000 : 3500);
  }
  // a new message: the page wrote text and showed it (one batch of changes, so one toast per call of its toast())
  new MutationObserver(function(){
    var shown = src.classList.contains('on') || src.classList.contains('show'), msg = src.textContent.trim();
    if(shown && msg) push(msg);
  }).observe(src, { attributes:true, attributeFilter:['class'], childList:true, characterData:true, subtree:true });
})();
