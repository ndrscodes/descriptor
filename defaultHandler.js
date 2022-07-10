const rex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;

function loadCmn(){
    let map = new Map();
    map.set("decoration", String.fromCodePoint(0x1F493)); //💓
    map.set("download-header", "FREE DOWNLOAD + STREAM:");
    map.set("artist-header", "Follow $artist_name:");
    map.set("self-description", `Follow CookieMusicNetwork:
Soundcloud: https://soundcloud.com/cookiemusicnetwork
Facebook: https://www.facebook.com/cookiemusicnetwork
Plug.dj: http://plug.dj/electro-and-chill-room/
Twitch: https://twitch.tv/cookiemusicnetwork
    
Want your track uploaded?
Send your song to our email: cookiemusicnetwork@gmail.com
    
If any producer/label/artist has an issue with this Music Video or the picture used in it, please contact us and we will delete it immediately.`);
    map.set("wallpaper-header", "Picture URL:");
    return map;
}

function loadJ(){
    let map = new Map();
    map.set("decoration", "\u0295\u2022\u1D25\u2022\u0294"); //💓
    map.set("download-header", "Free Download:");
    map.set("artist-header", "$artist_name:");
    map.set("line-prefix", "\u279E");
    map.set("additional-info-top", "Add me on Snapchat for your daily dose of Jompz: Jompahej")
    map.set("self-description", `JompaMusic: 
Twitter: https://twitter.com/JompaMusic
Facebook: https://www.facebook.com/JompaMusic/
Soundcloud: https://soundcloud.com/jompamusic
Snapchat: Jompahej

\u279EEvery song named "JompaMusic Release" in title is copyright free &  can be used & monetized against proper cred such as iTunes, Spotify & free download link. 

\u279EIntro made by Nils Bakker.
\u279ELogo made by: https://www.youtube.com/user/iFlipsfulGames`);
    map.set("wallpaper-header", "Picture URL \u1555( \u141B )\u1557:");
    return map;
}