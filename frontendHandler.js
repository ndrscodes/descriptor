let personalNetworkDeclaration = "personal"

//TODO: Parse Domain einbinden
let artistCount = 1;
let artistBlock = document.getElementById("artists");
document.onreadystatechange = function(){
    if(document.readyState == "complete"){
        addArtistField();
    }
}

async function process(){
    let textArea = document.getElementById("textarea");
    let textElement = "";
    for(let i = 1; i < artistCount; i++){
        console.log("executing " + i);
        textElement += await getArtistBlock(i);
        textElement += "\r\n";
    }
    textArea.value = textElement;
}

async function getArtistBlock(artistId){
    let displayHelper = new displayHandler();
    let artistUrl = document.getElementById("artist-"+artistId).value;
    console.log(artistUrl);
    let foo = new scraper(artistUrl);
    let artistHeader = document.getElementById("artist-header").value;
    let artistName = await foo.getDisplayName();
    console.log("Artistname: " + artistName);
    let scrapedItems = await foo.crawl();
    let result = artistHeader.toLowerCase().replace("$artist_name", artistName);
    result += "\r\n";
    result += "Soundcloud: " + artistUrl + "\r\n";
    scrapedItems.forEach(element => {
        console.log(element.network);
        //textElement += String.fromCodePoint(0x2794);
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
    result = displayHelper.runReplacements(result);
    return result;
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
    let documentNode = document.createElement("input");
    documentNode.setAttribute("class", "form-control mb-2");
    documentNode.setAttribute("id", "artist-" + artistCount);
    let label = document.createElement("label");
    label.innerHTML = "Artist " + artistCount
    container.appendChild(label);
    container.appendChild(documentNode);
    artistCount++;
    console.log(container);
    return container;
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