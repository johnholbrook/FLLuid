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