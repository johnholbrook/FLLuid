const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var current_display = "";
socket.on("select-display", name => {
    if (current_display != name){
        current_display = name;
        selectDisplay(name);
        console.log(name);
    }
});

var display_state = {chroma_mode: false};

socket.on("set-state", new_state => {
    let old_state = display_state;

    display_state = JSON.parse(new_state);

    if ((old_state.chroma_mode !== display_state.chroma_mode) &&
        (current_display == "timer" || current_display == "none" || current_display == "slides")){
        console.log("reloading displays")
        selectDisplay(current_display);
    }
});

var frame_a;
var frame_b;
var dark = false;
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("dark") >= 1){
        dark = true;
    }

    frame_a = document.querySelector("#display-frame-a");
    frame_b = document.querySelector("#display-frame-b");

    selectDisplay("logos");
});

function getDisplayPath(name){
    if (name == "none"){
        return display_state.chroma_mode ? "/none" : getDisplayPath("logos");
    }
    else if (display_state.chroma_mode && (["timer", "slides"].includes(name))){
        return `/${name}-chroma${dark ? "?dark=1" : ""}`
    }
    else{
        return `/${name}${dark ? "?dark=1" : ""}`
    }
}

function selectDisplay(name){
    if (frame_a.style.display == ""){
        // frame a is currently active, switch to frame b
        frame_b.src = getDisplayPath(name);
        frame_b.onload = () => {
            frame_b.style.display = "";
            frame_a.style.display = "none";
        }
    }
    else {
        // frame b is currently active, switch to frame a
        frame_a.src = getDisplayPath(name);
        frame_a.onload = () => {
            frame_a.style.display = "";
            frame_b.style.display = "none";
        }
    }       
}