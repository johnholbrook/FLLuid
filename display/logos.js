const test_dir = "/users/john/Documents/logo_test";
const fs = require("fs");

var running = false;

var images = [];
// var images = ["/Users/john/Documents/logo_test/wvde.png", "/Users/john/Documents/logo_test/fll.png", "/Users/john/Documents/logo_test/aladdin.png", "/Users/john/Documents/logo_test/city-shaper.png", "/Users/john/Documents/logo_test/fsu.png", "/Users/john/Documents/logo_test/wvsgc.png", "/Users/john/Documents/logo_test/ivv.png", "/Users/john/Documents/logo_test/wvhtf.png"];
var current_image = 0;

function next_image(){
    current_image += 1;
    if (current_image >= images.length){
        current_image = 0;
    }
    document.querySelector("#logo").src = images[current_image];
}

// document.addEventListener('DOMContentLoaded', () => {

// });

function start(){
    if (images.length != 0 && !running){
        console.log("Starting interval");
        running = true;
        next_image();
        setInterval(next_image, 5000);
    }
}

function stop(){
    clearInterval(next_image);
    running = false;
}

function set_logos(new_logos){
    // console.log("Setting logos");
    // console.log(new_logos);
    images = new_logos;
    start();
}

module.exports = {
    start : start,
    stop : stop,
    set_logos : set_logos
};