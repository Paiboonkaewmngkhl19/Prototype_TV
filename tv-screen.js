/*
  tv-screen.js: every page is a 1920x1080 TV screen (#screen) in a frame (#frame) scaled to fit the window, centred.
  Load it on any page that has them; it fits now and on every resize.
*/
(function(){
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');
  if(!frame || !screen) return;
  function fit(){
    var k = Math.min(innerWidth / 1920, innerHeight / 1080);
    frame.style.width = 1920 * k + 'px'; frame.style.height = 1080 * k + 'px';
    frame.style.marginLeft = -960 * k + 'px'; frame.style.marginTop = -540 * k + 'px';
    screen.style.transform = 'scale(' + k + ')';
  }
  addEventListener('resize', fit); fit();
})();
