const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var current_display = "";
socket.on("select-display", name => {
    current_display = name;
    selectDisplay(name);
    console.log(name);
});

var display_state = {chroma_mode: false};

socket.on("set-state", new_state => {
    let old_state = display_state;

    display_state = JSON.parse(new_state);

    // console.log(old_state.chroma_mode, display_state.chroma_mode);
    if ((old_state.chroma_mode !== display_state.chroma_mode) &&
        (current_display == "timer" || current_display == "none" || current_display == "slides")){
        console.log("reloading displays")
        selectDisplay(current_display);
    }
});

var dark = false;
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("dark") >= 1){
        dark = true;
    }
    selectDisplay("logos");
});

function selectDisplay(disp_name){
    if (disp_name == "none"){
        if (display_state.chroma_mode){
            document.querySelector("#display-frame").src = "/none";
        }
        else{
            selectDisplay("logos");
        }
    }
    else if (disp_name == "timer" && display_state.chroma_mode){
        document.querySelector("#display-frame").src = `/timer-chroma${dark ? "?dark=1" : ""}`;
    }
    else if (disp_name == "slides" && display_state.chroma_mode){
        document.querySelector("#display-frame").src=`/slides-chroma${dark ? "?dark=1" : ""}`;
    }
    else{
        document.querySelector("#display-frame").src = `/${disp_name}${dark ? "?dark=1" : ""}`;
    }
}