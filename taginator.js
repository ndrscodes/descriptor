let allowed_tags = ["house",
    "bass",
    "dubstep",
    "dnb",
    "drum n bass",
    "drum and bass",
    "monstercat",
    "ncs",
    "nocopyrightsounds",
    "no copyright sounds",
    "no copyright",
    "bitbird",
    "deep",
    "hard",
    "trap",
    "future"]

async function getTags(search){
    return await new scraper().getJson('https://rapidtags.io/api/generator?query=' + search + 'type=YouTube')
}

async function getProcessedTags(search){
    let tags = await getTags(search);
    tags = tags.tags;
    let searchItems = normalizeSearch(search).split(" ");
    searchItems = searchItems.filter(item => item.trim().length > 0);
    let result = [];

    tags.forEach(element => {
        let hitCount = 0;
        let added = false;
        if(element.toLowerCase().containsAny(allowed_tags)){
            console.log("found tag", element);
            result.push(element);
        }
        else{
            searchItems.forEach(str => {
                if(!added && element.toString().toLowerCase().includes(str.toLowerCase())){
                    hitCount++;
                    console.log(element + " is a probable candidate: " + hitCount + " matches with title")
                    if(hitCount >= search.length/3){
                        console.log("found tag", element);
                        result.push(element);
                        added = true;
                    }
                }
            });
        }
    });

    let tagSearch = search.replace(/[\[\]\(\)]/gm, "");
    tagSearch.toLowerCase().split(/[\& \-]/gm).forEach(element => {
        if(element.trim().length > 0){
            result.push(element);
        }
    });

    let songArtistSplit = tagSearch.toLowerCase().split("-");
    result.push(songArtistSplit[0].replace(/&|x /gm, ""));
    let artists = songArtistSplit[0].split(/&|x /gm);
    result.push(artists);

    artists.forEach(element => {
        result.push(element.trim() + " " + songArtistSplit[1].trim());
        result.push(element.trim() + " - " + songArtistSplit[1].trim());
    });

    result.push(songArtistSplit);
    result.push(songArtistSplit[1].split(/feat\.?|ft\.?/gm));
    result.push(songArtistSplit[1].split(/feat\.?|ft\.?/gm).join(""));
    result.push(normalizeSearch(search));
    result.push(search);
    result.push(normalizeSearch(search).toLowerCase().split(/feat\.?|ft\.?/gm))

    result = result.flat().map(item => item.toString().trim().replace("  ", " ").toLowerCase());

    return result.unique().join(",");
}

function normalizeSearch(search){
    return search.replace(/[\[\]\-\(\)]/gm, "");
}