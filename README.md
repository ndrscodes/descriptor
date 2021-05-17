# descriptor
a hacky tool for automatically creating youtube descriptions and tags from soundcloud links

I actually have no clue about JS conventions (as you might see. I'm a backend-programmer, but i'm trying to learn more frontendy(?) stuff too.), this is just a hacky solution i came up with in order to automatically create descriptions and tags for some youtube channels i'm working on.

# DISCLAIMER
This thing here is nothing official and you likely will not be able to use it for anything.
I do not know if Soundcloud is cool with me parsing their JS files in order to obtain a client id for using their API.

## Additional information
This neat little tool requires a CORS proxy running on port 8000. Any proxy should do, as long as you can pass links to it by using HTTP parameters like this:
```
http://localhost:8000/https://github.com
```
In my case, i'm running a small node.js proxy called [CORS Anywhere](https://github.com/Rob--W/cors-anywhere) by [Rob--W](https://github.com/Rob--W). 
If you don't want to use your own proxy, i have included a simple start skript for a cors-anywhere proxy [(server.js)](server.js).
In order for this skript to work, port 8000 needs to be available and cors-anywhere needs to be installed. To do this, you can run the following command:
```
npm install cors-anywhere
```
The script can be executed by simply passing it to node:
```
node server.js
```

You can also run this proxy on a different server. In case you do, do not forget to edit [config.js](config.js). Here, we need to exchange the value for corsProxy to point to our proxy (example given below):
```
proxy: "http://your-cors-pro.xy:8000/";
```

If any of you guys are interested in creating a more stable solution for a broader audience, i'll gladly help you. Just create an issue or a pull request. Whatever floats your boat.
