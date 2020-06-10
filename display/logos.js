const test_dir = "/users/john/Documents/logo_test";
const fs = require("fs");

var running = false;

var DELAY_TIME = 5;//seconds each image is displayed

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

var interval;
function start(){
    clearInterval(interval);
    if (images.length != 0){
        // next_image
        interval = setInterval(next_image, DELAY_TIME*1000);
    }
}
function stop(){
    clearInterval(interval);
}

function set_logos(new_logos){
    images = new_logos;
    next_image();
    start();
}

function set_delay_time(new_time){
    DELAY_TIME = new_time;
    start();
}

module.exports = {
    start : start,
    stop : stop,
    set_logos : set_logos,
    set_delay_time: set_delay_time
};