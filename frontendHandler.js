let personalNetworkDeclaration = "personal"
let itemScraper = new scraper();

//TODO: Parse Domain einbinden
let artistCount = 0;
let artistBlock = document.getElementById("artists");
document.onreadystatechange = function(){
    if(document.readyState == "complete"){
        addArtistField();
    }
}

function loadDefaults(channel){
    let inputs = document.getElementsByTagName("input");
    for(let i = 0; i < inputs.length; i++){
        inputs[i].value = "";
    }
    inputs = document.getElementsByTagName("textarea");
    for(let i = 0; i < inputs.length; i++){
        inputs[i].value = "";
    }
    if(channel === "CookieMusicNetwork"){
        displayDefaults(loadCmn());
        return;
    }
    if(channel === "JompaMusic"){
        displayDefaults(loadJ());
        return;
    }
}

function displayDefaults(map){
    map.forEach((value, key) => {
        console.log(document.getElementById(key));
        document.getElementById(key).value = value;
    });
}

async function process(){
    let textArea = document.getElementById("textarea");
    let textElement = "";
    textElement += getHeader() + "\r\n" + "\r\n";
    textElement += getAdditionalInfoTop() + "\r\n";
    textElement += getDownloadLink() + "\r\n" + "\r\n";
    for(let i = 0; i < artistCount; i++){
        console.log("executing " + i);
        textElement += await getArtistBlock(i);
        textElement += "\r\n";
        updateProgressBar(i/artistCount * 100);
    }
    textElement += getSelfDescription() + "\r\n" + "\r\n";
    textElement += getWallpaperLink();
    textArea.value = textElement;
}

function getSectionPrefix(){
    return document.getElementById("line-prefix").value;
}

function updateProgressBar(progress){
    console.log("progress", progress);
  if (progress == 0) {
    progress = 1;
    var elem = document.getElementById("process-progress");
    var width = 10;
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
        progress = 0;
      } else {
        width++;
        elem.style.width = width + "%";
        elem.innerHTML = width + "%";
      }
    }
  }
}

async function getArtistBlock(artistId){
    let displayHelper = new displayHandler();
    let artistUrl = document.getElementById("artist-"+artistId).value;
    console.log(artistUrl);
    let artistHeader = document.getElementById("artist-header").value;
    let artistName = await itemScraper.getDisplayName(artistUrl);
    console.log("Artistname: " + artistName);
    let scrapedItems = await itemScraper.crawl(artistUrl);
    let result = artistHeader.replace("$artist_name", artistName);
    result += "\r\n";
    result += "Soundcloud: " + artistUrl + "\r\n";
    scrapedItems.forEach(element => {
        console.log(element.network);
        if(element.network === personalNetworkDeclaration){
            result += displayHelper.handlePersonalNetwork(element.url);
        }
        else{
            result += displayHelper.capitalize(element.network);
        }
        result += ": ";
        result += element.url;
        result += "\r\n";
    });
    result = getSectionPrefix() + displayHelper.runReplacements(result);
    return result;
}

async function autoFill(){
    let url = getSongUrl();
    let artistLinks = await itemScraper.getArtistLinks(url);
    console.log(artistLinks);
    for(let i = 0; i < (await artistLinks).length; i++){
        if(i >= artistCount){
            addArtistField();
        }
        getArtistField(i).value = artistLinks[i];
    }
    setTitle(await itemScraper.getSongTitle(url));
    setDownloadLink(await itemScraper.getDownloadLink(url));
}

function getArtistField(id){
    return document.getElementById("artist-" + id);
}

function setDownloadLink(link){
    document.getElementById("download-link").value = link;
}

function getSongUrl(){
    console.log(document.getElementById("song-link").value);
    return document.getElementById("song-link").value;
}

function setTitle(title){
    document.getElementById("title").value = title;
}

function getHeader(){
    let title = document.getElementById("title").value;
    let decoration = document.getElementById("decoration").value;
    return decoration + " " + title + " " + decoration;
}

