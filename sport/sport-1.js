
(function(){
  // ---- fit the 1920x1080 screen into the window ----
  var frame = document.getElementById('frame'), screen = document.getElementById('screen');

  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function attrs(o){ return Object.keys(o).filter(function(k){ return o[k] != null; }).map(function(k){ return ' data-' + k + '="' + esc(o[k]) + '"'; }).join(''); }

  /* ---------- content ----------
     Pictures are the project's own sport stills; items with no matching picture keep Figma's placeholder (ph). */
  var LS = 'tv-features-test/live-stream-assets/', PS = 'posters_portrait/sport/';
  // the Main Page's pictures (sport-assets/main-page/sportMainPage_<rail>_No<n>): the card's, with its text, and -2 the
  // same picture clean, for the screen behind (cardOnly: no clean one yet, so the item's own bg, else the card's)
  function mp(rail, n, o, cardOnly){
    var b = 'sport-assets/main-page/sportMainPage_' + rail + '_No' + n;
    o.img = b + '.webp'; o.bg = o.bg || b + (cardOnly ? '' : '-2') + '.webp';
    return o;
  }
  // the sport channels by their TV Guide names (tv); name, number, crown and logo come from channels-data.js, so they
  // match the TV Guide. n / fit here: only where this page shows them its own way
  var CH = {
    play:  {tv:'PLAY SPORTS (Football)', v:'video/football.mp4'},
    mutv:  {tv:'MUTV', v:'video/football.mp4'},
    rm:    {tv:'Real Madrid TV', v:'video/football.mp4'},
    ws:    {tv:'W-Sports', v:'video/football.mp4'},
    ag902: {tv:'Asian Games 902', n:'Asian Games', fit:'contain', v:'video/football.mp4'},
    ag907: {tv:'Asian Games 907', n:'Asian Games', fit:'contain', v:'video/football.mp4'},
    nba:   {tv:'PLAY SPORTS (NBA)', v:'video/football.mp4'},
    nfl:   {tv:'PLAY SPORTS (NFL)', v:'video/football.mp4'}
  };
  function mkCh(c){
    var d = TV.byName(c.tv);
    c.n = c.n || d.n; c.no = String(d.no); c.crown = d.crown || ''; c.logo = TV.logoSrc(d);
    c.fit = c.fit || (d.logo ? d.fit : 'cover'); c.bg = d.bg || ''; c.d = d;   // d: the TV Guide channel, whose logo disc the cards show
    return c;
  }
  Object.keys(CH).forEach(function(k){ mkCh(CH[k]); });
  // a match Home's Live and Upcoming also has (content.js LIVE, by its title): the same LIVE / Upcoming, channel, time,
  // words and pictures here, so a match never shows two ways
  function sync(m){
    var p = !m.synced && window.LIVE.find(m.t);
    if(!p) return m;
    var c = Object.keys(CH).map(function(k){ return CH[k]; }).filter(function(c){ return c.tv === p.tv; })[0] || mkCh({tv:p.tv});
    m.live = !!p.live; m.when = p.live ? '' : p.when; m.ch = c; m.time = window.LIVE.range(p); m.d = p.d; m.img = p.img; m.bg = p.bg || p.img; m.video = p.v;
    m.synced = 1;
    return m;
  }
  var MATCH_DESC = 'Live from the UEFA Champions League. Every touch in Full HD with Thai and English commentary, plus the build-up and post-match analysis.';
  // sp: a sport's own Live and Upcoming takes its matches from here (NBA and NFL: All Sports only)
  var LIVE = window.LIVE.list.filter(function(p){ return p.sportRail; }).map(function(p){ return {sp:p.sp, t:p.t}; });   // sync() fills in the rest
  var UCL = [
    mp('UCL', 1, {t:'Bayern München vs Arsenal', live:true, ch:CH.play, time:'02:00 – 04:00'}, 1),
    mp('UCL', 2, {t:'Real Madrid vs RB Leipzig', live:true, ch:CH.rm, time:'02:00 – 04:00'}, 1),
    mp('UCL', 3, {t:'Inter Milan vs Shakhtar Donetsk', when:'Tomorrow 02:45', ch:CH.play, time:'02:45 – 04:45'}, 1),
    mp('UCL', 4, {t:'Aston Villa vs Viking', when:'Tomorrow 02:45', ch:CH.play, time:'02:45 – 04:45'}, 1),
    mp('UCL', 5, {t:'Club Brugge vs Lens', when:'Tomorrow 15:00', ch:CH.play, time:'15:00 – 17:00'}, 1),
    mp('UCL', 6, {t:'Real Betis vs Feyenoord', when:'Tomorrow 15:00', ch:CH.play, time:'15:00 – 17:00'}, 1)
  ];
  var CHIPS = [
    // sp: the sport each chip filters the rails below by (channels-data.js's tags); All Sports shows everything.
    // only All Sports and Football filter: the other chips take focus (and show their hero) but change nothing below, as
    // there is no content of theirs yet (NOFILTER)
    {t:'All Sports', img:'sport-assets/all-sports-bg.webp', d:'Every sport in one place. Live matches, upcoming fixtures, highlights and documentaries from the leagues you follow.'},
    {t:'Football', sp:'football', img:'sport-assets/football-bg.webp', d:'Champions League, Premier League, Bundesliga and more: live football, full matches and the best goals of the week.'},
    {t:'Motorsports', sp:'motorsport', img:'posters/f1.jpg', d:'Formula 1, MotoGP and World Superbike: every race live, with qualifying, onboard cameras and race replays.'},
    {t:'Golf', sp:'golf', d:'PGA Tour and the majors, live from the first tee to the final putt, with round highlights.'},
    {t:'Basketball', sp:'basketball', d:'NBA and regional leagues: live games, full replays and the plays everyone is talking about.'},
    {t:'Tennis', sp:'tennis', img:'posters/upcoming/u4.png', d:'Grand Slams and tour events: live matches on every court, with daily highlights.'},
    {t:'Rugby', sp:'rugby', d:'International rugby and the top club competitions, live and on replay.'},
    {t:'Boxing', sp:'boxing', d:'Title fights, undercards and classic bouts from the biggest nights in boxing.'}
  ];
  function NOFILTER(i){ return i > 1; }
  var LEAGUES = Leagues.list;   // leagues.js (Store's sport chips show the same logos)
  // followed leagues, as changed this session (the heart on a league's landing page); the rail's discs show it
  var FOLLOW = {}; try { FOLLOW = JSON.parse(sessionStorage.getItem('leagueFollow') || '{}'); } catch(e){}
  LEAGUES.forEach(function(l){ if(l.id in FOLLOW) l.fav = FOLLOW[l.id] ? 1 : 0; });
  // ?league=id: that league's landing page instead of the Sport page
  var LG = (function(id){ return LEAGUES.filter(function(l){ return l.id === id; })[0] || null; })((/[?&]league=([\w-]+)/.exec(location.search) || [])[1]);
  var LATEST = [
    mp('highlight', 1, {t:'Lakers vs Warriors Full Game Highlights', dur:'8m', g:'Basketball · Highlights'}),
    mp('highlight', 2, {t:'Pacers vs Heat Full Game Highlights', dur:'9m', g:'Basketball · Highlights'}),
    mp('highlight', 3, {t:'Como vs Man United Highlights', dur:'6m', g:'Football · Highlights'}),
    mp('highlight', 4, {t:'Paris Saint-Germain vs Barcelona Highlights', dur:'12m', g:'Football · Highlights'}),
    mp('highlight', 5, {t:'Man City vs AEK Athens Highlights', dur:'10m', g:'Football · Highlights'}),
    mp('highlight', 6, {t:'VfB Stuttgart vs Gladbach Highlights', dur:'9m', g:'Football · Highlights'}),
    mp('highlight', 7, {t:'Mainz vs Werder Bremen Highlights', dur:'8m', g:'Football · Highlights'}),
    mp('highlight', 8, {t:'2026 Australian GP Race Highlights', dur:'14m', g:'Motorsport · Highlights'}),
    mp('highlight', 9, {t:'2026 Japanese GP Best Moments', dur:'6m', g:'Motorsport · Highlights'})
  ];
  // what's on now on the sport channels: the TV Guide's own channels (channels-data.js, `tv`), so the card, the TV Guide
  // and the player show the same programme, time, Time Shift and favourite
  // favourites at the very front, from every sports channel (channels-data.js TV.favFirst)
  var EPG = TV.favFirst([CH.play, CH.mutv, CH.rm, CH.ws, CH.ag902].map(function(c){ return {c:c, tv:c.tv}; }), function(e){ return e.tv; },
    TV.CHANNELS.filter(function(d){ return (d.cats || []).indexOf('sports') >= 0; }), function(d){ return {c:{d:d, tv:d.n}, tv:d.n}; });
  TV.reloadOnFavChange();   // back from the player with a favourite changed: the cards in their new order
  // y: which part of the tall poster the 16:9 card shows (background-position %), set so the people stay in frame
  var FOR_YOU = [
    {title:'Football For You', sp:'football', items:[
      mp('footballForYou', 1, {t:'Paris Saint-Germain vs Barcelona Highlights', dur:'12m'}),
      mp('footballForYou', 2, {t:'Como vs Man United Highlights', dur:'6m'}),
      mp('footballForYou', 3, {t:'Bournemouth vs AC Milan Highlights', dur:'9m'}),
      mp('footballForYou', 4, {t:'Lillestrøm vs Real Sociedad Highlights', dur:'10m'}),
      mp('footballForYou', 5, {t:'Arsenal vs Lille Highlights', dur:'8m'}),
      mp('footballForYou', 6, {t:'Villarreal vs Napoli Highlights', dur:'11m'})]},
    {title:'Basketball For You', sp:'basketball', items:[
      mp('basketballForYou', 1, {t:'Lakers vs Warriors Full Game Highlights', dur:'8m'}),
      mp('basketballForYou', 2, {t:'Pacers vs Heat Full Game Highlights', dur:'9m'}),
      mp('basketballForYou', 3, {t:'Pistons vs Knicks Full Game Highlights', dur:'12m'}),
      mp('basketballForYou', 4, {t:'Kings vs Spurs Full Game Highlights', dur:'10m'}),
      mp('basketballForYou', 5, {t:'Cavaliers vs Hawks Full Game Highlights', dur:'9m'}),
      mp('basketballForYou', 6, {t:'Suns vs Thunder Full Game Highlights', dur:'11m'})]},
    {title:'Motorsport For You', sp:'motorsport', items:[
      mp('motorsportsForYou', 1, {t:'2026 Australian GP Race Highlights', dur:'14m'}),
      mp('motorsportsForYou', 2, {t:'2026 Indonesian GP Race Highlights', dur:'13m'}),
      mp('motorsportsForYou', 3, {t:'2026 Japanese GP Best Moments', dur:'6m'}),
      mp('motorsportsForYou', 4, {t:'2026 Austrian GP Race Highlights', dur:'15m'}),
      mp('motorsportsForYou', 5, {t:'2026 San Marino GP Race Highlights', dur:'14m'}),
      mp('motorsportsForYou', 6, {t:'2026 San Marino GP Best Moments', dur:'7m'})]},
    {title:'Golf For You', sp:'golf', items:[
      {t:'Career Grand Slam', dur:'45m', img:PS + 'golf-career-slam.jpg', y:27},
      {t:'Career Grand Slam: Rory McIlroy', dur:'52m', img:PS + 'golf-career-slam-rory.jpg', y:36},
      {t:'Masters Tournament', dur:'64m', img:PS + 'golf-masters.jpg', y:37},
      {t:'Masters Tournament: Final Round', dur:'78m', img:PS + 'golf-masters-final.jpg', y:24},
      {t:'Manors Golf', dur:'24m', img:PS + 'golf-manors.jpg', y:24},
      {t:'Featured Group 2', dur:'60m', img:PS + 'golf-featured-group.jpg', y:7},
      {t:'Grand Slam', dur:'38m', img:PS + 'golf-grand-slam.jpg', y:24}]}
  ];
  // Related Content: the sports films (content.js MD.M: their words), then the Netflix sports documentaries (Figma For
  // PBR 8:11038). sp: the sport chip that shows it; none (Secretariat, The Ascent, Tour de Force): All Sports only
  var DOCS = [
    // the first seven take turns by app (Prime Video, Netflix, HBO Max, Disney+ Hotstar), so every app is in sight at once
    {sp:'motorsport', k:'f1', img:PS + 'rc-f1.webp'}, {sp:'football', k:'mourinho'}, {sp:'basketball', k:'spacejam'}, {k:'secretariat'},
    {sp:'boxing', k:'rocky'}, {sp:'football', k:'beckham'}, {sp:'football', k:'blindside'},
    {sp:'boxing', k:'creed'}, {sp:'football', k:'pele'}, {sp:'basketball', k:'spacejam2'}, {sp:'football', k:'longestyard'},
    {sp:'football', k:'ronaldinho'}, {sp:'football', k:'goal'}, {sp:'football', k:'goal2'},
    {sp:'basketball', t:'Giannis: The Marvelous Journey', img:PS + 'doc-giannis.jpg', plat:'netflix', len:'1h 46m', d:'From selling goods on the streets of Athens to NBA champion: the rise of Giannis Antetokounmpo.'},
    {sp:'basketball', t:'The Rise', img:PS + 'doc-the-rise.jpg', plat:'netflix', len:'1h 38m', d:'One young player\'s fight to make it from the playground courts to the professional game.'},
    {sp:'boxing', t:'The Knockout', img:PS + 'doc-the-knockout.jpg', plat:'netflix', len:'1h 32m', d:'Inside the ring and out: a fighter\'s long road back to a title shot.'},
    {t:'The Ascent', img:PS + 'doc-the-ascent.jpg', plat:'netflix', len:'1h 41m', d:'An ultra-runner sets out to conquer the hardest mountain race on earth.'},
    {sp:'football', t:'Solo Echoes', img:PS + 'doc-solo-echoes.jpg', plat:'netflix', len:'1h 28m', d:'Under empty stadium lights, a footballer faces the season that will define his career.'},
    {t:'Tour de Force', img:PS + 'doc-tour-de-force.jpg', plat:'netflix', len:'1h 52m', d:'Three weeks, 3,400 kilometers and the riders who push past every limit in the Tour de France.'},
    {sp:'tennis', t:'Match Point', img:PS + 'doc-match-point.jpg', plat:'netflix', len:'1h 35m', d:'The tennis stars chasing a Grand Slam, on court and behind the scenes.'}
  ];
  DOCS.forEach(function(d){ if(d.k){ d.t = MD.M[d.k].t; d.img = d.img || MD.M[d.k].p; } });
  var CHANNELS = [
    {t:'AIS PLAY Sports', img:'sport-assets/channel-aisplay.jpg', size:'110%', c:CH.play, tv:CH.play.tv},   // its black disc sits on white: zoomed past the white
    {t:'MUTV', img:CH.mutv.logo, c:CH.mutv, tv:'MUTV'}, {t:'Real Madrid TV', img:CH.rm.logo, contain:1, bg:CH.rm.bg, c:CH.rm, tv:'Real Madrid TV'},
    {t:'W-Sports', img:CH.ws.logo, contain:1, bg:'#404045', c:CH.ws, tv:'W-Sports'},   // on Real Madrid TV's grey
    // the Asian Games logos are full discs already: they fill the circle
    {t:'Asian Games 902', img:CH.ag902.logo, bg:'#fff', c:CH.ag902, tv:'Asian Games 902'},
    {t:'Asian Games 907', img:CH.ag907.logo, bg:'#fff', c:CH.ag907, tv:'Asian Games 907'}
  ];

  /* ---------- what each chip shows below it (Figma Sports: All Sports 3203:107793, Football 3220:64263, Tennis 3220:65693) ----------
     All Sports: League & Tournament, Highlight, the Champions League band, TV Guide, each sport's For You, Short, Related
     Contents. A sport: Live and Upcoming, its leagues, Because You Watched…, its tournament band (when it has one),
     Highlights, the tournament's highlights, TV Guide, the sport's For You, Short, Related Content. Placeholder titles
     (as the Figma's) where there is no content yet. */
  function phv(t, dur, img){ return {t:t, dur:dur, img:img || null}; }
  // a title in content.js (MD.M k): its own name, and its card opens its own detail page
  function phk(k, dur, img){ return {k:k, t:MD.M[k].t, dur:dur, img:img || MD.M[k].b || MD.M[k].p}; }
  function vs(n){ return n + ' Name vs ' + n + ' Name'; }
  var SPORT = {
    football:{ label:'Football', upcoming:LIVE.filter(function(m){ return m.sp === 'football'; }), who:'Manchester United',
      because:[phv('Como vs Manchester United Highlights','6m','sport-assets/main-page/sportMainPage_footballForYou_No2.webp'), phk('mufcars','115m'),
        phv('Sir Alex Ferguson: Never Give In','98m','posters/maxresdefault.jpg'), phk('mufcche','115m'), phv('Liverpool vs Brentford Full Match','11m','posters/liver-ben.jpg'), phv('Arsenal vs Man United Full Match','95m','sport-assets/watch-arsenal-manutd.jpg')],
      // Highlights and Rerun: the Bundesliga's own (LEAGUE_HL, LEAGUE_RERUN below), the same pictures as its landing page
      leagueHl:{t:'Rerun'},
      band:{t:'UEFA Champions League', ucl:1, d:'The road to the final runs through here. Every match of the league phase live, with the knockout draw, highlights and the best goals of each matchday.', matches:UCL},
      forYou:FOR_YOU[0] },
    tennis:{ label:'Tennis', who:'Ben Shelton', ph:'Athlete',
      upcoming:[{t:vs('Athlete'), live:true, ch:CH.play, time:'02:00 – 04:00'}, {t:vs('Athlete'), live:true, ch:CH.play, time:'02:00 – 04:00'}],
      band:{t:'ATP Tour', img:'posters/upcoming/u4.png', d:'The men’s tour from the first round to the Finals: every court live, with the day’s best rallies and the results.',
        matches:[{t:vs('Athlete'), live:true, ch:CH.play, time:'02:00 – 04:00'}, {t:vs('Athlete'), live:true, ch:CH.play, time:'02:00 – 04:00'}]},
      highlights:[phv('F. Cobolli vs A. Zverev Men’s Final Highlights','12m','posters/upcoming/u4.png')], leagueHl:{t:'ATP Tour Highlights'} },
    motorsport:{ label:'Motorsport', who:'Max Verstappen', ph:'Race Title', race:1,
      band:{t:'Formula 1', img:'posters/f1.jpg', d:'Every Grand Prix weekend live: practice, qualifying and the race, with onboard cameras and race replays.'},
      highlights:[phv('Best MotoGP Moments 2026 Japanese GP','6m')], leagueHl:{t:'Formula 1 2026 Highlights'}, forYou:FOR_YOU[2] },
    basketball:{ label:'Basketball', who:'Golden State Warriors', ph:'Basketball Team',
      highlights:[phv('Timberwolves vs Heat Full Game Highlights','8m','sport-assets/hl-basketball.jpg')], leagueHl:{t:'NBA 25/26 Highlights'}, forYou:FOR_YOU[1],
      because:[phv('Knicks vs Spurs (Game 3)','98m','sport-assets/watch-knicks-spurs-g3.jpg'), phv('Spurs vs Knicks (Game 2)','96m','sport-assets/watch-spurs-knicks-g2.jpg')] },
    golf:{ label:'Golf', who:'Scottie Scheffler', ph:'Player', race:1, leagueHl:{t:'PGA Tour Highlights'}, forYou:FOR_YOU[3],
      because:[phv('Austrian Alpine Open: Final Round Highlights','12m','sport-assets/watch-austrian-open.jpg')] },
    rugby:{ label:'Rugby', who:'All Blacks', ph:'Rugby Team', leagueHl:{t:'Rugby Championship Highlights'} },
    boxing:{ label:'Boxing', who:'Canelo Álvarez', ph:'Boxer', leagueHl:{t:'Fight Night Highlights'} }
  };
  // a league's own Highlights on its landing page (else its sport's): Bundesliga, Matchdays 7 and 6
  var BL = 'sport-assets/bundesliga/';
  var LEAGUE_HL = {
    bundesliga:[phv('Borussia Dortmund vs Eintracht Frankfurt Highlights','8m',BL + 'hl-md7-bvb-sge.webp'),
      phv('FC Augsburg vs Union Berlin Highlights','7m',BL + 'hl-md7-fca-fcu.webp'),
      phv('SC Paderborn vs Hamburger SV Highlights','6m',BL + 'hl-md7-scp-hsv.webp'),
      phv('RB Leipzig vs SV Elversberg Highlights','9m',BL + 'hl-md7-rbl-sve.webp'),
      phv('SC Freiburg vs Bayern München Highlights','10m',BL + 'hl-md7-scf-fcb.webp'),
      phv('TSG Hoffenheim vs Bayer Leverkusen Highlights','8m',BL + 'hl-md7-tsg-b04.webp'),
      phv('Bayern München vs RB Leipzig Highlights','12m',BL + 'hl-md6-fcb-rbl.webp'),
      phv('SV Elversberg vs FC Augsburg Highlights','11m',BL + 'hl-md6-sve-fca.webp'),
      phv('Schalke 04 vs Mainz 05 Highlights','6m',BL + 'hl-md6-s04-m05.webp'),
      phv('Werder Bremen vs SC Paderborn Highlights','9m',BL + 'hl-md6-svw-scp.webp')]
  };
  // a league's own Rerun (full matches) on its landing page (else its sport's For You)
  var LEAGUE_RERUN = {
    bundesliga:[phv('Mainz 05 vs Werder Bremen Full Match','96m',BL + 'rerun-md7-m05-svw.webp'),
      phv('Borussia Dortmund vs Eintracht Frankfurt Full Match','98m',BL + 'rerun-md7-bvb-sge.webp'),
      phv('SC Paderborn vs Hamburger SV Full Match','95m',BL + 'rerun-md7-scp-hsv.webp'),
      phv('RB Leipzig vs SV Elversberg Full Match','97m',BL + 'rerun-md7-rbl-sve.webp'),
      phv('SC Freiburg vs Bayern München Full Match','99m',BL + 'rerun-md7-scf-fcb.webp'),
      phv('TSG Hoffenheim vs Bayer Leverkusen Full Match','96m',BL + 'rerun-md7-tsg-b04.webp'),
      phv('Bayern München vs RB Leipzig Full Match','98m',BL + 'rerun-md6-fcb-rbl.webp')]
  };
  // a league's own Moments of the Week on its landing page (else its sport's league highlights)
  var LEAGUE_MOMENTS = {
    bundesliga:[phv('Harry Kane Addresses the Allianz Arena','3m',BL + 'moment-kane-speech.webp'),
      phv('Kane’s Penalty Against Dortmund','2m',BL + 'moment-kane-penalty-bvb.webp'),
      phv('Union Berlin vs 1. FC Köln: The Big Calls','4m',BL + 'moment-fcu-koe.webp'),
      phv('Atubolu’s Saves of the Week','3m',BL + 'moment-atubolu.webp'),
      phv('Olise Scores and Celebrates','2m',BL + 'moment-olise.webp'),
      phv('Dortmund Celebrates in Stuttgart','3m',BL + 'moment-bvb-stuttgart.webp')]
  };
  // a league's own Match Schedule art [This Week (wide), Next Week (tall)]: its words are on the picture, so the tile shows
  // it at full strength without the Match Schedule / week text (else the league's picture, dimmed, under that text)
  var LEAGUE_SCHED = { bundesliga:[BL + 'sched-md8.webp', BL + 'sched-md9.webp'] };
  SPORT.football.highlights = LEAGUE_HL.bundesliga.slice();
  SPORT.football.leagueHl.items = LEAGUE_RERUN.bundesliga.slice();
  // the rest of a sport's rails, from placeholders where it has no content yet
  Object.keys(SPORT).forEach(function(k){
    var S = SPORT[k], t = S.race ? S.ph : vs(S.ph || 'Team'), durs = ['6m','8m','12m','17m','11m','64m'];
    function fill(list, n){ list = (list || []).slice(); while(list.length < n) list.push(phv(t, durs[list.length % durs.length])); return list; }
    if(!S.upcoming) S.upcoming = [{t:t, live:true, ch:CH.play, time:'02:00 – 04:00'}, {t:t, live:true, ch:CH.play, time:'02:00 – 04:00'},
      {t:t, when:'Today 20:30', ch:CH.play, time:'20:30 – 22:30'}, {t:t, when:'Tomorrow 02:30', ch:CH.play, time:'02:30 – 04:30'}];
    if(S.band && !S.band.matches) S.band.matches = S.upcoming;
    S.because = fill(S.because, 5); S.highlights = fill(S.highlights, 5);
    S.leagueHl.items = fill(S.leagueHl.items, 5);
    if(!S.forYou) S.forYou = { title:S.label + ' For You', items:fill([], 6) };
  });
  // the NBA match on now (Figma For PBR 8:10938): first in Basketball's Live and Upcoming, its court as the screen picture
  SPORT.basketball.upcoming.unshift({t:'Minnesota Timberwolves vs Denver Nuggets', live:true, img:'sport-assets/match-min-den.jpg', bg:'sport-assets/match-min-den-bg.jpg',
    ch:CH.play, time:'02:00 – 04:30', d:'A thrilling NBA showdown as the Minnesota Timberwolves take on the Denver Nuggets. Expect fast-paced action, elite scoring, and a battle for every possession.'});

  /* ---------- markup ---------- */
  function thumbStyle(img, y){ return img ? ' style="background-image:url(\'' + img + '\')' + (y != null ? ';background-position:center ' + y + '%' : '') + '"' : ''; }
  function topBadge(it){ return it.live ? '<span class="badge live">LIVE</span>' : '<span class="badge">' + esc(it.when) + '</span>'; }
  function matchCard(it, i, set){
    sync(it);
    return '<div class="card item"' + attrs({kind:'match', set:set, i:i}) + '><div class="thumb' + (it.img ? '' : ' ph') + '" data-ratio="16:9"' + thumbStyle(it.img) + '>' +
      (it.live ? '' : '<span class="top-tag">' + esc(it.when) + '</span>') + (it.ch ? Content.crownIcon({tv:it.ch.tv}, 0, 'crown-tag') : '') + '</div>' +   // premium, not the viewer's yet: the gold crown tag (corner-tag.css)
      (it.live ? '<span class="live-ribbon" data-ring-top="styled">Live</span>' : '') +   // live: Home's Live ribbon
      '<div class="t one">' + esc(it.t) + '</div></div>';
  }
  function vodCard(it, kind, i, set){
    return '<div class="card item"' + attrs({kind:kind, set:set, i:i}) + (it.k ? ' data-k="' + it.k + '"' : '') + '><div class="thumb' + (it.img ? '' : ' ph') + '" data-ratio="16:9"' + thumbStyle(it.img, it.y) + '>' +
      '<span class="dur corner-tag">' + esc(it.dur) + '</span></div><div class="t two">' + esc(it.t) + '</div></div>';
  }
  function epgIcons(o){ return (o.ts ? '<img class="epg-ts" src="icons/tv-guide/timeshift.svg" alt="Time Shift">' : '') + (o.fav ? '<span class="epg-heart"><img src="icons/epg/heart.svg" alt="Favorite"></span>' : ''); }
  // Home's TV Guide card (tvguide-card.css): the channel's logo, what's on now and its progress, then what's next
  function epgCard(e, i){
    var c = e.c, o = TV.onNow(TV.byName(e.tv));
    return '<div class="epg-card tv-glass item"' + attrs({kind:'epg', i:i}) + ' data-ring-art=""><div class="epg-now">' +
      TV.logoHtml(c.d, 'epg-avatar round') +
      '<div class="epg-prog-data"><div class="epg-title">' + esc(o.now.t) + '</div><div class="epg-sub">Started at ' + o.startedAt + '</div></div>' +
      '<span class="epg-icons">' + epgIcons(o) + '</span>' +
      '<div class="progress"><i style="width:' + o.pct + '%"></i></div></div>' +
      '<div class="epg-next"><div class="epg-title">' + esc(o.next.t) + '</div><div class="epg-sub">Starts at ' + o.nextAt + '</div></div></div>';
  }
  // back from the player: the sport that was picked
  // a landing page keeps its own place (coming back to it, or to the Sport page under it, each lands where it was)
  var RKEY = LG ? 'sportLeagueReturn' : 'sportReturn', FKEY = LG ? 'sportLeagueFocus:' + LG.id : 'sportFocus';
  var RETURNING = !!sessionStorage.getItem(RKEY), PICK = 0;
  try { if(RETURNING) PICK = +(sessionStorage.getItem('sportPick') || 0) || 0; } catch(e){}
  if(NOFILTER(PICK)) PICK = 0;
  var html = '';
  if(LG) document.body.classList.add('landing');
  if(!LG) html += '<section class="sec" data-row="live"><div class="rail"><div class="track">' + LIVE.map(function(it, i){ return matchCard(it, i, 'live'); }).join('') + '</div></div></section>';
  if(!LG) html += '<section class="sec" data-row="chips"><div class="rail"><div class="chips">' + CHIPS.map(function(c, i){
    return '<div class="chip item' + (i === PICK ? ' sel' : '') + '"' + attrs({kind:'chip', i:i}) + ' data-ring-art="">' + esc(c.t) + '</div>';
  }).join('') + '</div></div></section>';
  // the rails below the chips, for the sport picked ('' = All Sports). SETS: each rail's items by set name, for the screen
  // text and Enter
  var SETS = { live:LIVE }, SHOWN_LEAGUES = LEAGUES, BAND = SPORT.football.band, sportCur = '';
  // a card without a picture yet borrows the first picture in its rail (else its sport's), until its own art is added
  var SPORT_PIC = { football:LS + 'football-024.jpg', tennis:'posters/upcoming/u4.png', motorsport:'posters/f1.jpg', basketball:'posters/all.jpg',
    golf:'posters/all.jpg', rugby:'posters/all.jpg', boxing:'posters/all.jpg', '':LS + 'football-024.jpg' };
  function withPics(list, fallback){
    var first = null; list.forEach(function(it){ if(!first && it.img) first = it.img; });
    return list.map(function(it){ return it.img ? it : Object.assign({}, it, { img:first || fallback || SPORT_PIC[sportCur] }); });
  }
  function vodSec(key, title, list, sp){
    list = withPics(list, sp ? SPORT_PIC[sp] : null);
    SETS[key] = list;
    return '<section class="sec" data-row="' + key + '"><h2 class="sec-title">' + esc(title) + '</h2><div class="rail" style="margin-top:32px"><div class="track">' +
      list.map(function(it, i){ return vodCard(it, 'vod', i, key); }).join('') + '</div></div></section>';
  }
  function matchSec(key, title, list){
    list = withPics(list);
    SETS[key] = list;
    return '<section class="sec" data-row="' + key + '"><h2 class="sec-title">' + esc(title) + '</h2><div class="rail" style="margin-top:32px"><div class="track">' +
      list.map(function(it, i){ return matchCard(it, i, key); }).join('') + '</div></div></section>';
  }
  function leaguesSec(list){
    if(!list.length) return '';   // a sport with no leagues: no empty rail to land on
    SHOWN_LEAGUES = list;
    return '<section class="sec" data-row="leagues"><h2 class="sec-title">League &amp; Tournament</h2><div class="rail"><div class="leagues">' + list.map(function(l, i){
      var pic = Leagues.pic(l);   // leagues.js
      return '<div class="league"><div class="disc item' + (l.fav ? ' followed' : '') + '"' + attrs({kind:'league', i:i}) + '>' + pic +
        '<span class="dfav" data-ring-top="styled"><i><img src="icons/tv-guide/heart-fill.svg" alt="Following"></i></span></div><div class="name">' + l.name + '</div></div>';
    }).join('') + '</div></div></section>';
  }
  // the tournament band: the Champions League's own artwork, or a plain picture for the others; its matches under the text
  function bandSec(b){
    BAND = b; SETS.ucl = withPics(b.matches, b.img);
    var back = b.ucl ? '<div class="back"><div class="inner">' +
      '<img class="art full" src="sport-assets/ucl-band-bg.webp" alt="">' +
      '<div class="glow" style="left:-417.44px;top:-697.17px;width:2056.26px;height:1424.171px"><div style="transform:rotate(-14.2deg)"><div style="position:relative;width:1869px;height:996px">' +
        '<img src="sport-assets/ucl-ring-1.svg" alt="" style="left:-1240px;top:-1240px;width:4349px;height:3476px"></div></div></div>' +
      '<div class="glow" style="left:-195.49px;top:-421.98px;width:2674.459px;height:1698.144px"><div style="transform:rotate(15.99deg)"><div style="position:relative;width:2479.497px;height:1056.018px">' +
        '<img src="sport-assets/ucl-ring-2.svg" alt="" style="left:-1183.96px;top:-1184.03px;width:4847.4px;height:3424.1px"></div></div></div>' +
      '</div></div>'
      : '<div class="back"><div class="inner"><img class="art" src="' + b.img + '" alt=""></div></div>';
    return '<section class="sec ucl' + (b.ucl ? '' : ' plain') + '" data-row="ucl">' + back +
      '<div class="text"><h2>' + esc(b.t) + '</h2><p>' + esc(b.d) + '</p></div>' +
      '<div class="row"><div class="track">' + SETS.ucl.map(function(it, i){ return matchCard(it, i, 'ucl'); }).join('') +
      (b.ucl ? '<div class="uclava item" data-kind="uclava" data-ring-art="url(\'sport-assets/ucl-avatar.jpg\')"></div>' : '') + '</div></div></section>';
  }
  function guideSec(){
    return '<section class="sec" data-row="guide"><div class="rail"><div class="track" style="padding-top:0;padding-bottom:0">' +
      '<div class="epg-countdown tv-chip item" data-kind="guideall" data-ring-art=""><b>TV Guide</b><span>View All</span></div>' +
      EPG.map(epgCard).join('') + '</div></div></section>';
  }
  // the sport picked: its titles; a sport with none (Golf, Rugby) and All Sports: all of them
  function shownDocs(){
    var mine = DOCS.filter(function(d){ return d.sp === sportCur; });
    return sportCur && mine.length ? mine : DOCS;
  }
  function docsSec(){
    return '<section class="sec docs" data-row="docs"><h2 class="sec-title">Related Content</h2><div class="rail"><div class="track">' + shownDocs().map(function(d){
        // its app's tag bottom-left (platform-tag.css), as the Movie page's posters: a title in content.js its own platform
        var plat = d.k ? MD.M[d.k].plat : d.plat;
        var tag = !plat ? '' : plat === 'ais' ? '<span class="ptag ais"></span>' : '<img class="ptag" src="badges/tag-' + plat + '.png" alt="">';
        return '<div class="poster item"' + attrs({kind:'doc', i:DOCS.indexOf(d)}) + (d.k ? ' data-k="' + d.k + '"' : '') + ' style="background-image:url(\'' + d.img + '\')">' + tag + '</div>';
      }).join('') + '</div></div></section>';
  }
  function totopSec(){ return '<section class="sec totop" data-row="totop"><div class="tv-btn tv-btn--primary tv-btn--top item" data-kind="totop" data-ring-art=""><i></i>Back to Top</div></section>'; }
  function tailSecs(){
    return docsSec() + totopSec();
  }
  /* ---------- a league's landing page (?league=; Figma Sports 3011:44457): its name, synopsis and follow heart over its
     picture, then its Live and Upcoming, Highlights, Rerun, Moments of the Week, the Match Schedule tiles (the Short
     Highlight tiles' look), Related Content and the other leagues; the plain page, no dynamic background ---------- */
  function landingHtml(l){
    var sched = LEAGUE_SCHED[l.id];
    function schedTile(size, week, n){
      var img = sched ? sched[n] : pic;
      return '<div class="short ' + size + ' sched' + (sched ? ' art' : '') + ' item" data-kind="sched" data-label="Match Schedule: ' + week + '" style="--img:url(\'' + img + '\')">' +
        (sched ? '' : '<div class="sl"><b>Match Schedule</b><i>' + week + '</i></div>') + '</div>';
    }
    var S = SPORT[l.sp] || SPORT.football, pic = l.img || SPORT_PIC[l.sp] || SPORT_PIC[''];   // (a sport without its own rails: Football's)
    sportCur = SPORT[l.sp] ? l.sp : '';
    var live = withPics(l.id === 'ucl' ? UCL : S.upcoming, pic), rerun = LEAGUE_RERUN[l.id] || (S.forYou || {}).items || S.because;
    SETS = { live:live };
    var d = l.id === 'ucl' ? SPORT.football.band.d : 'Every ' + l.t + ' match live, with full replays, the week’s best moments and the fixtures still to come.';
    return '<section class="sec lhero" data-row="lhero"><div class="lbg" style="background-image:url(\'' + pic + '\')"></div>' +
        '<div class="ltext"><h1>' + esc(l.t) + '</h1><p>' + esc(d) + '</p>' +
        '<div class="tv-btn tv-btn--secondary ic lfav item' + (l.fav ? ' on' : '') + '" data-kind="lfav" data-label="Favorite" data-ring-art=""><img src="icons/tv-guide/heart' + (l.fav ? '-fill' : '') + '.svg" alt="Follow">' +
          '<span class="tip">' + (l.fav ? 'Remove from Favorites' : 'Add to Favorites') + '</span></div></div></section>' +
      '<section class="sec" data-row="live"><div class="rail"><div class="track">' + live.map(function(it, i){ return matchCard(it, i, 'live'); }).join('') + '</div></div></section>' +
      vodSec('highlights', 'Highlights', LEAGUE_HL[l.id] || S.highlights, l.sp) + vodSec('rerun', 'Rerun', rerun, l.sp) + vodSec('moments', 'Moments of the Week', LEAGUE_MOMENTS[l.id] || S.leagueHl.items, l.sp) +
      '<section class="sec" data-row="sched"><div class="shorts">' + schedTile('wide', 'This Week', 0) + schedTile('tall', 'Next Week', 1) + '</div></section>' +
      docsSec() + leaguesSec(LEAGUES.filter(function(x){ return x !== l; })) + totopSec();
  }
  function renderBelow(sp){
    sportCur = sp; SETS = { live:LIVE };
    var h = '';
    if(!sp){
      h += leaguesSec(LEAGUES) + vodSec('latest', 'Highlights', LATEST) + bandSec(SPORT.football.band) + guideSec();
      FOR_YOU.forEach(function(r, ri){ h += vodSec('foryou' + ri, r.title, r.items, r.sp); });
    } else {
      var S = SPORT[sp];
      h += matchSec('upcoming', 'Live and Upcoming', S.upcoming) + leaguesSec(LEAGUES.filter(function(l){ return l.sp === sp; })) +
        vodSec('because', 'Because You Watched ' + S.who, S.because) + (S.band ? bandSec(S.band) : '') +
        vodSec('highlights', 'Highlights', S.highlights) + vodSec('leaguehl', S.leagueHl.t, S.leagueHl.items) + guideSec() +
        vodSec('foryou', S.forYou.title, S.forYou.items, null);
    }
    return h + tailSecs();
  }
  html += LG ? landingHtml(LG) : renderBelow(CHIPS[PICK].sp || '');
  var page = document.getElementById('page');
  page.innerHTML = html;

  /* ---------- focus rows: the top bar, then one row per section ---------- */
  var $ = function(q, root){ return Array.prototype.slice.call((root || document).querySelectorAll(q)); };
  // what focus can reach: the top bar, then each section's items (rebuilt when a chip changes the rails below)
  var secs, rows, R, DYNAMIC_END;
  function buildRows(){
    secs = $('.sec', page);
    rows = [{ items:$('.topnav .item') }].concat(secs.map(function(s){ return { sec:s, key:s.dataset.row, items:$('.item', s) }; }));
    R = {}; rows.forEach(function(r, i){ if(r.key) R[r.key] = i; });
    // Figma (Sports 2385:14824): every row down to the TV Guide rail keeps the hero (dynamic background); the For You
    // rails and everything after them are the plain page (static background)
    DYNAMIC_END = LG ? -1 : R.guide;
  }
  function FIRST(){ return LG ? R.lhero : R.live; }   // the first row under the top bar
  buildRows();
  var NAV_SPORT = rows[0].items.indexOf(document.querySelector('.navtab.active'));
  var cur = { row:R.live, col:rows.map(function(){ return 0; }), from:0 };   // (a landing page too: on its LIVE rail)   // from: the row the top bar was entered from
  cur.col[0] = NAV_SPORT;

  // ---- the hero speaks for the focused rail ----
  var heroEl = document.querySelector('.hero'), heroKey = '';
  var pics = $('.hero-bg .pic'), picFront = 0, picCur = null;
  function setBg(img){
    if((img || null) === picCur) return;
    picCur = img || null;
    pics[picFront].classList.remove('on');
    picFront = 1 - picFront;
    if(img){ pics[picFront].style.backgroundImage = 'url(\'' + img + '\')'; pics[picFront].classList.add('on'); }
  }
  // a match with video plays it behind the screen text (hero-video.js)
  var heroVid = HeroVideo(document.querySelector('.hero-bg'));
  function chMeta(c){ return '<span class="ch">' + TV.logoHtml(c.d) + 'Channel ' + c.no + ': ' + esc(c.d.n) + '</span>'; }   // the TV Guide's name, as its detail page
  // a highlight / full match: what its screen text and its detail page (content.js, AIS PLAY's own) both say
  function vodInfo(el){
    var h = SETS[el.dataset.set][+el.dataset.i];
    if(h.k) return {k:h.k};   // a title of content.js: its own words, platform and crown
    var g = h.g || ((sportCur ? SPORT[sportCur].label : 'Sport') + ' · Highlights');
    return { own:1, t:h.t, img:h.img || '', plat:'ais', g:g.split(' · '), y:2026, len:h.dur, age:'G',
             d:'The best moments, the goals and the talking points, cut down so you can catch up in minutes.' };
  }
  // a match as a channel's programme (content.js LIVE): what its screen text and its detail page both show
  function matchProg(m){
    sync(m);
    var d = m.d || (sportCur && sportCur !== 'football' ? 'Live ' + SPORT[sportCur].label + ' in Full HD with Thai and English commentary, plus the build-up and the analysis after.' : MATCH_DESC);
    return { t:m.t, img:m.img, bg:m.bg || m.img, tv:m.ch.tv, live:m.live, when:m.when, range:m.time, d:d };   // bg: a screen picture of its own, else the card's
  }
  function heroFor(el, rowKey){
    var k = el && el.dataset.kind, i = el ? +el.dataset.i : 0, set = el && el.dataset.set;
    if(k === 'match'){
      var m = SETS[set][i];
      var p = matchProg(m);   // its detail page's meta row and words (content.js LIVE): LIVE / Upcoming, Premium, the channel, the time
      return { video:m.video, t:p.t, meta:(m.live ? '<span class="badge live">LIVE</span>' : '<span class="badge">Upcoming</span>') + (Content.crownIcon({tv:p.tv}) ? '<span class="badge">' + Content.crownIcon({tv:p.tv}) + 'Premium</span>' : '') + chMeta(m.ch) + '<span class="pill">' + window.LIVE.range(p) + '</span>', d:p.d, bg:p.bg };
    }
    if(k === 'uclava') return { t:BAND.t, d:BAND.d, bg:null };
    if(rowKey === 'chips'){ var c = CHIPS[i]; return { t:c.t, d:c.d, bg:c.img, keepBg:NOFILTER(i) }; }   // a focus-only chip: no picture of its own yet, the last one stays
    if(rowKey === 'leagues'){ var l = SHOWN_LEAGUES[i]; return { t:l.t, d:'Follow ' + l.t + ' for live matches, fixtures, results and highlights, all in one place.', bg:l.bg || l.img }; }
    if(k === 'vod'){
      var v = vodInfo(el), c = Content.hero(v);   // its detail page's words (content.js)
      return { t:c.t, meta:Content.metaHtml(v, true),   // its detail page's meta row (content.js)
               d:c.d, bg:SETS[set][i].bg || SETS[set][i].img };
    }
    if(rowKey === 'guide') return { t:'TV Guide', d:'See what’s on now and next across every sports channel, set reminders, and jump straight into a live match.', bg:'sport-assets/tvguide-sport-bg.webp' };
    return null;
  }
  function paintHero(rowKey, el){
    var h = heroFor(el, rowKey);
    if(!h) return;
    var key = h.t + '|' + (h.meta || '');
    if(key !== heroKey){
      heroKey = key;
      heroEl.querySelector('h1').textContent = h.t;
      heroEl.querySelector('.meta').innerHTML = h.meta || '';
      heroEl.querySelector('.desc').textContent = h.d;
      heroEl.classList.remove('swap'); void heroEl.offsetWidth; heroEl.classList.add('swap');
    }
    if(h.keepBg) return;   // the background (and its video) of the item focused before stays
    setBg(h.bg);
    heroVid.set(document.body.classList.contains('ucl') ? '' : h.video);   // the UCL band hides the background (.hero-bg): no video behind it
  }

  // ---- keep the focused item in view ----
  // Sideways (Home's "fixed focus"): the focused item sits in the first item's slot and the rail slides under it,
  // until the rail's end is in; past that, focus moves on alone. Down the page: the focused rail sits at y=600 while
  // the hero shows (on the suggested league: its cards do), its title at y=200 after that (the top bar steps away, as on Home).
  var pageY = 0;
  function slide(r, el){
    if(r.key === 'totop' || r.key === 'sched' || r.key === 'lhero') return;
    // (offsets are all from the rail, the nearest positioned box, so a league's disc measures like a card)
    var track = el.closest('.track, .chips, .leagues, .chans');
    var want = el.offsetLeft - r.items[0].offsetLeft;
    var max = Math.max(0, track.scrollWidth - 1920 + (r.key === 'ucl' ? 110 : 0));   // the suggested league's rail has no right padding
    track.style.transform = 'translateX(' + -Math.max(0, Math.min(want, max)) + 'px)';
  }
  // the hero text ends 80px above the focused rail's first line (its title, else its cards), whatever its length
  var HERO_GAP = 80;
  function placeHero(r){
    var y = 0, e = r.sec.querySelector('.sec-title, .item');
    while(e && e !== r.sec){ y += e.offsetTop; e = e.offsetParent; }
    heroEl.style.top = 'auto';
    heroEl.style.bottom = 1080 - (r.sec.offsetTop + y - pageY - HERO_GAP) + 'px';
  }
  // where a row's cards start in the page (offsets ignore the focus scale)
  var FIRST_TOP = 659;   // the first screen's match cards' top
  function pageTop(el){ var y = 0; for(var e = el; e && e !== page; e = e.offsetParent) y += e.offsetTop; return y; }
  function firstLineTop(r){ return pageTop(r.items[0]); }   // the cards' top (a rail's title sits above, outside the area)
  function layout(ri){
    var r = rows[ri], top = r.sec.offsetTop, y;
    if(LG && (r.key === 'lhero' || r.key === 'live')) y = 0;   // a landing page's first screen: its hero and LIVE rail, as Figma
    else if(ri <= DYNAMIC_END){
      y = top - 600;
      // the first screen ends as Home's and Movie's: the chips' row 942 to 1042, nothing of the next rail showing
      if(r.key === 'live'){ var ch = rows[R.chips].sec; y = ch.offsetTop + ch.offsetHeight - 1042; }
      // the card rails (Live and Upcoming, Because You Watched, Highlight(s), the band's matches, TV Guide) sit where the first screen's match rail does:
      // their cards' top at y=659, whatever is above them (a title, the screen text)
      if(/^(upcoming|because|latest|ucl|highlights|leaguehl|guide)$/.test(r.key)) y = firstLineTop(r) - FIRST_TOP;
    } else {
      // past the hero, as Home's: the focused rail (its title and cards) centred in the screen under the top bar's 90px
      // (y=585), until the page's end is in
      y = Math.min(top + r.sec.offsetHeight / 2 - 585, page.offsetHeight - 1080);
    }
    pageY = r.key === 'live' ? y : Math.max(0, y);   // the first screen may sit lower than the page's own top
    page.style.transform = 'translateY(' + -pageY + 'px)';
    secs.forEach(function(s, si){ s.classList.toggle('above', !LG && si + 1 < ri); });   // (a landing page keeps its hero showing)
    document.body.classList.toggle('static', LG ? ri > R.live : ri > DYNAMIC_END);   // a landing page: the top bar steps away past its first screen
    document.body.classList.toggle('ucl', ri === R.ucl);
  }

  // the profile panel under the top bar's photo, as on Home (profile-panel.js)
  var profileEl = document.querySelector('.topnav .profile'), prof = ProfilePanel(profileEl, { paint:paint, toast:toast });

  function paint(){
    var inProf = prof.paint(cur.row === 0 && rows[0].items[cur.col[0]] === profileEl);   // focus is in the profile panel
    rows.forEach(function(r, ri){ r.items.forEach(function(el, ci){ el.classList.toggle('focused', !inProf && ri === cur.row && ci === cur.col[ri]); }); });
    // top-bar tab states (button-theme.css): the current page's tab is Active while the D-pad is on the bar, Active dim in the content
    var curTab = document.querySelector('.topnav .navtab.active, .topnav .navtab.active-dim');
    curTab.classList.toggle('active', cur.row === 0); curTab.classList.toggle('active-dim', cur.row !== 0);
    var ri = cur.row === 0 ? cur.from : cur.row;   // on the top bar the page stays as it was
    document.body.classList.toggle('on-nav', cur.row === 0);
    // the top bar, as Home's: gone once focus is past the first rail, back as an overlay (with its scrim) while it has focus
    document.body.classList.toggle('past-first', ri > R.live);   // (a landing page: past its LIVE rail)
    layout(ri);
    var r = rows[ri], el = r.items[cur.col[ri]];
    if(cur.row) slide(r, el);
    if(ri <= DYNAMIC_END){ paintHero(r.key, el); placeHero(r); } else heroVid.set('');
    try { sessionStorage.setItem(FKEY, JSON.stringify(cur)); } catch(e){}
  }

  /* ---------- actions ---------- */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 1600); }
  // leaving for the player or the TV Guide: their Back lands on the same item here
  function leave(url){ try { sessionStorage.setItem(RKEY, '1'); } catch(e){} location.href = url; }
  // back from the player out of the browser's page cache: the channel cards' hearts (and Time Shift) as they are now
  addEventListener('pageshow', function(e){
    if(!e.persisted) return;
    document.querySelectorAll('.epg-card[data-kind="epg"]').forEach(function(el){ el.querySelector('.epg-icons').innerHTML = epgIcons(TV.onNow(TV.byName(EPG[+el.dataset.i].tv))); });
  });
  // a chip picked (focus on it, or Enter / a click): the rails below show only that sport (All Sports: everything); the chip stays marked
  function setSport(i, quiet){
    if(NOFILTER(i)) return;   // focus only: the picked chip and the rails below stay as they are
    var sp = CHIPS[i].sp || '', liveCol = cur.col[R.live];
    $('.chips .chip', page).forEach(function(c, ci){ c.classList.toggle('sel', ci === i); });
    try { sessionStorage.setItem('sportPick', i); } catch(e){}
    if(sp !== sportCur){
      // the rails after the chips are rebuilt for that sport
      var after = false;
      $('.sec', page).forEach(function(sec){ if(after) sec.remove(); if(sec.dataset.row === 'chips') after = true; });
      page.insertAdjacentHTML('beforeend', renderBelow(sp));
      buildRows();
    }
    cur.col = rows.map(function(r, ri){ return ri === 0 ? cur.col[0] : r.key === 'chips' ? i : r.key === 'live' ? liveCol : 0; });
    cur.row = R.chips;
    if(!quiet) toast(sp ? 'Showing ' + CHIPS[i].t : 'Showing every sport');
  }
  function select(el){
    var k = el.dataset.kind, i = +el.dataset.i;
    el.animate([{ transform:getComputedStyle(el).transform }, { transform:(getComputedStyle(el).transform === 'none' ? '' : getComputedStyle(el).transform + ' ') + 'scale(0.97)' }], { duration:140, easing:'ease-out' });
    if(el.dataset.href){ location.href = el.dataset.href; return; }
    if(el === profileEl) return;   // its panel is already open under it
    if(k === 'match'){
      var m = SETS[el.dataset.set][i];
      // LIVE / Upcoming: its detail page (a sport channel's programme; content.js LIVE), which plays the channel live
      leave(window.LIVE.href(matchProg(m), 'sport'));   // (window.: this page's own LIVE is its match list)
      return;
    }
    if(k === 'chip'){ setSport(i); return; }
    // a league: its landing page (follow it there, with its heart)
    if(k === 'league'){ leave('sport.html?league=' + SHOWN_LEAGUES[i].id); return; }
    if(k === 'guideall'){ leave('tv-guide.html'); return; }
    // channel cards play the channel in the Live TV player via the TV Guide (its programmes and mini EPG), as Home's and Movie's
    if(k === 'epg'){ leave('tv-guide.html?play=' + encodeURIComponent(EPG[i].tv) + '&from=sport'); return; }
    if(k === 'totop'){ cur.row = R.live; cur.col[R.live] = 0; paint(); return; }
    if(k === 'sched'){ toast(el.dataset.label + ' (demo)'); return; }
    // the heart on a league's landing page: follow it (the rails' discs show it too)
    if(k === 'lfav'){
      LG.fav = LG.fav ? 0 : 1; FOLLOW[LG.id] = !!LG.fav;
      try { sessionStorage.setItem('leagueFollow', JSON.stringify(FOLLOW)); } catch(e){}
      // as the detail pages' Favorite (icon-toggle.js): filled and light while on, the pop and sparks, its tooltip
      el.classList.toggle('on', !!LG.fav); IconToggle.pop(el, !!LG.fav);
      el.querySelector('.tip').textContent = LG.fav ? 'Remove from Favorites' : 'Add to Favorites';
      toast((LG.fav ? 'Following ' : 'Unfollowed ') + LG.t); return;
    }
    // videos, documentaries and shorts: their detail page (content.js), then the player
    // clips with no detail page play at once: every highlight rail (All Sports's Highlight, a sport's Highlights and its
    // league's highlights: leaguehl); on a league's page, Highlights, Rerun and Moments of the Week
    if(k === 'vod' && /^(latest|highlights|leaguehl|rerun|moments)$/.test(el.dataset.set)){ leave(Content.playUrl(vodInfo(el))); return; }
    if(k === 'vod'){ leave(Content.detailUrl(vodInfo(el))); return; }
    if(k === 'doc'){ var ci = Content.info(el); if(ci){
      var dc = DOCS[i]; ci.t = dc.t; ci.g = ['Documentary', 'Sport']; if(dc.plat){ ci.plat = dc.plat; ci.len = dc.len; ci.d = dc.d; ci.own = 1; }
      leave(Content.detailUrl(ci)); return; } }
    if(k === 'doc'){ toast('Now playing: ' + DOCS[i].t); return; }
    if(k === 'uclava'){ toast(BAND.t); return; }
    toast(el.dataset.label + ' (demo)');
  }
  function back(){
    if(cur.row > R.live){ cur.row = R.live; paint(); return; }
    if(LG){   // a landing page: back to where it was opened from (the Sport page, or another league's page)
      try { if(document.referrer && /sport\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
      location.href = 'sport.html'; return;
    }
    try { if(document.referrer && /home\.html/.test(document.referrer) && history.length > 1){ history.back(); return; } } catch(e){}
    location.href = 'home.html';
  }

  addEventListener('keydown', function(e){
    if(prof.key(e.key)){ e.preventDefault(); return; }   // the profile photo / its panel
    var r = rows[cur.row], n = r.items.length, handled = true;
    if(e.key === 'ArrowRight') cur.col[cur.row] = Math.min(n - 1, cur.col[cur.row] + 1);
    else if(e.key === 'ArrowLeft'){
      // Left on a rail's first item goes up to the top bar (its Sport tab), as on Home
      if(cur.row > 0 && cur.col[cur.row] === 0){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_SPORT; }
      else cur.col[cur.row] = Math.max(0, cur.col[cur.row] - 1);
    }
    else if(e.key === 'ArrowUp'){
      if(cur.row === FIRST()){ cur.from = cur.row; cur.row = 0; cur.col[0] = NAV_SPORT; }
      else if(cur.row > 0) cur.row--;
    }
    else if(e.key === 'ArrowDown'){
      if(cur.row === 0) cur.row = cur.from || FIRST();
      else cur.row = Math.min(rows.length - 1, cur.row + 1);
    }
    else if(e.key === 'Enter') select(r.items[cur.col[cur.row]]);
    else if(e.key === 'Escape' || e.key === 'Backspace') back();
    else handled = false;
    // the chips are a single filter: the chip focus lands on is the one picked (only one is ever marked), as Store's tabs
    if(handled && rows[cur.row].key === 'chips' && !NOFILTER(cur.col[cur.row]) && !rows[cur.row].items[cur.col[cur.row]].classList.contains('sel')) setSport(cur.col[cur.row], true);
    if(handled){ e.preventDefault(); paint(); }
  });
  // clicks: the top bar's items, and the page's by delegation (a chip rebuilds the rails below it)
  function clickItem(el){
    var ri = -1, ci = -1;
    rows.forEach(function(x, xi){ var j = x.items.indexOf(el); if(j >= 0){ ri = xi; ci = j; } });
    if(ri < 0) return;
    if(ri === 0) cur.from = cur.row || cur.from; cur.row = ri; cur.col[ri] = ci; paint(); select(el);
  }
  rows[0].items.forEach(function(el){ el.addEventListener('click', function(){ clickItem(el); }); });
  page.addEventListener('click', function(e){ var el = e.target.closest('.item'); if(el) clickItem(el); });

  // coming back (Back from the player or the TV Guide): the same item again
  try {
    var saved = RETURNING && JSON.parse(sessionStorage.getItem(FKEY) || 'null');
    sessionStorage.removeItem(RKEY);
    if(saved && saved.col && saved.col.length === rows.length){ cur = saved; if(cur.row === 0) cur.row = cur.from || FIRST(); }
  } catch(e){}
  if(!cur.from) cur.from = FIRST();
  page.style.transition = 'none';
  paint();
  // fonts change the rows' heights: lay out again once they are in, then let the page glide
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ paint(); requestAnimationFrame(function(){ page.style.transition = ''; }); });
})();
