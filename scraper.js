
class scraper{
    constructor(){
        this.corsProxy = config.proxy;
        this.api = config.api;
        this.loadedWebPages = new Map();
        this.proxyLoadedWebPages = new Map();
        this.clientId = null;
        this.userId = null;
    }

    async getViaProxy(url){
        if(this.proxyLoadedWebPages.get(url) == null){
            this.proxyLoadedWebPages.set(url, await fetch(this.corsProxy + url, {headers: {'Content-Type': 'text/plain'}}).then(res => res.text()));
        }
        return this.proxyLoadedWebPages.get(url);
    }

    async get(url){
        if(this.loadedWebPages.get(url) == null){
            this.loadedWebPages.set(url, await fetch(url, {headers: {'Content-Type': 'text/plain'}}).then(res => res.text()));
        }
        return this.loadedWebPages.get(url);
    }

    async getHtmlDocument(url){
        const result = await fetch(this.corsProxy + url, {headers: {'Content-Type': 'text/plain'}});
        return result;
    }

    async getJson(url){
        return await this.getViaProxy(url).then(res => JSON.parse(res));
    }

    async getClientId(page){
        if(this.clientId == null){
            let client_id;
            const regex = /,client_id:"(.+?)"/gm;
            let currentNode;
            let elements = this.getElementsByXPath(page, '//script[@src]');
            while((currentNode = elements.iterateNext()) != null){
                client_id = this.getRegexResultByIndex(
                    regex.exec(await this.get(currentNode.getAttribute("src"))), 1);
                if(client_id != null){
                    break;
                }
            }
            this.clientId = client_id;
        }
        return this.clientId;
    }

    getUserId(page){
        let userId;
        let currentNode;
        const regex = /soundcloud:users:(\w+)?/gm;
        let elements = this.getElementsByXPath(page, '//script[not(@src)]');
        while((currentNode = elements.iterateNext()) != null){
            userId = this.getRegexResultByIndex(regex.exec(currentNode.innerHTML), 1);
            this.userId = userId;
        }
        return this.userId;
    }

    async getDisplayName(url){
        let page = await this.getViaProxy(url);
        return this.getElementByXPath(page, '//h1[contains(@itemprop, "name")]/a[contains(@itemprop, "url")]').innerHTML;
    }

    getRegexResultByIndex(regexResult, index){
        if(regexResult != null){
            if(regexResult.length >= index + 1){
                return regexResult[1];
            }
        }
        return null;
    }

    getElementsByXPath(html, xPathExpression){
        if(xPathExpression == null){
            return null;
        }
        let parser = new DOMParser();
        let htmlPage = parser.parseFromString(html, 'text/html');
        return htmlPage.evaluate(xPathExpression, htmlPage, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
    }

    getElementByXPath(html, xPathExpression){
        if(xPathExpression == null){
            return null;
        }
        let parser = new DOMParser();
        let htmlPage = parser.parseFromString(html, 'text/html');
        return htmlPage.evaluate(xPathExpression, htmlPage, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }

    async crawl(url) {
        let userId;
        let clientId;
        
        let scPage = await this.getViaProxy(url);
        userId = this.getUserId(scPage);
        clientId = await this.getClientId(scPage);

        return this.getSocialPages(clientId, userId);
    }

    async getSocialPages(clientId, userId){
        let url = this.api + "/users/soundcloud:users:" + userId + "/web-profiles?client_id=" + clientId;
        let response = await this.getJson(url);
        return response;
    }

    async getDescription(url){
        let page = await this.getViaProxy(url);
        let description = this.getElementByXPath(page, "//*[@id=\"app\"]/noscript[2]/article/p/text()").parentElement.textContent;
        return description;
    }

    async getArtistLinks(url){
        let result = [];
        let description = await this.getDescription(url);
        const regex = /(?:^|\s|[^a-zA-Z])@(\S*[a-zA-Z])/gm;
        let regexResult;
        console.log(description);
        while((regexResult = regex.exec(description)) != null && regexResult[1] != null){
            console.log(regexResult);
            result.push(("https://soundcloud.com/" + regexResult[1]).toLowerCase());
        }
        result = result.concat(await this.getArtistLinksDirect(description));
        return result.concat(("https://soundcloud.com" + await this.getOwner(url)).toLowerCase()).unique();
    }

    async getArtistLinksDirect(text){
        let result = [];
        const regex = /(https?:\/\/soundcloud.com\/[a-zA-Z\d\-]*)/gm;
        let regexResult;
        while((regexResult = regex.exec(text)) != null && regexResult[1] != undefined){
            result.push(regexResult[1].toLowerCase().replace("http:", "https:"));
        }
        return result;
    }

    async getDownloadLink(url){
        let page = await this.getViaProxy(url);
        let link = this.getElementByXPath(page, "//*[@id=\"app\"]/noscript[2]/article/footer/a").href;
        return link.replace("http://", "https://");
    }

    async getSongTitle(url){
        let title = new DOMParser().parseFromString(await this.getViaProxy(url), 'text/html').querySelector("[itemprop=url]");
        return title.textContent;
    }

    async getOwner(url){
        let owner = new DOMParser().parseFromString(await this.getViaProxy(url), 'text/html').querySelector("[itemprop=url]").nextElementSibling;
        return owner.getAttribute("href");
    }
}