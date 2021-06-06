const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

socket.on("select-display", name => {
    selectDisplay(name);
    console.log(name);
});

document.addEventListener("DOMContentLoaded", () => {
    selectDisplay("logos");
});

function selectDisplay(disp_name){
    if (disp_name == "none"){
        selectDisplay("logos");
    }
    else{
        document.querySelector("#display-frame").src = `/${disp_name}`;
    }
}