const { remote, ipcRenderer } = require('electron');

var displayWindow = remote.getGlobal('displayWindow');

//gets the selected value of a set of radio buttons
//@param buttons - a list of buttons, e.g.returned by document.getElementsByName('current-display')
function getRadioValue(buttons){
    for (let i=0; i<buttons.length; i++){
        if (buttons[i].checked){
            return buttons[i].value;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showLogos();

    displayWindow.webContents.send("reset-timer");
    
    let display_radio_buttons = document.getElementsByName('current-display');
    for (let i=0; i<display_radio_buttons.length; i++){
        display_radio_buttons[i].onchange = function(){
            displayWindow.webContents.send("new-display-selected", getRadioValue(display_radio_buttons));
        };
    }

    document.querySelector("#timer-start-pause").onclick = function(){
        displayWindow.webContents.send("start-timer");
        showTimer();
    };

    document.querySelector("#timer-reset").onclick = function(){
        displayWindow.webContents.send("reset-timer");
    };

    document.querySelector("#start-sound").onchange = function(){
        displayWindow.webContents.send("set-start-sound", document.querySelector("#start-sound").checked);
    };

    document.getElementById("30-second-warning").onchange = function(){
        displayWindow.webContents.send("set-30sec-warning", document.getElementById("30-second-warning").checked);
    };

    document.querySelector("#end-sound").onchange = function(){
        displayWindow.webContents.send("set-end-sound", document.querySelector("#end-sound").checked);
    };

    document.querySelector("#select-font").onchange = function(){
        let new_choice = document.querySelector("#select-font").value;
        if (new_choice == "default"){
            displayWindow.webContents.send("set-timer-font", "");
        }
        else{
            displayWindow.webContents.send("set-timer-font", new_choice);
        }
    };

    document.querySelector("#logo-dir-picker").onchange = function(){
        // console.log(document.querySelector("#logo-dir-picker").files);
        let files = document.querySelector("#logo-dir-picker").files;
        let list_of_files = [];
        for (let i=0; i<files.length; i++){
            if (isImage(files[i].name)){
                list_of_files.push(files[i].path);
            }
        }
        list_of_files.sort();
        console.log(list_of_files);
        displayWindow.send("set-logos", list_of_files);
    };

    document.querySelector("#chroma-key").onchange = function(){
        displayWindow.webContents.send("set-chroma-key-mode", document.querySelector("#chroma-key").checked);
    };

    document.querySelector("#save-tournament-id").onclick = function(){
        let new_id = document.querySelector("#tournament-id").value;
        displayWindow.webContents.send("set-tournament-id", new_id);
    };

    document.querySelector("#select-match-type").onchange = function(){
        let selection = document.querySelector("#select-match-type").value;
        let get_comp_results = selection == "competition" ? true : false;
        displayWindow.webContents.send("set-comp-mode", get_comp_results);
    };
});

ipcRenderer.on("set-start-button-text", function(event, arg){
    document.querySelector("#timer-start-pause").innerHTML = arg;
});

ipcRenderer.on("set-timer-text", function(event, arg){
    document.querySelector("#timer-display").innerHTML = arg;
});

function showNone(){
    displayWindow.webContents.send("new-display-selected", "none");
    document.querySelector("#none-radio-button").checked = true;
}

function showLogos(){
    displayWindow.webContents.send("new-display-selected", "logos");
    document.querySelector("#logos-radio-button").checked = true;
}

function showScores(){
    displayWindow.webContents.send("new-display-selected", "scores");
    document.querySelector("#scores-radio-button").checked = true;
}

function showTimer(){
    displayWindow.webContents.send("new-display-selected", "timer");
    document.querySelector("#timer-radio-button").checked = true;
}

//returns true if a file name corresponds to a known image type
function isImage(name){
    let extension = name.split(".").slice(-1)[0];
    let image_extensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    return image_extensions.indexOf(extension) > -1
}