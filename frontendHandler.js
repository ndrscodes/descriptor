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
    resetProgressBar();
    let textArea = document.getElementById("textarea");
    let textElement = "";

    textElement += getHeader() + "\r\n" + "\r\n";
    textElement += getAdditionalInfoTop() + "\r\n";
    textElement += getDownloadLink() + "\r\n" + "\r\n";
    for(let i = 0; i < artistCount; i++){
        console.log("executing " + i);
        textElement += await getArtistBlock(i);
        textElement += "\r\n";
        updateProgressBar((i + 1)/(artistCount + 1) * 100);
    }
    textElement += getSelfDescription() + "\r\n" + "\r\n";
    textElement += getWallpaperLink();
    textArea.value = textElement;
    document.getElementById("tags").value = await processTags();
    updateProgressBar(100);
}

function getSectionPrefix(){
    return document.getElementById("line-prefix").value;
}

function resetProgressBar(){
    width = 0;
    updateProgressBar(0);
}

let width = 0;
function updateProgressBar(progress){
    var elem = document.getElementById("process-progress");
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= progress) {
        clearInterval(id);
      } else {
        width++;
        elem.style.width = width + "%";
        elem.innerHTML = width + "%";
      }
    }
}

async function getArtistBlock(artistId){
    let displayHelper = new displayHandler();
    let artistUrl = document.getElementById("artist-"+artistId).value;
    let artistHeader = document.getElementById("artist-header").value;
    let artistName = await itemScraper.getDisplayName(artistUrl);
    let scrapedItems = await itemScraper.crawl(artistUrl);
    let result = artistHeader.replace("$artist_name", artistName);
    result += "\r\n";
    result += "Soundcloud: " + artistUrl + "\r\n";
    scrapedItems.forEach(element => {
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
    for(let i = 0; i < artistLinks.length; i++){
        if(i >= artistCount){
            addArtistField();
        }
        if(artistLinks.length < artistCount){
            removeArtistField();
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
    return document.getElementById("song-link").value;
}

function setTitle(title){
    document.getElementById("title").value = title;
}

function getTitle(){
    return document.getElementById("title").value;
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
    documentNode.setAttribute("class", "form-control movable-content");
    documentNode.setAttribute("id", "artist-" + artistCount);

    let label = document.createElement("label");
    label.innerHTML = "Artist " + artistCount

    let upwardBtn = document.createElement("button");
    upwardBtn.setAttribute("class", "btn btn-sm text-right btn-outline-success");
    upwardBtn.textContent = "up"
    upwardBtn.setAttribute("onclick", "switchTextFieldValue(this.previousSibling, \"up\")");
    
    let downwardBtn = document.createElement("button");
    downwardBtn.setAttribute("class", "btn btn-sm text-right btn-outline-success");
    downwardBtn.textContent = "down"
    downwardBtn.setAttribute("onclick", "switchTextFieldValue(this.previousSibling.previousSibling, \"down\")");
    
    let removeBtn = document.createElement("button");
    removeBtn.setAttribute("class", "btn btn-sm text-right btn-outline-danger");
    removeBtn.textContent = "delete"
    removeBtn.setAttribute("onclick", "remove(this.previousSibling.previousSibling.previousSibling)");
    
    form.appendChild(documentNode);
    form.appendChild(upwardBtn);
    form.appendChild(downwardBtn);
    form.appendChild(removeBtn);
    
    container.appendChild(label);
    container.appendChild(form);

    artistCount++;

    return container;
}

function remove(element){
    let res;
    if(element !== undefined && element !== null && (res = switchTextFieldValue(element, "down")) !== undefined){
        remove(res);
    }
    else{
        removeArtistField();
    }
}

function switchTextFieldValue(element, direction){
    let input = element;
    let target;
    if(!input.classList.contains("movable-content")){
        console.error("not movable");
        return null;
    }
    if(direction === "down"){
        target = element?.parentElement?.parentElement?.nextSibling?.childNodes[1]?.childNodes[0];
    }
    if(direction === "up"){
        target = element?.parentElement?.parentElement?.previousSibling?.childNodes[1]?.childNodes[0];
    }
    if(target){
        let previousValue = target.value
        target.value = input.value
        input.value = previousValue;
        return target;
    }
    else{
        return null;
    }
}

async function processTags(){
    return await getProcessedTags(getTitle());
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
            return this.capitalize(result[1].replace("-", " "));
        }
        return null;
    }

    runReplacements(input){
        let result;
        result = input.replace("?sub_confirmation=1", "");
        return result;
    }
}