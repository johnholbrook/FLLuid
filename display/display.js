const { ipcRenderer } = require('electron');
var timer = require('./timer.js');
var logos = require('./logos.js');
var scores = require('./scores.js');
var other_events = require('./other_events.js');
var intro = require('./match-intro.js');
var schedule = require('./schedule.js');
var message = require('./message.js');

var none_display, logo_display, timer_display, scores_display, other_events_display, intro_display, schedule_display;

var chroma_key_mode = false;
var selected_display = "";


document.addEventListener('DOMContentLoaded', () => {
    none_display = document.querySelector("#none-display");
    logo_display = document.querySelector("#logo-display");
    timer_display = document.querySelector("#timer-display");
    scores_display = document.querySelector("#scores-display");
    other_events_display = document.querySelector("#other-events-display");
    intro_display = document.querySelector("#intro-display");
    schedule_display = document.querySelector("#schedule-display");
    message_display = document.querySelector("#message-display");
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
        intro_display.style.display = "none";
        schedule_display.style.display = "none";
        message_display.style.display = "none";
    }
    else if (display == "logos"){
        none_display.style.display = "none";
        logo_display.style.display = "";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
        intro_display.style.display = "none";
        schedule_display.style.display = "none";
        message_display.style.display = "none";
    }
    else if (display == "timer"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
        intro_display.style.display = "none";
        schedule_display.style.display = "none";
        message_display.style.display = "none";
    }
    else if (display == "scores"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "";
        other_events_display.style.display = "none";
        intro_display.style.display = "none";
        schedule_display.style.display = "none";
        message_display.style.display = "none";

        scores.update_table_header();
    }
    else if (display == "other-events"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "";
        intro_display.style.display = "none";
        schedule_display.style.display = "none";
        message_display.style.display = "none";

        other_events.update_table_position();
    }
    else if (display == "schedule"){
        // console.log("showing schedule");
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
        intro_display.style.display = "none";
        schedule_display.style.display = "";
        message_display.style.display = "none";

        schedule.update_table_header();
    }
    else if (display == "intro"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
        intro_display.style.display = "";
        schedule_display.style.display = "none";
        message_display.style.display = "none";

        intro.update_table_position();
    }
    else if (display == "message"){
        none_display.style.display = "none";
        logo_display.style.display = "none";
        timer_display.style.display = "none";
        scores_display.style.display = "none";
        other_events_display.style.display = "none";
        intro_display.style.display = "none";
        schedule_display.style.display = "none";
        message_display.style.display = "";
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
        schedule.stop();
    }
    else if (arg == "scores"){
        scores.start();
        logos.stop();
        other_events.stop();
        schedule.stop();
        change_display("scores");
    }
    else if (arg == "other-events"){
        logos.stop();
        scores.stop();
        other_events.start();
        schedule.stop();
        change_display(arg);
    }
    else if (arg == "schedule"){
        logos.stop();
        scores.stop();
        other_events.stop();
        schedule.start();
        change_display(arg);
    }
    else{
        logos.stop();
        scores.stop();
        other_events.stop();
        schedule.stop();
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
    schedule.set_logos(arg);
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

ipcRenderer.on("refresh-this-event", function(event){
    // console.log("refreshing this event...");
    scores.update_scores();
});

ipcRenderer.on("refresh-other-events", function(event){
    // console.log("refreshing other events...");
    other_events.update_tables();
});

ipcRenderer.on("set-blocks", function(event, arg){
    // console.log("new block");
    // console.log(arg);
    intro.set_blocks(arg);
    schedule.set_blocks(arg);
});

ipcRenderer.on("set-current-block", function(event, arg){
    intro.set_current_block(arg);
    schedule.set_current_block(arg);
});

ipcRenderer.on("set-message-text", function(event, arg){
    console.log("Message text: " + arg);
    message.set_message_text(arg);
});

ipcRenderer.on("msg-on-other-screens", function(event, arg){
    message.show_on_other_screens(arg);
})