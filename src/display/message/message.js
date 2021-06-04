const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", newState => {
    display_state = JSON.parse(newState);
    document.querySelector("#message_content").innerHTML = display_state.message;
});
