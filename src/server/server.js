var http = require('http');
var path = require('path');
var fs = require('fs');

// check if a file at the given path (relative to the display directory) exists
function fileExists(filepath) {
    let p = path.join(__dirname, "..", "display", filepath);
    return fs.existsSync(p);
}

// create the server
var server = http.createServer(function(req, res) {
    // determine which file to serve based on the request URL
    let fp;
    switch (req.url){
        // some special cases for the name of each display
        case "/":
        case "/index":
        case "/index.html":
            fp = "display.html";
            break;
        case "/intro":
        case "/intro.html":
            fp = path.join("intro", "intro.html");
            break;
        case "/logos":
        case "/logos.html":
            fp = path.join("logos", "logos.html");
            break;
        case "/message":
        case "/message.html":
            fp = path.join("message", "message.html");
            break;
        case "/other-events":
        case "/other-events.html":
            fp = path.join("other-events", "other-events.html");
            break;
        case "/schedule":
        case "/schedule.html":
            fp = path.join("schedule", "schedule.html");
            break;
        case "/scores":
        case "/scores.html":
            fp = path.join("scores", "scores.html");
            break;
        case "/timer":
        case "/timer.html":
            fp = path.join("timer", "timer.html");
            break;

        // default case
        default:
            // fp = "default";
            if (fileExists(req.url)){
                // if the URL is an extant file, return that file
                fp = req.url;
            }
            else{
                // if not, try appending ".html" and see if that's a file
                if (fileExists(`${req.url}.html`)){
                    fp = `${req.url}.html`;
                }
                else{
                    // if that doesn't work, return the 404 page
                    fp = `404.html`;
                }
            }
    }
    // console.log(fp);

    // write the header as appropriate
    if (fp == "404.html"){
        res.writeHead(404, { 'Content-Type': 'text/html' });
    }
    else{
        res.writeHead(200, { 'Content-Type': 'text/html' });
    }

    // get the file contents
    res.write(fs.readFileSync(path.join(__dirname, "..", "display", fp)))
    res.end();
});

// listen on port 34778 (spells FIRST on a phone pad)
server.listen(34778);

console.log('Web server running at http://localhost:34778...');
