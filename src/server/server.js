var http = require('http');
var path = require('path');
var fs = require('fs');
const {ipcMain} = require("electron");

// check if a file at the given path (relative to the display directory) exists
function fileExists(filepath) {
    let p = path.join(__dirname, "..", "display", filepath);
    return fs.existsSync(p);
}

// some special cases
const paths = {
    "/" : "display.html",
    "/index" : "display.html",
    "/intro" : path.join("intro", "intro.html"),
    "/logos" : path.join("logos", "logos.html"),
    "/message" : path.join("message", "message.html"),
    "/other-events" : path.join("other-events", "other-events.html"),
    "/schedule" : path.join("schedule", "schedule.html"),
    "/scores" : path.join("scores", "scores.html"),
    "/timer" : path.join("timer", "timer.html"),
    "/lib/socket.io.min.js" : path.join("..", "..", "node_modules", "socket.io", "client-dist", "socket.io.min.js"),
    "/lib/socket.io.min.js.map" : path.join("..", "..", "node_modules", "socket.io", "client-dist", "socket.io.min.js.map"),
    "/lib/bootstrap.min.css" : path.join("..", "..", "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css"),
    "/lib/scrollable.js" : path.join("..", "scrollable", "scrollable.js"),
}

const mime_types = {
    "html" : "text/html",
    "css" : "text/css",
    "js" : "text/javascript",
    "png" : "image/png",
    "jpg" : "image/jpeg",
    "jpeg": "image/jpeg",
    "gif" : "image/gif",
    "bmp" : "image/bmp"
};

// object to keep track of the user-selected images
var images = {};

// create the HTTP server
var server = http.createServer(function(req, res) {
    // determine the location of the file to be retrieved based on the request's URL
    let fp;
    let absolute_path = false;
    // if the url is one of the special cases, use the corresponding path
    if (paths.hasOwnProperty(req.url)){
        fp = paths[req.url];
    }
    // if not, try appending ".html" to the path and see if it matches one of the special cases
    // else if (paths.hasOwnProperty(req.url+".html")){
    //     fp = paths[req.url+".html"];
    // }
    // otherwise, if the url is an image, use the path to the image
    else if (images.hasOwnProperty(req.url)){
        fp = images[req.url];
        absolute_path = true;
    }
    // otherwise, if the url is the name of a file in /display, use that
    else if (fileExists(req.url)){
        // if the URL is an extant file, return that file
        fp = req.url;
    }
    else{
        // if not, try appending ".html" and see if that's a file
        if (fileExists(`${req.url}.html`)){
            fp = `${req.url}.html`;
        }
        else{
            // finally, if none of the above worked, return the 404 page
            fp = `404.html`;
        }
    }

    // write the header as appropriate
    let ext = fp.split(".").slice(-1)[0];
    if (fp == "404.html"){
        res.writeHead(404, { 'Content-Type': 'text/html' });
    }
    else if (mime_types.hasOwnProperty(ext)){
        res.writeHead(200, { 'Content-Type': mime_types[ext] });
    }
    else{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
    }

    // get the file contents
    if (absolute_path){
        res.write(fs.readFileSync(fp));
    }
    else{
        res.write(fs.readFileSync(path.join(__dirname, "..", "display", fp)))
    }
    res.end();
});

// initialize socket.io
const io = require("socket.io")(server);

// when a new client connects, send it the display state
io.on('connection', socket => {
    console.log("connection!");
    socket.emit("set-state", JSON.stringify(display_state));
});

// listen on port 34778 (spells FIRST on a phone pad)
server.listen(34778);
console.log('Web server running at http://localhost:34778...');

var display_state = {
    images: [],
    message: "",
    show_message_on_tables: false,
    match_blocks: [],
    current_block: 0
}

// send the display state to all connected clients
function updateDisplayState(){
    io.emit("set-state", JSON.stringify(display_state));
}

ipcMain.on("set-display", function(event, arg){
    io.emit("select-display", arg);
});

// when a new set of images is selected in the controller,
// propagate that change appropriately
ipcMain.on("set-logos", function(event, arg){
    images = {};
    let names = [];
    arg.forEach(img_fp => {
        let fname = `/img/${path.basename(img_fp)}`;
        images[fname] = img_fp;
        names.push(fname);
    });
    display_state.images = names;
    updateDisplayState();
    console.log(images);
});

// update the message
ipcMain.on("set-message-text", function(event, arg){
    display_state.message = arg;
    // console.log(display_state.message)
    updateDisplayState();
});

ipcMain.on("set-blocks", function(event, arg){
    // console.log(arg);
    display_state.match_blocks = arg;
    updateDisplayState();
});

ipcMain.on("msg-on-other-screens", function(event, arg){
    display_state.show_message_on_tables = arg;
    updateDisplayState();
});

ipcMain.on("set-current-block", function(event, arg){
    display_state.current_block = arg;
    updateDisplayState();
});