const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", new_state => {
    let old_state = display_state;
    display_state = JSON.parse(new_state);

    if (old_state.chroma_color != display_state.chroma_color){
        document.querySelector("body").style.backgroundColor = display_state.chroma_color;
    }
});