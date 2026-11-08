/*
  content.js: every title in the prototype and where it opens. One file for all pages:
    window.MD       movies and series (the Movie page's catalogue, details, prices, progress), below
    window.SHORTS   the short dramas (plat: their app, ReelShort or DramaBox: badges/tag-*.png), window.SHORT their
                    episodes, locks and progress, below
    window.Content  the router: any card → its detail page (movie-detail.html for a movie or series, short-detail.html
                    for a short), and a title's player (player.html); Content.hero(info) what the card's screen text
                    shows, word for word what that detail page shows; Content.related(info, n) its You May Also
                    Like (the same type only); Content.metaHtml(info, tag) its meta row. See the end of the file.
*/
/*
  MD: the Movie page's titles and lists, shared by movie.html and movie-detail.html (the detail page of any title).
    MD.M            every title: t, p (2:3 poster), w (16:9 picture), plat (platform tag), g (genres), y, len, age, d
    MD.CONTINUE     Continue Watching: k, w (minutes watched) of `of`
    MD.FOR_YOU      For You (PPV): k, price
    MD.RENT         Rent or Buy: k, b (badge)
    MD.MY_RENTAL    titles already rented
    MD.state(k)     what the detail page offers: 'soon' (not out yet: MD.soon(k) its release), 'resume' (in Continue Watching), 'play' (rented, bought this session, or
                    in the viewer's package), 'buy' (For You / Rent or Buy, not yet bought); MD.price(k) its price
    MD.own(k)       mark a title bought / its package subscribed (this session)
    MD.subscribe(plat), MD.subscribed(plat)   a platform's package bought this session (packages.js: netflix, hbo, ...,
                    reelshort, dramabox): its premium titles and shorts are the viewer's (sessionStorage ottSubscribed)
    m.v             a title's video: plays over its picture wherever its picture fills the screen (Home, Movie, its detail
                    page; hero-video.js)
    m.premium       a premium title: sold on its own or in a package; Content.crown(info) says whether the viewer has
                    it ('owned') or not ('gold'). Its cards show no crown; its detail page's meta row says Premium (gold only)
    MD.cw(k)        where the title was left: this session's progress (player.html), else Continue Watching
    MD.setProgress(k, w, of[, s, e])   remember it (minutes watched of `of`; a series also its season / episode);
                    MD.minutes(k) its length in minutes
  Series (a title whose length reads "N Seasons"): MD.series(k), MD.seasons(k) (up to 3), MD.episodes(k, s) (8 a season:
    n, t, m minutes, d), MD.episode(k, s, e), MD.next(k, s, e) (the one after, or null); MD.cw(k) also gives s / e.
    MD.until(k) the rental's last day ({d, t}) for a rented title, else null.
    MD.buyPrice(k), MD.rentPrice(k)   what Buy / Rent cost on its detail page (0: no such option); MD.price(k) the
                    buy price, else the rent price. MD.rent(k) rent it (this session, MD.RENT_HOURS: MD.MY_RENTAL, MD.until).
                    Buy / Rent are paid on package-detail.html?k=K&opt=buy|rent (m.ev: an event, its Event Pass)
    m.buy, m.rent, m.pkg   a title's own options (its detail page: View Package if m.pkg, Buy, Rent); a title without
                    them keeps its price from the lists below (For You, Rent or Buy, series)
    MD.metaHtml(m)  its meta row (genres, year, length, age pill, quality tag); MD.watched(k) how far in, or null
    MD.qtag(m)  its quality tag: 4K Dolby (m.q '4k') or the HD pill
    MD.bg(k)    the title's full-screen picture (its b, else w, else p): every page's screen text and its detail page
*/
(function(){
  var PP = 'posters_portrait/', P = 'posters/', K = 'kids-assets/';
  // a news series' episodes (MD.M eps), oldest first: [air date, episode title, its words (else the series')], img its
  // picture (news-assets/), m its minutes; more (with morePics, full paths): newer episodes after them, [3] a full-screen picture
  function newsEps(dir, m, pics, list, morePics, more){
    var eps = list.map(function(e, i){ return { date:e[0], t:e[1], d:e[2], img:'news-assets/' + dir + pics[i], m:m }; });
    (more || []).forEach(function(e, i){ eps.push({ date:e[0], t:e[1], d:e[2], img:morePics[i], bg:e[3], m:m }); });   // (episodes whose pictures sit elsewhere: their own paths)
    return eps;
  }
  var M = {
    d9:     {t:'District 9', w:P + 'district9.jpg', v:'video/District9.mp4', plat:'monomax', g:['Sci-Fi', 'Action'], y:2009, len:'1h 52m', age:'16+',
             d:'Aliens stranded over Johannesburg are forced into a slum, until a field agent exposed to their technology starts to become one of them.'},
    topgun: {t:'Top Gun: Maverick', p:PP + 'topgun_m.jpg', w:P + 'topgun-m.jpg', plat:'hbo', g:['Action', 'Drama'], y:2022, len:'2h 11m', age:'13+',
             d:'After thirty years, Maverick trains a new generation of Top Gun graduates for a dangerous mission.'},
    wicked: {t:'Wicked', w:P + 'wicked.jpg', v:'video/wicked.mp4', plat:'prime', g:['Musical', 'Fantasy'], y:2024, len:'2h 40m', age:'G',
             d:'The untold story of the witches of Oz: Elphaba and Glinda, long before Dorothy arrived.'},
    superman:{t:'Superman', w:P + 'superman.jpg', plat:'hbo', g:['Action', 'Sci-Fi'], y:2025, len:'2h 9m', age:'13+',
             d:'The Man of Steel balances his Kryptonian heritage with his human upbringing as the ultimate protector of Earth.'},
    house:  {t:'House of the Dragon', p:PP + 'House.jpg', w:P + 'house-of-the-dragon.jpg', plat:'hbo', g:['Fantasy', 'Drama'], y:2024, len:'2 Seasons', age:'18+',
             d:'Set 200 years before Game of Thrones, the Targaryen dynasty tears itself apart in a war for the Iron Throne.'},
    lastofus:{t:'The Last of Us', w:P + 'last-of-us.jpg', plat:'hbo', g:['Drama', 'Thriller'], y:2025, len:'2 Seasons', age:'18+',
             d:'Joel and Ellie journey across a post-pandemic United States, facing new threats and impossible choices.'},
    loki:   {t:'Loki', w:P + 'loki.jpg', plat:'disney', g:['Fantasy', 'Adventure'], y:2023, len:'2 Seasons', age:'13+',
             d:'The God of Mischief must fix a fractured timeline while pursued by the Time Variance Authority.'},
    dragon: {t:'How to Train Your Dragon', w:P + 'how-to-train.jpg', plat:'prime', g:['Family', 'Adventure'], y:2025, len:'2h 5m', age:'G',
             d:'A young Viking and an injured dragon form an unlikely friendship that changes their island forever.'},
    john:   {t:'John Wick: Chapter 4', p:PP + 'John.jpg', plat:'netflix', g:['Action', 'Thriller'], y:2023, len:'2h 49m', age:'18+',
             d:'John Wick uncovers a path to defeating the High Table, but must face a powerful new enemy first.'},
    venom:  {t:'Venom: Let There Be Carnage', p:PP + 'Venom.jpg', plat:'netflix', g:['Action', 'Sci-Fi'], y:2021, len:'1h 37m', age:'13+',
             d:'Eddie Brock and Venom face Cletus Kasady, a serial killer who becomes host to the symbiote Carnage.'},
    avatar: {t:'Avatar: Fire and Ash', p:PP + 'avatar.jpg', plat:'disney', g:['Sci-Fi', 'Adventure'], y:2025, len:'3h 17m', age:'13+',
             d:'Jake and Neytiri\'s family meets the Ash People, a fierce Na\'vi clan, in a new chapter on Pandora.'},
    f1:     {t:'F1: The Movie', p:PP + 'F1.jpg', w:P + 'f1.jpg', plat:'prime', g:['Action', 'Sport'], y:2025, len:'2h 35m', age:'13+',
             d:'A once-promising Formula 1 driver returns to mentor a young rookie and chase one last shot at glory.'},
    // sports films (Sport's Related Content)
    rocky:  {t:'Rocky', p:PP + 'sport/rc-rocky.webp', plat:'prime', g:['Drama', 'Sport'], y:1976, len:'2h 0m', age:'13+',
             d:'A small-time Philadelphia boxer gets a million-to-one shot at the world heavyweight title.'},
    creed:  {t:'Creed', p:PP + 'sport/rc-creed.webp', plat:'prime', g:['Drama', 'Sport'], y:2015, len:'2h 13m', age:'13+',
             d:'Apollo Creed\'s son asks an aging Rocky Balboa to train him, and steps into the ring to make his own name.'},
    blindside:{t:'The Blind Side', p:PP + 'sport/rc-blindside.webp', plat:'hbo', g:['Drama', 'Sport'], y:2009, len:'2h 9m', age:'13+',
             d:'A homeless teenager finds a family and a future in football, in the extraordinary true story of Michael Oher.'},
    longestyard:{t:'The Longest Yard', p:PP + 'sport/rc-longestyard.webp', plat:'prime', g:['Comedy', 'Sport'], y:2005, len:'1h 53m', age:'13+',
             d:'A jailed former quarterback puts together a team of inmates to take on the guards in one brutal football game.'},
    // football documentaries (Sport: a football league's Related Content)
    mourinho:{t:'Mourinho', p:PP + 'sport/rc-mourinho.webp', plat:'netflix', g:['Documentary', 'Sport'], y:2026, len:'1 Season', age:'13+',
             d:'José Mourinho, in his own words: from Porto to Chelsea, Inter and Real Madrid, the trophies, the feuds and the man behind "The Special One".'},
    beckham:{t:'Beckham', p:PP + 'sport/rc-beckham.webp', plat:'netflix', g:['Documentary', 'Sport'], y:2023, len:'1 Season', age:'13+',
             d:'David Beckham looks back on his life and career, from a boy in East London to Manchester United, Real Madrid and global fame, with the highs and lows in between.'},
    pele:   {t:'Pelé', p:PP + 'sport/rc-pele.webp', plat:'netflix', g:['Documentary', 'Sport'], y:2021, len:'1h 48m', age:'13+',
             d:'Pelé\'s rise from a poor childhood to three World Cups with Brazil, set against a country changing around him.'},
    ronaldinho:{t:'Ronaldinho: The One and Only', p:PP + 'sport/rc-ronaldinho.webp', plat:'netflix', g:['Documentary', 'Sport'], y:2025, len:'1 Season', age:'13+',
             d:'The smile, the tricks and the trophies: Ronaldinho\'s journey from Porto Alegre to Barcelona and the top of world football.'},
    goal:   {t:'Goal! The Dream Begins', p:PP + 'sport/rc-goal.webp', plat:'netflix', g:['Drama', 'Sport'], y:2005, len:'1h 58m', age:'13+',
             d:'A young Mexican immigrant in Los Angeles gets the chance of a lifetime: a trial at Newcastle United.'},
    goal2:  {t:'Goal II: Living the Dream', p:PP + 'sport/rc-goal2.webp', plat:'netflix', g:['Drama', 'Sport'], y:2007, len:'1h 49m', age:'13+',
             d:'Santiago Muñez signs for Real Madrid, and finds that fame and the Champions League come at a price.'},
    secretariat:{t:'Secretariat', p:PP + 'sport/rc-secretariat.webp', plat:'disney', g:['Drama', 'Sport'], y:2010, len:'2h 3m', age:'G',
             d:'A housewife takes over her father\'s stables and bets everything on the horse that will win the Triple Crown.'},
    spacejam:{t:'Space Jam', p:PP + 'sport/rc-spacejam.webp', plat:'hbo', g:['Animation', 'Sport'], y:1996, len:'1h 28m', age:'G',
             d:'Michael Jordan comes out of retirement to help Bugs Bunny and the Looney Tunes win a basketball game against aliens.'},
    spacejam2:{t:'Space Jam: A New Legacy', p:PP + 'sport/rc-spacejam2.webp', plat:'hbo', g:['Animation', 'Sport'], y:2021, len:'1h 55m', age:'G',
             d:'LeBron James teams up with the Tune Squad to win back his son from a rogue artificial intelligence.'},
    debt:   {t:'The Debt Collector', p:PP + 'debt.jpg', plat:'netflix', g:['Action', 'Crime'], y:2026, len:'1h 52m', age:'18+',
             d:'A debt collector with a violent past takes one last job that drags him back into Bangkok\'s underworld.'},
    lotr:   {t:'The Lord of the Rings: The Return of the King', p:PP + 'lotr/r1.jpg', plat:'disney', g:['Fantasy', 'Adventure'], y:2003, len:'3h 21m', age:'13+',
             d:'Gandalf and Aragorn lead the World of Men against Sauron\'s army as Frodo and Sam near Mount Doom.'},
    hobbit: {t:'The Hobbit: The Battle of the Five Armies', p:PP + 'lotr/r3.jpg', plat:'hbo', g:['Fantasy', 'Adventure'], y:2014, len:'2h 24m', age:'13+',
             d:'Bilbo and the dwarves face the dragon Smaug\'s fury, and five armies march on the Lonely Mountain.'},
    lastking:{t:'The Last Kingdom', p:PP + 'lotr/r5.jpg', plat:'netflix', g:['Drama', 'History'], y:2022, len:'5 Seasons', age:'18+',
             d:'Raised by Vikings, Uhtred of Bebbanburg fights for the birth of England between two worlds.'},
    vikings:{t:'Vikings', p:PP + 'lotr/r6.jpg', plat:'prime', g:['Drama', 'History'], y:2020, len:'6 Seasons', age:'18+',
             d:'The legendary Norse hero Ragnar Lothbrok rises from farmer to king, raiding across the seas.'},
    got:    {t:'Game of Thrones', p:PP + 'lotr/r7.jpg', plat:'hbo', g:['Fantasy', 'Drama'], y:2019, len:'8 Seasons', age:'18+',
             d:'Nine noble families wage war for control of Westeros, while an ancient enemy returns from the north.'},
    huntsman:{t:'The Huntsman: Winter\'s War', p:PP + 'lotr/r8.jpg', plat:'prime', g:['Fantasy', 'Adventure'], y:2016, len:'1h 54m', age:'13+',
             d:'Eric the Huntsman and the warrior Sara must stop the Ice Queen Freya and her sister Ravenna from seizing the Enchanted Forest.'},
    stardust:{t:'Stardust', p:PP + 'lotr/r9.jpg', plat:'netflix', g:['Fantasy', 'Adventure'], y:2007, len:'2h 7m', age:'13+',
             d:'To win his true love\'s heart, a young man crosses into a magical realm to fetch a fallen star, and finds she is a woman named Yvaine.'},
    pirates:{t:'Pirates of the Caribbean: The Curse of the Black Pearl', p:PP + 'lotr/r10.jpg', plat:'disney', g:['Adventure', 'Fantasy'], y:2003, len:'2h 23m', age:'13+',
             d:'Blacksmith Will Turner teams up with the eccentric pirate Jack Sparrow to rescue Elizabeth Swann from a crew of cursed pirates.'},
    readyornot:{t:'Ready or Not', p:PP + 'lotr/r11.jpg', plat:'disney', g:['Horror', 'Thriller'], y:2019, len:'1h 35m', age:'18+',
             d:'A new bride\'s wedding night turns deadly when her rich in-laws force her into a game of hide-and-seek where losing means death.'},
    // My List (Home): w their 16:9 picture (posters/mylist/)
    queensgambit:{t:'The Queen\'s Gambit', w:P + 'mylist/m1.jpg', plat:'netflix', g:['Drama'], y:2020, len:'1 Season', age:'16+',
             d:'An orphaned chess prodigy fights her own demons on her way to the top of the 1960s chess world.'},
    guilty:{t:'The Guilty', w:P + 'mylist/m2.jpg', plat:'netflix', g:['Thriller', 'Crime'], y:2021, len:'1h 30m', age:'16+',
             d:'A troubled police officer working the 911 desk races to save a caller in danger over one tense morning.'},
    reply1988:{t:'Reply 1988', w:P + 'mylist/m3.jpg', plat:'netflix', g:['Comedy', 'Drama'], y:2015, len:'1 Season', age:'13+',
             d:'Five friends and their families share the joys and growing pains of life in one Seoul neighborhood in 1988.'},
    fourweddings:{t:'Four Weddings and a Funeral', w:P + 'mylist/m4.jpg', plat:'prime', g:['Romance', 'Comedy'], y:1994, len:'1h 57m', age:'16+',
             d:'A charming but commitment-shy Englishman keeps meeting the same American woman at a series of weddings, and one funeral.'},
    // iQIYI (Home: Date Night Picks, We think you'll love this, Worlds in Chaos; Movie: Series)
    predict:{t:'Predict You in 3 Seconds', p:PP + 'iqiyi/q1.jpg', plat:'iqiyi', g:['Romance', 'Fantasy'], y:2026, len:'1 Season', age:'13+',
             d:'A woman who can see three seconds into the future keeps seeing the same man in every vision, and can\'t decide if he is her fate or her danger.'},
    ning:{t:'The Rise of Ning', p:PP + 'iqiyi/q2.jpg', plat:'iqiyi', g:['Romance', 'Period'], y:2024, len:'1 Season', age:'13+',
             d:'A sheltered noble daughter rises through palace intrigue and family betrayal to protect the people she loves, with an unlikely ally at her side.'},
    mist:{t:'Into the Mist', p:PP + 'iqiyi/q3.jpg', plat:'iqiyi', g:['Romance', 'Drama'], y:2025, len:'1 Season', age:'13+',
             d:'Years after a misty summer that tore them apart, two former classmates meet again and find their feelings never cleared.'},
    midnight:{t:'Lost in the Light', p:PP + 'iqiyi/q4.jpg', plat:'iqiyi', g:['Romance', 'Drama'], y:2025, len:'1 Season', age:'16+',
             d:'A guarded lawyer and the heiress he was hired to watch fall into a love affair neither of their families can know about.'},
    momentforever:{t:'A Moment But Forever', p:PP + 'iqiyi/q5.jpg', plat:'iqiyi', g:['Fantasy', 'Romance'], y:2025, len:'1 Season', age:'13+',
             d:'A mortal girl and an immortal swordsman share one fleeting moment that binds them across a thousand years.'},
    heroine:{t:'Heroine of the Battlefield', p:PP + 'iqiyi/q6.jpg', plat:'iqiyi', g:['Action', 'Period'], y:2024, len:'1 Season', age:'16+',
             d:'Disguised as a man, a general\'s daughter leads her father\'s army to war, and the crown prince is the only one who knows her secret.'},
    // WeTV (Home: Date Night Picks, We think you'll love this, Because You Watched; Movie: Series)
    aboutlove:{t:'About Love', p:PP + 'wetv/w1.jpg', plat:'wetv', g:['Romance', 'Comedy'], y:2025, len:'1 Season', age:'13+',
             d:'A sharp-tongued love columnist and a charming bar owner trade toasts and barbs, until their war of words turns into a romance.'},
    peacock:{t:'The Peacock Envoy\'s Love', p:PP + 'wetv/w2.jpg', plat:'wetv', g:['Fantasy', 'Romance'], y:2025, len:'1 Season', age:'13+',
             d:'A peacock spirit sent to the mortal realm as an envoy falls for the young woman she was meant to guide home.'},
    followheart:{t:'Follow Your Heart', p:PP + 'wetv/w3.jpg', plat:'wetv', g:['Romance', 'Period'], y:2024, len:'1 Season', age:'13+',
             d:'A sharp-witted lady and a stern imperial guard are forced to work together to solve a string of court mysteries, and fall in love along the way.'},
    generation:{t:'Generation to Generation', p:PP + 'wetv/w4.jpg', plat:'wetv', g:['Fantasy', 'Romance'], y:2024, len:'1 Season', age:'13+',
             d:'An immortal and a mortal maiden meet again across lifetimes, bound by a love that heaven itself has forbidden.'},
    perfecther:{t:'Perfect Her', p:PP + 'wetv/w5.jpg', plat:'wetv', g:['Romance', 'Drama'], y:2024, len:'1 Season', age:'16+',
             d:'Reborn into another woman\'s life, a betrayed heiress uses her second chance to take back everything that was stolen from her.'},
    overdo:{t:'Overdo', p:PP + 'wetv/w6.jpg', plat:'wetv', g:['Romance', 'Period'], y:2025, len:'1 Season', age:'16+',
             d:'In 1930s Shanghai, a society heiress and a mysterious businessman play a dangerous game of love and lies on the eve of war.'},
    sunstar:{t:'The Sun from Another Star', p:PP + 'wetv/w7.jpg', plat:'wetv', g:['Romance', 'Drama'], y:2025, len:'1 Season', age:'13+',
             d:'Two young men from opposite worlds meet in San Francisco, where a summer together changes the course of both their lives.'},
    yesterday:{t:'Yesterday', p:PP + 'wetv/w8.jpg', plat:'wetv', g:['Romance', 'Thriller'], y:2025, len:'1 Season', age:'18+',
             d:'A WeTV Original: a young man wakes up in a stranger\'s custody with no memory of yesterday, and the only one who knows the truth may also be the danger.'},
    // Viu (Home: Worlds in Chaos, We think you'll love this, Date Night Picks; Movie: Series)
    bittersweet:{t:'Bitter Sweet Hell', p:PP + 'viu/u1.jpg', plat:'viu', g:['Mystery', 'Comedy'], y:2025, len:'1 Season', age:'16+',
             d:'A perfect wife and mother-in-law sets out to protect her family when her daughter\'s mysterious new husband moves into their home.'},
    blind:{t:'Blind', p:PP + 'viu/u2.jpg', plat:'viu', g:['Thriller', 'Crime'], y:2022, len:'1 Season', age:'16+',
             d:'A detective, his judge brother and a social worker are pulled into a string of murders tied to a terrible secret from their childhood.'},
    dutyschool:{t:'Duty After School', p:PP + 'viu/u3.jpg', plat:'viu', g:['Sci-Fi', 'Action'], y:2023, len:'1 Season', age:'16+',
             d:'When mysterious orbs appear in the sky and attack, a class of high school seniors is drafted to fight under one young army sergeant.'},
    goodpartner:{t:'Good Partner 2', p:PP + 'viu/u4.jpg', w:P + 'continue/c6.jpg', plat:'viu', g:['Legal', 'Drama'], y:2026, len:'2 Seasons', age:'13+',
             d:'Star divorce lawyer Cha Eun-kyung and her team return to untangle the messiest splits in Seoul, while saving each other along the way.'},
    fateful:{t:'You Are My Fateful Love', p:PP + 'viu/u5.jpg', plat:'viu', g:['Romance', 'Drama'], y:2025, len:'1 Season', age:'13+',
             d:'A piano prodigy and the girl he met as a child find each other again years later, and fate refuses to let them go.'},
    hauntedpalace:{t:'The Haunted Palace', p:PP + 'viu/u6.jpg', plat:'viu', g:['Fantasy', 'Romance'], y:2025, len:'1 Season', age:'13+',
             d:'A reluctant shaman and a young king\'s servant possessed by an imoogi team up to drive the evil spirits out of the Joseon palace.'},
    // We think you'll love this (Home)
    anne:{t:'Anne with an E', p:PP + 'love/v1.jpg', plat:'netflix', g:['Drama', 'Family'], y:2019, len:'3 Seasons', age:'13+',
             d:'Orphan Anne Shirley, a fiercely imaginative girl, finds a home with siblings Marilla and Matthew Cuthbert on Prince Edward Island.'},
    trauma:{t:'The Trauma Code: Heroes on Call', p:PP + 'love/v2.jpg', plat:'netflix', g:['Medical', 'Drama'], y:2025, len:'1 Season', age:'16+',
             d:'A genius trauma surgeon takes over a struggling hospital trauma team and fights to turn it into the best in the country.'},
    blackbird:{t:'Black Bird', p:PP + 'love/v3.jpg', plat:'prime', g:['Crime', 'Drama'], y:2022, len:'1 Season', age:'18+',
             d:'Sentenced to 10 years in prison, a former high school football star is offered freedom if he can get a suspected serial killer to confess.'},
    cmbyn:{t:'Call Me by Your Name', p:PP + 'love/v4.jpg', plat:'prime', g:['Romance', 'Drama'], y:2017, len:'2h 12m', age:'16+',
             d:'In the Italian summer of 1983, 17-year-old Elio falls for Oliver, the American graduate student staying with his family.'},
    weakhero:{t:'Weak Hero Class 1', p:PP + 'love/v5.jpg', plat:'netflix', g:['Action', 'Drama'], y:2022, len:'1 Season', age:'18+',
             d:'A top student with a sharp mind and no fighting skills takes on the violence at his high school with the help of two unlikely friends.'},
    anyonebut:{t:'Anyone But You', p:PP + 'love/v6.jpg', plat:'prime', g:['Romance', 'Comedy'], y:2023, len:'1h 43m', age:'16+',
             d:'After a disastrous first date, Bea and Ben pretend to be a couple at a destination wedding in Australia, for very different reasons.'},
    myname:{t:'My Name', p:PP + 'love/v7.jpg', plat:'netflix', g:['Action', 'Crime'], y:2021, len:'1 Season', age:'18+',
             d:'Bent on avenging her father\'s murder, a young woman joins a crime syndicate and goes undercover as a police officer.'},
    bbcsherlock:{t:'Sherlock', p:PP + 'love/v8.jpg', plat:'netflix', g:['Mystery', 'Crime'], y:2017, len:'4 Seasons', age:'13+',
             d:'Sherlock Holmes and Dr. John Watson solve baffling crimes in present-day London.'},
    gooddoctor:{t:'The Good Doctor', p:PP + 'love/v9.jpg', plat:'prime', g:['Medical', 'Drama'], y:2024, len:'7 Seasons', age:'13+',
             d:'Shaun Murphy, a young surgeon with autism and savant syndrome, joins the surgical unit of a prestigious hospital.'},
    wolfws:{t:'The Wolf of Wall Street', p:PP + 'love/v10.jpg', plat:'prime', g:['Biography', 'Crime'], y:2013, len:'3h', age:'18+',
             d:'The true story of Jordan Belfort, from his rise as a wealthy stockbroker to his fall amid crime, corruption and the federal government.'},
    // Worlds in Chaos (Home)
    y2012:{t:'2012', p:PP + 'chaos/c1.webp', plat:'prime', g:['Action', 'Sci-Fi'], y:2009, len:'2h 38m', age:'13+',
             d:'As the Earth\'s crust begins to shift, a struggling writer races to get his family to safety before the world ends in a chain of global cataclysms.'},
    westfront:{t:'All Quiet on the Western Front', p:PP + 'chaos/c2.webp', plat:'netflix', g:['War', 'Drama'], y:2022, len:'2h 28m', age:'18+',
             d:'A young German soldier\'s patriotic dreams give way to the horrors of the trenches on the Western Front in the final days of World War I.'},
    wotw:{t:'War of the Worlds', p:PP + 'chaos/c3.webp', plat:'prime', g:['Sci-Fi', 'Thriller'], y:2005, len:'1h 56m', age:'13+',
             d:'When alien tripods rise from beneath the ground and lay waste to everything in their path, a dockworker fights to keep his children alive.'},
    wwz:{t:'World War Z', p:PP + 'chaos/c4.webp', plat:'netflix', g:['Action', 'Horror'], y:2013, len:'1h 56m', age:'16+',
             d:'A former UN investigator travels the globe in a race against time to stop a zombie pandemic that is toppling armies and governments.'},
    // Date Night Picks (Home)
    oneday:{t:'One Day', p:PP + 'datenight/d1.jpg', plat:'netflix', g:['Romance', 'Drama'], y:2011, len:'1h 47m', age:'13+',
             d:'Emma and Dexter meet on the night of their graduation, and the film revisits them on the same day every year for the next two decades.'},
    purple:{t:'Purple Hearts', p:PP + 'datenight/d2.jpg', plat:'netflix', g:['Romance', 'Drama'], y:2022, len:'2h 2m', age:'13+',
             d:'A struggling singer-songwriter and a troubled Marine agree to a marriage of convenience for the benefits, until a tragedy makes the line between real and pretend harder to find.'},
    sunrise:{t:'Before Sunrise', p:PP + 'datenight/d3.jpg', plat:'hbo', g:['Romance', 'Drama'], y:1995, len:'1h 41m', age:'13+',
             d:'An American traveler and a French student meet on a train and spend one unforgettable night walking the streets of Vienna.'},
    holidate:{t:'Holidate', p:PP + 'datenight/d4.jpg', plat:'netflix', g:['Romance', 'Comedy'], y:2020, len:'1h 44m', age:'16+',
             d:'Fed up with being single on holidays, two strangers agree to be each other\'s platonic plus-one all year, until real feelings get in the way.'},
    lalaland:{t:'La La Land', p:PP + 'datenight/d5.jpg', plat:'prime', g:['Romance', 'Musical'], y:2016, len:'2h 8m', age:'13+',
             d:'An aspiring actress and a jazz pianist fall in love in Los Angeles while chasing dreams that threaten to pull them apart.'},
    oxford:{t:'My Oxford Year', p:PP + 'datenight/d6.jpg', plat:'netflix', g:['Romance', 'Drama'], y:2025, len:'1h 52m', age:'13+',
             d:'An ambitious American student\'s plans for a year at Oxford change when she falls for a charming local with a secret.'},
    starborn:{t:'A Star Is Born', p:PP + 'datenight/d7.jpg', plat:'hbo', g:['Romance', 'Music'], y:2018, len:'2h 16m', age:'16+',
             d:'A seasoned musician discovers a struggling singer and helps her rise to fame, even as his own career slips away.'},
    meangirls:{t:'Mean Girls', p:PP + 'datenight/d8.jpg', plat:'prime', g:['Comedy'], y:2004, len:'1h 37m', age:'13+',
             d:'Homeschooled Cady Heron starts high school and gets pulled into the ruthless world of the Plastics, its most popular clique.'},
    ideaofyou:{t:'The Idea of You', p:PP + 'datenight/d9.jpg', plat:'prime', g:['Romance', 'Comedy'], y:2024, len:'1h 55m', age:'16+',
             d:'A 40-year-old single mom begins an unexpected romance with the 24-year-old lead singer of the world\'s hottest boy band.'},
    thailaw:{t:'The Evil Lawyer', p:PP + 'legal/l1.jpg', plat:'netflix', g:['Drama', 'Crime'], y:2026, len:'1 Season', age:'16+',
             d:'A ruthless Bangkok lawyer will defend anyone for the right price, until one case turns personal.'},
    dollar: {t:'One Dollar Lawyer', p:PP + 'legal/l2.jpg', plat:'disney', g:['Comedy', 'Drama'], y:2022, len:'1 Season', age:'13+',
             d:'A brilliant lawyer who charges just one dollar takes on the rich and powerful to protect ordinary people.'},
    judge:  {t:'The Judge from Hell', p:PP + 'legal/l3.jpg', plat:'netflix', g:['Fantasy', 'Drama'], y:2024, len:'1 Season', age:'18+',
             d:'A demon from hell takes over the body of a judge to punish the killers the courts let walk free.'},
    bigmouth:{t:'Big Mouth', p:PP + 'legal/l4.jpg', plat:'disney', g:['Thriller', 'Crime'], y:2022, len:'1 Season', age:'16+',
             d:'A failing lawyer is mistaken for a genius con man and has to survive in a world of the rich and corrupt.'},
    family: {t:'A Model Family', p:PP + 'legal/l5.jpg', plat:'netflix', g:['Thriller', 'Crime'], y:2022, len:'1 Season', age:'18+',
             d:'A broke professor stumbles on a car full of drug money and drags his family into a cartel war.'},
    vincenzo:{t:'Vincenzo', p:PP + 'legal/l6.jpg', plat:'netflix', g:['Comedy', 'Crime'], y:2021, len:'1 Season', age:'16+',
             d:'A mafia consigliere returns to Seoul and uses his methods to bring down a ruthless conglomerate.'},
    lawless:{t:'Lawless Lawyer', p:PP + 'legal/l7.jpg', plat:'viu', g:['Action', 'Drama'], y:2018, len:'1 Season', age:'16+',
             d:'A former gangster turned lawyer takes on a corrupt judge to avenge his mother.'},
    again:  {t:'Again My Life', p:PP + 'legal/l8.jpg', plat:'viu', g:['Fantasy', 'Drama'], y:2022, len:'1 Season', age:'16+',
             d:'A prosecutor killed by a corrupt politician gets a second chance at life, and at taking him down.'},
    sherlock:{t:'Young Sherlock', w:P + 'continue/c1.jpg', plat:'prime', g:['Mystery', 'Drama'], y:2026, len:'1 Season', age:'13+',
             d:'A teenage Sherlock Holmes stumbles into his first real mystery at Oxford, long before Baker Street.'},
    brazil: {t:'All or Nothing: Brazil National Team', w:P + 'continue/c4.jpg', plat:'netflix', g:['Documentary', 'Sport'], y:2023, len:'1 Season', age:'13+',
             d:'Unprecedented access to the Seleção on their road to the World Cup, on and off the pitch.'},
    endgame:{t:'Avengers: Endgame', w:P + 'continue/c2.jpg', plat:'disney', g:['Action', 'Sci-Fi'], y:2019, len:'3h 1m', age:'13+',
             d:'After Thanos wiped out half of all life, the remaining Avengers assemble once more to undo the snap.'},
    hailmary:{t:'Project Hail Mary', w:P + 'continue/c5.jpg', plat:'netflix', g:['Sci-Fi', 'Drama'], y:2026, len:'2h 36m', age:'13+',
             d:'A lone astronaut wakes up light-years from home with one mission: save humanity from extinction.'},
    encanto:{t:'Encanto', w:P + 'hero/encanto.jpg', plat:'disney', g:['Animation', 'Family'], y:2021, len:'1h 42m', age:'G',
             d:'The Madrigals live in a magical house in the mountains of Colombia, where every child has a gift, except Mirabel.'},
    stranger:{t:'Stranger Things', w:P + 'hero/stranger-things.jpg', plat:'netflix', g:['Sci-Fi', 'Horror'], y:2016, len:'1 Season', age:'16+',
             d:'When a young boy vanishes, a small town uncovers secret experiments, terrifying forces and one strange little girl.'},
    spider: {t:'Spider-Man: No Way Home', w:P + 'P10-spiderman.jpg', plat:'disney', g:['Action', 'Adventure'], y:2021, len:'2h 28m', age:'13+',
             d:'With his identity revealed, Peter Parker asks Doctor Strange for help, and the multiverse breaks open.'},
    prada:  {t:'The Devil Wears Prada 2', w:P + 'P10-Devil.jpg', plat:'disney', g:['Comedy', 'Drama'], y:2026, len:'1h 59m', age:'13+',
             d:'Miranda Priestly faces the decline of print, and an old assistant who now holds the purse strings.'},
    // Thai horror (Figma For PBR 8:11038)
    khemjira:{t:'Khemjira', p:PP + 'khemjira.jpg', plat:'monomax', g:['Horror', 'Thriller'], y:2025, len:'1h 58m', age:'18+', soon:19,   // out in 19 days
             d:'A young man haunted by a curse on his family\'s bloodline turns to an ancient ritual, and the spirit it wakes will not let him go.'},
    medium: {t:'The Medium', p:PP + 'the-medium.jpg', plat:'monomax', g:['Horror', 'Mystery'], y:2021, len:'2h 10m', age:'18+',
             d:'A documentary crew follows a shaman in rural northeastern Thailand, until her niece starts to show signs of something far darker.'},
    // The Lord of the Rings / The Hobbit (Home's Because You Watched)
    twotowers:{t:'The Lord of the Rings: The Two Towers', p:PP + 'lotr/r2.jpg', plat:'disney', g:['Fantasy', 'Adventure'], y:2002, len:'2h 59m', age:'13+',
             d:'The Fellowship is broken, but its members fight on to defend Middle-earth against Saruman and Sauron.'},
    smaug:  {t:'The Hobbit: The Desolation of Smaug', p:PP + 'lotr/r4.jpg', plat:'hbo', g:['Fantasy', 'Adventure'], y:2013, len:'2h 41m', age:'13+',
             d:'Bilbo, Gandalf and the dwarves press on toward Erebor, where the dragon Smaug guards a lost kingdom.'},
    siralex:{t:'Sir Alex Ferguson: Never Give In', w:P + 'maxresdefault.jpg', plat:'prime', g:['Documentary', 'Sport'], y:2021, len:'1h 52m', age:'13+',
             d:'The life of Manchester United\'s legendary manager, told by his son: from the Govan shipyards to 26 years at Old Trafford, and the fight back from a brain hemorrhage.'},
    // AIS PLAY Exclusive (Home): AIS PLAY's own; p its poster, b its wide picture
    missuni:{t:'Miss Universe Thailand 2026', p:'login-assets/ppv/universe-bg.webp', b:'login-assets/ppv/universe-bg.webp', plat:'ais', g:['Pageant', 'Live Event'], y:2026, len:'1h 55m', age:'G',
             d:'The Miss Universe Thailand 2026 pageant is underway with provincial preliminaries and delegate selections, highlighted by Tharina Botes winning Miss Universe Krung Thep Maha Nakhon (Bangkok).'},
    assanee:{t:'Asanee-Wasan Farewell Concert', p:'login-assets/ppv/assanee-bg.webp', b:'login-assets/ppv/assanee-bg.webp', w:'login-assets/ppv/assanee-card.webp', plat:'ais', g:['Concert', 'Music'], y:2026, len:'2h 30m', age:'G',
             d:'Asanee-Wasan say goodbye in their farewell concert, live from Impact Arena, Muang Thong Thani on 3, 5 and 6 September 2026.'},
    sophomores:{t:'Happy Boss Day: The Sophomores – D-Day', p:PP + 'ex1.jpg', b:P + 'hero/ex-sophomores.jpg', plat:'ais', g:['Concert'], y:2026, len:'2h 30m', age:'G',
             d:'Relive The Sophomores\' sold-out D-Day concert, exclusively on AIS PLAY. Rerun from 1 February to 30 April 2026.'},
    bossckm:{t:'BossCKM: Dream Warrior Concert', p:PP + 'ex2.jpg', b:P + 'hero/ex-bossckm.jpg', plat:'ais', g:['Concert', 'Music'], y:2026, len:'2h 5m', age:'G',
             d:'BossCKM takes the stage for Dream Warrior, a night of rock anthems, fan favorites and a few surprises.'},
    cityars:{t:'Man City vs Arsenal', p:PP + 'ex3.jpg', b:PP + 'ex3.jpg', plat:'ais', g:['Football'], y:2026, len:'1h 55m', age:'G',
             d:'Haaland\'s Manchester City hosts Arsenal at the Etihad in a title clash that could decide the Premier League race.'},
    mufcche:{t:'Match Day: Man Utd vs Chelsea', p:PP + 'ex4.jpg', b:P + 'hero/ex-mufc-chelsea.jpg', plat:'ais', g:['Football'], y:2026, len:'1h 55m', age:'G',
             d:'Manchester United welcomes Chelsea at Old Trafford for a place in the next round of the Emirates FA Cup.'},
    mufcars:{t:'Match Day: Man Utd vs Arsenal', p:PP + 'ex5.jpg', b:P + 'hero/ex-mufc-arsenal.jpg', plat:'ais', g:['Football'], y:2026, len:'1h 55m', age:'G',
             d:'Manchester United faces Arsenal under the Old Trafford lights in one of the Premier League\'s fiercest rivalries.'},
    // LPGA golf highlights (Home's Highlight band): AIS PLAY's own
    hl1:    {t:'Honda LPGA Thailand 2024', p:P + 'highlight/h1.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2024, len:'15m', age:'G',
             d:'The best shots from Siam Country Club in Pattaya, as the world\'s top women battle for the Honda LPGA Thailand title.'},
    hl2:    {t:'BGC Betagro Match Play', p:P + 'highlight/h2.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2024, len:'12m', age:'G',
             d:'Head-to-head drama from the BGC Betagro Match Play: every hole won, halved and conceded on the way to the final.'},
    hl3:    {t:'The Champion', p:P + 'highlight/h3.jpg', plat:'ais', g:['Golf', 'Documentary'], y:2025, len:'48m', age:'G',
             d:'A season with a champion: the practice, the pressure and the putt that won it all.'},
    hl4:    {t:'LPGA Lotte Championship', p:P + 'highlight/h4.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2024, len:'14m', age:'G',
             d:'Final-round highlights from Hawaii at the LPGA Lotte Championship, from the opening tee shot to the winning putt.'},
    hl5:    {t:'DP World Tour: Career Grand Slam', p:P + 'highlight/h5.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2025, len:'18m', age:'G',
             d:'The rounds that completed a career Grand Slam, and the DP World Tour stars chasing the same history.'},
    hl6:    {t:'Masters Tournament', p:P + 'highlight/h6.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2025, len:'20m', age:'G',
             d:'Four days at Augusta National: Amen Corner, the back-nine charges and the green jacket ceremony.'},
    hl7:    {t:'Masters Tournament: Round Highlights', p:P + 'highlight/h7.jpg', plat:'ais', g:['Golf', 'Highlights'], y:2025, len:'10m', age:'G',
             d:'Round-by-round highlights from the Masters, with every eagle, chip-in and clutch putt.'},
    odyssey:{t:'The Odyssey', w:P + 'P10_Odyssey.jpg', plat:'prime', g:['Adventure', 'Fantasy'], y:2026, len:'2h 40m', age:'13+',
             d:'Odysseus fights his way home across a hostile sea after the fall of Troy, ten years from his family.'},
    // Kids (kids.html, Figma Prototype "PLAY:kidsHome_mainPageStructure" 210:53522; pictures in kids-assets/). logo: a title
    // drawn as its logo on its screen (Steven Universe)
    moana:  {t:'Moana', w:K + 'moana-bg.jpg', logo:K + 'moana-logo.png', plat:'disney', g:['Animation', 'Adventure'], y:2016, len:'1h 47m', age:'G', kids:1,
             d:'A spirited teenager sails out on a daring mission to save her people, joined by the once-mighty demigod Maui.'},
    dora:   {t:'Dora the Explorer', p:K + 'dora-p.jpg', w:K + 'dora-w.jpg', plat:'prime', g:['Animation', 'Learning'], y:2000, len:'8 Seasons', age:'G', kids:1,
             d:'Dora and her best friend Boots set off on adventures, solving puzzles and learning Spanish words along the way.'},
    pinkfong:{t:'Pinkfong Baby Shark', w:K + 'pinkfong-w.jpg', plat:'ais', g:['Music', 'Learning'], y:2016, len:'2 Seasons', age:'G', kids:1,
             d:'Sing and dance along with Baby Shark and the Pinkfong friends in songs made for little ones.'},
    powerpuff:{t:'The Powerpuff Girls', p:K + 'powerpuff-p.jpg', w:K + 'powerpuff-w.jpg', b:K + 'powerpuff-bg.webp', plat:'hbo', g:['Animation', 'Action'], y:2016, len:'3 Seasons', age:'7+', kids:1,
             d:'Blossom, Bubbles and Buttercup save the day in Townsville, all before bedtime.'},
    bluey:  {t:'Bluey', w:K + 'bluey-w.jpg', plat:'disney', g:['Animation', 'Family'], y:2018, len:'3 Seasons', age:'G', kids:1,
             d:'Bluey, a Blue Heeler puppy, turns everyday family life into big imaginative games with her sister Bingo.'},
    steven: {t:'Steven Universe', p:K + 'steven-p.jpg', w:K + 'steven-w.jpg', b:K + 'steven-bg.jpg', logo:K + 'steven-logo.png', plat:'hbo', g:['Animation', 'Adventure'], y:2013, len:'5 Seasons', age:'7+', kids:1,
             d:'Half-human, half-Gem, Steven learns to use his powers alongside the Crystal Gems to protect the world.'},
    phineas:{t:'Phineas and Ferb', p:K + 'phineas-p.jpg', b:K + 'phineas-bg.webp', plat:'disney', g:['Animation', 'Comedy'], y:2007, len:'4 Seasons', age:'G', kids:1,
             d:'Two stepbrothers fill every day of summer vacation with impossible inventions, while their pet platypus fights evil.'},
    pororo: {t:'Pororo the Little Penguin', p:K + 'pororo-p.jpg', b:K + 'pororo-bg.webp', plat:'ais', g:['Animation', 'Learning'], y:2003, len:'7 Seasons', age:'G', kids:1,
             d:'Pororo and his friends play, quarrel and make up in their snowy village, learning something new every day.'},
    doraemonart:{t:"Doraemon the Movie: Nobita's Art World Tales", p:K + 'doraemon-art-p.jpg', b:K + 'doraemon-collection.webp', plat:'ais', g:['Animation', 'Adventure'], y:2025, len:'1h 45m', age:'G', kids:1,
             d:'Doraemon and friends jump into a famous painting and find a medieval kingdom, a lost jewel and a dragon on the loose.'},
    doraemoncastle:{t:'Doraemon: Nobita and the Castle of the Undersea Devil', p:K + 'doraemon-castle-p.jpg', b:K + 'doraemon-band.jpg', plat:'ais', g:['Animation', 'Adventure'], y:2026, len:'1h 50m', age:'G', kids:1,
             d:'A summer camp on the sea floor turns into an adventure when the gang finds a sunken city and a castle that should not wake.'},
    doraemonsymphony:{t:"Doraemon the Movie: Nobita's Earth Symphony", p:K + 'doraemon-symphony-p.jpg', b:K + 'doraemon-collection.webp', plat:'ais', g:['Animation', 'Music'], y:2024, len:'1h 55m', age:'G', kids:1,
             d:'A mysterious girl invites Nobita to a palace in space powered by music, and the friends must play together to save the world from a silence that eats every sound.'},
    doraemonsky:{t:"Doraemon the Movie: Nobita's Sky Utopia", p:K + 'doraemon-skyutopia-p.jpg', b:K + 'doraemon-collection.webp', plat:'ais', g:['Animation', 'Adventure'], y:2023, len:'1h 48m', age:'G', kids:1,
             d:'Doraemon and friends fly off to find Paradapia, a perfect utopia floating in the sky where everyone is happy, but paradise is hiding a secret.'},
    doraemondino:{t:"Doraemon the Movie: Nobita's New Dinosaur", p:K + 'doraemon-newdino-p.jpg', b:K + 'doraemon-collection.webp', plat:'ais', g:['Animation', 'Adventure'], y:2020, len:'1h 50m', age:'G', kids:1,
             d:'Nobita hatches twin baby dinosaurs from a fossil egg and travels back to the age of dinosaurs to find them a home.'},
    doraemonjapan:{t:'Doraemon: Nobita and the Birth of Japan', p:K + 'doraemon-birthjapan-p.jpg', b:K + 'doraemon-collection.webp', plat:'ais', g:['Animation', 'Adventure'], y:2016, len:'1h 44m', age:'G', kids:1,
             d:'Tired of the modern world, Nobita and friends run away 70,000 years into the past, where they meet a boy from a lost tribe and an evil sorcerer who wants it all.'},
    standbyme:{t:'Stand by Me Doraemon', p:K + 'standbyme-p.jpg', b:K + 'doraemon-collection.webp', plat:'ais', g:['Animation', 'Family'], y:2014, len:'1h 35m', age:'G', kids:1,
             d:'A robot cat from the future arrives to help Nobita, the boy who never gets anything right, change his destiny.'},
    trolls: {t:'Trolls', p:K + 'trolls-p.jpg', b:K + 'trolls-collection.webp', plat:'prime', g:['Animation', 'Music'], y:2016, len:'1h 32m', age:'G', kids:1,
             d:'Upbeat Poppy and grumpy Branch set out to rescue their friends from the Bergens, who think Trolls make them happy.'},
    trollsholiday:{t:'Trolls Holiday', p:K + 'trolls-holiday-p.jpg', b:K + 'trolls-band.jpg', plat:'prime', g:['Animation', 'Music'], y:2017, len:'26m', age:'G', kids:1,
             d:'Poppy finds out the Bergens have no holidays of their own, and sets out to give them one.'},
    trollswt:{t:'Trolls World Tour', p:K + 'trolls-worldtour-p.jpg', b:K + 'trolls-band.jpg', plat:'prime', g:['Animation', 'Music'], y:2020, len:'1h 31m', age:'G', kids:1,
             d:'Poppy and Branch discover five other Troll tribes, each devoted to its own kind of music, and a queen who wants them all.'},
    trollsbt:{t:'Trolls Band Together', p:K + 'trolls-bandtogether-p.jpg', b:K + 'trolls-collection.webp', plat:'prime', g:['Animation', 'Music'], y:2023, len:'1h 32m', age:'G', kids:1,
             d:'Branch reunites his long-lost boy band brothers to rescue one of them, with Poppy along for the ride.'},
    tomjerry:{t:'Tom and Jerry', p:K + 'ch-tomjerry.jpg', plat:'hbo', g:['Animation', 'Comedy'], y:1940, len:'7 Seasons', age:'G', kids:1,
             d:'A cat and a mouse who never stop chasing each other star in the classic cartoons that made the world laugh.'},
    lady:   {t:"Lady and the Tramp II: Scamp's Adventure", p:K + 'ch-lady.jpg', plat:'disney', g:['Animation', 'Family'], y:2001, len:'1h 9m', age:'G', kids:1,
             d:'Lady and Tramp\'s puppy Scamp longs for the wild life of a street dog, until he learns what home really means.'},
    // News page: AIS PLAY's own news series, each episode a dated programme with its own picture (eps: oldest first;
    // MD.episodes gives them as Season 1). The News page's episode rails show them newest first
    honekrasae:{t:'Hone-Krasae (โหนกระแส)', w:'news-assets/ep-honkrasae-1.png', plat:'ais', g:['News', 'Talk Show'], y:2026, len:'1 Season', age:'G',
             d:'โหนกระแส ทุกประเด็นร้อนที่สังคมพูดถึง ถามตรง ตอบจริง กับหนุ่ม กรรชัย', eps:newsEps('ep-honkrasae', 60,
               ['-7.jpg', '-6.jpg', '-5.jpg', '-4.jpg', '-3.jpg', '-2.png', '-1.png'],
               [['15/10/26', 'จักรวาล "สาวเฟิร์น"'],
                ['16/10/26', 'เคราะห์ซ้ำกรรมซัด! ลูกสาวร้อง พ่อตายถูกบิดเงินค่าที่ดินกว่า 2 ล้าน'],
                ['19/10/26', 'รวมตัวแฉ! อินฟลูฯหนุ่ม อ้างเป็น ตร.หลอกสาวถ่ายงาน ชวนมีสัมพันธ์'],
                ['20/10/26', 'เรื่องแมวๆ ที่ไม่แมว ถึงขั้นขึ้นโรงขึ้นศาล!'],
                ['21/10/26', '#1 มรสุม "บุ๋ม ปนัดดา"'],
                ['22/10/26', 'ช่วยด้วย! รองเจ้าอาวาสยึดวัด พบพิรุธเงินหายนับล้าน แถมมีสีกามาเอี่ยว'],
                ['23/10/26', '#2 มรสุม "บุ๋ม ปนัดดา"']], ['news-assets/hotvod/hv-1.png'], [['05/11/26', '#6 มรสุม "บุ๋ม ปนัดดา" สละเรือ!!!', null, 'news-assets/hotvod/hv-1-bg.webp']])},
    globalstory:{t:'BBC The Global Story', w:'news-assets/ep-globalstory-1.jpg', plat:'ais', g:['News', 'World'], y:2026, len:'1 Season', age:'G',
             d:'One story, every weekday: the BBC\u2019s journalists go behind the headline to explain what it means for the world.', eps:newsEps('ep-globalstory', 25,
               ['.png', '-7.jpg', '-6.jpg', '-5.jpg', '-4.jpg', '-3.jpg', '-2.jpg', '-1.jpg'],
               [['13/08/26', 'The Global Story'],
                ['23/08/26', 'Would Spheres of Influence Make the World More Peaceful?'],
                ['03/09/26', 'Why Are White South Africans Accessing US Refugee Programs?'],
                ['13/09/26', 'Is a Decline in Reading Making Us Less Intelligent?'],
                ['23/09/26', 'Inside Afghanistan', 'Asma Khalid hears from people inside Afghanistan about life there today.'],
                ['03/10/26', 'Why Are Sperm Counts Dropping?'],
                ['13/10/26', 'Saudi Crown Prince Visits the White House'],
                ['23/10/26', 'Voice of Ghada al-Kurd', 'Freelance journalist Ghada al-Kurd on reporting from Gaza.']])},
    witness:{t:'Witness', w:'news-assets/ep-witness-1.jpg', plat:'ais', g:['News', 'Documentary'], y:2026, len:'1 Season', age:'G',
             d:'Witness: award-winning documentaries that tell the human stories behind the news.', eps:newsEps('ep-witness', 47,
               ['.png', '-7.jpg', '-6.jpg', '-5.jpg', '-4.jpg', '-3.jpg', '-2.jpg', '-1.jpg'],
               [['23/03/26', 'ROT54: Armenia\u2019s Forgotten Space Giant', 'A film by Marta Miskaryan about ROT54, the giant Soviet-era telescope in the mountains of Armenia.'],
                ['23/04/26', 'After the Floods: Saving Spain\u2019s Coastline', 'After the floods, the people working to save Spain\u2019s coastline.'],
                ['23/05/26', 'A Boy Investigates', 'A boy investigates his father\u2019s mysterious death in Kenya.'],
                ['23/06/26', 'Shoot the People', 'Global activism through photographer Misan Harriman\u2019s lens.'],
                ['23/07/26', 'Inside Sednaya: Syria\u2019s Prison of Secrets', 'Inside Sednaya, the Syrian prison where thousands disappeared.'],
                ['23/08/26', 'Gaza Family Reunion', 'Finding each other after the ceasefire: a Gaza family\u2019s search.'],
                ['23/09/26', 'The Deaf Moroccan', 'A deaf Moroccan migrant in Spain struggling to reunite with his family.'],
                ['23/10/26', 'Peter Magubane', 'The legacy of one of South Africa\u2019s most renowned photographers.']])},
    // News page, Hot VOD: AIS PLAY's news and business talk series, each with its episodes (as above)
    secretsauce:{t:'The Secret Sauce', w:'news-assets/hotvod/hv-4.png', plat:'ais', g:['News', 'Business'], y:2026, len:'1 Season', age:'G',
             d:'Business stories from the people who build them: founders, leaders and creatives on how they win, and what they learned on the way.',
             eps:newsEps('', 45, [], [], ['news-assets/hotvod/hv-2.png', 'news-assets/hotvod/hv-4.png'],
               [['11/05/24', 'The Secret Sauce Summit 2024', 'Live from Khon Kaen: "Don\u2019t erase the past, cross it out, so you never make the same mistake again."'],
                ['02/05/26', 'รู้จัก Dan Epstein แห่ง CNN', 'Meet Dan Epstein of CNN, the creative who builds brands for the world\u2019s biggest partners.']])},
    spotlight:{t:'Spotlight', w:'news-assets/hotvod/hv-5.png', plat:'ais', g:['News', 'Business'], y:2026, len:'1 Season', age:'G',
             d:'Spotlight Short Cut: the ideas, people and deals shaping business in Thailand and the region.',
             eps:newsEps('', 30, [], [], ['news-assets/hotvod/hv-5.png'],
               [['23/09/26', 'Global Perspectives: In Bangkok', 'CNN comes to Bangkok for Global Perspectives, 14 October 2026.']])},
    tnntech:{t:'TNN Tech', w:'news-assets/hotvod/hv-6.png', plat:'ais', g:['News', 'Tech'], y:2026, len:'1 Season', age:'G',
             d:'TNN Tech: the technology, startups and business ideas shaping tomorrow, from TNN.',
             eps:newsEps('', 30, [], [], ['news-assets/hotvod/hv-6.png'],
               [['23/09/26', 'Future Forum 2026', 'TNN Future Forum 2026: happiness you can measure, and Happitat\u2019s customer-first strategy.']])},
    fastfact:{t:'Fast Fact', w:'news-assets/hotvod/hv-7.png', plat:'ais', g:['News', 'Talk Show'], y:2026, len:'1 Season', age:'G',
             d:'Fast Fact Perspective: one guest, one topic, the facts in minutes.',
             eps:newsEps('', 20, [], [], ['news-assets/hotvod/hv-7.png'],
               [['30/07/26', 'สมชัย กูรูละแวกบ้าน', 'Fast Fact Perspective with Somchai, the neighborhood guru.']])},
    mrbean: {t:'Mr. Bean: The Animated Series', p:K + 'ch-mrbean.jpg', plat:'prime', g:['Animation', 'Comedy'], y:2002, len:'5 Seasons', age:'G', kids:1,
             d:'Mr. Bean, his teddy bear and his little car get into one silly scrape after another, with hardly a word said.'}
  };
  // b: the full-screen picture (posters/hero/) a title shows behind the screen text on Home, the Movie page and its
  // detail page alike (Content.hero / MD.bg); a title without one uses its 16:9 picture, else its poster
  var B = { topgun:'topgun-m', wicked:'wicked', superman:'superman', house:'house-of-the-dragon', lastofus:'last-of-us', loki:'loki',
            dragon:'how-to-train', john:'john-wick', venom:'venom', f1:'f1', lotr:'lotr', thailaw:'evil-lawyer', dollar:'one-dollar-lawyer',
            sherlock:'young-sherlock', endgame:'endgame', hailmary:'hailmary', encanto:'encanto', stranger:'stranger-things', spider:'spiderman',
            goodpartner:'good-partner' };
  for(var bk in B) M[bk].b = P + 'hero/' + B[bk] + '.jpg';
  // q: the titles in 4K with Dolby Atmos (a 4K pill and the Dolby mark, MD.qtag); every other title is HD
  ['avatar', 'topgun', 'f1', 'house', 'got', 'lotr', 'spider', 'endgame', 'odyssey', 'superman', 'stranger', 'wicked']
    .forEach(function(k){ M[k].q = '4k'; });
  // premium: the titles sold on their own or in a package (For You, Rent or Buy, the series sold one by one, District 9's
  // package, the rentals) and AIS PLAY Exclusive; Content.crown(info) their crown (Premium on the detail page)
  ['d9', 'avatar', 'f1', 'topgun', 'john', 'venom', 'lotr', 'hobbit', 'house', 'got', 'loki', 'odyssey', 'spider', 'lastofus', 'vikings',
   'missuni', 'assanee', 'sophomores', 'bossckm', 'cityars', 'mufcche', 'mufcars',
   // more of the Movie page's titles premium, so most of what it shows is for sale (a gold crown), not free
   'debt', 'khemjira', 'medium', 'prada', 'superman', 'wicked', 'dragon', 'vincenzo', 'thailaw', 'dollar', 'judge', 'lawless', 'lastking', 'again',
   // kids (kids.html): a few premium, one per platform, the rest free
   'moana', 'steven', 'trollsbt', 'doraemonart', 'doraemoncastle']
    .forEach(function(k){ M[k].premium = true; });
  // the titles with their own options, so a detail page has 1, 2 or 3 buttons (View Package, Buy N ฿, Rent N ฿); pkg 0:
  // no package has it (Content.packageFor: none)
  // Most premium titles are sold on their own only (pkg 0: Buy and / or Rent, no View Package); fewer come with a package
  var OFFERS = { // kids: each in its platform's package (View Package: Disney+, HBO Max, Prime Video; AIS PLAY's own: PLAY
                 // ULTIMATE), the new Doraemon movie also sold on its own
                 moana:{ pkg:1 }, steven:{ pkg:1 }, trollsbt:{ pkg:1 }, doraemonart:{ pkg:1 }, doraemoncastle:{ pkg:1, buy:129 },
                 avatar:{ pkg:1, buy:399, rent:229 }, f1:{ pkg:1, buy:199 }, topgun:{ pkg:0, rent:149 }, john:{ pkg:0, buy:149, rent:99 },
                 venom:{ pkg:0, buy:129, rent:79 }, lotr:{ pkg:0, buy:299 }, hobbit:{ pkg:0, rent:99 }, loki:{ pkg:0, buy:199 },
                 // movies sold on their own
                 debt:{ pkg:0, buy:149, rent:79 }, khemjira:{ pkg:0, rent:99 }, medium:{ pkg:0, buy:129, rent:69 }, prada:{ pkg:0, buy:299, rent:149 },
                 superman:{ pkg:0, buy:349, rent:199 }, wicked:{ pkg:0, buy:299, rent:149 }, dragon:{ pkg:0, rent:129 },
                 // series sold one by one (Buy: the whole series)
                 vincenzo:{ pkg:0, buy:279 }, thailaw:{ pkg:0, buy:199 }, dollar:{ pkg:0, buy:199 }, judge:{ pkg:0, buy:199 }, lawless:{ pkg:0, buy:199 },
                 // series in their app's package (View Package: Netflix, Viu)
                 lastking:{ pkg:1 }, again:{ pkg:1 },
                 // AIS PLAY Exclusive (Home's rail): premium, bought on its own like a PPV event (the Store's price), or with PLAY ULTIMATE
                 // (ev: an event, bought as an Event Pass: package-detail.html, Figma "PPV Event")
                 missuni:{ pkg:1, buy:199, ev:1 }, assanee:{ pkg:1, buy:199, ev:1 }, sophomores:{ pkg:1, buy:199, ev:1 }, bossckm:{ pkg:1, buy:199, ev:1 }, cityars:{ pkg:1, buy:199, ev:1 },
                 mufcche:{ pkg:1, buy:199, ev:1 }, mufcars:{ pkg:1, buy:199, ev:1 } };
  for(var ok in OFFERS){ M[ok].pkg = !!OFFERS[ok].pkg; M[ok].buy = OFFERS[ok].buy || 0; M[ok].rent = OFFERS[ok].rent || 0; if(OFFERS[ok].ev) M[ok].ev = 1; }
  // titles made from a card that had no data of its own (Content.open): back into the catalogue on every page
  try { var ADHOC = JSON.parse(sessionStorage.getItem('contentAdhoc') || '{}'); for(var ak in ADHOC) if(!M[ak]) M[ak] = ADHOC[ak]; } catch(e){}
  var CONTINUE = [{k:'sherlock', s:1, e:5, w:31, of:58}, {k:'endgame', w:122, of:181}, {k:'lastofus', s:1, e:4, w:22, of:50}, {k:'goodpartner', s:2, e:3, w:35, of:62}, {k:'hailmary', w:101, of:156}, {k:'encanto', w:61, of:102},
                  {k:'spider', w:41, of:148}, {k:'stranger', s:1, e:3, w:34, of:50}];
  var FOR_YOU = [{k:'d9', price:199}, {k:'avatar', price:399}, {k:'f1', price:199}, {k:'topgun', price:149}, {k:'john', price:149}];
  var RENT = [{k:'avatar', b:'Recommended'}, {k:'f1', b:'Best Seller'}, {k:'topgun', b:'Best Seller'}, {k:'john'}, {k:'venom'}, {k:'lotr'}, {k:'hobbit'}];
  // the title rails Home and the Movie page share (each a list of MD.M keys, {k, badge} where the rail tags a card), so
  // the same rail shows the same titles on both pages; the Movie page's Movies and Series are every title in them
  var RAILS = {
    top10:['d9', 'house', 'john', 'f1', 'avatar', 'debt', 'topgun', 'thailaw', 'lotr', 'dollar'],
    hot:['f1', 'house', 'blind', 'john', 'venom', 'avatar', 'debt', 'topgun'],
    myList:['loki', 'queensgambit', 'guilty', 'reply1988', 'fourweddings', 'dragon', 'odyssey', 'siralex'],
    because:{ t:'Because You Watched “The Lord of the Rings: The Fellowship of the Ring”', list:['lotr', 'twotowers', 'hobbit', 'smaug', 'lastking', 'vikings', 'got', 'huntsman', 'stardust', 'pirates', 'readyornot', 'generation', 'peacock'] },
    chaos:{ t:'Worlds in Chaos', list:['y2012', 'westfront', 'wotw', 'wwz', 'blind', 'dutyschool', 'bittersweet', 'heroine', 'khemjira', 'medium', 'thailaw', {k:'debt', badge:'Leaving Soon'}, 'judge', {k:'bigmouth', badge:'Leaving Soon'}, {k:'vincenzo', badge:'Top 10'}] },
    love:{ t:'We think you’ll love this', list:['anne', 'trauma', 'blackbird', 'cmbyn', 'weakhero', 'anyonebut', 'myname', 'bbcsherlock', 'gooddoctor', 'wolfws', 'goodpartner', 'hauntedpalace', 'followheart', 'sunstar', 'yesterday', 'ning', 'momentforever'] },
    dateNight:{ t:'Date Night Picks', list:['oneday', 'family', {k:'again', badge:'Leaving Soon'}, 'lawless', 'fateful', 'aboutlove', 'perfecther', 'overdo', 'predict', 'mist', 'midnight', 'purple', 'sunrise', 'holidate', 'lalaland', 'oxford', 'starborn', 'meangirls', 'ideaofyou'] }
  };
  // News page Hot VOD: the latest news episodes everyone is watching (series key, episode number in MD.episodes)
  var HOT_VOD = [{k:'honekrasae', e:8}, {k:'secretsauce', e:1}, {k:'witness', e:7}, {k:'secretsauce', e:2}, {k:'spotlight', e:1}, {k:'tnntech', e:1}, {k:'fastfact', e:1}];
  var MY_RENTAL = ['odyssey', 'spider', 'd9', 'lastofus', 'vikings'];   // (F1 and Top Gun are for sale: OFFERS)
  // series sold one by one (Figma "Series MD: First scene": View Package + Buy 279 baht)
  var SERIES_PRICE = { house:279, got:279, loki:199 };
  // a rental's last day (Figma "Package Available until")
  var UNTIL = { lastofus:{d:'13 November 2026', t:'09:00 PM'}, vikings:{d:'20 November 2026', t:'11:59 PM'} };

  // ---- series: seasons and their episodes (the prototype gives every series the same 8 episode names) ----
  var EP_NAMES = ['The Beginning', 'Strangers', 'Old Wounds', 'Crossroads', 'The Long Night', 'Into the Fire', 'Reckoning', 'Homecoming'];
  var EP_MIN = [57, 55, 52, 61, 58, 49, 54, 63];
  var EP_DESC = ['Everything changes when an unexpected arrival sets the story in motion.', 'New faces bring new trouble, and an old secret starts to surface.',
    'A wound from the past reopens, and loyalties are put to the test.', 'Two paths, one choice: the decision that will shape everything to come.',
    'A long night of waiting ends in a confrontation no one saw coming.', 'There is no turning back as the conflict finally catches fire.',
    'Every choice has a price, and tonight the bill comes due.', 'The journey comes full circle, but home is not what it used to be.'];
  function series(k){ return /Season/.test((M[k] && M[k].len) || ''); }
  function seasons(k){ return series(k) ? Math.min(3, parseInt(M[k].len, 10) || 1) : 0; }
  function episodes(k, s){
    // a series with its own episodes (MD.M eps: the news series): those, as Season 1, each with its own picture
    if(M[k] && M[k].eps) return M[k].eps.map(function(e, i){ return { s:1, n:i + 1, t:e.t, date:e.date, m:e.m, d:e.d || M[k].d, img:e.img, bg:e.bg }; });   // bg: a full-screen picture of its own
    return EP_NAMES.map(function(t, i){ var j = (i + s - 1) % 8; return { s:s, n:i + 1, t:EP_NAMES[j], m:EP_MIN[j], d:EP_DESC[j] }; });
  }
  function episode(k, s, e){ return episodes(k, s)[e - 1]; }
  function next(k, s, e){ return e < episodes(k, s).length ? episode(k, s, e + 1) : s < seasons(k) ? episode(k, s + 1, 1) : null; }
  function until(k){ return MY_RENTAL.indexOf(k) >= 0 && UNTIL[k] || null; }
  // rented this session (purchase.html, Rent): 48 hours from then, first in My Rental, with its last day
  var RENT_HOURS = 48;
  function fmtUntil(t){ var d = new Date(t), h = d.getHours();
    return { d:d.getDate() + ' ' + 'January February March April May June July August September October November December'.split(' ')[d.getMonth()] + ' ' + d.getFullYear(),
             t:((h % 12) || 12) + ':' + ('0' + d.getMinutes()).slice(-2) + ' ' + (h < 12 ? 'AM' : 'PM') }; }
  function rented(){ try { return JSON.parse(sessionStorage.getItem('mdRented') || '{}'); } catch(e){ return {}; } }
  (function(r){ Object.keys(r).forEach(function(k){ if(MY_RENTAL.indexOf(k) < 0) MY_RENTAL.unshift(k); UNTIL[k] = fmtUntil(r[k]); }); })(rented());
  function rent(k){
    var r = rented(); if(!r[k]) r[k] = Date.now() + RENT_HOURS * 36e5;
    try { sessionStorage.setItem('mdRented', JSON.stringify(r)); } catch(e){}
    if(MY_RENTAL.indexOf(k) < 0) MY_RENTAL.unshift(k);
    UNTIL[k] = fmtUntil(r[k]);
  }

  function owned(){ try { return JSON.parse(sessionStorage.getItem('mdOwned') || '[]'); } catch(e){ return []; } }
  function own(k){ var o = owned(); if(o.indexOf(k) < 0){ o.push(k); try { sessionStorage.setItem('mdOwned', JSON.stringify(o)); } catch(e){} } }
  // a platform's package bought this session (purchase.html?ott=, or a detail page's View Package): read fresh each call
  function subs(){ try { return JSON.parse(sessionStorage.getItem('ottSubscribed') || '[]'); } catch(e){ return []; } }
  function subscribed(plat){ return !!plat && subs().indexOf(plat) >= 0; }
  function subscribe(plat){ var s = subs(); if(plat && s.indexOf(plat) < 0){ s.push(plat); try { sessionStorage.setItem('ottSubscribed', JSON.stringify(s)); } catch(e){} } }
  function find(list, k){ for(var i = 0; i < list.length; i++) if(list[i].k === k) return list[i]; return null; }
  function listPrice(k){ var f = find(FOR_YOU, k); return f ? f.price : find(RENT, k) ? 149 : SERIES_PRICE[k] || (M[k] && M[k].price) || 0; }   // Rent or Buy titles: 149 baht
  function offers(k){ return !!M[k] && 'pkg' in M[k]; }
  function buyPrice(k){ return offers(k) ? M[k].buy : listPrice(k); }
  function rentPrice(k){ return offers(k) ? M[k].rent : 0; }
  function price(k){ return buyPrice(k) || rentPrice(k); }
  // titles that need a package (View Package opens the package view, then the purchase): District 9 (Monomax)
  var PACKAGE = ['d9'];
  function progress(){ try { return JSON.parse(sessionStorage.getItem('mdProgress') || '{}'); } catch(e){ return {}; } }
  function cw(k){
    var p = progress()[k], c = p ? { k:k, w:p.w, of:p.of, s:p.s, e:p.e } : find(CONTINUE, k);
    if(c && series(k) && !c.s){ c.s = 1; c.e = 1; }
    return c;
  }
  function setProgress(k, w, of, s, e){ var p = progress(); p[k] = { w:w, of:of, s:s, e:e, at:Date.now() }; try { sessionStorage.setItem('mdProgress', JSON.stringify(p)); } catch(e){} }
  // Kids' Continue watching (kids.html): its own titles only; img: the card's own picture (Figma's), else the title's
  var KIDS_CONTINUE = [{k:'bluey', w:20, of:40, img:'kids-assets/bluey-cw.jpg'}, {k:'powerpuff', w:9, of:22}, {k:'moana', w:48, of:107},
                       {k:'dora', w:11, of:24}, {k:'pinkfong', w:4, of:15}];
  function kidsContinue(){
    var p = progress(), seen = {}, out = [];
    Object.keys(p).sort(function(a, b){ return (p[b].at || 0) - (p[a].at || 0); }).forEach(function(k){
      if(M[k] && M[k].kids && M[k].w && p[k].w < p[k].of - 1){ seen[k] = 1; out.push({ k:k, w:p[k].w, of:p[k].of }); }
    });
    KIDS_CONTINUE.forEach(function(c){ if(!seen[c.k]) out.push(c); });
    return out.filter(function(c){ return state(c.k) !== 'buy'; });   // (not one still for sale: as Continue Watching)
  }
  // Continue Watching (Home, Movie): what was watched this session, latest first, then the list above; finished ones drop out
  function continueList(){
    var p = progress(), seen = {}, out = [];
    Object.keys(p).sort(function(a, b){ return (p[b].at || 0) - (p[a].at || 0); }).forEach(function(k){
      seen[k] = 1; if(M[k] && M[k].w && p[k].w < p[k].of - 1 && state(k) !== 'buy') out.push(cw(k));   // (not one still for sale)
    });
    CONTINUE.forEach(function(c){ if(!seen[c.k]) out.push(cw(c.k)); });
    return out;
  }
  function minutes(k){ var l = (M[k] && M[k].len) || '', h = /(\d+)h/.exec(l), mm = /(\d+)m/.exec(l); return (h ? +h[1] * 60 : 0) + (mm ? +mm[1] : 0) || 50; }   // a series ('1 Season'): a 50-minute episode
  // soon: a title not out yet (days from today; MD.soon(k) its release, ms), else null
  function soon(k){ var m = M[k]; if(!m || !m.soon) return null; var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() + m.soon * 864e5; }
  function state(k){
    if(soon(k)) return 'soon';   // not out yet: its detail page has no Play (Remind instead)
    // a title for sale stays 'buy' until it is the viewer's (bought this session, its platform's package, a rental),
    // even if it was played before: progress alone never makes it theirs (Content.crown stays gold)
    var bought = owned().indexOf(k) >= 0 || !!(M[k] && M[k].premium && subscribed(M[k].plat));
    if(!bought && PACKAGE.indexOf(k) >= 0) return 'buy';
    if(!bought && MY_RENTAL.indexOf(k) < 0 && (price(k) || (offers(k) && M[k].pkg))) return 'buy';   // (View Package only: for sale too)
    return cw(k) ? 'resume' : 'play';
  }
  window.MD = { P:P, PP:PP, M:M, RAILS:RAILS, HOT_VOD:HOT_VOD, CONTINUE:CONTINUE, FOR_YOU:FOR_YOU, RENT:RENT, MY_RENTAL:MY_RENTAL, state:state, price:price, own:own, cw:cw, setProgress:setProgress, minutes:minutes,
    subscribe:subscribe, subscribed:subscribed, buyPrice:buyPrice, rentPrice:rentPrice, rent:rent, RENT_HOURS:RENT_HOURS,
    soon:soon, continueList:continueList, kidsContinue:kidsContinue, series:series, seasons:seasons, episodes:episodes, episode:episode, next:next, until:until,
    bg:function(k){ var m = M[k]; return m ? m.b || m.w || m.p : ''; },
    // the quality tag every page shows in a title's meta row: 4K Dolby (platform-tag.css .qtag), else the HD pill
    // a title's meta row, the same on every page (Home's screen text, the Movie page's hero, the detail page): its
    // genres, year, length, age pill and quality tag (the platform tag goes before it, as each page draws it)
    metaHtml:function(m){ return '<strong>' + m.g.join(' · ') + '</strong><span>' + m.y + '</span><span>' + m.len + '</span><span class="pill">' + m.age + '</span>' + window.MD.qtag(m); },
    // how far in a title is (a title being watched: MD.state 'resume'), else null: {w, of, pct}
    watched:function(k){ var c = state(k) === 'resume' && cw(k); return c ? { w:c.w, of:c.of, pct:Math.round(c.w / c.of * 100) } : null; },
    // 4K: the same pill as the age's, then the Dolby Atmos mark (icons/tag-dolby.svg)
    qtag:function(m){ return m && m.q === '4k' ? '<span class="pill">4K</span><img class="qtag" src="icons/tag-dolby.svg" alt="Dolby Atmos">' : '<span class="pill">HD</span>'; } };
})();

