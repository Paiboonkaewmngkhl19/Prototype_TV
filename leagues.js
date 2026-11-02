/*
  leagues.js: the leagues and tournaments (Sport's League & Tournament rail and landing pages, Store's sport chips),
  and their logo in a round disc, the same everywhere:
    Leagues.list        every league: id, t, sp, name, logo, box / fitc, fav, img, bg (Sport's screen picture while its disc has focus)
    Leagues.find(t)     a league by its title ('Premier League', 'NBA', ...), else null
    Leagues.pic(l)      the disc's picture (league-disc.css): the logo placed by its box, else filling the disc (cover /
                        zoom / inset); a league without a logo (or l.mono) its initials
*/
window.Leagues = (function(){
  // Figma (Sports 3336:63788 rail_league): the logo in a white disc, placed by box [left, top, width, height] in % of the disc;
  // UCL, Bundesliga and RWS fill theirs (cover / zoom). fav: followed (the heart shows)
  // id: its landing page (sport.html?league=id, Figma Sports 3011:44457)
  var list = [
    {id:'ucl', bg:'sport-assets/main-page/sportMainPage_leagueTournament_No1-2.webp', t:'UEFA Champions League', sp:'football', name:'UEFA<br>Champions League', logo:'sport-assets/league-ucl.jpg', fitc:'zoom', fav:1, img:'sport-assets/ucl-bg.jpg'},
    {id:'bundesliga', bg:'sport-assets/main-page/sportMainPage_leagueTournament_No2-2.webp', t:'Bundesliga', sp:'football', name:'Bundesliga', logo:'sport-assets/league-bundesliga.png', fitc:'inset', fav:1, img:'posters/upcoming/u3.jpg'},
    {id:'europa', bg:'sport-assets/main-page/sportMainPage_leagueTournament_No3-2.webp', t:'UEFA Europa League', sp:'football', name:'UEFA<br>Europa League', logo:'sport-assets/league-europa.png', box:[21.95,10,56.1,80], fav:1},
    {id:'motogp', t:'MotoGP', sp:'motorsport', name:'MotoGP', logo:'sport-assets/league-motogp.png', box:[5,24.69,90,50.62]},
    {id:'nfl', t:'NFL', sp:'rugby', name:'NFL', logo:'sport-assets/league-nfl.png', box:[19.08,7.5,61.84,85]},   // American football: under Rugby
    {id:'nba', t:'NBA', sp:'basketball', name:'NBA', logo:'sport-assets/league-nba.png', box:[-28.13,6.05,156.25,87.89]},
    {id:'conference', bg:'sport-assets/main-page/sportMainPage_leagueTournament_No4-2.webp', t:'UEFA Conference League', sp:'football', name:'UEFA Conference League', logo:'sport-assets/league-conference.png', box:[11.13,11.24,78.18,77.53]},
    {id:'rws', t:'RWS', sp:'boxing', name:'RWS', logo:'sport-assets/league-rws.png'},   // Rajadamnern World Series (Muay Thai): under Boxing
    {id:'pga', t:'PGA Tour', sp:'golf', name:'PGA<br>Tour', logo:'sport-assets/league-pga.png', box:[-18.13,11.68,136.25,76.64]},
    {id:'atp', t:'ATP Tour', sp:'tennis', name:'ATP<br>Tour', logo:'sport-assets/league-atp.png', box:[8.5,30.5,83,39.01]},
    // the landing page's own rail (Figma 3258:67811): Premier League (its lion), FA Cup, the four Grand Slams
    {id:'epl', t:'Premier League', sp:'football', name:'Premier<br>League', logo:'sport-assets/league-epl.png', fitc:'inset'},   // the lion on white
    {id:'facup', t:'FA Cup', sp:'football', name:'FA Cup', logo:'sport-assets/league-facup.jpg'},
    {id:'wimbledon', t:'Wimbledon', sp:'tennis', name:'Wimbledon', logo:'sport-assets/league-wimbledon.png'},
    {id:'usopen', t:'US Open', sp:'tennis', name:'US Open', logo:'sport-assets/league-usopen.jpg'},
    {id:'ausopen', t:'Australian Open', sp:'tennis', name:'Australian<br>Open', logo:'sport-assets/league-ausopen.jpg'},
    {id:'rg', t:'French Open', sp:'tennis', name:'French<br>Open', logo:'sport-assets/league-rg.png'},
    // Germany's second tier and Thai football (Figma For PBR 8:10976): the shields stand in their disc by their box
    {id:'bundesliga2', t:'Bundesliga 2', sp:'football', name:'Bundesliga 2', logo:'sport-assets/league-bundesliga2.png', fitc:'inset'},
    {id:'thai1', t:'Thai League', sp:'football', name:'Thai League', logo:'sport-assets/league-thai1.png', box:[20,10,60,80]},
    {id:'thai2', t:'Thai League 2', sp:'football', name:'Thai League 2', logo:'sport-assets/league-thai2.png', box:[20,10,60,80]},
    {id:'thai3', t:'Thai League 3', sp:'football', name:'Thai League 3', logo:'sport-assets/league-thai3.png', box:[20,10,60,80]},
    {id:'muangthai', t:'Muangthai Cup', sp:'football', name:'Muangthai<br>Cup', logo:'sport-assets/league-muangthai.png', box:[14.6,10,70.8,80]},
    {id:'pea', t:'PEA Youngster League', sp:'football', name:'Thai U21', logo:'sport-assets/league-pea.png', box:[20,10,60,80]}
  ];
  function find(t){ return list.filter(function(l){ return l.t === t; })[0] || null; }
  function pic(l){
    if(!l || l.mono || !l.logo) return '<span class="lg-mono">' + (l && l.mono || String(l && l.t || '').split(/\s+/).map(function(w){ return w[0]; }).join('').slice(0, 2)) + '</span>';
    if(l.box) return '<span class="lg-pic"><img class="lg" src="' + l.logo + '" alt="" style="left:' + l.box[0] + '%;top:' + l.box[1] + '%;width:' + l.box[2] + '%;height:' + l.box[3] + '%"></span>';
    return '<span class="lg-pic ' + (l.fitc || '') + '" style="background-image:url(\'' + l.logo + '\')"></span>';
  }
  return { list:list, find:find, pic:pic };
})();
