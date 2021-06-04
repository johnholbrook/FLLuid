document.addEventListener("DOMContentLoaded", () => {
    hideAll();
    document.querySelector("#logos-frame").style.display = "";
});

function hideAll(){
    document.querySelectorAll(".display-frame").forEach(frame => {
        frame.style.display = "none";
    });
}

function selectDisplay(disp_name){
    hideAll();
    if (disp_name == "none" || disp_name == "logos"){
        document.querySelector("#logos-frame").style.display = "";
    }
    else if (disp_name == "timer"){
        document.querySelector("#timer-frame").style.display = "";
    }
    else if (disp_name == "scores"){
        document.querySelector("#scores-frame").style.display = "";
    }
    else if (disp_name == "other-events"){
        document.querySelector("#other-events-frame").style.display = "";
    }
    else if (disp_name == "schedule"){
        document.querySelector("#schedule-frame").style.display = "";
    }
    else if (disp_name == "intro"){
        document.querySelector("#intro-frame").style.display = "";
    }
    else if (disp_name == "message"){
        document.querySelector("#message-frame").style.display = "";
    }
}

const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

socket.on("select-display", name => {
    selectDisplay(name);
    console.log(name);
});