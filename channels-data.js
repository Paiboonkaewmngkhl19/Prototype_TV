/*
  The TV channels and their programmes, shared by tv-guide.html (the guide, and the Live TV player it opens) and
  home.html (its TV Guide rail), so a channel card, the hero text and the player always show the same programme.
  Each channel repeats its line-up (sched: [title, minutes, picture, hot]) from a per-channel offset around the real
  clock; about 4 in 10 programmes have Time Shift (ts: watch from the start). tsNow: the programme on air now always
  has Time Shift (MUTV and CNN, so Home's TV Guide rail shows two).
    TV.CHANNELS        the channels, lowest number first, each with progs [{t, start, end, img, hot, ts, key, ch}]
    TV.byName(n)       a channel by its name
    TV.onAt(c, when)   the index of the programme on c at a time
*/
(function(){
  /* ---------- 44 channels: the ones Home shows (TV Guide rail + Hot Channels), Thailand's free-to-air digital channels, four Exclusive ones
     and a few pay channels; shown in channel-number order ----------
     logo: cover = fills the disc; contain = sits inside it; box = Home's crop [left, top, width, height] in %.
     cats: category tabs; tags: sub-tabs (Sports, Others); crown: 'gold' premium or 'owned' (gold with the green mark). */
  var CHANNELS = [
    {no:61,  n:'PLAY Sports',        logo:'icons/channels/playsports.png', fit:'cover', cats:['sports'], tags:['multi','motorsport','golf'], crown:'gold', recent:true,
      sched:[['Formula 1: Grand Prix Qualifying',120,'posters/f1.jpg',1],['Paddock Pass',30],['PGA Tour: Final Round Highlights',90],['Motorsport Weekly',60],['World Superbike: Race 2',90],['Golf Central',60]]},
    {no:62,  n:'MUTV',               logo:'icons/epg/mutv.png', fit:'cover', tsNow:true, cats:['sports'], tags:['football'], crown:'owned', fav:true, recent:true,
      sched:[['PL Match: v Chelsea (A) 25/26',120,'posters/maxresdefault.jpg',1],['Inside United',60],['Sir Alex Ferguson: Never Give In',90,'posters/maxresdefault.jpg'],['Reserves Highlights',60],['Classic Match: 1999 Final',120],['United Review',30]]},
    {no:63,  n:'Real Madrid TV',     logo:'icons/epg/realmadrid.png', fit:'contain', cats:['sports'], tags:['football'],
      sched:[['Champions League 15/16: Real Madrid vs Atlético de Madrid',120,'posters/upcoming/u2.jpg'],['Classic Highlights',60],['Training Ground Live',60,'posters/upcoming/u3.jpg'],['La Liga Review',60],['Bernabéu Stories',90]]},
    {no:64,  n:'W-Sport',            logo:'icons/epg/wsport.png', fit:'contain', cats:['sports'], tags:['multi','basketball'],
      sched:[['Malaysia Regional Cup \'26: Wildcats v Sneakers',120,'posters/all.jpg',1],['Heroines (S2E02)',60],['All or Nothing: Brazil',60,'posters/all.jpg'],['Hoops Asia',60],['W-Sport Tonight',30]]},
    {no:230, n:'Warner TV',          logo:'icons/channels/wbtv.png', box:[10.88,12.81,80.09,74.91], bg:'#fff', cats:['movies','cartoons'], crown:'gold',
      sched:[['Superman',150,'posters/superman.jpg',1],['Looney Tunes Cartoons',30],['Gotham Knights',60],['The Big Bang Theory',30],['Young Sheldon',30],['Friends',30]]},
    {no:251, n:'HBO',                logo:'icons/channels/hbo.png', fit:'cover', bg:'#fff', cats:['movies'], crown:'gold', recent:true,
      sched:[['House of the Dragon',60,'posters/house-of-the-dragon.jpg',1],['The Last of Us',60,'posters/last-of-us.jpg',1],['Dune: Part Two',165],['Real Time with Bill Maher',60],['The Penguin',60]]},
    {no:252, n:'HBO Hits',           logo:'icons/channels/hbohits.png', box:[0,17.28,95.67,65.54], bg:'#fff', cats:['movies'], crown:'gold',
      sched:[['Top Gun: Maverick',135,'posters/topgun-m.jpg'],['Wicked',160,'posters/wicked.jpg',1],['The Batman',175],['Barbie',115]]},
    {no:253, n:'HBO Family',         logo:'icons/channels/hbofamily.png', box:[-0.11,22.3,108.43,66.07], bg:'#fff', cats:['movies','cartoons'], crown:'gold',
      sched:[['How to Train Your Dragon',100,'posters/how-to-train.jpg'],['Paddington 2',105],['The Lego Movie',100],['Sesame Street',30],['Kung Fu Panda 4',95]]},
    {no:254, n:'HBO Signature',      logo:'icons/channels/hbosignature.png', box:[-17.36,23.71,114.25,52.53], bg:'#fff', cats:['movies'], crown:'gold',
      sched:[['The Last of Us',60,'posters/last-of-us.jpg'],['Succession',60],['The White Lotus',60,null,1],['True Detective',60],['Chernobyl',60]]},
    {no:255, n:'Cinemax',            logo:'icons/channels/cinemax.png', box:[5.54,25.24,88.79,50], bg:'#fff', cats:['movies'], crown:'gold',
      sched:[['District 9',115,'posters/district9.jpg',1],['Spider-Man: No Way Home',150,'posters/P10-spiderman.jpg'],['The Devil Wears Prada',110,'posters/P10-Devil.jpg'],['The Odyssey',140,'posters/P10_Odyssey.jpg']]},
    {no:260, n:'Rock Entertainment', logo:'icons/channels/rock.png', box:[-11.46,24.55,120.21,51.94], bg:'#fff', cats:['variety','others'],
      sched:[['Miss Universe Thailand 2026',120,'posters/miss-universe.jpg',1],['Masterchef Thailand',60,'posters/upcoming/u1.jpg'],['Rock Comedy Hour',60],['Talent Showdown',90],['Late Night Variety',60]]},
    {no:301, n:'CNN',                logo:'icons/epg/cnn.jpg', fit:'cover', tsNow:true, cats:['news'], fav:true, recent:true,
      sched:[['CNN News Central',60],['Anderson Cooper 360°',60,null,1],['The Lead with Jake Tapper',60],['Amanpour',30],['CNN Newsroom',90],['World Sport',30]]},
    {no:302, n:'BBC News',           logo:'icons/epg/bbc.jpg', fit:'cover', cats:['news'],
      sched:[['BBC News at Ten',60],['HARDtalk',30],['Newsnight',60,null,1],['World Business Report',30],['BBC World News',60],['Click',30]]},
    {no:902, n:'Asian Games 902',    logo:'tv-features-test/live-stream-assets/channel-asian-games.png', fit:'cover', bg:'#fff', cats:['digital','sports'], tags:['multi','tennis','boxing'], fav:true,
      sched:[['Asian Games 2026: Tennis Finals',150,'posters/upcoming/u4.png',1],['Boxing: Semi-finals',120],['Medal Ceremony Live',30],['Asian Games Daily',60]]},
    {no:907, n:'Asian Games 907',    logo:'tv-features-test/shorts-assets/channel-907.png', fit:'cover', bg:'#fff', cats:['digital','sports'], tags:['multi','basketball','rugby'],
      sched:[['Asian Games 2026: Football Group Stage',120,'posters/SC.jpg',1],['Basketball 3x3: Quarter-finals',90],['Rugby Sevens: Pool A',90],['Asian Games Daily',60]]},
    // Thailand's digital terrestrial (free-to-air) channels, at their own channel numbers. No logo files for these:
    // the avatar shows the name as text on a colour (txt, plus fg for dark text on a light colour).
    {no:1,  n:'TV5 HD1',      txt:'TV5', bg:'#1d4f9c', cats:['digital','variety'],
      sched:[['TV5 Midday News',60],['Army Channel Documentary',60],['Muay Thai Super Fight',90,null,1],['TV5 Evening News',60],['Thai Drama Classics',90]]},
    {no:2,  n:'NBT 2HD',      txt:'NBT', bg:'#0a6e3a', cats:['digital','news'],
      sched:[['NBT National News',60],['Government Report',30],['Thailand Today',60],['Regional News Hour',60],['Talk of the Nation',60]]},
    {no:3,  n:'Thai PBS',     txt:'Thai PBS', bg:'#f26f21', cats:['digital','news','others'], tags:['education','documentary'],
      sched:[['Thai PBS News',60],['Wild Thailand',60,null,1],['Kitchen of the Provinces',30],['Public Forum',60],['Thai PBS Night News',60]]},
    {no:4,  n:'ALTV',         txt:'ALTV', bg:'#26a69a', cats:['digital','cartoons','others'], tags:['education'],
      sched:[['Little Scientists',30],['Learn English Together',30],['Kids Story Time',30],['Math Adventures',30],['Family Science Show',60]]},
    {no:10, n:'TPTV',         txt:'TPTV', bg:'#5d4037', cats:['digital','news'],
      sched:[['Parliament Live Session',120],['Lawmakers Talk',60],['Parliament News',30],['Committee Report',60]]},
    {no:16, n:'TNN16',        txt:'TNN16', bg:'#c62828', cats:['digital','news'],
      sched:[['TNN News Hour',60],['Business Watch',30],['Tech Talk Thailand',30],['TNN World',60],['Breaking News Live',60,null,1]]},
    {no:18, n:'JKN18',        txt:'JKN18', bg:'#111', cats:['digital','news','others'], tags:['documentary'],
      sched:[['JKN World News',60],['Global Business',30],['Asia Documentary',60],['JKN Night Talk',60]]},
    {no:22, n:'Nation TV',    txt:'Nation', bg:'#1565c0', cats:['digital','news'],
      sched:[['Nation Headline',60],['Nation Insight',60],['Weekend Debate',90,null,1],['Nation Night News',60]]},
    {no:23, n:'Workpoint TV', txt:'Workpoint', bg:'#ffcc00', fg:'#111', cats:['digital','variety'],
      sched:[['The Mask Singer',90,null,1],['I Can See Your Voice',90],['Workpoint Today',60],['Comedy Night',60],['Game Show Marathon',90]]},
    {no:24, n:'True4U',       txt:'True4U', bg:'#e53935', cats:['digital','variety','others'], tags:['shopping'],
      sched:[['True4U Drama',90],['Home Shopping Hour',60],['Celebrity Kitchen',60],['Music Countdown',60],['Late Night Movie',120]]},
    {no:25, n:'GMM25',        txt:'GMM25', bg:'#7b1fa2', cats:['digital','variety','movies'],
      sched:[['GMM25 Series',60,null,1],['Club Friday',60],['Music Live Stage',90],['Teen Series Marathon',120]]},
    {no:27, n:'Channel 8',    txt:'Ch 8', bg:'#e65100', cats:['digital','variety'],
      sched:[['Muay Thai Live',120,null,1],['Channel 8 Drama',90],['Thai Folk Music',60],['News at Eight',60]]},
    {no:29, n:'MONO29',       txt:'MONO29', bg:'#000', cats:['digital','movies'],
      sched:[['Mono Hit Movie',120,null,1],['Mono Series',60],['Cartoon Club',60],['Mono Late Movie',120]]},
    {no:30, n:'MCOT HD',      txt:'MCOT', bg:'#0d47a1', cats:['digital','news'],
      sched:[['MCOT News',60],['Thailand Morning',60],['MCOT Documentary',60],['MCOT Night News',60]]},
    {no:31, n:'one31',        txt:'one31', bg:'#c2185b', cats:['digital','variety'],
      sched:[['one31 Lakorn',90,null,1],['The Wall Song',90],['One Night Comedy',60],['Lakorn Rerun',90]]},
    {no:32, n:'Thairath TV',  txt:'Thairath', bg:'#d32f2f', cats:['digital','news','variety'],
      sched:[['Thairath News',60],['Talk of the Town',60],['Thairath Drama',90],['Thairath Night News',60]]},
    {no:33, n:'Ch3 HD',       txt:'Ch3 HD', bg:'#1e88e5', cats:['digital','variety'], recent:true,
      sched:[['Ch3 Lakorn',120,null,1],['Ch3 News',60],['Weekend Variety Show',90],['Ch3 Late Night',60]]},
    {no:34, n:'Amarin TV',    txt:'Amarin', bg:'#00897b', cats:['digital','variety','others'], tags:['shopping'],
      sched:[['Amarin Lifestyle',60],['Amarin Shopping',60],['Home and Garden',30],['Amarin Drama',90],['Amarin News',60]]},
    {no:35, n:'Ch7 HD',       txt:'Ch7 HD', bg:'#2e7d32', cats:['digital','variety'], fav:true,
      sched:[['Ch7 Lakorn',120,null,1],['Ch7 Evening News',60],['Morning Variety',90],['Muay Thai 7 Si',120]]},
    {no:36, n:'PPTV HD36',    txt:'PPTV', bg:'#fbc02d', fg:'#111', cats:['digital','variety','sports'], tags:['football'],
      sched:[['PPTV Football Live',120,null,1],['PPTV Lakorn',90],['PPTV News',60],['Football Highlights',60]]},
    // pay channels
    {no:65, n:'Eurosport',    logo:'icons/pkg/d-eurosport.png', fit:'contain', bg:'#fff', cats:['sports'], tags:['multi','tennis'], crown:'gold',
      sched:[['Tennis: ATP Highlights',90],['Cycling Live',120,null,1],['Snooker Masters',120],['Eurosport News',30]]},
    {no:66, n:'T Sports 7',   txt:'T Sports', bg:'#283593', cats:['sports'], tags:['multi','boxing'],
      sched:[['Thai League Live',120,null,1],['Boxing Night',90],['T Sports News',30],['Volleyball Thailand',120]]},
    {no:401, n:'Cartoon Network', logo:'icons/pkg/d-cn.png', fit:'contain', bg:'#000', cats:['cartoons'], crown:'gold',
      sched:[['We Bare Bears',30],['The Amazing World of Gumball',30],['Teen Titans Go!',30],['Ben 10',30],['Adventure Time',30]]},
    {no:411, n:'Discovery',   logo:'icons/pkg/d-discovery.png', fit:'contain', bg:'#fff', cats:['others'], tags:['documentary'], crown:'gold',
      sched:[['How It\'s Made',30],['Shark Week',60,null,1],['Gold Rush',60],['MythBusters',60],['Deadliest Catch',60]]},
    {no:501, n:'MONOMAX 1',   logo:'partners/monomax.png', fit:'contain', bg:'#fff', cats:['movies'], crown:'gold',
      sched:[['District 9',115,'posters/district9.jpg',1],['Liverpool vs Brentford',120,'posters/liver-ben.jpg'],['Top Gun: Maverick',135,'posters/topgun-m.jpg'],['Monomax Original Series',60]]},
    // Exclusive: app-only channels with no channel number (excl). `no` is only their id here, after every numbered channel,
    // and is never shown. up: how many programmes are listed after the live one (0 to 2)
    {no:9001, excl:true, up:2, n:'TrueID Exclusive', logo:'partners/trueid.png', fit:'contain', bg:'#fff', cats:['exclusive'], crown:'gold',
      sched:[['Liverpool vs Brentford',120,'posters/liver-ben.jpg',1],['Arsenal: Match Highlights',30,'posters/arsenal.jpg'],['TrueID Original Series',60],['Premier League Review',60]]},
    {no:9002, excl:true, up:1, n:'COOL Live',        logo:'tv-features-test/concert-assets/channel-cool.png', fit:'cover', cats:['exclusive','variety'],
      sched:[['COOL Live Concert 2026',150,'tv-features-test/concert-assets/moment-080.jpg',1],['Backstage Pass',30],['COOL Countdown',60],['Acoustic Night',60]]},
    {no:9003, excl:true, up:0, n:'Miss Universe Live', txt:'MU', bg:'#8e24aa', cats:['exclusive','variety'],
      sched:[['Miss Universe 2026: Preliminary',120,'posters/miss-universe.jpg',1],['Road to the Crown',60],['Miss Universe Daily',30],['Behind the Sash',60]]},
    {no:9004, excl:true, up:2, n:'F1 Exclusive',     txt:'F1', bg:'#e10600', cats:['exclusive','sports'], tags:['motorsport'], crown:'gold',
      sched:[['F1 Grand Prix: Qualifying',90,'posters/f1.jpg',1],['F1 Paddock Live',60],['Onboard Classics',60],['F1 Race Replay',120]]}
  ];
  CHANNELS.sort(function(a, b){ return a.no - b.no; });   // lowest channel number first, everywhere

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var NOW = Date.now();
  CHANNELS.forEach(function(c, i){
    var t = new Date(today.getTime() - (90 + Math.round(i * 37 % 120 / 15) * 15) * 60000), k = 0, list = [];   // starts on a quarter hour
    var end = today.getTime() + 9 * 864e5;   // through the last day in the date picker (today + 7), and the night after it
    while(t.getTime() < end){
      var s = c.sched[k % c.sched.length], start = new Date(t);
      t = new Date(t.getTime() + s[1] * 60000);
      list.push({ch:c, t:s[0], start:start, end:new Date(t), img:s[2] || null, hot:!!s[3], key:c.no + '@' + start.getTime(),
        ts:(c.tsNow && start.getTime() <= NOW && t.getTime() > NOW) || (c.no * 7 + k * 13 + start.getHours()) % 10 < 4});   // timeshift on about 4 in 10 programmes, at random but the same every render (and on air now on a tsNow channel)
      k++;
    }
    c.progs = list;
  });
  function onAt(c, when){ for(var i = 0; i < c.progs.length; i++) if(c.progs[i].end > when) return i; return c.progs.length - 1; }
  function byName(n){ for(var i = 0; i < CHANNELS.length; i++) if(CHANNELS[i].n === n) return CHANNELS[i]; return null; }
  window.TV = { CHANNELS:CHANNELS, onAt:onAt, byName:byName };
})();
