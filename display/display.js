const { ipcRenderer } = require('electron');
var timer = require('./timer.js');
var logos = require('./logos.js');
var scores = require('./scores.js');
var other_events = require('./other_events.js');

var none_display, logo_display, timer_display, scores_display, other_events_display;

var chroma_key_mode = false;
var selected_display = "";


document.addEventListener('DOMContentLoaded', () => {
    none_display = document.querySelector("#none-display");
    logo_display = document.querySelector("#logo-display");
    timer_display = document.querySelector("#timer-display");
    scores_display = document.querySelector("#scores-display");
    other_events_display = document.querySelector("#other-events-display");
});

//change to a particular display
//@param display - display to show
function change_display(display){
    if (display == "none"){
        none_display.style.display = "";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
    }
    else if (display == "logos"){
        none_display.style.display = "none";
        logo_display.style.display = "";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
    }
    else if (display == "timer"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
    }
    else if (display == "scores"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "";
        other_events_display.style.display = "none";
    }
    else if (display == "other-events"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "";
    }
}

ipcRenderer.on("new-display-selected", function(event, arg){
    console.log(arg);
    //run the logo slideshow only when that display is selected
    selected_display = arg;
    if (arg == "logos" || (arg == "none" && !chroma_key_mode)){
        change_display("logos");
        logos.start();
        scores.stop();
        other_events.stop();
    }
    else if (arg == "scores"){
        scores.start();
        logos.stop();
        other_events.stop();
        change_display("scores");
    }
    else if (arg == "other-events"){
        logos.stop();
        scores.stop();
        other_events.start();
        change_display(arg);
    }
    else{
        logos.stop();
        scores.stop();
        other_events.stop();
        change_display(arg);
    }
});

ipcRenderer.on("start-timer", function(event, args){
    // console.log("Start timer event received");
    timer.toggle();
});

ipcRenderer.on("reset-timer", function(event, args){
    // console.log("Reset timer event received");
    timer.reset();
});

ipcRenderer.on("set-logos", function(event, arg){
    logos.set_logos(arg);
    scores.set_logos(arg);
    // console.log(arg);
});

ipcRenderer.on("set-chroma-key-mode", function(event, arg){
    chroma_key_mode = arg;
    if (selected_display == "none"){
        change_display(chroma_key_mode ? "none" : "logos");
    }
    timer.set_chroma_key(chroma_key_mode);
});

ipcRenderer.on("set-this-tournament-id", function(event, arg){
    scores.set_event_id(arg);
});

ipcRenderer.on("set-this-comp-mode", function(event, arg){
    scores.set_comp_mode(arg);
});

ipcRenderer.on("set-other-tournament-ids", function(event, arg){
    let id_list = arg.replace(/\s/g, '').split(',');
    other_events.set_event_ids(id_list);
    // console.log(id_list);    
});

ipcRenderer.on("set-other-comp-mode", function(event, arg){
    other_events.set_comp_mode(arg);
    // console.log("Other comp mode: " + arg);
});