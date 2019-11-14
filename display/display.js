const { ipcRenderer } = require('electron');
var timer = require('./timer.js');
var logos = require('./logos.js');
var scores = require('./scores.js');

var none_display, logo_display, timer_display, scores_display;

var chroma_key_mode = false;
var selected_display = "";


document.addEventListener('DOMContentLoaded', () => {
    none_display = document.querySelector("#none-display");
    logo_display = document.querySelector("#logo-display");
    timer_display = document.querySelector("#timer-display");
    scores_display = document.querySelector("#scores-display");
});

//change to a particular display
//@param display - display to show
function change_display(display){
    if (display == "none"){
        none_display.style.display = "";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
    }
    else if (display == "logos"){
        none_display.style.display = "none";
        logo_display.style.display = "";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
    }
    else if (display == "timer"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "";
        scores_display.style.display = "none";
    }
    else if (display == "scores"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "";
    }
}

ipcRenderer.on("new-display-selected", function(event, arg){
    // console.log(arg);
    //run the logo slideshow only when that display is selected
    selected_display = arg;
    if (arg == "logos" || (arg == "none" && !chroma_key_mode)){
        change_display("logos");
        logos.start();
        scores.stop();
    }
    else if (arg == "scores"){
        scores.start();
        logos.stop();
        change_display("scores");
    }
    else{
        logos.stop();
        scores.stop();
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
});

ipcRenderer.on("set-chroma-key-mode", function(event, arg){
    chroma_key_mode = arg;
    if (selected_display == "none"){
        change_display(chroma_key_mode ? "none" : "logos");
    }
    timer.set_chroma_key(chroma_key_mode);
});