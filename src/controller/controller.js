const { remote, ipcRenderer } = require('electron');
const schedule = require('./schedule.js');

// var displayWindow = remote.getGlobal('displayWindow');

//gets the selected value of a set of radio buttons
//@param buttons - a list of buttons, e.g.returned by document.getElementsByName('current-display')
function getRadioValue(buttons){
    for (let i=0; i<buttons.length; i++){
        if (buttons[i].checked){
            return buttons[i].value;
        }
    }
}

function set_timer_font(){
    let new_choice = document.querySelector("#select-font").value;
    if (new_choice == "default"){
        ipcRenderer.send("set-timer-font", "");
    }
    else{
        ipcRenderer.send("set-timer-font", new_choice);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showLogos();

    // setTimeout(() => {
    //     displayWindow.webContents.send("reset-timer");
    // }, 500);
    
    let display_radio_buttons = document.getElementsByName('current-display');
    for (let i=0; i<display_radio_buttons.length; i++){
        display_radio_buttons[i].onchange = function(){
            // displayWindow.webContents.send("new-display-selected", getRadioValue(display_radio_buttons));
            // ipcRenderer.send("new-display-selected", getRadioValue(display_radio_buttons));
            // ipcRenderer.send("broadcast-to-displays", "set-display", getRadioValue(display_radio_buttons));
            ipcRenderer.send("set-display", getRadioValue(display_radio_buttons));
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

    document.querySelector("#select-font").onchange = set_timer_font;

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
        ipcRenderer.send("set-logos", list_of_files);

        document.querySelector("#logo-ordering").innerHTML = "";
        list_of_files.forEach(file_path => {
            let tmp = document.createElement("div");
            tmp.setAttribute("path", file_path);
            // tmp.className = "logo-draggable-element";
            tmp.className = "card logo-draggable-element";
            let file_name = file_path.split(/[\/\\]/).pop(); //split on either-direction slash
            tmp.innerHTML = `<div class="card-body">
                                <img class="logo-preview" src="${file_path}">
                                <span style="margin:0.5em;"></span>
                                <b>${file_name}</b>
                             </div>
                            `;
            document.querySelector("#logo-ordering").appendChild(tmp);
        });

        let sortable_list = document.querySelector("#logo-ordering");
        var sortable = Sortable.create(sortable_list, {
            onSort: function(evt){
                let new_list = []
                for (let child of evt.to.children){
                    new_list.push(child.getAttribute("path"));
                }
                console.log(new_list);
                ipcRenderer.send("set-logos", new_list);
            }
        });
    };

    document.querySelector("#chroma-key").onchange = function(){
        displayWindow.webContents.send("set-chroma-key-mode", document.querySelector("#chroma-key").checked);
    };

    document.querySelector("#chroma-key-timer-teams").onchange = function(){
        displayWindow.webContents.send("set-chroma-key-timer-teams", document.querySelector("#chroma-key-timer-teams").checked);
    };

    document.querySelector("#save-this-tournament-id").onclick = function(){
        let new_id = document.querySelector("#this-tournament-id").value;
        // displayWindow.webContents.send("set-this-tournament-id", new_id);
        schedule.set_event_id(new_id);
    };

    document.querySelector("#select-this-match-type").onchange = function(){
        let selection = document.querySelector("#select-this-match-type").value;
        let get_comp_results = selection == "competition" ? true : false;
        displayWindow.webContents.send("set-this-comp-mode", get_comp_results);
    };

    document.querySelector("#save-other-tournament-ids").onclick = function(){
        let input = document.querySelector("#other-tournament-ids").value;
        displayWindow.webContents.send("set-other-tournament-ids", input);
    };

    document.querySelector("#select-other-match-type").onchange = function(){
        let selection = document.querySelector("#select-other-match-type").value;
        let get_comp_results = selection == "competition" ? true : false;
        displayWindow.webContents.send("set-other-comp-mode", get_comp_results);
    };

    document.querySelector("#refresh-this-event").onclick = function(){
        displayWindow.webContents.send("refresh-this-event");
    }

    document.querySelector("#refresh-other-events").onclick = function(){
        displayWindow.webContents.send("refresh-other-events");
    }

    document.querySelector("#spawn-extra-timer-window").onclick = function(){
        // console.log("spawn extra timer window button clicked");
        ipcRenderer.send("spawn-extra-timer-window");
        //terrible hack, I know
        setTimeout(set_timer_font, 500);
    };

    document.querySelector("#schedule-csv-picker").onchange = function(){
        let file_path = document.querySelector("#schedule-csv-picker").files[0].path;
        schedule.parseCSV(file_path);
    };

    document.querySelector("#prev-block").onclick = function(){
        schedule.previous_block();
    };

    document.querySelector("#next-block").onclick = function(){
        schedule.next_block();
    };

    document.querySelector("#auto-advance").onclick = function(){
        let auto_advance = document.querySelector("#auto-advance").checked;
        displayWindow.webContents.send("set-auto-advance", auto_advance);
        console.log("Sending auto advance");
    };

    document.querySelector("#submit-message-text").onclick = function(){
        let message_text = document.querySelector("#message-text-area").value;
        console.log(message_text);
        ipcRenderer.send("set-message-text", message_text);
    };

    document.querySelector("#msg-on-other-screens").onchange = function(){
        let status = document.querySelector("#msg-on-other-screens").checked;
        ipcRenderer.send("msg-on-other-screens", status);
    }

    $('#chroma-color-picker').colorpicker({
        autoInputFallback: false,
        format: 'hex',
        debug: true
    });

    $('#chroma-color-picker').on('colorpickerChange', function(event){
        // console.log(event.color.toString());
        displayWindow.webContents.send("set-chroma-key-color", event.color.toString())
    });

    document.querySelector("#table-scroll-speed").oninput = function(){
        let value = document.querySelector("#table-scroll-speed").value;
        document.querySelector("#table-scroll-speed-current-value").innerHTML = value;
        displayWindow.webContents.send("set-table-scroll-speed", value);
    };

    document.querySelector("#logo-time").oninput = function(){
        let value = document.querySelector("#logo-time").value;
        document.querySelector("#logo-time-current-value").innerHTML = value;
        displayWindow.webContents.send("set-logo-time", value);
    };
});

ipcRenderer.on("set-start-button-text", function(event, arg){
    document.querySelector("#timer-start-pause").innerHTML = arg;
});

ipcRenderer.on("set-timer-text", function(event, arg){
    document.querySelector("#timer-display").innerHTML = arg;
});

ipcRenderer.on("next-match-block", function(event, arg){
    schedule.next_block();
});

ipcRenderer.on("prev-match-block", function(event, arg){
    schedule.previous_block();
});

ipcRenderer.on("start-timer", function(event){
    displayWindow.webContents.send("start-timer");
    showTimer();
});

ipcRenderer.on("radio-select", function(event, arg){
    document.querySelector(arg).checked = true;
});

function showNone(){
    displayWindow.webContents.send("new-display-selected", "none");
    document.querySelector("#none-radio-button").checked = true;
}

function showLogos(){
    // displayWindow.webContents.send("new-display-selected", "logos");
    ipcRenderer.send("broadcast-to-displays", "set-display", "logos");
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

// function spawnExtraTimerWindow(){
//     ipcMain.send("spawn-extra-timer-window");
// }