const { ipcRenderer, TouchBarOtherItemsProxy, TouchBarSegmentedControl } = require('electron');
const schedule = require('./schedule.js');
const scraper = require('../web_scraper/web_scraper.js');
var ip = require("ip");

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

const EVENT_UPDATE_INTERVAL = 3; //mins

var this_event_id = "";
var get_comp_results = true;
var updating_this_event = null;

var other_event_ids = [];
var get_other_comp_results = true;
var updating_other_events = null;

document.addEventListener('DOMContentLoaded', () => {

    showLogos();
    
    // activate tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    let display_radio_buttons = document.getElementsByName('current-display');
    for (let i=0; i<display_radio_buttons.length; i++){
        display_radio_buttons[i].onchange = function(){
            ipcRenderer.send("set-display", getRadioValue(display_radio_buttons));
        };
    }

    document.querySelector("#timer-start-pause").onclick = function(){
        ipcRenderer.send("start-timer");
        showTimer();
    };

    document.querySelector("#timer-reset").onclick = function(){
        ipcRenderer.send("reset-timer");
    };

    document.querySelector("#start-sound").onchange = function(){
        ipcRenderer.send("set-start-sound", document.querySelector("#start-sound").checked);
    };

    document.getElementById("30-second-warning").onchange = function(){
        ipcRenderer.send("set-30sec-warning", document.getElementById("30-second-warning").checked);
    };

    document.querySelector("#end-sound").onchange = function(){
        ipcRenderer.send("set-end-sound", document.querySelector("#end-sound").checked);
    };

    document.querySelector("#select-font").onchange = set_timer_font;

    document.querySelector("#logo-dir-picker").onchange = function(){
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
        let sortable = Sortable.create(sortable_list, {
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
        ipcRenderer.send("set-chroma-key-mode", document.querySelector("#chroma-key").checked);
    };

    document.querySelector("#chroma-key-timer-teams").onchange = function(){
        ipcRenderer.send("set-chroma-key-timer-teams", document.querySelector("#chroma-key-timer-teams").checked);
    };

    function update_this_event_scores(){
        scraper.getScores(this_event_id, get_comp_results, scores => {
            ipcRenderer.send("update-scores", scores);
        });
    }

    document.querySelector("#save-this-tournament-id").onclick = function(){
        let new_id = document.querySelector("#this-tournament-id").value;
        schedule.set_event_id(new_id);
        this_event_id = new_id;
        clearInterval(updating_this_event);
        update_this_event_scores();
        updating_this_event = setInterval(update_this_event_scores, EVENT_UPDATE_INTERVAL*60*1000);

        // set the event name in the controller window
        scraper.getEventName(new_id, name => {
            document.querySelector("#optionsAccordionHeading > button").innerHTML = 
            `<b>Configuration & Options</b>&nbsp; ${name}`;
        });
    };

    document.querySelector("#select-this-match-type").onchange = function(){
        let selection = document.querySelector("#select-this-match-type").value;
        get_comp_results = selection == "competition" ? true : false;
        clearInterval(updating_this_event);
        update_this_event_scores();
        updating_this_event = setInterval(update_this_event_scores, EVENT_UPDATE_INTERVAL*60*1000);
    };

    function update_other_event_scores(){
        ipcRenderer.send("other-event-ids", other_event_ids);
        other_event_ids.forEach(id => {
            scraper.getEventName(id, ename => {
                scraper.getScores(id, get_other_comp_results, escores => {
                    ipcRenderer.send("other-event-scores", {event_name:ename, event_id:id, scores:escores});
                });
            });
        });
    }

    document.querySelector("#save-other-tournament-ids").onclick = function(){
        let input = document.querySelector("#other-tournament-ids").value;
        other_event_ids = input.split(",").map(x => x.trim());
        clearInterval(updating_other_events);
        update_other_event_scores();
        updating_other_events = setInterval(update_other_event_scores, EVENT_UPDATE_INTERVAL*60*1000);
    };

    document.querySelector("#select-other-match-type").onchange = function(){
        let selection = document.querySelector("#select-other-match-type").value;
        get_other_comp_results = selection == "competition" ? true : false;
        clearInterval(updating_other_events);
        update_other_event_scores();
        updating_other_events = setInterval(update_other_event_scores, EVENT_UPDATE_INTERVAL*60*1000);
    };

    document.querySelector("#refresh-this-event").onclick = function(){
        update_this_event_scores();
    }

    document.querySelector("#refresh-other-events").onclick = function(){
        update_other_event_scores();
    }

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
        ipcRenderer.send("set-auto-advance", auto_advance);
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

    document.querySelector("#chroma-color-picker").onchange = function(){
        ipcRenderer.send("set-chroma-color", document.querySelector("#chroma-color-picker").value);
    }

    document.querySelector("#table-scroll-speed").oninput = function(){
        let value = document.querySelector("#table-scroll-speed").value;
        document.querySelector("#table-scroll-speed-current-value").innerHTML = value;
        ipcRenderer.send("set-table-scroll-speed", value);
    };

    document.querySelector("#logo-time").oninput = function(){
        let value = document.querySelector("#logo-time").value;
        document.querySelector("#logo-time-current-value").innerHTML = value;
        ipcRenderer.send("set-logo-time", value);
    };

    document.querySelector("#dark-mode").onclick = update_disp_urls;
    document.querySelector("#disp-select").onchange = update_disp_urls;
    document.querySelector("#local-ip-addr").innerHTML = `http://${ip.address()}:355`;

    document.querySelector("#copy-localhost").onclick = function(){
        navigator.clipboard.writeText(document.querySelector("#localhost-addr").innerHTML);
    }

    document.querySelector("#copy-ip").onclick = function(){
        navigator.clipboard.writeText(document.querySelector("#local-ip-addr").innerHTML);
    }

    document.querySelector("#launch-disp-window").onclick = function(){
        let dark = document.querySelector("#dark-mode").checked;
        ipcRenderer.send("launch-disp-window", dark);
    }

    document.querySelector("#slide-type-speaker").onclick = () => {
        document.querySelector("#new-slide-content").setAttribute("slide-type", "speaker");
        document.querySelector("#new-slide-content").innerHTML = `<div class="input-group mb-3 w-100"><span class="input-group-text">Name:</span><input type="text" class="form-control" id="speaker-name"></div><div class="input-group mb-3 w-100"><span class="input-group-text">Title:</span><input type="text" class="form-control" id="speaker-title"></div><div class="input-group w-100"><span class="input-group-text">Company:</span><input type="text" class="form-control" id="speaker-company"></div>`;
    };

    document.querySelector("#slide-type-award-intro").onclick = () => {
        document.querySelector("#new-slide-content").setAttribute("slide-type", "award-intro");
        document.querySelector("#new-slide-content").innerHTML = `<div class="input-group mb-3 w-100"><span class="input-group-text">Award Name:</span><input type="text" class="form-control" id="award-name"></div><div class="input-group w-100"><span class="input-group-text">Description:</span><textarea rows="3" id="award-desc" class="form-control"></textarea></div>`;
    };

    document.querySelector("#slide-type-award-winner").onclick = () => {
        document.querySelector("#new-slide-content").setAttribute("slide-type", "award-winner");
        document.querySelector("#new-slide-content").innerHTML = `<div class="input-group w-100 mb-3"><span class="input-group-text">Award Name:</span><input type="text" class="form-control" id="award-name"></div><div class="input-group w-100 mb-3"><span class="input-group-text">Team #:</span><input type="text" class="form-control" id="award-team-num"></div><div class="input-group w-100 mb-3"><span class="input-group-text">Team Name:</span><input type="text" class="form-control" id="award-team-name"></div><div class="input-group w-100"><span class="input-group-text">Location:</span><input type="text" class="form-control" id="award-team-loc"></div>`;
    };

    document.querySelector("#slide-type-text").onclick = () => {
        document.querySelector("#new-slide-content").setAttribute("slide-type", "text");
        document.querySelector("#new-slide-content").innerHTML = `<div class="input-group"><span class="input-group-text" id="slide-text-label" data-bs-toggle="tooltip" data-bs-placement="bottom" title="HTML supported">Text:</span><textarea id="slide-text" class="form-control"></textarea></div>`;
        $('#slide-text-label').tooltip();
    };

    document.querySelector("#slide-type-image").onclick = () => {
        document.querySelector("#new-slide-content").setAttribute("slide-type", "image");
        document.querySelector("#new-slide-content").innerHTML = `<input type="file" class="form-control" id="slide-img-picker" accept=".jpg, .jpeg, .gif, .png, .bmp"><div id="slide-img-preview" class="slide-img-preview"></div>`;
        document.querySelector("#slide-img-picker").onchange = () => {
            document.querySelector("#slide-img-preview").innerHTML = `<img src="${document.querySelector("#slide-img-picker").files[0].path}">`
        };
    };

    document.querySelector("#add-slide").onclick = () => {
        let slide_type = document.querySelector("#new-slide-content").getAttribute("slide-type");
        let slide_json;
        let slide_html;
        switch(slide_type){
            case "speaker":
                slide_json = {
                    slide_type: "speaker",
                    name: document.querySelector("#speaker-name").value,
                    title: document.querySelector("#speaker-title").value,
                    company: document.querySelector("#speaker-company").value
                };
            break;
            case "award-intro":
                slide_json = {
                    slide_type: "award-intro",
                    award_name: document.querySelector("#award-name").value,
                    desc: document.querySelector("#award-desc").value
                };
            break;
            case "award-winner":
                slide_json = {
                    slide_type: "award-winner",
                    award_name: document.querySelector("#award-name").value,
                    team_num: document.querySelector("#award-team-num").value,
                    team_name: document.querySelector("#award-team-name").value,
                    team_loc: document.querySelector("#award-team-loc").value,
                }
            break;
            case "text":
                slide_json = {
                    slide_type: "text",
                    slide_text: document.querySelector("#slide-text").value,
                };
            break;
            case "image":
                let img_path = document.querySelector("#slide-img-picker").files[0].path;
                let img_url = `/img/slides/${randID()}.${img_path.split(".").pop()}`
                slide_json = {
                    slide_type: "image",
                    image_url: img_url,
                    image_local_path: img_path
                };
            break;
        }
        let tmp = document.createElement("div");
        let tmp_id = randID();
        tmp.classList.add("card", "mb-3");
        tmp.id = tmp_id;
        tmp.setAttribute("json", JSON.stringify(slide_json));
        tmp.innerHTML = slide_preview_html(slide_json);
        tmp.querySelector("div.card-header").innerHTML += `<span class="del-slide" onclick="deleteSlide('${tmp_id}')">❌</span>`

        document.querySelector("#slide-order-area").appendChild(tmp);
        update_slide_order();

        let sortable_slides = Sortable.create(document.querySelector("#slide-order-area"), {
            onSort: update_slide_order
        })
    };

    document.querySelector("#prev-slide").onclick = () => {
        ipcRenderer.send("prev-slide");
    };

    document.querySelector("#next-slide").onclick = () => {
        ipcRenderer.send("next-slide");
    };

    document.querySelector("#custom-timer-val-box").onclick = () => {
        let checked = document.querySelector("#custom-timer-val-box").checked;
        if (checked){
            let value = document.querySelector("#custom-timer-val").value;
            ipcRenderer.send("set-timer-length", value);
        }
        else{
            ipcRenderer.send("set-timer-length", 150);
        }
    };

    document.querySelector("#custom-timer-val").onchange = () => {
        let checked = document.querySelector("#custom-timer-val-box").checked;
        if (checked){
            let value = document.querySelector("#custom-timer-val").value;
            ipcRenderer.send("set-timer-length", value);
        }
    };
});

function update_disp_urls(){
    let value = document.querySelector("#disp-select").value;
    let dark = document.querySelector("#dark-mode").checked;
    document.querySelector("#localhost-addr").innerHTML = `http://localhost:355${value == 'display' ? '' : `/${value}`}${dark ? '?dark=1':''}`;
    document.querySelector("#local-ip-addr").innerHTML = `http://${ip.address()}:355${value == 'display' ? '' : `/${value}`}${dark ? '?dark=1':''}`;
};

function slide_preview_html(slide_json){
    switch(slide_json.slide_type){
        case "speaker":
            return `<div class="card-header">Speaker</div><div class="card-body"><b>Name: </b>${slide_json.name}<br><b>Title: </b>${slide_json.title}<br><b>Company: </b>${slide_json.company}</div>`;
        break;
        case "award-intro":
            return `<div class="card-header">Award Intro</div><div class="card-body"><b>Award: </b>${slide_json.award_name}<br><b>Description: </b>${slide_json.desc}</div>`;
        break;
        case "award-winner":
            return `<div class="card-header">Award Winner</div><div class="card-body"><b>Award: </b>${slide_json.award_name}<br><b>Team #: </b>${slide_json.team_num}<br><b>Team Name: </b>${slide_json.team_name}<br><b>Location: </b>${slide_json.team_loc}</div>`;
        break;
        case "text":
            return `<div class="card-header">Text</div><div class="card-body">${slide_json.slide_text}</div>`;
        break;
        case "image":
            return `<div class="card-header">Image</div><div class="card-body slide-img-preview"><img src="${slide_json.image_local_path}"></div>`;
        break;
    }
}

ipcRenderer.on("curr-slide", function(event, arg){
    document.querySelector("#curr-slide").innerHTML = slide_preview_html(arg);
});

function randID(){
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

function deleteSlide(id){
    let elem = document.querySelector(`#${id}`);
    elem.parentElement.removeChild(elem);
    update_slide_order();
}

function update_slide_order(){
    let area = document.querySelector("#slide-order-area");
    let new_list = [];
    for (let child of area.children){
        new_list.push(JSON.parse(child.getAttribute("json")));
    }
    ipcRenderer.send("set-slides", new_list);
}

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
    ipcRenderer.send("start-timer");
    showTimer();
});

ipcRenderer.on("radio-select", function(event, arg){
    document.querySelector(arg).checked = true;
});

function showNone(){
    ipcRenderer.send("set-display", "none");
    document.querySelector("#none-radio-button").checked = true;
}

function showLogos(){
    ipcRenderer.send("set-display", "logos");
    document.querySelector("#logos-radio-button").checked = true;
}

function showScores(){
    ipcRenderer.send("set-display", "scores");
    document.querySelector("#scores-radio-button").checked = true;
}

function showTimer(){
    ipcRenderer.send("set-display", "timer");
    document.querySelector("#timer-radio-button").checked = true;
}

//returns true if a file name corresponds to a known image type
function isImage(name){
    let extension = name.split(".").slice(-1)[0];
    let image_extensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    return image_extensions.indexOf(extension) > -1
}


var blocks = []
ipcRenderer.on("set-blocks", function(event, arg){
    blocks = arg;
})

ipcRenderer.on("set-current-block", function(event, arg){
    let matches = blocks[arg].matches;
    let tmp = "Teams: ";
    matches.forEach((m, i) => {
        tmp += `${m.team}${i<matches.length-1 ? ", " : ""}`;
    });
    document.querySelector("#block-teams").innerText = tmp;
});

//pre-load sounds
const start_sound = new Audio('../display/sounds/charge.mp3');
const warning_sound = new Audio('../display/sounds/laser.mp3');
const end_sound = new Audio('../display/sounds/buzzer.mp3');

ipcRenderer.on("play-start-sound", event => {
    if (document.querySelector("#play-sound-from-controller").checked){
        start_sound.play();
    }
});

ipcRenderer.on("play-warning-sound", event => {
    if (document.querySelector("#play-sound-from-controller").checked){
        warning_sound.play();
    }
});

ipcRenderer.on("play-end-sound", event => {
    if (document.querySelector("#play-sound-from-controller").checked){
        end_sound.play();
    }
});