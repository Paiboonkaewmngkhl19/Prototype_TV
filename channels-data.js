/*
  The TV channels and their programmes, shared by tv-guide.html (the guide, and the Live TV player it opens) and
  home.html (its TV Guide rail), so a channel card, the hero text and the player always show the same programme.
  Each channel repeats its line-up (sched: [title, minutes, picture, hot]) from a per-channel offset around the real
  clock; about 4 in 10 programmes have Time Shift (ts: watch from the start). tsNow: the programme on air now always
  has Time Shift (MUTV and CNN, so Home's TV Guide rail shows two).
    TV.CHANNELS        the channels, lowest number first, each with progs [{t, start, end, img, hot, ts, key, ch}]
    TV.byName(n)       a channel by its name
    TV.onAt(c, when)   the index of the programme on c at a time
    TV.onNow(c)        the card's now / next programmes, times, progress, Time Shift and favourite
    TV.isFav(c)        whether c is a favourite (its own, or as changed this session in the TV Guide / player)
    TV.logoSrc(c)      c's logo picture, or the placeholder (its name on a box) when it has none
    TV.logoAttrs(c)    an <img>'s alt (the channel name) and onerror (TV.logoFail: the placeholder if the picture fails)
    TV.logoHtml(c, cls) the logo on its disc, sized and coloured as in the TV Guide (cls: the disc's own classes)
*/
(function(){
  /* ---------- the channels: AIS PLAY's line-up (data/AISPLAY_ContentTVChannel.csv, the source of truth), lowest number first,
     then a few the prototype keeps that aren't in it (TV5 HD1, CNBC, SKY, MONOMAX 1, the Asian Games) ----------
     From the CSV: premium (Premium), category (Category, split at the commas), sub (Sub-Category; "null" is empty).
     cats / tags: the TV Guide's tabs and sub-tabs they show under (Education -> Others / Education; Women's Sports and
     American Football -> Multi-Sports). crown: 'gold' premium, or 'owned' (premium, in the viewer's package: no crown shown).
     pkg (set below for every premium one): the package it comes with, 'sports' (its sports channels: PLAY ALL or a
     league package) or 'ultimate' (every other one: PLAY ULTIMATE); content.js Content.crown turns it owned with it.
     logo: assets/logos/{ChannelNumber}_{ChannelName}.png; fit cover = the square logo fills the disc, contain = sits
     inside it, box = Home's crop [left, top, width, height] in %; bg: the disc behind it (dark for a white logo).
     A channel with no logo anywhere has txt instead: its name on a box (the placeholder). */
  var CHANNELS = [
    {no:1, n:'TV5 HD1', txt:'TV5', bg:'#1d4f9c', cats:['digital','variety'], premium:false,
      sched:[['TV5 Midday News',60],['Army Channel Documentary',60],['Muay Thai Super Fight',90,null,1],['TV5 Evening News',60],['Thai Drama Classics',90]]},
    {no:2, n:'NBT 2 HD', premium:false, category:['Digital TV','News'], sub:[], logo:'assets/logos/2_NBT.png', box:[13.67,14.82,73.53,73.53], bg:'#fff', cats:['digital','news'],
      sched:[['NBT National News',60],['Government Report',30],['Thailand Today',60],['Regional News Hour',60],['Talk of the Nation',60]]},
    {no:3, n:'TPBS', premium:false, category:['Digital TV','News'], sub:[], logo:'assets/logos/3_ThaiPBS.png', box:[18.44,19.08,63.76,63.76], bg:'#fff', cats:['digital','news'],
      sched:[['Thai PBS News',60],['Wild Thailand',60,null,1],['Kitchen of the Provinces',30],['Public Forum',60],['Thai PBS Night News',60]]},
    {no:4, n:'ALTV4', premium:false, category:['Digital TV','Education'], sub:[], logo:'assets/logos/4_ALTV.png', box:[10.86,10.71,78.27,78.27], bg:'#202020', cats:['digital','others'], tags:['education'],
      sched:[['Little Scientists',30],['Learn English Together',30],['Kids Story Time',30],['Math Adventures',30],['Family Science Show',60]]},
    {no:5, n:'CH5 HD', premium:false, category:['Digital TV','News'], sub:[], logo:'assets/logos/5_Ch5HD.png', box:[15.09,14.95,69.83,69.83], bg:'#202020', cats:['digital','news'],
      sched:[['CH5 News',60],['Army Documentary',60],['Muay Thai Super Fight',90,null,1],['Evening News',60]]},
    {no:7, n:'T Sports 7', premium:false, category:['Digital TV','News','Sports'], sub:['Multi-Sports'], logo:'assets/logos/7_TSport.png', box:[10.36,9.57,80.86,80.86], bg:'#fff', cats:['digital','news','sports'], tags:['multi'],
      sched:[['Thai League Live',120,null,1],['Boxing Night',90],['T Sports News',30],['Volleyball Thailand',120]]},
    {no:10, n:'Parliament', premium:false, category:['Digital TV','News'], sub:[], logo:'assets/logos/10_TPTV.png', box:[3.88,7.58,87.01,87.01], bg:'#fff', cats:['digital','news'],
      sched:[['Parliament Live Session',120],['Lawmakers Talk',60],['Parliament News',30],['Committee Report',60]]},
    {no:16, n:'TNN', premium:false, category:['Digital TV','News'], sub:[], logo:'assets/logos/16_TNN24.png', box:[15.26,15.26,69.48,69.48], bg:'#fff', cats:['digital','news'],
      sched:[['TNN News Hour',60],['Business Watch',30],['Tech Talk Thailand',30],['TNN World',60],['Breaking News Live',60,null,1]]},
    {no:18, n:'JKN 18', premium:false, category:['Digital TV','News'], sub:[], logo:'assets/logos/18_JKN.png', box:[13.22,13.22,73.28,73.28], bg:'#fff', cats:['digital','news'],
      sched:[['JKN World News',60],['Global Business',30],['Asia Documentary',60],['JKN Night Talk',60]]},
    {no:22, n:'Nation TV', premium:false, category:['Digital TV','News'], sub:[], logo:'assets/logos/22_Nation.png', box:[18.29,18.6,62.79,62.79], bg:'#fff', cats:['digital','news'],
      sched:[['Nation Headline',60],['Nation Insight',60],['Weekend Debate',90,null,1],['Nation Night News',60]]},
    {no:23, n:'Workpoint TV', premium:false, category:['Digital TV','Variety'], sub:[], logo:'assets/logos/23_Workpoint.png', box:[17.87,17.62,64.52,64.52], bg:'#202020', cats:['digital','variety'],
      sched:[['The Mask Singer',90,null,1],['I Can See Your Voice',90],['Workpoint Today',60],['Comedy Night',60],['Game Show Marathon',90]]},
    {no:24, n:'True 4 U', premium:false, category:['Digital TV','Movies & Series','Variety'], sub:[], logo:'assets/logos/24_True4U.png', box:[8.5,8.71,81.77,81.77], bg:'#fff', cats:['digital','movies','variety'],
      sched:[['True4U Drama',90],['Home Shopping Hour',60],['Celebrity Kitchen',60],['Music Countdown',60],['Late Night Movie',120]]},
    {no:25, n:'GMM25', premium:false, category:['Digital TV','Movies & Series','Variety','News'], sub:[], logo:'assets/logos/25_GMM25.png', box:[10.19,9.99,79.23,79.23], bg:'#fff', cats:['digital','movies','variety','news'],
      sched:[['GMM25 Series',60,null,1],['Club Friday',60],['Music Live Stage',90],['Teen Series Marathon',120]]},
    {no:27, n:'CH 8', premium:false, category:['Digital TV','Movies & Series','Variety','News'], sub:[], logo:'assets/logos/27_Ch8.png', box:[13.72,13.3,71.44,71.44], bg:'#fff', cats:['digital','movies','variety','news'],
      sched:[['Muay Thai Live',120,null,1],['Channel 8 Drama',90],['Thai Folk Music',60],['News at Eight',60]]},
    {no:29, n:'MONOMAX SPORTS', premium:false, category:['Digital TV','Sports'], sub:['Multi-Sports'], logo:'assets/logos/29_MONOMAXSPORTS.png', box:[14.99,14.99,70.03,70.03], bg:'#fff', cats:['digital','sports'], tags:['multi'],
      sched:[['MONOMAX SPORTS Live',120,null,1],['Matchday Countdown',60],['Highlights Show',30],['Sports Talk',60]]},
    {no:30, n:'MCOT HD', premium:false, category:['Digital TV','Movies & Series','Variety','News'], sub:[], logo:'assets/logos/30_MCOTHD.png', box:[8.82,8.82,82.03,82.03], bg:'#202020', cats:['digital','movies','variety','news'],
      sched:[['MCOT News',60],['Thailand Morning',60],['MCOT Documentary',60],['MCOT Night News',60]]},
    {no:31, n:'ONE 31 HD', premium:false, category:['Digital TV','Movies & Series','Variety','News'], sub:[], logo:'assets/logos/31_One31.png', box:[11.31,11.5,77.0,77.0], bg:'#fff', cats:['digital','movies','variety','news'],
      sched:[['one31 Lakorn',90,null,1],['The Wall Song',90],['One Night Comedy',60],['Lakorn Rerun',90]]},
    {no:32, n:'Thairath TV HD', premium:false, category:['Digital TV','Variety','News'], sub:[], logo:'assets/logos/32_Thairath.png', box:[12.85,12.71,74.0,74.0], bg:'#202020', cats:['digital','variety','news'],
      sched:[['Thairath News',60],['Talk of the Town',60],['Thairath Drama',90],['Thairath Night News',60]]},
    {no:33, n:'3 HD', premium:false, category:['Digital TV','Movies & Series','Variety','News'], sub:[], logo:'assets/logos/33_3HD.png', box:[10.93,11.08,77.85,77.85], bg:'#202020', cats:['digital','movies','variety','news'], recent:true,
      sched:[['Ch3 Lakorn',120,null,1],['Ch3 News',60],['Weekend Variety Show',90],['Ch3 Late Night',60]]},
    {no:34, n:'AmarinTV HD', premium:false, category:['Digital TV','Movies & Series','Variety','News'], sub:[], logo:'assets/logos/34_Amarin.png', box:[15.23,15.37,69.27,69.27], bg:'#202020', cats:['digital','movies','variety','news'],
      sched:[['Amarin Lifestyle',60],['Amarin Shopping',60],['Home and Garden',30],['Amarin Drama',90],['Amarin News',60]]},
    {no:35, n:'CH7 HD', premium:false, category:['Digital TV','Movies & Series','Variety','News'], sub:[], logo:'assets/logos/35_Ch7HD.png', box:[14.64,14.82,70.36,70.36], bg:'#202020', cats:['digital','movies','variety','news'], fav:true,
      sched:[['Ch7 Lakorn',120,null,1],['Ch7 Evening News',60],['Morning Variety',90],['Muay Thai 7 Si',120]]},
    {no:36, n:'PPTV HD', premium:false, category:['Digital TV','Movies & Series','Variety','News','Sports'], sub:['Multi-Sports'], logo:'assets/logos/36_PPTV.png', box:[15.85,15.85,67.5,67.5], bg:'#fff', cats:['digital','movies','variety','news','sports'], tags:['multi'],
      sched:[['PPTV Football Live',120,null,1],['PPTV Lakorn',90],['PPTV News',60],['Football Highlights',60]]},
    {no:51, n:'FOX News', premium:true, category:['News'], sub:[], logo:'assets/logos/51_FOXNews.png', box:[-18.18,-18.18,136.36,136.36], bg:'#1b4e81', cats:['news'], crown:'gold',
      sched:[['FOX & Friends',90,null,1],['America\'s Newsroom',60],['Outnumbered',60],['The Five',60],['Special Report',60]]},
    {no:101, n:'Asian Hits', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/101_AsianHits.png', box:[8.55,10.62,81.3,81.3], bg:'#fff', cats:['movies'], crown:'gold',
      sched:[['K-Drama Marathon',90,null,1],['Asian Hits Countdown',30],['Romance Series',60],['Thai Lakorn',60]]},
    {no:106, n:'Warner', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/106_Warner.png', box:[21.41,21.41,57.17,57.17], bg:'#ffffff', cats:['movies'], crown:'gold',
      sched:[['Superman',150,'posters/superman.jpg',1],['Looney Tunes Cartoons',30],['Gotham Knights',60],['The Big Bang Theory',30],['Young Sheldon',30],['Friends',30]]},
    {no:109, n:'Mono 29 Plus', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/109_MONO29Plus.png', box:[17.99,16.71,65.55,65.55], bg:'#fff', cats:['movies'], crown:'gold',
      sched:[['Blockbuster Premiere',120,null,1],['Asian Action Hits',100],['Mono Plus Series',60],['Late Night Thriller',100]]},
    {no:116, n:'HBO', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/116_HBO.png', box:[12.91,12.91,73.6,73.6], bg:'#202020', cats:['movies'], crown:'gold', recent:true,
      sched:[['House of the Dragon',60,'posters/house-of-the-dragon.jpg',1],['The Last of Us',60,'posters/last-of-us.jpg',1],['Dune: Part Two',165],['Real Time with Bill Maher',60],['The Penguin',60]]},
    {no:117, n:'HBO Signature', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/117_HBOSignature.png', box:[14.93,13.69,70.5,70.5], bg:'#202020', cats:['movies'], crown:'gold',
      sched:[['The Last of Us',60,'posters/last-of-us.jpg'],['Succession',60],['The White Lotus',60,null,1],['True Detective',60],['Chernobyl',60]]},
    {no:118, n:'HBO Hits', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/118_HBOHits.png', box:[16.48,15.97,67.39,67.39], bg:'#202020', cats:['movies'], crown:'gold',
      sched:[['Top Gun: Maverick',135,'posters/topgun-m.jpg'],['Wicked',160,'posters/wicked.jpg',1],['The Batman',175],['Barbie',115]]},
    {no:119, n:'HBO Family', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/119_HBOFamily.png', box:[17.45,16.63,66.08,66.08], bg:'#202020', cats:['movies'], crown:'gold',
      sched:[['How to Train Your Dragon',100,'posters/how-to-train.jpg'],['Paddington 2',105],['The Lego Movie',100],['Sesame Street',30],['Kung Fu Panda 4',95]]},
    {no:120, n:'CINEMAX', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/120_CINEMAX.png', box:[12.18,12.74,74.52,74.52], bg:'#fff', cats:['movies'], crown:'gold',
      sched:[['District 9',115,'posters/district9.jpg',1],['Spider-Man: No Way Home',150,'posters/P10-spiderman.jpg'],['The Devil Wears Prada',110,'posters/P10-Devil.jpg'],['The Odyssey',140,'posters/P10_Odyssey.jpg']]},
    {no:167, n:'Bloomberg', premium:true, category:['News'], sub:[], txt:'Bloomberg', bg:'#2a2a2a', cats:['news'], crown:'gold',
      sched:[['Bloomberg Markets',60],['Bloomberg Surveillance',60],['Asia Trade',60],['Bloomberg Technology',30]]},
    {no:200, n:'Rock Entertainment', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/200_RockEntertainment.png', box:[8.45,9.26,82.78,82.78], bg:'#202020', cats:['movies'], crown:'gold',
      sched:[['Miss Universe Thailand 2026',120,'posters/miss-universe.jpg',1],['MasterChef Thailand',60,'posters/upcoming/u1.jpg'],['Rock Comedy Hour',60],['Talent Showdown',90],['Late Night Variety',60]]},
    {no:201, n:'Rock Action', premium:true, category:['Movies & Series'], sub:[], logo:'assets/logos/201_RockAction.png', box:[13.77,12.07,72.46,72.46], bg:'#202020', cats:['movies'], crown:'gold',
      sched:[['Action Movie Night',120,null,1],['Martial Arts Classics',100],['Rock Action Series',60],['Crime Thriller',100]]},
    {no:202, n:'Mono29 Music Station', premium:true, category:['Variety'], sub:[], logo:'assets/logos/202_MONO29MusicStation.png', box:[16.48,15.7,67.04,67.04], bg:'#fff', cats:['variety'], crown:'gold',
      sched:[['Music Station Countdown',60,null,1],['Concert Replay',90],['Thai Pop Hits',60],['Request Hour',60]]},
    {no:205, n:'Food Network', premium:true, category:['Variety'], sub:[], logo:'assets/logos/205_FN.png', box:[20.16,20.16,59.38,59.38], bg:'#fff', cats:['variety'], crown:'gold',
      sched:[['Diners, Drive-Ins and Dives',30],['Chopped',60,null,1],['Beat Bobby Flay',30],['Guy\'s Grocery Games',60]]},
    {no:206, n:'Asian Food Network', premium:true, category:['Variety'], sub:[], logo:'assets/logos/206_AFN.png', box:[18.12,18.12,63.77,63.77], bg:'#fff', cats:['variety'], crown:'gold',
      sched:[['Asian Street Food',30],['Chef\'s Table Asia',60,null,1],['Wok Stars',30],['Kitchen Battle',60]]},
    {no:207, n:'TLC', premium:true, category:['Variety'], sub:[], txt:'TLC', bg:'#2a2a2a', cats:['variety'], crown:'gold',
      sched:[['Say Yes to the Dress',60],['90 Day Fiancé',60,null,1],['Cake Boss',30],['Dr. Pimple Popper',60]]},
    {no:210, n:'Khong Dee Thailand', premium:true, category:['Variety'], sub:[], logo:'assets/logos/210_KhongDeeThailand.png', box:[10.52,10.05,79.59,79.59], bg:'#202020', cats:['variety'], crown:'gold',
      sched:[['Khong Dee Market Tour',30],['Thai Village Stories',60],['Local Food Hunt',30,null,1],['Crafts of Siam',30]]},
    {no:211, n:'Thainess', premium:true, category:['Variety'], sub:[], logo:'assets/logos/211_Thainess.png', box:[12.69,12.55,74.61,74.61], bg:'#fff', cats:['variety'], crown:'gold',
      sched:[['Thai Heritage',60],['Temple Treasures',60,null,1],['Thai Arts Today',30],['Festival Journey',60]]},
    {no:255, n:'TV5 Monde Asie', premium:true, category:['Variety'], sub:[], logo:'assets/logos/255_TV5MONDE.png', box:[13.0,14.59,74.0,74.0], bg:'#fff', cats:['variety'], crown:'gold',
      sched:[['Le Journal',30],['French Cinema',100,null,1],['Destination Francophonie',30],['Culture Club',60]]},
    {no:260, n:'MVTV', premium:true, category:['Others'], sub:['Shopping'], logo:'assets/logos/260_MVTV.png', box:[1.97,1.51,92.37,92.37], bg:'#fff', cats:['others'], tags:['shopping'], crown:'gold',
      sched:[['MVTV Shopping Live',60,null,1],['Home & Living',60],['Beauty Deals',30],['Kitchen Picks',60]]},
    {no:300, n:'Golf+', premium:true, category:['Sports'], sub:['Golf'], logo:'assets/logos/300_Golf+.png', box:[9.09,9.23,81.82,81.82], bg:'#fff', cats:['sports'], tags:['golf'], crown:'gold',
      sched:[['PGA Tour Live',180,null,1],['Golf Central',60],['Swing Lab',30],['LPGA Highlights',60]]},
    {no:301, n:'FutureChannel Tennis', premium:true, category:['Sports'], sub:['Tennis'], txt:'FutureChannel Tennis', bg:'#2a2a2a', cats:['sports'], tags:['tennis'], crown:'gold',
      sched:[['ATP Tour Live',150,null,1],['Tennis Weekly',30],['WTA Highlights',60],['Grand Slam Classics',90]]},
    {no:303, n:'CNBC News', logo:'news-assets/ch-cnbc.png', cats:['news'], premium:false, box:[23.13,23.13,53.74,53.74], bg:'#fff',
      sched:[['Squawk Box Asia',60,null,1],['Street Signs',60],['Capital Connection',60],['Asia Market Wrap',30],['Squawk Box Europe',90]]},
    {no:304, n:'SKY News', logo:'news-assets/ch-sky.png', cats:['news'], premium:false, box:[23.13,23.13,53.74,53.74], bg:'#fff',
      sched:[['Sky News Today',60],['The Politics Hub',60,null,1],['Sky News Breakfast',90],['The World',60],['Sunday Morning',60]]},
    {no:311, n:'Eurosport', premium:true, category:['Sports'], sub:['Multi-Sports'], logo:'assets/logos/311_Eurosport.png', box:[12.25,12.37,75.25,75.25], bg:'#fff', cats:['sports'], tags:['multi'], crown:'gold',
      sched:[['Tennis: ATP Highlights',90],['Cycling Live',120,null,1],['Snooker Masters',120],['Eurosport News',30]]},
    {no:312, n:'FutureChannel Boxing', premium:true, category:['Sports'], sub:['Boxing'], txt:'FutureChannel Boxing', bg:'#2a2a2a', cats:['sports'], tags:['boxing'], crown:'gold',
      sched:[['Fight Night Live',150,null,1],['Boxing Weekly',30],['Classic Bouts',90],['Weigh-In Live',30]]},
    {no:313, n:'Real Madrid TV', premium:true, category:['Sports'], sub:['Football','Basketball'], logo:'assets/logos/313_RealMadridTV.png', box:[13.35,14.32,70.18,70.18], bg:'#404045', cats:['sports'], tags:['football','basketball'], crown:'gold',
      sched:[['Champions League 15/16: Real Madrid vs Atlético de Madrid',120,'posters/upcoming/u2.jpg'],['Classic Highlights',60],['Training Ground Live',60,'posters/upcoming/u3.jpg'],['La Liga Review',60],['Bernabéu Stories',90]]},
    {no:401, n:'Cartoonito', premium:true, category:['Cartoons'], sub:[], logo:'assets/logos/401_Cartoonito.png', box:[9.86,9.71,80.27,80.27], bg:'#202020', cats:['cartoons'], crown:'gold',
      sched:[['Peppa Pig',30],['Thomas & Friends',30],['Batwheels',30,null,1],['Lucas the Spider',30]]},
    {no:402, n:'Cartoon Network', premium:true, category:['Cartoons'], sub:[], logo:'assets/logos/402_CartoonNetwork.png', box:[17.16,16.52,65.68,65.68], bg:'#fff', cats:['cartoons'], crown:'gold',
      sched:[['We Bare Bears',30],['The Amazing World of Gumball',30],['Teen Titans Go!',30],['Ben 10',30],['Adventure Time',30]]},
    {no:403, n:'Nickelodeon', premium:true, category:['Cartoons'], sub:[], logo:'assets/logos/403_Nickelodeon_2024.png', box:[15.83,16.22,67.56,67.56], bg:'#fff', cats:['cartoons'], crown:'gold',
      sched:[['SpongeBob SquarePants',30,null,1],['The Loud House',30],['Teenage Mutant Ninja Turtles',30],['Rugrats',30]]},
    {no:404, n:'Nick Jr.', premium:true, category:['Cartoons'], sub:[], logo:'assets/logos/404_NickJr_2024.png', box:[19.73,19.73,60.31,60.31], bg:'#fff', cats:['cartoons'], crown:'gold',
      sched:[['PAW Patrol',30,null,1],['Blue\'s Clues & You!',30],['Bubble Guppies',30],['Peppa Pig',30]]},
    {no:450, n:'Boomerang', premium:true, category:['Cartoons'], sub:[], logo:'assets/logos/450_Boomerang_2024.png', box:[18.54,17.93,62.68,62.68], bg:'#fff', cats:['cartoons'], crown:'gold',
      sched:[['Tom and Jerry',30,null,1],['Looney Tunes',30],['Scooby-Doo',30],['The Flintstones',30]]},
    {no:453, n:'Mango Mojito', premium:true, category:['Cartoons'], sub:[], txt:'Mango Mojito', bg:'#2a2a2a', cats:['cartoons'], crown:'gold',
      sched:[['Mango Mojito Toons',30,null,1],['Little Explorers',30],['Story Time',30],['Fun Lab',30]]},
    {no:501, n:'MONOMAX 1', logo:'partners/monomax.png', bg:'#ffffff', cats:['movies'], crown:'gold', premium:true, box:[9.02,9.15,82.27,82.27],
      sched:[['District 9',115,'posters/district9.jpg',1],['Liverpool vs Brentford',120,'posters/liver-ben.jpg'],['Top Gun: Maverick',135,'posters/topgun-m.jpg'],['MONOMAX Original Series',60]]},
    {no:503, n:'Discovery', premium:true, category:['Others'], sub:['Documentary'], logo:'assets/logos/503_Discovery.png', box:[9.88,9.88,79.93,79.93], bg:'#202020', cats:['others'], tags:['documentary'], crown:'gold',
      sched:[['How It\'s Made',30],['Shark Week',60,null,1],['Gold Rush',60],['MythBusters',60],['Deadliest Catch',60]]},
    {no:505, n:'Samrujlok', premium:true, category:['Others'], sub:['Documentary'], logo:'assets/logos/505_Samrujlok.png', box:[11.59,11.74,76.51,76.51], bg:'#fff', cats:['others'], tags:['documentary'], crown:'gold',
      sched:[['Explore the World',60,null,1],['Wild Thailand',60],['Ocean Secrets',60],['Hidden Places',30]]},
    {no:506, n:'Mysci', premium:true, category:['Others'], sub:['Documentary'], logo:'assets/logos/506_MySCI.png', box:[13.83,13.54,72.35,72.35], bg:'#202020', cats:['others'], tags:['documentary'], crown:'gold',
      sched:[['Science Unlocked',60,null,1],['How Things Work',30],['Space Frontier',60],['Lab Challenge',30]]},
    {no:507, n:'Animal Show', premium:true, category:['Others'], sub:['Documentary'], logo:'assets/logos/507_AnimalShow.png', box:[8.11,8.11,83.78,83.78], bg:'#fff', cats:['others'], tags:['documentary'], crown:'gold',
      sched:[['Animal Rescue',60,null,1],['Wild Babies',30],['Safari Live',60],['Pet Clinic',30]]},
    {no:550, n:'NHK World Japan', premium:true, category:['News'], sub:[], logo:'assets/logos/550_NHK.png', box:[15.98,15.98,67.77,67.77], bg:'#fff', cats:['news'], crown:'gold',
      sched:[['NHK World Japan Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['NHK World Japan Headlines',30]]},
    {no:551, n:'RT Documentary', premium:true, category:['Others'], sub:['Documentary'], logo:'assets/logos/551_RTDocumentary.png', box:[18.49,18.61,62.78,62.78], bg:'#fff', cats:['others'], tags:['documentary'], crown:'gold',
      sched:[['RT Doc: Frontiers',60,null,1],['Hidden Russia',60],['Arctic Journeys',60],['People and Places',30]]},
    {no:603, n:'CNN', premium:true, category:['News'], sub:[], logo:'assets/logos/603_CNN.png', box:[15.45,15.59,68.83,68.83], bg:'#fff', cats:['news'], crown:'gold', fav:true, recent:true, tsNow:true,
      sched:[['CNN News Central',60],['Anderson Cooper 360°',60,null,1],['The Lead with Jake Tapper',60],['Amanpour',30],['CNN Newsroom',90],['World Sport',30]]},
    {no:604, n:'BBC News', premium:true, category:['News'], sub:[], logo:'assets/logos/604_BBCNews.png', box:[11.38,11.38,77.25,77.25], bg:'#202020', cats:['news'], crown:'gold',
      sched:[['BBC News at Ten',60],['HARDtalk',30],['Newsnight',60,null,1],['World Business Report',30],['BBC World News',60],['Click',30]]},
    {no:640, n:'CCTV 4', premium:true, category:['News'], sub:[], logo:'assets/logos/640_CCTV4.png', box:[12.64,12.49,74.72,74.72], bg:'#202020', cats:['news'], crown:'gold',
      sched:[['CCTV 4 Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['CCTV 4 Headlines',30]]},
    {no:641, n:'CGTN', premium:true, category:['News'], sub:[], logo:'assets/logos/641_CGTN.png', box:[8.34,7.03,83.64,83.64], bg:'#fff', cats:['news'], crown:'gold',
      sched:[['CGTN Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['CGTN Headlines',30]]},
    {no:650, n:'CNA', premium:true, category:['News'], sub:[], logo:'assets/logos/650_ChannelNewsAsia.png', box:[15.82,15.82,68.08,68.08], bg:'#202020', cats:['news'], crown:'gold',
      sched:[['CNA Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['CNA Headlines',30]]},
    {no:651, n:'Euronews', premium:true, category:['News'], sub:[], logo:'assets/logos/651_EuroNews.png', box:[12.84,12.47,74.69,74.69], bg:'#fff', cats:['news'], crown:'gold',
      sched:[['Euronews Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['Euronews Headlines',30]]},
    {no:652, n:'DW', premium:true, category:['News'], sub:[], logo:'assets/logos/652_DW.png', box:[7.5,6.35,84.33,84.33], bg:'#202020', cats:['news'], crown:'gold',
      sched:[['DW Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['DW Headlines',30]]},
    {no:653, n:'France 24', premium:true, category:['News'], sub:[], logo:'assets/logos/653_France24.png', box:[23.13,23.13,53.74,53.74], bg:'#00a8e7', cats:['news'], crown:'gold',
      sched:[['France 24 Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['France 24 Headlines',30]]},
    {no:654, n:'Arirang', premium:true, category:['Variety'], sub:[], logo:'assets/logos/654_Arirang.png', box:[9.04,9.04,81.61,81.61], bg:'#fff', cats:['variety'], crown:'gold',
      sched:[['Arirang Today',30],['K-Culture Showcase',60,null,1],['Pops in Seoul',30],['Korea Travel Diary',60]]},
    {no:655, n:'News 1', premium:true, category:['News'], sub:[], logo:'assets/logos/655_News1.png', box:[13.6,14.33,72.79,72.79], bg:'#fff', cats:['news'], crown:'gold',
      sched:[['News 1 Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['News 1 Headlines',30]]},
    {no:656, n:'FOX Business', premium:true, category:['News'], sub:[], txt:'FOX Business', bg:'#2a2a2a', cats:['news'], crown:'gold',
      sched:[['FOX Business Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['FOX Business Headlines',30]]},
    {no:657, n:'Al Jazeera', premium:true, category:['News'], sub:[], logo:'assets/logos/657_AlJazeera.png', box:[19.69,19.92,59.92,59.92], bg:'#fff', cats:['news'], crown:'gold',
      sched:[['Al Jazeera Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['Al Jazeera Headlines',30]]},
    {no:658, n:'Top News', premium:true, category:['News'], sub:[], logo:'assets/logos/658_TOPNEWS.png', box:[17.28,17.28,65.43,65.43], bg:'#fff', cats:['news'], crown:'gold',
      sched:[['Top News Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['Top News Headlines',30]]},
    {no:659, n:'RT Channel', premium:true, category:['News'], sub:[], logo:'assets/logos/659_RTChannel.png', box:[22.03,21.81,56.15,56.15], bg:'#fff', cats:['news'], crown:'gold',
      sched:[['RT Channel Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['RT Channel Headlines',30]]},
    {no:660, n:'TVBS', premium:true, category:['News'], sub:[], logo:'assets/logos/660_TVBSNews.png', box:[17.04,17.04,65.93,65.93], bg:'#202020', cats:['news'], crown:'gold',
      sched:[['TVBS Newsroom',60,null,1],['World Report',30],['Business Today',30],['Asia Tonight',60],['TVBS Headlines',30]]},
    {no:716, n:'ETV', premium:true, category:['Others'], sub:['Education'], logo:'assets/logos/716_ETV.png', box:[-0.43,0.34,98.93,98.93], bg:'#fff', cats:['others'], tags:['education'], crown:'gold',
      sched:[['ETV Classroom',60],['English for Everyone',30,null,1],['Science Lab',30],['History Hour',60]]},
    {no:902, n:'Asian Games 902', logo:'tv-features-test/live-stream-assets/channel-asian-games.png', fit:'cover', bg:'#fff', cats:['digital','sports'], tags:['multi','tennis','boxing'], fav:true, premium:false,
      sched:[['Asian Games 2026: Tennis Finals',150,'posters/upcoming/u4.png',1],['Boxing: Semifinals',120],['Medal Ceremony Live',30],['Asian Games Daily',60]]},
    {no:907, n:'Asian Games 907', logo:'tv-features-test/shorts-assets/channel-907.png', fit:'cover', bg:'#fff', cats:['digital','sports'], tags:['multi','basketball','rugby'], premium:false,
      sched:[['Asian Games 2026: Football Group Stage',120,'posters/SC.jpg',1],['Basketball 3x3: Quarterfinals',90],['Rugby Sevens: Pool A',90],['Asian Games Daily',60]]},
    {no:991, n:'W-Sports', premium:true, category:['Sports'], sub:['Women\'s Sports'], logo:'assets/logos/991_W-Sports.png', box:[23.13,23.13,53.74,53.74], bg:'#404045', cats:['sports'], tags:['multi'], crown:'gold',
      sched:[['Malaysia Regional Cup \'26: Wildcats v Sneakers',120,'posters/all.jpg',1],['Heroines (S2E02)',60],['All or Nothing: Brazil',60,'posters/all.jpg'],['Hoops Asia',60],['W-Sport Tonight',30]]},
    {no:992, n:'FutureChannel Rugby', premium:true, category:['Sports'], sub:['Rugby'], txt:'FutureChannel Rugby', bg:'#2a2a2a', cats:['sports'], tags:['rugby'], crown:'gold',
      sched:[['Rugby Sevens Live',120,null,1],['Rugby Weekly',30],['Test Match Replay',100],['Try of the Week',30]]},
    {no:993, n:'FutureChannel Motorsport', premium:true, category:['Sports'], sub:['Motorsport'], txt:'FutureChannel Motorsport', bg:'#2a2a2a', cats:['sports'], tags:['motorsport'], crown:'gold',
      sched:[['Motorsport Live',150,null,1],['Pit Lane',30],['Rally Highlights',60],['Superbike Race',90]]},
    {no:994, n:'PLAY SPORTS (Football)', premium:true, category:['Sports'], sub:['Football'], txt:'PLAY SPORTS (Football)', bg:'#2a2a2a', cats:['sports'], tags:['football'], crown:'gold',
      sched:[['Premier League Live',120,null,1],['Matchday Review',60],['Goals of the Week',30],['Football Talk',60]]},
    {no:995, n:'PLAY SPORTS (NBA)', premium:true, category:['Sports'], sub:['Basketball'], txt:'PLAY SPORTS (NBA)', bg:'#2a2a2a', cats:['sports'], tags:['basketball'], crown:'gold',
      sched:[['NBA Live',150,null,1],['NBA Action',30],['Game Recap',60],['Hoops Classics',90]]},
    {no:996, n:'Premier Sports', premium:true, category:['Sports'], sub:['Multi-Sports'], txt:'Premier Sports', bg:'#2a2a2a', cats:['sports'], tags:['multi'], crown:'gold',
      sched:[['Premier Sports Live',120,null,1],['Rugby League',90],['Sports Wrap',30],['Fight Night',90]]},
    {no:997, n:'PLAY SPORTS (PGA)', premium:true, category:['Sports'], sub:['Golf'], logo:'assets/logos/997_PLAYSPORTS(PGA).png', fit:'cover', cats:['sports'], tags:['golf'], crown:'gold', recent:true,
      sched:[['Formula 1: Grand Prix Qualifying',120,'posters/f1.jpg',1],['Paddock Pass',30],['PGA Tour: Final Round Highlights',90],['Motorsport Weekly',60],['World Superbike: Race 2',90],['Golf Central',60]]},
    {no:998, n:'MUTV', premium:true, category:['Sports'], sub:['Football'], logo:'assets/logos/998_MUTV.png', box:[11.49,11.49,76.6,76.6], bg:'#202020', cats:['sports'], tags:['football'], crown:'owned', fav:true, recent:true, tsNow:true,
      sched:[['PL Match: v Chelsea (A) 25/26',120,'posters/maxresdefault.jpg',1],['Inside United',60],['Sir Alex Ferguson: Never Give In',90,'posters/maxresdefault.jpg'],['Reserves Highlights',60],['Classic Match: 1999 Final',120],['United Review',30]]},
    {no:999, n:'PLAY SPORTS (NFL)', premium:true, category:['Sports'], sub:['American Football'], txt:'PLAY SPORTS (NFL)', bg:'#2a2a2a', cats:['sports'], tags:['multi'], crown:'gold',
      sched:[['NFL Game Pass Live',180,null,1],['NFL RedZone',60],['Game Recap',60],['NFL Films',60]]},
  ];
  CHANNELS.sort(function(a, b){ return a.no - b.no; });   // lowest channel number first, everywhere
  CHANNELS.forEach(function(c){ if(c.crown) c.pkg = c.cats.indexOf('sports') >= 0 ? 'sports' : 'ultimate'; });   // its package (above)

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
  // a favourite: the channel's own, unless changed this session in the TV Guide or the player (tvFavs, by name). Read it
  // fresh each time, so a page coming back from the player shows the heart added there
  function isFav(c){
    try { var f = JSON.parse(sessionStorage.getItem('tvFavs') || 'null'); if(f && c.n in f) return !!f[c.n]; } catch(e){}
    return !!c.fav;
  }
  // the TV Guide card rails (Home, Sport, News): favourites at the very front, in the rail's own order, then any other
  // favourite of `pool` the rail doesn't list (make: its rail item), then the rest. name(item): the item's channel name
  function favFirst(list, name, pool, make){
    function fav(x){ var c = byName(name(x)); return !!c && isFav(c); }
    var has = {}; list.forEach(function(x){ has[name(x)] = 1; });
    var more = !pool ? [] : pool.filter(function(c){ return isFav(c) && !has[c.n]; }).sort(function(a, b){ return a.no - b.no; }).map(make);
    return list.filter(fav).concat(more, list.filter(function(x){ return !fav(x); }));
  }
  // a rail page coming back out of the browser's page cache runs no scripts: rebuild it if a favourite changed meanwhile
  function favKey(){ return CHANNELS.filter(isFav).map(function(c){ return c.n; }).join('|'); }
  function reloadOnFavChange(){
    var key = favKey();
    addEventListener('pageshow', function(e){ if(e.persisted && favKey() !== key) location.reload(); });
  }
  // what a channel card shows (Home's TV Guide rail, Sport's and News' channel rails): the programme on now and the next,
  // their times ("21:30"), how far in (0-100) and whether the one on now has Time Shift
  function clock(d){ var m = d.getMinutes(); return d.getHours() + ':' + (m < 10 ? '0' : '') + m; }   // 24-hour H:MM, everywhere
  function onNow(c, when){
    when = when || new Date();
    var i = onAt(c, when), p = c.progs[i], n = c.progs[i + 1] || p;
    return { now:p, next:n, pct:Math.max(0, Math.min(100, Math.round((when - p.start) / (p.end - p.start) * 100))),
             startedAt:clock(p.start), nextAt:clock(n.start), ts:!!p.ts, fav:isFav(c) };
  }
  // a channel's logo on every page: its picture, or (no logo, or the picture fails to load) the placeholder, a box with
  // the channel's name. logoAttrs gives an <img> its alt and the onerror that swaps the placeholder in
  function attrEsc(v){ return String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function ph(name){
    var w = String(name).split(' '), lines = [String(name)];
    if(name.length > 10 && w.length > 1){   // two lines, split near the middle
      var best = 1, gap = 1e9;
      for(var i = 1; i < w.length; i++){ var d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length); if(d < gap){ gap = d; best = i; } }
      lines = [w.slice(0, best).join(' '), w.slice(best).join(' ')];
    }
    var len = Math.max.apply(null, lines.map(function(l){ return l.length; })), fs = Math.min(26, Math.floor(190 / Math.max(len, 1)));
    var txt = lines.map(function(l, i){ return '<text x="60" y="' + (60 + (i - (lines.length - 1) / 2) * fs * 1.15) + '" dominant-baseline="central" text-anchor="middle">' + attrEsc(l) + '</text>'; }).join('');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#2a2a2a"/>' +
      '<g fill="#fff" font-family="Plus Jakarta Sans, Open Sans, sans-serif" font-weight="700" font-size="' + fs + '">' + txt + '</g></svg>');
  }
  function logoSrc(c){ return c.logo || ph(c.txt || c.n); }
  function logoFail(img){ img.onerror = null; img.src = ph(img.alt || ''); img.style.cssText = 'left:0;top:0;width:100%;height:100%;object-fit:cover;background:#2a2a2a'; }
  function logoAttrs(c){ return ' alt="' + attrEsc(c.n) + '" onerror="TV.logoFail(this)"'; }
  // a channel's logo disc, sized as everywhere else (box: the picture placed so its content sits centred, fit cover: a
  // picture that is a disc already); cls gives it its size and shape (tvguide-card.css .ch-logo)
  function logoHtml(c, cls){
    var b = c.logo && (c.box || (c.fit === 'contain' ? [15, 15, 70, 70] : null));
    return '<span class="' + (cls || '') + ' ch-logo" style="background:' + (c.logo ? c.bg || 'transparent' : '#2a2a2a') + '"><img src="' + logoSrc(c) + '"' + logoAttrs(c) +
      (b ? ' style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + '%;height:' + b[3] + '%"' : ' class="cover"') + '></span>';
  }
  window.TV = { CHANNELS:CHANNELS, onAt:onAt, byName:byName, isFav:isFav, favFirst:favFirst, reloadOnFavChange:reloadOnFavChange, onNow:onNow, clock:clock, ph:ph, logoSrc:logoSrc, logoFail:logoFail, logoAttrs:logoAttrs, logoHtml:logoHtml };
})();
