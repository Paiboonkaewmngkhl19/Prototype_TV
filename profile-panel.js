/*
  Profile panel, as on Home (home.html, Figma "profilePanel" 430:137036): drops down under the top bar's profile photo
  while the photo has focus: the profile card, My Account, then Settings, Help & Support and Exit AIS PLAY.
  Down / Enter on the photo go into it, Up from My Account (or Back) comes out; Left / Right stay in it.

  Shared by the pages with Home's top bar (sport.html, store.html). The page keeps its own focus model and asks:
    var prof = ProfilePanel(profileEl, { paint:paint, toast:toast });
    - first thing in its keydown:  if(prof.key(e.key)){ e.preventDefault(); return; }
    - in its paint():             var inProf = prof.paint(onPhoto);   // onPhoto: the top bar's photo has focus
                                  and items get `focused` only while !inProf (the panel's button has it then)
*/
(function(){
  var css =
    '.prof-panel{ position:absolute; left:110px; top:100px; width:402px; box-sizing:border-box; padding:24px; border-radius:24px;' +
    '  background:radial-gradient(600px 460px at 85% 110%, var(--th-glow, rgba(214,222,240,.12)), transparent 70%), var(--bg-0);' +
    '  box-shadow:inset 0 0 0 1px rgba(214,222,240,.14), 0 12px 32px rgba(0,0,0,.5);' +
    '  display:flex; flex-direction:column; gap:32px; overflow:hidden; font-family:"Open Sans", sans-serif;' +
    '  opacity:0; translate:0 -12px; pointer-events:none; transition:opacity .22s cubic-bezier(.2,0,0,1), translate .22s cubic-bezier(.2,0,0,1); }' +
    '.topnav.prof-open .prof-panel{ opacity:1; translate:0 0; pointer-events:auto; }' +
    '.prof-top{ display:flex; flex-direction:column; gap:16px; }' +
    '.prof-card{ display:flex; align-items:center; gap:8px; padding:16px; border-radius:16px;' +
    '  background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0) 45%), linear-gradient(160deg, #3a4254 0%, #2a3040 55%, #1f2533 100%);' +
    '  box-shadow:inset 0 0 0 1px rgba(214,222,240,.22), inset 0 1px 0 rgba(255,255,255,.18), 0 12px 32px rgba(0,0,0,.5), 0 0 40px rgba(214,222,240,.10); }' +
    '.prof-ava{ position:relative; width:80px; height:80px; border-radius:100px; flex:0 0 auto; overflow:hidden; background:#404045; }' +
    '.prof-ava img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }' +
    '.prof-info{ flex:1; min-width:0; display:flex; flex-direction:column; gap:8px; }' +
    '.prof-name-row{ display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }' +
    '.prof-name{ flex:1; min-width:0; font-weight:500; font-size:24px; color:#e8e8e8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }' +
    '.prof-chip{ height:24px; padding:2px 10px; box-sizing:border-box; border-radius:999px; background:rgba(255,255,255,.16); display:flex; align-items:center;' +
    '  font-weight:700; font-size:11px; line-height:1.4; color:#e8e8e8; white-space:nowrap; flex:0 0 auto; }' +
    '.prof-acc{ font-size:14px; color:#a8a8a8; white-space:nowrap; }' +
    '.prof-net{ font-size:12px; color:#a8a8a8; white-space:nowrap; }' +
    '.prof-div{ display:block; width:354px; height:1px; opacity:.6; }' +
    '.prof-menu{ display:flex; flex-direction:column; gap:16px; }' +
    '.prof-btn{ position:relative; height:56px; box-sizing:border-box; padding:16px; border-radius:9999px; display:flex; align-items:center; gap:8px; cursor:pointer;' +
    '  background:transparent; box-shadow:inset 0 0 0 2px rgba(255,255,255,.16);' +
    '  font-weight:700; font-size:16px; line-height:24px; color:#f0f0f0; white-space:nowrap; transition:background .2s ease; }' +
    '.prof-btn .ic{ position:relative; width:24px; height:24px; flex:0 0 auto; }' +
    '.prof-btn .ic img{ display:block; width:24px; height:24px; }' +
    '.prof-btn .ic img.tint{ filter:brightness(0) invert(.94); }' +
    '.prof-btn .ic .dot{ position:absolute; right:-1px; top:-1px; width:8px; height:8px; }' +
    '.prof-btn .lbl{ position:relative; }' +
    '.prof-btn.focused{ background:linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 60%), var(--th-pill); box-shadow:none; color:#fff; }' +
    '.prof-btn.focused .lbl{ text-shadow:0 1px 4px rgba(0,0,0,.35); }' +
    '.topnav .profile.open{ box-shadow:0 0 0 4px rgba(255,255,255,.22); }';

  var html =
    '<div class="prof-top">' +
      '<div class="prof-card">' +
        '<div class="prof-ava"><img src="icons/profile-tv.png" alt=""></div>' +
        '<div class="prof-info">' +
          '<div class="prof-name-row"><div class="prof-name">User</div><div class="prof-chip">Not Linked</div></div>' +
          '<div class="prof-acc">Account: 88X XXX XXXX</div>' +
          '<div class="prof-net">AIS Fibre</div>' +
        '</div>' +
      '</div>' +
      '<div class="prof-btn" data-act="account"><span class="ic"><img src="icons/profile/icon-account.svg" alt=""></span><span class="lbl">My Account</span></div>' +
    '</div>' +
    '<img class="prof-div" src="icons/profile/divider.svg" alt="">' +
    '<div class="prof-menu">' +
      '<div class="prof-btn" data-act="settings"><span class="ic"><img class="tint" src="icons/profile/icon-settings.svg" alt=""><img class="dot" src="icons/profile/badge.svg" alt=""></span><span class="lbl">Settings</span></div>' +
      '<div class="prof-btn" data-act="help"><span class="ic"><img class="tint" src="icons/profile/icon-help.svg" alt=""></span><span class="lbl">Help &amp; Support</span></div>' +
      '<div class="prof-btn" data-act="exit"><span class="ic"><img class="tint" src="icons/profile/icon-exit.svg" alt=""></span><span class="lbl">Exit AIS PLAY</span></div>' +
    '</div>';

  window.ProfilePanel = function(profileEl, opts){
    if(!document.getElementById('prof-panel-css')){
      var st = document.createElement('style');
      st.id = 'prof-panel-css'; st.textContent = css;
      document.head.appendChild(st);
    }
    var panel = document.createElement('div');
    panel.className = 'prof-panel'; panel.setAttribute('aria-hidden', 'true'); panel.innerHTML = html;
    profileEl.insertAdjacentElement('afterend', panel);
    var nav = profileEl.parentElement, btns = Array.prototype.slice.call(panel.querySelectorAll('.prof-btn'));
    var at = -1, on = false;   // at: the focused button in the panel (-1: focus is not in it); on: the photo has focus

    function act(b){
      if(b.dataset.act === 'exit'){ location.href = 'launcher.html'; return; }
      opts.toast(b.textContent.trim() + ' isn\'t part of this prototype yet');
    }
    btns.forEach(function(b, i){ b.addEventListener('click', function(e){ e.stopPropagation(); at = i; opts.paint(); act(b); }); });

    return {
      // the page's paint: open while the photo (or something in the panel) has focus; true while focus is in the panel
      paint:function(onPhoto){
        on = onPhoto;
        if(!on) at = -1;
        nav.classList.toggle('prof-open', on);
        profileEl.classList.toggle('open', at >= 0);
        panel.setAttribute('aria-hidden', on ? 'false' : 'true');
        btns.forEach(function(b, i){ b.classList.toggle('focused', i === at); });
        return at >= 0;
      },
      // keys while the photo or its panel has focus; true when handled
      key:function(k){
        if(!on) return false;
        if(at < 0){
          if(k === 'ArrowDown' || k === 'Enter'){ at = 0; opts.paint(); return true; }
          return false;
        }
        if(k === 'ArrowDown') at = Math.min(btns.length - 1, at + 1);
        else if(k === 'ArrowUp') at--;   // up from My Account: back on the photo
        else if(k === 'Enter'){ act(btns[at]); return true; }
        else if(k === 'Escape' || k === 'Backspace') at = -1;
        else return true;   // Left / Right stay in the panel
        opts.paint(); return true;
      }
    };
  };
})();