/*
  The short dramas: Home's Shorts row (the same titles and posters, posters/shorts/), shared by short-detail.html
  (each short's page) and package-detail.html (its payment, ?short=N). buy: its price to own every episode (its detail
  page's Buy N ฿, purchase.html?s=N&opt=buy).
*/
window.SHORTS = [
  { t:'Seven Days Back, Old Love Ends', img:'s1.jpg', plat:'reelshort', gen:['Romance', 'Period'], rate:'13+', premium:true, buy:199,
    d:'Seven days before her wedding, a palace maid wakes up in the past with one chance to undo the love that ruined her, and the courage to finally walk away.' },
  { t:'Grandma Takes Over the Family II', img:'s2.jpg', plat:'dramabox', gen:['Comedy', 'Family'], rate:'13+', premium:true, buy:199,
    d:'Back in a young body, the family matriarch returns to set her spoiled heirs straight and save the business they nearly lost.' },
  { t:'Ink and Rain', img:'s3.jpg', plat:'reelshort', gen:['Romance', 'Fantasy'], rate:'13+', premium:true, buy:199,
    d:'A painter whose brush brings ink to life and a guarded swordsman cross paths in a city of rain, where every painting hides a promise.' },
  { t:"The Secretary's Forbidden Love", img:'s4.jpg', plat:'dramabox', gen:['Romance', 'Drama'], rate:'16+', premium:true, buy:199,
    d:'A new secretary falls for the CEO she was hired to watch, and has to choose between the job, the truth and her heart.' },
  { t:"The Mafia Boss's Spoiled Secretary", img:'s5.jpg', plat:'reelshort', gen:['Romance', 'Crime'], rate:'18+', premium:true, buy:199,
    d:'Hired by the most feared man in the city, a quiet secretary finds out she is the only one he will not let go.' },
  { t:"The Healer's Comeback", img:'s6.jpg', plat:'dramabox', gen:['Drama', 'Period'], rate:'13+', premium:true,
    d:'Cast out of the imperial clinic, a young healer comes back under a new name to cure the court and expose the ones who framed her.' },
  { t:'Back to the Moonlight Promise', img:'s7.jpg', plat:'reelshort', gen:['Romance', 'Drama'], rate:'13+', premium:true,
    d:'Two strangers keep meeting under the same full moon, until they remember the promise they made in another life.' },
  { t:'The Contract Bride\'s Revenge', img:'s8.jpg', plat:'dramabox', gen:['Romance', 'Drama'], rate:'13+', premium:true,
    d:'Married by contract to the heir who ruined her family, a quiet bride plays the perfect wife while she plans her revenge.' },
  // ShortMax (Home's Shorts rail: the first three)
  { t:'A Chan', img:'s9.jpg', plat:'shortmax', gen:['Romance', 'Drama'], rate:'13+', premium:true, buy:199,
    d:'On a snowy night in the city, a guarded young woman and the cold heir she was sent to win over find their game turning into something real.' },
  { t:'Only the General in My World', img:'s10.jpg', plat:'shortmax', gen:['Romance', 'Period'], rate:'13+', premium:true, buy:199,
    d:'A woman warrior and the general sworn to protect her fight side by side on the battlefield, until a betrayal forces them to choose between love and the throne.' },
  { t:'Blindfolded Vengeance', img:'s11.jpg', plat:'shortmax', gen:['Drama', 'Period'], rate:'16+', premium:true,
    d:'Blinded and left for dead by the family who betrayed her, a noblewoman returns to the palace with a red ribbon over her eyes and a plan for every one of them.' },
  { t:'Dawn of Love and Revenge', img:'s12.jpg', plat:'shortmax', gen:['Romance', 'Period'], rate:'13+', premium:true,
    d:'Married into the house of the man she swore to ruin, a bride falls for the husband who may be the key to her revenge.' },
  { t:'Stars That Entered My Dreams', img:'s13.jpg', plat:'shortmax', gen:['Romance', 'Drama'], rate:'16+', premium:true,
    d:'Reborn on the day she first met him, a woman who lost everything to a heartless tycoon vows that this time he will be the one with regrets.' },
  { t:'Day and Night', img:'s14.jpg', plat:'shortmax', gen:['Romance', 'Drama'], rate:'16+', premium:true,
    d:'A by-day assistant and her boss keep a secret by night, until the line between business and the heart disappears.' },
  // WeTV (Home's Shorts rail: the first three)
  { t:"The Tyrant's Bride to Be", img:'s15.jpg', plat:'wetv', gen:['Romance', 'Drama'], rate:'16+', premium:true, buy:199,
    d:'Engaged to a cold, ruthless heir she has never met, a young woman refuses to be just another pawn in his family\'s game.' },
  { t:'Office Scandal', img:'s16.jpg', plat:'wetv', gen:['Romance', 'Drama'], rate:'16+', premium:true, buy:199,
    d:'A late-night kiss at the office turns into a rumor neither of them can stop, and a secret romance both of them want to keep.' },
  { t:'Fortune in Meeting You', img:'s17.jpg', plat:'wetv', gen:['Romance', 'Period'], rate:'13+', premium:true,
    d:'A fortune teller\'s mistaken prophecy binds a carefree lady to a stern young lord, and fate has more twists in store for them both.' },
  { t:'Perfect Love', img:'s18.jpg', plat:'wetv', gen:['Romance', 'Comedy'], rate:'13+', premium:true,
    d:'A cheerful café barista and a regular customer who seems too perfect to be true fall into a romance with no flaws, or so it seems.' },
  { t:'Kindness with a Twist', img:'s19.jpg', plat:'wetv', gen:['Romance', 'Drama'], rate:'13+', premium:true,
    d:'The sweet new colleague who helps her through every crisis may be hiding a bitter reason for being so kind.' },
  // iQIYI (Home's Shorts rail: the first two)
  { t:'The Phoenix Bride', img:'s20.jpg', plat:'iqiyi', gen:['Romance', 'Fantasy'], rate:'13+', premium:true, buy:199,
    d:'Promised to the dark prince of a rival realm, a phoenix-blooded princess has to decide whether her groom is her enemy or her destiny.' },
  { t:'Like the Morning Sun', img:'s21.jpg', plat:'iqiyi', gen:['Romance', 'Drama'], rate:'13+', premium:true, buy:199,
    d:'A bright young dog walker and a buttoned-up executive keep crossing paths in the park, until their morning walks turn into something more.' },
  { t:'The Sunlit Night Garden', img:'s22.jpg', plat:'iqiyi', gen:['Drama', 'Mystery'], rate:'16+', premium:true,
    d:'Two women bound by a secret from their past meet again in a garden that blooms only at night, where the truth finally comes to light.' },
  { t:"The Intern's Pain Game", img:'s23.jpg', plat:'iqiyi', gen:['Medical', 'Drama'], rate:'16+', premium:true,
    d:'A trainee doctor discovers she can move a patient\'s pain onto someone else, and a ruthless senior surgeon wants the secret for herself.' },
  { t:'My Heart Is Yours, My Lord', img:'s24.jpg', plat:'iqiyi', gen:['Romance', 'Period'], rate:'13+', premium:true,
    d:'Sent to spy on a powerful young lord, a palace maid falls for the man she was meant to betray.' },
  { t:'A Heart That Never Gives Up', img:'s25.jpg', plat:'iqiyi', gen:['Romance', 'Drama'], rate:'13+', premium:true,
    d:'The overlooked daughter of a wealthy family wins over five rival heirs and fights to claim the life that was always hers.' }
];

