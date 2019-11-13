const { ipcRenderer } = require('electron');
let scores_web_scraper = require('./scores_web_scraper.js');

module.exports = {
    set_logos : set_logos
};

//scroll constants and calculations
const TABLE_SCROLL_SPEED = 70; //px per second
const TABLE_SCROLL_FPS = 60; //updates per second
const UPDATE_INTERVAL = 1000/TABLE_SCROLL_FPS; //frequency between scroll updates (ms)
const PX_PER_UPDATE = TABLE_SCROLL_SPEED/TABLE_SCROLL_FPS; //amount (in px) to scroll with each update

//the current scrolling position
var current_scroll = 1;

// var logo_files = ["../blank.png"];
var logo_files = ["/Users/john/Documents/logo_test/wvde.png", "/Users/john/Documents/logo_test/fll.png", "/Users/john/Documents/logo_test/aladdin.png", "/Users/john/Documents/logo_test/city-shaper.png", "/Users/john/Documents/logo_test/fsu.png", "/Users/john/Documents/logo_test/wvsgc.png", "/Users/john/Documents/logo_test/ivv.png", "/Users/john/Documents/logo_test/wvhtf.png"]
var current_logo = 0;
function set_logos(new_logos){
    // console.log("setting logos in scores.js");
    // console.log(new_logos);
    logo_files = new_logos;
}

var scores_table = document.create

function get_next_logo(){
    current_logo += 1;
    if (current_logo >= logo_files.length){
        if (logo_files.length == 0){
            return "../blank.png";
        }
        current_logo = 0;
    }
    // console.log(logo_files[current_logo])
    return logo_files[current_logo];
}

function advance_scroll(){
    //scroll by the appropriate amount:
    current_scroll += PX_PER_UPDATE;
    document.querySelector(".scrollable").style.top = (-current_scroll + "px");

    //has the top element gone off the screen?
    //if so, remove it
    if (current_scroll >= document.querySelector(".scrollable").firstElementChild.offsetHeight){
        // current_scroll = -1 * document.documentElement.clientHeight;
        // console.log("top element has gone off screen, removing it");
        let scrollable = document.querySelector(".scrollable");
        scrollable.removeChild(scrollable.firstElementChild);
        current_scroll = 0;
        document.querySelector(".scrollable").style.top = (-current_scroll + "px");
    }

    //is there new space at the bottom of the screen?
    //if so, insert a new element there (table or image, as appropriate)
    if ((-1*current_scroll) + document.querySelector(".scrollable").offsetHeight < window.innerHeight){
        // console.log("space has opened up at the bottom of the screen, inserting new element...");
        let new_element = document.createElement("img");
        new_element.src = get_next_logo();
        // new_element.src="../blank.png"
        document.querySelector(".scrollable").appendChild(new_element);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setInterval(advance_scroll, UPDATE_INTERVAL);
    console.log(scores_web_scraper.generate_table());
});