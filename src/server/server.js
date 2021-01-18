var http = require('http');
var path = require('path');
var fs = require('fs');
const {ipcMain} = require("electron");

// check if a file at the given path (relative to the display directory) exists
function fileExists(filepath) {
    let p = path.join(__dirname, "..", "display", filepath);
    return fs.existsSync(p);
}

// create the HTTP server
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

        // some additional special cases for libraries and resources that live outside the 'display' directory
        case "/lib/socket.io.min.js":
            fp = path.join("..", "..", "node_modules", "socket.io", "client-dist", "socket.io.min.js");
            break;
        case "/lib/socket.io.min.js.map":
            fp = path.join("..", "..", "node_modules", "socket.io", "client-dist", "socket.io.min.js.map");
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
    else if (fp.split(".").slice(-1)[0] == "html"){
        res.writeHead(200, { 'Content-Type': 'text/html' });
    }
    else{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
    }

    // get the file contents
    res.write(fs.readFileSync(path.join(__dirname, "..", "display", fp)))
    res.end();
});

// initialize socket.io
const io = require("socket.io")(server);

io.on('connection', socket => {
    console.log("connection!");
    // ipcMain.on("new-display-selected", function(event, arg){
    //     socket.emit("set-display", arg);
    // });

    // generically pass messages from the controller to all connected displays
    ipcMain.on("broadcast-to-displays", function(event, name, arg){
        socket.emit(name, arg);
    });
});






// listen on port 34778 (spells FIRST on a phone pad)
server.listen(34778);

console.log('Web server running at http://localhost:34778...');