/*
  Episodes of a short, shared by short-detail.html and the vertical player (player.html?short=N&ep=E):
    SHORT.EPS episodes (the first SHORT.FREE free; SHORT.EP_PRICE one locked episode bought on its own), SHORT.open(s, n) whether episode n of short s can be watched (free,
    unlocked this session, a pass, or the Short Drama package), SHORT.secs(n) its length in seconds (1-3 minutes),
    SHORT.at(s) / SHORT.setAt(s, ep, sec) where the short was left; SHORT.continueList() short.html's Continue watching. SHORT.owned(s) every episode is the viewer's: its
    app's package (MD.subscribed: ReelShort / DramaBox; PLAY ULTIMATE doesn't include short dramas), bought (SHORT.own: a short with buy, its
    detail page's Buy N ฿), a pass, or each locked episode unlocked.
*/
window.SHORT = (function(){
  var EPS = 160, FREE = 10, EP_PRICE = 9;   // EP_PRICE: one locked episode bought on its own (฿; Unlock this content)
  function get(k, d){ try { return JSON.parse(sessionStorage.getItem(k) || d); } catch(e){ return JSON.parse(d); } }
  function own(s){ var o = get('shortOwned', '[]'); if(o.indexOf(s) < 0){ o.push(s); try { sessionStorage.setItem('shortOwned', JSON.stringify(o)); } catch(e){} } }
  function owned(s){
    var u = get('shortUnlocked' + s, '{}'), sh = window.SHORTS[s];
    if(u.all || get('shortOwned', '[]').indexOf(s) >= 0 || (sh && window.MD.subscribed(sh.plat))) return true;
    for(var n = FREE + 1; n <= EPS; n++) if(!u[n]) return false;
    return true;
  }
  function open(s, n){ return n <= FREE || !!get('shortUnlocked' + s, '{}')[n] || owned(s); }
  function secs(n){ return 75 + (n * 37) % 105; }
  function at(s){ return get('shortProgress', '{}')[s] || null; }
  function setAt(s, ep, sec){ var p = get('shortProgress', '{}'); p[s] = { ep:ep, sec:Math.floor(sec) }; try { sessionStorage.setItem('shortProgress', JSON.stringify(p)); } catch(e){} }
  // Continue watching (short.html): this session's shorts first (SHORT.at, the last one watched first), then the demo's
  // own list; each {s, ep}: the short and the episode it is on
  // (taking turns by app, so the first 7 show ReelShort, DramaBox, ShortMax, WeTV and iQIYI)
  var CW = [{ s:1, ep:23 }, { s:9, ep:41 }, { s:15, ep:16 }, { s:20, ep:64 }, { s:4, ep:58 }, { s:0, ep:7 }, { s:12, ep:33 },
            { s:17, ep:9 }, { s:6, ep:91 }, { s:22, ep:28 }, { s:3, ep:12 }];
  function continueList(){
    var p = get('shortProgress', '{}'), mine = Object.keys(p).map(function(s){ return { s:+s, ep:p[s].ep }; }).reverse();
    return mine.concat(CW.filter(function(c){ return !p[c.s]; })).filter(function(c){ return window.SHORTS[c.s]; });
  }
  return { EPS:EPS, FREE:FREE, EP_PRICE:EP_PRICE, open:open, owned:owned, own:own, secs:secs, at:at, setAt:setAt, continueList:continueList };
})();

