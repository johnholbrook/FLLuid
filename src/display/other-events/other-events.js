const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

const SLIDESHOW_INTERVAL = 15; //seconds
var updating = null;
var current_event = 0;

var display_state = {};

// compare two arrays by comparing their stringification
// because of course the == operator doesn't behave intuitively on JS arrays
function array_cmp(a,b){
    return JSON.stringify(a) === JSON.stringify(b);
}

socket.on("set-state", newState => {
    let old_state = display_state;
    display_state = JSON.parse(newState);

    if (!array_cmp(old_state.other_events, display_state.other_events)){
        if (display_state.other_events.length > 0){
            start();
        }
        else{
            stop();
        }
    }

    if (old_state.message != display_state.message){
        document.querySelector("#message-area").innerHTML = display_state.message;
    }

    if (old_state.show_message_on_tables != display_state.show_message_on_tables){
        document.querySelector("#message-wrapper").style.display = display_state.show_message_on_tables ? "block" : "none";
    }

    // if (old_state.dark_mode != display_state.dark_mode){
    //     if (display_state.dark_mode){
    //         document.querySelector("body").classList.add("dark", text-light);

    //         document.querySelectorAll(".other-eevnts-table").forEach(table => {
    //             table.classList.add("table-dark");
    //         });

    //         document.querySelector(".title-bg").classList.add("dark", "text-light");
    //         document.querySelector("#message-wrapper").classList.add("dark", "text-light");
    //     }
    //     else {
    //         document.querySelector("body").classList.remove("dark", text-light);

    //         document.querySelectorAll(".other-events-table").forEach(table => {
    //             table.classList.remove("table-dark");
    //         });

    //         document.querySelector(".title-bg").classList.remove("dark", "text-light");
    //         document.querySelector("#message-wrapper").classList.remove("dark", "text-light");
    //     }
    // }

});

function nextEvent(){
    // increment current_event, wrapping it if needed
    current_event += 1;
    if (current_event >= display_state.other_events.length){
        current_event = 0;
    }

    // set the event name
    this_event = display_state.other_events[current_event];
    document.querySelector("#event-name").innerHTML = this_event.event_name;

    // build the HTML table
    let table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-borderless", "other-events-table");
    if (dark) table.classList.add("table-dark");
    
    // get headers
    let rounds = Object.keys(this_event.scores[0]).filter(name => name.includes("Round")||name.includes("Practice"));
    let headers = ["Rank", "Team #", "Team Name", "Best"].concat(rounds);
    let tmp = `<thead><tr>`;
    headers.forEach(name => tmp += `<th>${name}</th>`);
    tmp += `</tr></thead><tbody>`;

    this_event.scores.forEach(row => {
        tmp += `<tr><td>${row["Rank"]}</td><td>${row["Team #"]}</td><td>${row["Team Name"]}</td><td>${row["Best Score"]}</td>`;
        rounds.forEach(rname => {
            tmp += `<td>${row[rname]}</td>`
        });
        tmp += "</tr>";
    });

    table.innerHTML = tmp;
    document.querySelector("#other-events-display-area").innerHTML = table.outerHTML;
}

function start(){
    console.log("Hello");
    clearInterval(updating);
    nextEvent();
    updating = setInterval(nextEvent, SLIDESHOW_INTERVAL*1000);
}

function stop(){
    clearInterval(updating);
}

var dark = false;
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(location.search);
    // var dark = false;
    if (urlParams.get("dark") >= 1){
        // dark mode
        dark = true;
        document.querySelector("body").classList.add("dark");
        document.querySelectorAll(".title-bg").forEach(el => {
            el.classList.add("dark", "text-light");
        });
        document.querySelector("#message-wrapper").classList.add("dark", "text-light");
    }
});
   