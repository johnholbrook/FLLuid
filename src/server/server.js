var http = require('http');
var path = require('path');
var fs = require('fs');
var accurateInterval = require('accurate-interval');
const {ipcMain} = require("electron");
const { setTimeout } = require('timers');

var sendToController = null;
module.exports = {
    initSendToController: f => sendToController = f
}

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
    "/timer-chroma" : path.join("timer", "timer-chroma.html"),
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
    // console.log(socket.handshake.headers.referer);

    socket.emit("set-state", JSON.stringify(display_state));

    let page = socket.handshake.headers.referer.split("/").slice(-1)[0];
    if (page == "timer" || page == "timer-chroma") {
        socket.emit("timer-value", secsToClock(current_time));
    }
    else if (page == ""){
        socket.emit("select-display", current_display);
    }
});

// listen on port 34778 (spells FIRST on a phone pad)
server.listen(34778);
console.log('Web server running at http://localhost:34778...');

var current_display = "";

var display_state = {
    images: [],
    message: "",
    show_message_on_tables: false,
    match_blocks: [],
    current_block: 0,
    scores: [],
    other_events: [],
    timer_options: {
        start_sound: true,
        warning_sound: true,
        end_sound: true,
        font: "",
        auto_advance: false,
        chroma_teams: false
    },
    chroma_mode: false
}

// send the display state to all connected clients
function updateDisplayState(){
    io.emit("set-state", JSON.stringify(display_state));
}

ipcMain.on("set-display", function(event, arg){
    current_display = arg;
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

ipcMain.on("update-scores", function(event, arg){
    display_state.scores = arg;
    updateDisplayState();
});

ipcMain.on("other-event-ids", function(event, arg){
    // remove any entries for events not in the list of IDs we just recieved
    display_state.other_events.forEach((entry, idx) => {
        if (!arg.includes(entry.event_id)){
            display_state.other_events.splice(idx,1);
        }
    });
});

ipcMain.on("other-event-scores", function(event, arg){
    let event_id = arg.event_id;

    // remove the existing entry for this event (if any)
    display_state.other_events.forEach((entry, idx) => {
        if (entry.event_id == event_id){
            display_state.other_events.splice(idx,1);
        }
    });

    display_state.other_events.push(arg);
    updateDisplayState();
});

const TIMER_RESET_VAL = 150; //seconds
var current_time = TIMER_RESET_VAL;
var timer_interval = null;
var timer_running = false;

function broadcast_current_time(){
    io.emit("timer-value", secsToClock(current_time));
    sendToController("set-timer-text", secsToClock(current_time));
}

function tick_timer(){
    current_time -= 1;
    if (current_time == 0){
        pause_timer();
        setTimeout(reset_timer, 5000);
        if (display_state.timer_options.auto_advance){
            setTimeout(() => {
                sendToController("next-match-block", "");
            }, 5000);
        }
    }
    broadcast_current_time();
}

function start_timer(){
    if (!timer_running){
        console.log("Starting timer");
        io.emit("play-start-sound");
        timer_interval = accurateInterval(tick_timer, 1000);
        sendToController("set-start-button-text", "Pause");
        timer_running = true;
    }
}

function pause_timer(){
    if (timer_interval != null) timer_interval.clear();
    timer_running = false;
    sendToController("set-start-button-text", "Start");
}

function reset_timer(){
    pause_timer();
    current_time = TIMER_RESET_VAL;
    broadcast_current_time();
}

//converts a number of seconds to a clock display
//@param time - a number of seconds
function secsToClock(time) {
	var secs = time % 60;
	if (secs < 10) {
		//force 2-digit display of seconds
		secs = '0' + secs;
	}
	var mins = Math.floor(time / 60);
	return mins + ':' + secs;
}

ipcMain.on("start-timer", function(){
    timer_running? pause_timer() : start_timer();
});

ipcMain.on("reset-timer", reset_timer);

ipcMain.on("set-start-sound", function(event, arg){
    display_state.timer_options.start_sound = arg;
    updateDisplayState();
});

ipcMain.on("set-30sec-warning", function(event, arg){
    display_state.timer_options.warning_sound = arg;
    updateDisplayState();
});

ipcMain.on("set-end-sound", function(event, arg){
    display_state.timer_options.end_sound = arg;
    updateDisplayState();
});

ipcMain.on("set-timer-font", function(event, arg){
    display_state.timer_options.font = arg;
    updateDisplayState();
});

ipcMain.on("set-auto-advance", function(event, arg){
    display_state.timer_options.auto_advance = arg;
    updateDisplayState();
});

ipcMain.on("set-chroma-key-timer-teams", function(event, arg){
    display_state.timer_options.chroma_teams = arg;
    updateDisplayState();
});

ipcMain.on("set-chroma-key-mode", function(event, arg){
    display_state.chroma_mode = arg;
    updateDisplayState();
})