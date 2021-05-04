
class scraper{

    constructor(){
        this.corsProxy = "http://localhost:8080/";
        this.api = "https://api-v2.soundcloud.com";
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
        console.log(result.text());
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
        console.log(this.getElementByXPath(page, '//h1[contains(@itemprop, "name")]/a[contains(@itemprop, "url")]'));
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
        console.log(htmlPage.evaluate(xPathExpression, htmlPage, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
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

    async getArtistLinks(url){
        let result = [];
        let page = await this.getViaProxy(url);
        let description = this.getElementByXPath(page, "//*[@id=\"app\"]/noscript[2]/article/p/text()").parentElement.textContent;
        console.log(description);
        const regex = /@(\S*)/gm;
        let regexResult;
        while((regexResult = regex.exec(description)) != null){
            result.push("https://soundcloud.com/" + regexResult[1]);
        }
        return result.concat(await this.getArtistLinksDirect(url));
    }

    async getArtistLinksDirect(url){
        let result = [];
        let page = await this.getViaProxy(url);
        let description = this.getElementByXPath(page, "//*[@id=\"app\"]/noscript[2]/article/p/text()").parentElement.textContent;
        console.log(description);
        const regex = /https?:\/\/soundcloud.com\/\S*/gm;
        let regexResult;
        while((regexResult = regex.exec(description)) != null){
            result.push(regexResult[0]);
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
}