function getDownloadLink(){
    let downloadLinkHeader = document.getElementById("download-header").value;
    let downloadLink = document.getElementById("download-link").value;
    return getSectionPrefix() + downloadLinkHeader + " " + downloadLink;
}

function getSelfDescription(){
    return getSectionPrefix() + document.getElementById("self-description").value;
}

function getWallpaperLink(){
    let wallpaperLinkHeader = document.getElementById("wallpaper-header").value;
    let wallpaperLink = document.getElementById("wallpaper-link").value;
    return getSectionPrefix() + wallpaperLinkHeader + " " + wallpaperLink;
}

function getAdditionalInfoTop(){
    return getSectionPrefix() + document.getElementById("additional-info-top").value;
}

function addArtistField(){
    let node = document.getElementById("artists");
    node.appendChild(createArtistFieldNode());
}

function removeArtistField(){
    let elementToDelete = document.getElementById("artists").lastChild;
    elementToDelete.remove();
    artistCount--;
}

function createArtistFieldNode(){
    let container = document.createElement("div");
    let form = document.createElement("div");
    form.setAttribute("class", "d-flex flex-row mb-2");
    let documentNode = document.createElement("input");
    let br = document.createElement("br");
    documentNode.setAttribute("class", "form-control movable-content");
    documentNode.setAttribute("id", "artist-" + artistCount);
    let label = document.createElement("label");
    label.innerHTML = "Artist " + artistCount
    container.appendChild(label);
    let upwardBtn = document.createElement("button");
    upwardBtn.setAttribute("class", "btn btn-sm text-right btn-outline-success");
    upwardBtn.textContent = "up"
    upwardBtn.setAttribute("onclick", "switchTextFieldValue(this, \"up\")");
    let downwardBtn = document.createElement("button");
    downwardBtn.setAttribute("class", "btn btn-sm text-right btn-outline-success");
    downwardBtn.textContent = "down"
    downwardBtn.setAttribute("onclick", "switchTextFieldValue(this, \"down\")");
    console.log(upwardBtn);
    form.appendChild(documentNode);
    form.appendChild(upwardBtn);
    form.appendChild(downwardBtn);
    container.appendChild(form);
    artistCount++;
    console.log(container);
    return container;
}

function switchTextFieldValue(element, direction){
    if(direction === "down"){
        let input = element.previousSibling.previousSibling;
        if(!input.classList.contains("movable-content")){
            console.error("not movable");
            return;
        }
        if(input.parentElement.parentElement.nextElementSibling){
            let target = element.parentElement.parentElement.nextSibling.childNodes[1].childNodes[0];
            let previousValue = target.value
            target.value = input.value
            input.value = previousValue;
        }
    }
    if(direction === "up"){
        let input = element.previousSibling;
        if(!input.classList.contains("movable-content")){
            console.error("not movable");
            return;
        }
        if(input.parentElement.parentElement.previousElementSibling){
            console.log(input.parentElement.parentElement.previousSibling);
            let target = element.parentElement.parentElement.previousSibling.childNodes[1].childNodes[0];
            let previousValue = target.value
            target.value = input.value
            input.value = previousValue;
        }
    }
}

class displayHandler{
    constructor(){

    }

    capitalize(input){
        let elements = input.split(" ");
        elements = elements.map(word => this.capitalizeFirstLetter(word));
        return elements.join(" ");
    }

    capitalizeFirstLetter(input){
        return input[0].toUpperCase() + input.slice(1);
    }

    handlePersonalNetwork(url){
        const regex = /(?:.*\.)*([\w-]*)\.(?!uk)/gm; //parses a string for the second-to-last occurence between two dots -> gets a hosts domain
        let result;
        if((result = regex.exec(url)) != null && result.length > 1){
            return this.capitalize(result[1]);
        }
        return null;
    }

    runReplacements(input){
        let result;
        result = input.replace("?sub_confirmation=1", "");
        return result;
    }
}