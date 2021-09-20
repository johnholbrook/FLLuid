const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", newState => {
    let old_state = display_state
    display_state = JSON.parse(newState);

    if (old_state.images != display_state.images){
        let tmp = "";
        display_state.images.forEach(img => tmp += generate_item(img));
        document.querySelector("#logoCarousel > .carousel-inner").innerHTML = tmp;
        // apply the 'active' class to the first image to start the slideshow
        document.querySelector("#logoCarousel > .carousel-inner > .carousel-item").classList.add("active");
    }

    if (old_state.image_time != display_state.image_time){
        document.querySelectorAll("#logoCarousel > .carousel-inner > .carousel-item").forEach(item => {
            item.setAttribute("data-bs-interval", display_state.image_time*1000);
        });
    }
});

function generate_item(path){
    return `<div class="carousel-item" data-bs-interval="${display_state.image_time*1000}"><img src="${path}" class="logo"></div>`;
}

document.addEventListener("DOMContentLoaded", () => {
    // need to apply different CSS if we're running in safari, because the crossfade CSS doesn't work in that browser
    if (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1){
        // assume we're running in safari if the user agent string contains "Safari" but doesn't
        // contain "Chrome" – we can't just check for "Safari" because Chrome's user agent
        // has "Safari" somewhere in there :facepalm:
        document.querySelector("#logoCarousel .carousel-inner").classList.add("carousel-inner-safari");
    }
    else {
        document.querySelector("#logoCarousel .carousel-inner").classList.add("carousel-inner-default");
    }

    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("dark") >= 1){
        // dark mode
        document.querySelector("body").classList.add("dark");
    }

});