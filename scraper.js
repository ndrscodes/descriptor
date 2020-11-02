
class scraper{

    constructor(url){
        this.url = url;
        this.corsProxy = "https://cors-anywhere.herokuapp.com/";
        this.api = "https://api-v2.soundcloud.com";
        this.loadedWebPages = new Map();
        this.proxyLoadedWebPages = new Map();
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
        return client_id;
    }

    getUserId(page){
        let userId;
        let currentNode;
        const regex = /soundcloud:users:(\w+)?/gm;
        let elements = this.getElementsByXPath(page, '//script[not(@src)]');
        while((currentNode = elements.iterateNext()) != null){
            userId = this.getRegexResultByIndex(regex.exec(currentNode.innerHTML), 1);
            if(userId != null){
                return userId;
            }
        }
        return null;
    }

    async getDisplayName(){
        let page = await this.getViaProxy(this.url);
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

    async crawl() {
        let userId;
        let clientId;
        
        let scPage = await this.getViaProxy(this.url);
        userId = this.getUserId(scPage);
        clientId = await this.getClientId(scPage);

        return this.getSocialPages(clientId, userId);
    }

    async getSocialPages(clientId, userId){
        let url = this.api + "/users/soundcloud:users:" + userId + "/web-profiles?client_id=" + clientId;
        let response = await this.getJson(url);
        return response;
    }
}