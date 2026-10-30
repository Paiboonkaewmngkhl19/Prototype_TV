/*
  Top 10 rank numerals (Home's "Top 10 in Thailand Today", Movie's "Top 10"), with top10.css.
  Figma "2 (Stroke)" (PLAY-player 1326:9848): a translucent glass numeral 240px tall (Plus Jakarta Sans ExtraBold, so the
  page loads that font at weight 800) behind the poster, two gradient fills plus a soft inner shadow, outlined in 0.3px
  white. The font builds some digits from overlapping contours, so a plain stroke would show seams
  inside the "3" etc.: instead a 0.6px stroke is masked to outside the glyph, leaving a clean 0.3px outer outline.

    Top10.defs()        the shared gradients and filter, once per page (an invisible <svg>)
    Top10.numeral(n)    one numeral's <svg class="rank-num">, first inside its <div class="rank-wrap">
    Top10.layout(root)  sizes every numeral under root to its ink and sets its wrap's left padding (how far the poster
                        overlaps it); call again once the font has loaded (Top10.ready(fn) does both)
*/
(function(){
  var FONT = 'font-family="Plus Jakarta Sans" font-weight="800"';
  function defs(){
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      // white, fading from 40% at the digit's top to 10% at its bottom: drawn over the digit's own ink (it is 240px tall,
      // its baseline at y=285, so y 45 to 285), not over the font's whole line box, so the fade shows as in Figma
      '<linearGradient id="rankNumTone" gradientUnits="userSpaceOnUse" x1="0" y1="45" x2="0" y2="285"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>' +
      // the glass rim: an edge that catches the light at the top (white 75%) and fades out towards the bottom (8%)
      '<linearGradient id="rankNumRim" gradientUnits="userSpaceOnUse" x1="0" y1="45" x2="0" y2="285"><stop offset="0" stop-color="#fff" stop-opacity=".75"/>' +
        '<stop offset=".45" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>' +
      // ... brighter on the focused poster's numeral
      '<linearGradient id="rankNumRimOn" gradientUnits="userSpaceOnUse" x1="0" y1="45" x2="0" y2="285"><stop offset="0" stop-color="#fff"/>' +
        '<stop offset=".5" stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>' +
      // inner shadow (Figma): light grey at 10%, 3.1px down, 7.8px blur
      '<filter id="rankNumGlass" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">' +
        '<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>' +
        '<feOffset dy="3.1"/><feGaussianBlur stdDeviation="7.8"/>' +
        '<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 .852 0 0 0 0 .852 0 0 0 0 .852 0 0 0 .1 0"/>' +
        '<feBlend mode="normal" in2="SourceGraphic"/></filter>' +
    '</defs></svg>';
  }
  function numeral(n){
    return '<svg class="rank-num" data-n="' + n + '" aria-hidden="true">' +
      // shading across the digit: black at 85% of its width, fading to faint grey by 61% (Figma); its x is set by layout()
      '<defs><linearGradient id="rankNumShade' + n + '" class="rn-shade" gradientUnits="userSpaceOnUse" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#393939" stop-opacity=".2"/></linearGradient>' +
      '<mask id="rankMask' + n + '" maskUnits="userSpaceOnUse" x="-50" y="-50" width="600" height="500">' +
        '<rect x="-50" y="-50" width="600" height="500" fill="#fff"/>' +
        '<text ' + FONT + ' fill="#000">' + n + '</text></mask></defs>' +
      '<g class="rn-fill" filter="url(#rankNumGlass)">' +
        '<text ' + FONT + ' fill="url(#rankNumTone)" fill-opacity=".5">' + n + '</text>' +
        '<text ' + FONT + ' fill="url(#rankNumShade' + n + ')" fill-opacity=".4">' + n + '</text>' +
      '</g>' +
      '<text ' + FONT + ' class="rn-line" fill="none" stroke="url(#rankNumRim)" mask="url(#rankMask' + n + ')">' + n + '</text>' +
    '</svg>';
  }
  function layout(root){
    var ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '800 400px "Plus Jakarta Sans"';
    (root || document).querySelectorAll('.rank-num').forEach(function(svg){
      var n = svg.dataset.n, m = ctx.measureText(n);
      var k = 240 / m.actualBoundingBoxAscent;              // digit ink height 240px, as in Figma
      // "10": its digits pulled 36px closer together, so the 0 sits near the 1 (letter-spacing on the numeral's texts)
      var tight = n.length > 1 ? -36 : 0;
      svg.style.letterSpacing = tight + 'px';
      var inkW = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) * k + tight;
      svg.querySelectorAll('text').forEach(function(t){
        t.setAttribute('font-size', (400 * k).toFixed(1));
        t.setAttribute('x', (m.actualBoundingBoxLeft * k).toFixed(1));
        t.setAttribute('y', 285);
      });
      var sh = svg.querySelector('.rn-shade');
      sh.setAttribute('x1', (inkW * .85).toFixed(1)); sh.setAttribute('x2', (inkW * .61).toFixed(1));
      svg.setAttribute('width', Math.ceil(inkW));
      svg.setAttribute('height', 330);
      // the poster overlaps the numeral's last 20px (one digit capped at 169px); "10" sits further under it (60px), closer to
      // its poster; "1" is all stem on the right, so it isn't overlapped at all and keeps 28px clear of its poster (room for
      // the poster's 8% growth and its focus ring)
      svg.parentElement.style.paddingLeft = Math.round(n === '1' ? inkW + 28 : n.length > 1 ? inkW - 60 : Math.min(169, inkW - 20)) + 'px';
    });
  }
  // lay out now and again once the numeral font has arrived (then fn, e.g. to re-place a focus ring)
  function ready(root, fn){
    layout(root);
    if(document.fonts) document.fonts.load('800 400px "Plus Jakarta Sans"').then(function(){ layout(root); if(fn) fn(); });
  }
  window.Top10 = { defs:defs, numeral:numeral, layout:layout, ready:ready };
})();
