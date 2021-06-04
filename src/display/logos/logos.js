const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", newState => {
    display_state = JSON.parse(newState);
    if (!interval){
        start();
    }
});

var DELAY_TIME = 5;//seconds each image is displayed
var current_image = 0;

function next_image(){
    current_image += 1;
    if (current_image >= display_state.images.length){
        current_image = 0;
    }
    document.querySelector("#logo_area").src = display_state.images[current_image];
}

var interval;
function start(){
    clearInterval(interval);
    current_image -= 1;
    next_image();
    if (display_state.images.length != 0){
        interval = setInterval(next_image, DELAY_TIME*1000);
    }
}

function stop(){
    clearInterval(interval);
}