/*
  Content: where a card goes. Pages pass what the card shows (Content.info(el) reads it from the element):
    k (a catalogue key) or s (a short's index), else t (title), img (its picture), d (synopsis), plat, price.
  Content.find(info)  the catalogue title (by key, then picture, then name) or short it is, or null
  Content.open(info)  its detail page. A card the catalogue doesn't have becomes a title of its own (its picture, title
                      and synopsis, kept for the session), so every card opens a detail page, then the player.
  Content.play(info)  straight into the player
  Content.info(el)    what an element shows: data-k / data-s / data-title / data-label / data-desc / data-price, and
                      the picture of the element or the first child with one; null for live cards (they play live)
  Content.crown(info) 'gold' | 'owned' | '': the premium crown of a channel, programme, movie, series or short; every
                      page asks this, never c.crown / MD.state itself. Content.crownIcon(info, size, cls) its <img>
  Content.packageFor(info)   the package that includes it; Content.packageUrl(info, ret) View Package's page
                      (package-suggest.html: the packages that include it, then their purchase, back to ret)
*/
window.Content = (function(){
  function base(src){ return String(src || '').split('/').pop().split('?')[0].toLowerCase(); }
  function norm(t){ return String(t || '').toLowerCase().replace(/\s+s\d+\s*:\s*e\d+$/, '').replace(/[^a-z0-9]/g, ''); }
  function find(info){
    if(!info || info.own) return null;   // own: a page's own video (Sport's highlights, News's episodes), never a catalogue title that shares its picture
    if(info.k && window.MD.M[info.k]) return { k:info.k };
    if(info.s !== undefined && info.s !== '' && window.SHORTS[+info.s]) return { s:+info.s };
    var b = base(info.img), n = norm(info.t), k;
    for(k in window.MD.M){ var m = window.MD.M[k]; if(b && (base(m.w) === b || base(m.p) === b)) return { k:k }; }
    for(var i = 0; i < window.SHORTS.length; i++) if(b && base(window.SHORTS[i].img) === b) return { s:i };
    if(n){
      for(k in window.MD.M) if(norm(window.MD.M[k].t) === n) return { k:k };
      for(i = 0; i < window.SHORTS.length; i++) if(norm(window.SHORTS[i].t) === n) return { s:i };
    }
    return null;
  }
  // a card the catalogue doesn't know: a movie made from what it shows
  function adhoc(info){
    var t = info.t || 'Untitled', id = t + '|' + base(info.img) + '|' + (info.len || '');   // title + picture + length: cards that share a placeholder title stay apart
    var k = 'x' + Math.abs(id.split('').reduce(function(h, c){ return (h * 31 + c.charCodeAt(0)) | 0; }, 7)).toString(36);
    // made again each time from what the card shows, so it never keeps words the card no longer has
    var portrait = /portrait|shorts\//.test(info.img || '');
    var m = { t:t, plat:info.plat || 'monomax', g:info.g || ['Featured'], y:info.y || 2026, len:info.len || '1h 45m', age:info.age || '13+', adhoc:1,
      d:info.d || t + ': watch it now on AIS PLAY.' };
    if(info.img){ if(portrait) m.p = info.img; else m.w = info.img; }
    if(info.bg) m.b = info.bg;
    if(info.price){ m.price = +info.price; m.premium = true; }   // sold on its own: premium (Content.crown)
    if(info.ppv) m.ppv = 1;   // a PPV event: premium, bought on its own (purchase.html)
    window.MD.M[k] = m;
    try { var a = JSON.parse(sessionStorage.getItem('contentAdhoc') || '{}'); a[k] = m; sessionStorage.setItem('contentAdhoc', JSON.stringify(a)); } catch(e){}
    return { k:k };
  }
  function target(info){ return find(info) || adhoc(info || {}); }
  function detailUrl(info){ var f = target(info); return f.s !== undefined ? 'short-detail.html?s=' + f.s : 'movie-detail.html?k=' + f.k; }
  function playUrl(info){ var f = target(info); return f.s !== undefined ? 'player.html?short=' + f.s : 'player.html?k=' + f.k; }
  function info(el){
    if(!el || el.closest('.has-ribbon, .xc-ribbon, [data-live="1"]') || el.querySelector('.live-ribbon')) return null;
    var d = el.dataset, img = '', n = [el].concat([].slice.call(el.querySelectorAll('*')));
    for(var i = 0; i < n.length && !img; i++){
      var bg = n[i].style && (n[i].style.backgroundImage || n[i].style.getPropertyValue('--img'));
      if(bg && bg !== 'none') img = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      else if(n[i].tagName === 'IMG' && !/badge|logo|tag|icon/.test(n[i].className + n[i].src)) img = n[i].getAttribute('src');
    }
    var o = { k:d.k, s:d.s, t:(d.heroTitle || d.title || d.label || (el.textContent || '').trim().split('\n')[0]).replace(/^#\d+\s+/, ''),   // (a Top 10 card's "#3 ")
              img:d.heroImg || img, d:d.heroDesc || d.desc, price:d.price };
    var inner = el.querySelector('[data-hero-bg], [data-desc]');   // a Top 10 card: its poster carries them
    if(!o.d && inner) o.d = inner.dataset.desc;
    var heroBg = d.heroBg || (inner && inner.dataset.heroBg);
    // what else the card says about itself (Home's My List: data-tag / data-meta; AIS PLAY's own: data-plat="ais" ...)
    var tag = el.querySelector('img[src*="badges/tag-"]'), pm = /tag-([a-z]+)\./.exec(d.tag || (tag ? tag.getAttribute('src') : ''));
    if(d.plat || pm) o.plat = d.plat || pm[1];
    if(heroBg) o.bg = heroBg;
    if(d.meta) meta(o, d.meta);
    if(d.g) o.g = d.g.split(',');
    if(d.y) o.y = +d.y;
    if(d.len) o.len = d.len;
    if(d.age) o.age = d.age;
    return o;
  }
  // "Documentary · Sport · 2021 · 1h 52m" → its genres, year and length
  function meta(o, line){
    var g = [];
    String(line).split(/\s*·\s*/).forEach(function(p){
      if(/^\d{4}$/.test(p)) o.y = +p;
      else if(/^\d+h|^\d+m|Seasons?$/.test(p)) o.len = p;
      else if(p && !/^(Series|Movie)$/.test(p)) g.push(p);
    });
    if(g.length) o.g = g;
  }
  // what a card's screen text shows, the same as the detail page it opens: {t, d, plat, meta, bg, s (a short)}
  function hero(info){
    if(!info) return null;
    var f = target(info);
    if(f.s !== undefined){ var sh = window.SHORTS[f.s];
      return { t:sh.t, d:sh.d, plat:sh.plat, meta:sh.gen.join(' · ') + ' · ' + sh.rate, bg:'posters/shorts/' + sh.img, s:f.s }; }
    var m = window.MD.M[f.k];
    return { t:m.t, d:m.d, plat:m.plat, meta:m.g.join(' · ') + ' · ' + m.y + ' · ' + m.len + ' · ' + m.age, bg:window.MD.bg(f.k), k:f.k };
  }
  // You May Also Like: up to n items of the SAME type as `info`, never another type (fewer if there aren't n):
  //   a short ({s}) → other shorts; a series ({k}, MD.series) → other series; a movie ({k}) → other movies;
  //   a LIVE / Upcoming programme ({t} of content.js LIVE) → other programmes, same league, then same sport, first.
  // Titles rank by most shared genres, then the same platform, then the newest. Never the item itself, no repeats.
  // Returns [{k}] / [{s}] / [programme], each for Content.open / LIVE.href.
  function related(info, n){
    n = n || 18;
    function shared(a, b){ return (a || []).filter(function(x){ return (b || []).indexOf(x) >= 0; }).length; }
    function rank(list, me, g, plat, y){
      return list.map(function(x, i){ return { x:x, i:i, g:shared(g(x), g(me)), p:plat(x) === plat(me) ? 1 : 0, y:y(x) || 0 }; })
        .sort(function(a, b){ return b.g - a.g || b.p - a.p || b.y - a.y || a.i - b.i; }).map(function(r){ return r.x; });
    }
    if(info && info.s !== undefined && info.s !== '' && window.SHORTS[+info.s]){   // a short drama
      var me = +info.s, shorts = window.SHORTS.map(function(x, i){ return i; }).filter(function(i){ return i !== me; });
      return rank(shorts, me, function(i){ return window.SHORTS[i].gen; }, function(i){ return window.SHORTS[i].plat; }, function(){ return 0; })
        .slice(0, n).map(function(i){ return { s:i }; });
    }
    if(info && info.k && window.MD.M[info.k]){   // a movie or a series: the same kind only
      var K = info.k, SER = window.MD.series(K), M = window.MD.M;
      var keys = Object.keys(M).filter(function(k){ return k !== K && !M[k].adhoc && window.MD.series(k) === SER; });
      return rank(keys, K, function(k){ return M[k].g; }, function(k){ return M[k].plat; }, function(k){ return M[k].y; })
        .slice(0, n).map(function(k){ return { k:k }; });
    }
    if(info && info.t && window.LIVE){   // a LIVE / Upcoming programme: the others, same league then same sport first
      var p = window.LIVE.find(info.t) || info;
      return window.LIVE.list.filter(function(q){ return q.t !== p.t && !q.hidden; }).map(function(q, i){
        return { q:q, i:i, s:(p.lg && q.lg === p.lg ? 2 : 0) + (p.sp && q.sp === p.sp ? 1 : 0) };
      }).sort(function(a, b){ return b.s - a.s || (b.q.live ? 1 : 0) - (a.q.live ? 1 : 0) || a.i - b.i; }).slice(0, n).map(function(r){ return r.q; });
    }
    return [];
  }
  // a title's or short's meta row, the same on every screen and its detail page: (tag: its platform tag first) then
  // Premium (one the viewer doesn't have yet: its gold crown, platform-tag.css .mbadge.prem), then a title's genres, year,
  // length, age pill and quality tag (MD.metaHtml), or a short's genres, year, episodes, rating pill and HD
  function ptag(plat){ return plat === 'ais' ? '<span class="ptag ais" aria-label="AIS PLAY"></span>' : '<img class="ptag" src="badges/tag-' + plat + '.png" alt="">'; }
  function premTag(f){ var ic = crownIcon(f); return ic ? '<span class="mbadge prem">' + ic + 'Premium</span>' : ''; }
  function metaHtml(info, tag){
    var f = target(info);
    if(f.s !== undefined){ var sh = window.SHORTS[f.s];
      return (tag ? ptag(sh.plat) : '') + premTag(f) + '<strong>' + sh.gen.join(' · ') + '</strong><span>2026</span><span>' + window.SHORT.EPS + ' Episodes</span>' +
        '<span class="pill">' + sh.rate + '</span><span class="pill">HD</span>'; }
    var m = window.MD.M[f.k];
    return (tag ? ptag(m.plat) : '') + premTag(f) + window.MD.metaHtml(m);
  }
  // the channel `info` is or is on, or null: {tv: name} (a LIVE / Upcoming programme), {ch: channel or name}, or a channel
  // itself (channels-data.js, or a page's copy of one: n plus its crown); the TV Guide's own entry when there is one
  // the channel packages bought this session ('ultimate', 'sports': channels-data.js pkg); read fresh each call. (An
  // older tvSubscribed flag counts for nothing: a premium channel stays for sale until its own package is bought.)
  function tvSubs(){ try { return JSON.parse(sessionStorage.getItem('tvSubs') || '[]'); } catch(e){ return []; } }
  function subscribeTv(g){ var s = tvSubs(); if(g && s.indexOf(g) < 0){ s.push(g); try { sessionStorage.setItem('tvSubs', JSON.stringify(s)); } catch(e){} } }
  function channelOf(info){
    var c = info.tv !== undefined ? info.tv : info.ch !== undefined ? info.ch : info.n !== undefined && 'crown' in info ? info : null;
    if(c === null || c === '') return null;
    var name = typeof c === 'string' ? c : c.n, d = window.TV && TV.byName ? TV.byName(name) : null;
    return d || (typeof c === 'string' ? { n:c, crown:'' } : c);
  }
  // the crown, one status for every kind of content: '' not premium, 'owned' premium and the viewer has it, 'gold' premium
  // and they don't. Read fresh each call (sessionStorage), so a purchase shows on the next page load:
  //   a channel / programme  its crown (channels-data.js); 'owned' too once its package is bought (its pkg:
  //                          'ultimate' PLAY ULTIMATE, 'sports' PLAY ALL or a league package; Content.subscribeTv)
  //   a movie / series       m.premium (or a PPV event); 'owned' while MD.state is 'play' or 'resume' (bought, rented,
  //                          its platform's package)
  //   a short                'owned' once SHORT.owned (a package, a pass, every episode unlocked)
  function crown(info){
    if(!info) return '';
    var c = channelOf(info);
    if(c){
      if(!c.crown) return '';
      return c.crown === 'owned' || tvSubs().indexOf(c.pkg || 'ultimate') >= 0 ? 'owned' : 'gold';
    }
    var f = find(info);
    if(f && f.s !== undefined) return window.SHORTS[f.s].premium ? (window.SHORT.owned(f.s) ? 'owned' : 'gold') : '';
    if(f){ var m = window.MD.M[f.k], st = window.MD.state(f.k);
      return m.premium || m.ppv ? (st === 'play' || st === 'resume' ? 'owned' : 'gold') : ''; }
    return info.ppv || info.premium ? 'gold' : '';   // a PPV card not opened yet: nothing bought
  }
  // the crown's <img>, gold only: a premium item the viewer has ('owned') shows no crown and no Premium tag, the same as
  // a free one (every rule on Content.crown stays: owned still means no View Package). Pages test this, not Content.crown,
  // to decide whether to draw a crown or Premium tag at all.
  // size: its width and height in px (else the page's CSS sizes it); cls: the page's class for it (crown-tag, ic20 ...)
  function crownIcon(info, size, cls){
    return crown(info) === 'gold' ? '<img class="crown-ic gold' + (cls ? ' ' + cls : '') + '" src="icons/crown-gold.svg" alt="Premium"' +
      (size ? ' width="' + size + '" height="' + size + '"' : '') + '>' : '';
  }
  // the package that includes `info` (View Package): {n, url}. A channel or programme: PLAY ULTIMATE (its premium
  // channels, package-detail.html's own), a sports channel PLAY ALL; a movie or series: its platform's packages (packages.js, ?ott=), AIS PLAY's
  // own titles PLAY ULTIMATE; a short: its app's Short Drama packages (ReelShort / DramaBox). Anything else (a PPV
  // event): All Packages. A page without packages.js gets All Packages for a platform.
  var ULTIMATE = { n:'PLAY ULTIMATE Monthly Package', url:'package-detail.html' }, PLAYALL = { n:'PLAY ALL', url:'package-detail.html?bundle=2' };
  function packageFor(info){
    if(!info) return { n:'All Packages', url:'all-packages.html' };
    var ch = channelOf(info);
    if(ch) return ch.pkg === 'sports' ? PLAYALL : ULTIMATE;   // a sports channel: PLAY ALL's
    var f = find(info), plat = f && f.s !== undefined ? window.SHORTS[f.s].plat : f ? window.MD.M[f.k].plat : '';
    if(f && f.k && window.MD.M[f.k].pkg === false) return null;   // sold on its own only (MD OFFERS: no View Package)
    if(f && f.k && window.MD.M[f.k].ppv) plat = '';
    if(plat === 'ais') return ULTIMATE;
    var P = window.Packages;
    if(plat && P && P.PKG[plat]) return { n:P.OTT[plat].n, url:'package-detail.html?ott=' + plat + '&p=0', ott:plat };
    return { n:'All Packages', url:'all-packages.html' };
  }
  // View Package: the package suggestion page (package-suggest.html: the packages that include it), whose purchases come
  // back to `ret` (the detail page) with ?subscribed=1. A channel's programme: info.prog (movie-detail.html's), else its
  // channel's packages only
  function packageUrl(info, ret){
    info = info || {};
    var c = !info.prog && channelOf(info), f = !info.prog && !c && target(info);
    var q = info.prog || c ? 'prog=' + encodeURIComponent(JSON.stringify(info.prog || { t:c.n, tv:c.n, live:1 }))
      : f.s !== undefined ? 's=' + f.s : 'k=' + f.k;
    return 'package-suggest.html?' + q + '&ret=' + encodeURIComponent(ret || location.pathname.split('/').pop() + location.search);
  }
  // a title's or short's main button, as its detail page has it (a screen's own Play button says the same):
  //   gold (premium, not the viewer's)  View Package (ic-pkg): its package, which comes back to the detail page bought;
  //                                     a title no package has: Buy N ฿ / Rent N ฿ (its purchase)
  //   being watched                     Resume (a series: "Resume S1: Ep.5"), else Play (a short: "Play Ep.N")
  // {act:'package' | 'play', label, icon (the <i> class), url}
  function mainAction(info){
    var f = target(info);
    if(crown(f) === 'gold'){
      // no package has it: its first own option, as its detail page's first button (Buy, else Rent)
      var b = f.k && !packageFor(f) && (window.MD.buyPrice(f.k) ? 'buy' : window.MD.rentPrice(f.k) ? 'rent' : '');
      if(b) return { act:b, label:(b === 'buy' ? 'Buy ' + window.MD.buyPrice(f.k) : 'Rent ' + window.MD.rentPrice(f.k)) + ' ฿', icon:'ic-pkg', url:'package-detail.html?k=' + f.k + '&opt=' + b };
      return { act:'package', label:'View Package', icon:'ic-pkg', url:packageUrl(f, detailUrl(f)) };
    }
    if(f.s !== undefined){ var ep = (window.SHORT.at(f.s) || {}).ep || 1;
      return { act:'play', label:'Play Ep.' + ep, icon:'ic-play', url:'player.html?short=' + f.s + '&ep=' + ep }; }
    var c = window.MD.state(f.k) === 'resume' && window.MD.cw(f.k);
    return { act:'play', label:c ? (window.MD.series(f.k) ? 'Resume S' + c.s + ': Ep.' + c.e : 'Resume') : 'Play', icon:'ic-play', url:playUrl(f) };
  }
  return { find:find, info:info, hero:hero, metaHtml:metaHtml, related:related, detailUrl:detailUrl, playUrl:playUrl,
    crown:crown, crownIcon:crownIcon, packageFor:packageFor, packageUrl:packageUrl, mainAction:mainAction, subscribeTv:subscribeTv,
    open:function(i){ location.href = detailUrl(i); }, play:function(i){ location.href = playUrl(i); } };
})();

/*
  LIVE and Upcoming programmes on the TV channels (Home's Live and Upcoming rail, Sport's matches, and the related rails on
  their detail pages). An Upcoming programme on a Movie or Sport channel has a detail page (movie-detail.html?prog=, Figma "MD LIVE
  State" / "Upcoming Has Access (MD)"), opened only from a picture card; the TV Guide and the EPGs always play the channel.
    LIVE.list          the programmes: t, img, tv (the TV Guide channel), live, or in (minutes from when the page opened,
                       so the demo's upcoming ones are always upcoming), d; heroOnly: shown in Home's first scene, not its rail;
                       sportRail: also Sport's Live and Upcoming, in this order; hidden: kept here but shown on no rail
                       (remove the flag to bring it back)
    LIVE.start(p)      when an upcoming programme starts (ms): from in, or a label ("Starts in 16:12", "Today 8:30 PM",
                       "Tomorrow 2:30 AM"; a time today that has gone by is taken as tomorrow's)
    LIVE.label(p)      its card's label: "Starts in 58:12" in the last hour, else "Today 8:30 PM" / "Tomorrow 6:00 PM" / "2 Nov 8:30 PM"
    LIVE.hasMD(tv)     whether the channel's programmes have a detail page: a Sports channel, or a Movies one that isn't Digital
                       TV (channels-data.js)
    LIVE.href(p, from) the card's link: a LIVE one always the channel in the Live TV player (via the TV Guide), no detail
                       page; an Upcoming one its detail page if LIVE.hasMD, else the player too
    LIVE.hot          Home's Hot Channel Program: news channels' programmes on now (t, img, logo, tv, d; bg, v: its screen picture and video, the News page's too)
    LIVE.range(p), LIVE.find(title)   its time on air, a programme by its title (Home's screen text and the detail
                       page's meta row say the same); its Premium: Content.crown({tv:p.tv})
*/
window.LIVE = (function(){
  var U = 'posters/upcoming/', SP = 'sport-assets/main-page/sportMainPage_liveUpcoming_No';
  var list = [
    {t:'Liverpool vs Brentford', hidden:true, img:U + 'liverpool-brentford.webp', bg:'posters/liver-ben.jpg', tv:'MONOMAX 1', live:true, sp:'football', lg:'epl',   // bg: Home's first scene and the detail page; v: its video, Home's and the player's
     d:'Liverpool hosts Brentford at Anfield in a big Premier League clash. Follow every moment live, from kick-off to the final whistle.'},
    {t:'Bayern München vs Arsenal', img:SP + '1.webp', bg:SP + '1-2.webp', v:'video/B&A.mp4', tv:'PLAY SPORTS (Football)', live:true, sportRail:1, sp:'football', lg:'ucl', range:'02:00 – 04:00',   // v: its video, Sport's screen and the player's
     d:'Live from the UEFA Champions League. Every touch in Full HD with Thai and English commentary, plus the build-up and post-match analysis.'},
    {t:'Real Madrid vs RB Leipzig', img:SP + '2.webp', bg:SP + '2-2.jpg', v:'video/Real Madrid vs RB Leipzig.mp4', tv:'Real Madrid TV', live:true, sportRail:1, sp:'football', lg:'ucl', range:'02:00 – 04:00',
     d:'Live from the UEFA Champions League. Every touch in Full HD with Thai and English commentary, plus the build-up and post-match analysis.'},
    {t:'MasterChef Thailand', img:U + 'u1.jpg', bg:U + 'masterchef-bg.webp', tv:'CH7 HD', in:58.2, sp:'', lg:'',
     d:'Thailand\'s best home cooks battle it out in the kitchen for the title of MasterChef. Season 7 premieres soon.'},
    {t:'Leipzig vs Gladbach', hidden:true, img:U + 'u2.jpg', tv:'PLAY SPORTS (Football)', in:150, sp:'football', lg:'bundesliga',
     d:'RB Leipzig welcomes Borussia Mönchengladbach in a Bundesliga clash with European places on the line.'},
    {t:'Dortmund vs Hamburg', hidden:true, img:U + 'u3.jpg', tv:'PLAY SPORTS (Football)', in:180, sp:'football', lg:'bundesliga',
     d:'The Yellow Wall awaits as Borussia Dortmund hosts Hamburger SV at Signal Iduna Park.'},
    {t:'CT14 Eala vs Jovic (R1)', img:U + 'u4.png', tv:'FutureChannel Tennis', in:1260, sp:'tennis', lg:'wta',
     d:'Alex Eala takes on Iva Jovic in the first round, live from the WTA tour.'},
    {t:'Portland Trail Blazers vs Utah Jazz', img:SP + '3.webp', bg:SP + '3-2.webp', tv:'PLAY SPORTS (NBA)', when:'Today 6:00 PM', sportRail:1, sp:'basketball', lg:'nba', range:'18:00 – 20:30',
     d:'Portland visits the Delta Center in Salt Lake City in Week 2 of the NBA season. Live in Full HD with Thai and English commentary.'},
    {t:'Philadelphia 76ers vs Charlotte Hornets', img:SP + '4.webp', bg:SP + '4-2.webp', tv:'PLAY SPORTS (NBA)', when:'Today 7:00 PM', sportRail:1, sp:'basketball', lg:'nba', range:'19:00 – 21:30',
     d:'The 76ers take on the Hornets at the Spectrum Center in Charlotte in Week 2 of the NBA season. Live in Full HD with Thai and English commentary.'},
    {t:'Arizona Cardinals vs Dallas Cowboys', img:SP + '5.webp', bg:SP + '5-2.webp', tv:'PLAY SPORTS (NFL)', when:'Tomorrow 1:00 AM', sportRail:1, sp:'rugby', lg:'nfl', range:'01:00 – 04:00',
     d:'The Cardinals visit AT&T Stadium in Arlington in Week 8 of the NFL season. Live in Full HD with Thai and English commentary.'},
    {t:'Cleveland Browns vs Pittsburgh Steelers', img:SP + '6.webp', bg:SP + '6-2.webp', tv:'PLAY SPORTS (NFL)', when:'Tomorrow 4:00 AM', sportRail:1, sp:'rugby', lg:'nfl', range:'04:00 – 07:00',
     d:'An AFC North rivalry at Acrisure Stadium in Pittsburgh in Week 8 of the NFL season. Live in Full HD with Thai and English commentary.'},
    {t:'Bayer Leverkusen vs VfB Stuttgart', img:SP + '7.webp', bg:SP + '7-2.webp', tv:'PLAY SPORTS (Football)', when:'Today 8:30 PM', sportRail:1, sp:'football', lg:'bundesliga', range:'20:30 – 22:30',
     d:'Leverkusen hosts Stuttgart at the BayArena on Bundesliga Matchday 8. Live in Full HD with Thai and English commentary.'},
    {t:'FC Schalke 04 vs RB Leipzig', img:SP + '8.webp', bg:SP + '8-2.webp', tv:'PLAY SPORTS (Football)', when:'Today 9:00 PM', sportRail:1, sp:'football', lg:'bundesliga', range:'21:00 – 23:00',
     d:'Schalke hosts RB Leipzig at the VELTINS-Arena in Gelsenkirchen on Bundesliga Matchday 8. Live in Full HD with Thai and English commentary.'},
    {t:'Bayern München vs Borussia Dortmund', img:SP + '9.webp', bg:SP + '9-2.webp', tv:'PLAY SPORTS (Football)', when:'Today 9:00 PM', sportRail:1, sp:'football', lg:'bundesliga', range:'21:00 – 23:00',
     d:'Der Klassiker on Bundesliga Matchday 8: Bayern München hosts Borussia Dortmund at the Allianz Arena, Munich. Live in Full HD with Thai and English commentary.'},
    {t:'Crystal Palace vs Hoffenheim', img:SP + '10.webp', bg:SP + '10-2.webp', tv:'PLAY SPORTS (Football)', when:'Tomorrow 3:00 PM', sportRail:1, sp:'football', lg:'', range:'15:00 – 17:00',
     d:'Crystal Palace hosts Hoffenheim at Selhurst Park, London, on Matchday 4. Live in Full HD with Thai and English commentary.'}
  ];
  var LOADED = Date.now();   // "Start in" counts from when the page was opened, as the card's label does
  function start(p){
    if(p.start) return +p.start;
    if(p.in) return LOADED + p.in * 60000;
    var w = p.when || '', m = /Starts in (\d+):(\d+)/i.exec(w);
    if(m) return LOADED + (+m[1] * 60 + +m[2]) * 1000;
    m = /(Today|Tomorrow)\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(w);
    if(!m) return LOADED + 3600000;
    var d = new Date(), h = +m[2];
    if(m[4] && /PM/i.test(m[4]) && h < 12) h += 12;
    if(m[4] && /AM/i.test(m[4]) && h === 12) h = 0;
    d.setHours(h, +m[3], 0, 0);
    if(/Tomorrow/i.test(m[1]) || d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }
  function hm(t){ var d = new Date(t); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
  function hm12(t){ var d = new Date(t), h = d.getHours(); return ((h % 12) || 12) + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + (h < 12 ? ' AM' : ' PM'); }
  function label(p){
    var t = start(p), left = t - Date.now();
    if(left < 3600000){ var s = Math.max(0, Math.floor(left / 1000)); return 'Starts in ' + Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + s % 60; }
    var a = new Date(t), b = new Date(); a.setHours(0, 0, 0, 0); b.setHours(0, 0, 0, 0);
    var dd = Math.round((a - b) / 864e5), d = new Date(t);
    return (dd === 0 ? 'Today ' : dd === 1 ? 'Tomorrow ' : d.getDate() + ' ' + 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[d.getMonth()] + ' ') + hm12(t);
  }
  // a Sports channel, or a Movies one that isn't a free-to-air Digital TV channel (those carry Movies & Series among
  // everything else: CH7 HD's MasterChef plays the channel)
  function hasMD(tv){ var c = window.TV && TV.byName(tv), has = function(k){ return c.cats.indexOf(k) >= 0; };
    return !!c && (has('sports') || (has('movies') && !has('digital'))); }
  // a LIVE programme (on now) never has a detail page: its card plays the channel at once (the Live TV player, via the
  // TV Guide); only an Upcoming one on a Movie / Sport channel opens movie-detail.html?prog=
  function href(p, from){
    if(!p.live && hasMD(p.tv)){
      var o = {t:p.t, img:p.img, tv:p.tv, d:p.d || ''};
      if(p.lg) o.lg = p.lg;   // its league (View Package: that league's packages)
      if(p.bg) o.bg = p.bg;
      if(p.live) o.live = 1; else o.start = start(p);
      if(p.range) o.range = p.range;
      return 'movie-detail.html?prog=' + encodeURIComponent(JSON.stringify(o));
    }
    return 'tv-guide.html?play=' + encodeURIComponent(p.tv) + '&from=' + (from || 'home') + (p.live ? '&t=' + encodeURIComponent(p.t) : '');
  }
  list.forEach(function(p){ if(!p.live) p.when = label(p); });   // the card's label, as the page opens
  // the same meta on Home's screen text and the detail page: the time on air (a LIVE one: what the channel's TV Guide has
  // on now; an Upcoming one: from its start, 2h15m)
  function range(p){
    if(p.range) return p.range;
    var c = window.TV && TV.byName(p.tv);
    if(p.live && c){ var o = TV.onNow(c); return hm(o.now.start) + ' – ' + hm(o.now.end); }
    var t = start(p); return hm(t) + ' – ' + hm(t + 135 * 60000);
  }
  function find(t){ return list.filter(function(p){ return p.t === t; })[0] || null; }
  // Hot Channel Program (Home): what's on now on the news channels, pictures from the News page (news-assets/); logo: a
  // logo on white rather than a photo
  var N = 'news-assets/';
  var hot = [
    {t:'CNN News', img:N + 'dm-cnn.png', bg:N + 'hero-bg.png', v:'video/CNN.mp4', logo:1, tv:'CNN', live:true,
     d:'CNN Primetime brings the day\u2019s biggest stories from around the world, with live reports from CNN\u2019s correspondents and in-depth analysis.'},
    {t:'Morning Stories', img:N + 'dm-rueng.png', bg:N + 'dm-rueng.png', v:'video/News 3hd.mp4', tv:'3 HD', live:true, d:'The morning news that tells the stories around you, with every hot topic from the crack of dawn.'},
    {t:'BBC News', img:N + 'dm-bbc.png', bg:N + 'bg-bbc.webp', tv:'BBC News', live:true, d:'The latest from BBC News: the stories that matter in the UK and around the world, live.'},
    {t:'Channel 7 News Insight', img:N + 'dm-sanam7.png', bg:N + 'bg-sanam7.webp', tv:'CH7 HD', live:true, d:'Follow every move in the day\u2019s biggest stories, live every day on Channel 7.'},
    {t:'World Update with Thai PBS', img:N + 'lc-1.png', tv:'TPBS', live:true, d:'The day\u2019s international news in one roundup, digging into the stories the whole world is watching.'},
    {t:'Open News Desk', img:N + 'lc-2.png', tv:'PPTV HD', live:true, d:'The PPTV news team opens the desk on every hot topic of the day.'},
    {t:'Komchadluek', img:N + 'lc-4.png', tv:'Nation TV', live:true, d:'Komchadluek goes straight to the heart of Thai politics and society, with frank, in-depth interviews.'}
  ];
  return { list:list, hot:hot, start:start, label:label, hasMD:hasMD, href:href, range:range, find:find };
})();
