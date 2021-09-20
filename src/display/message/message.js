const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", newState => {
    display_state = JSON.parse(newState);
    document.querySelector("#message_content").innerHTML = display_state.message;
});

window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("dark") >= 1){
        // dark mode
        document.querySelector("body").classList.add("dark", "text-light");
    }
});