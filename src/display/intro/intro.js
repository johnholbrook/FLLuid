const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", newState => {
    let old_state = display_state;
    display_state = JSON.parse(newState);

    if ((old_state.match_blocks != display_state.match_blocks) ||
        (old_state.current_block != display_state.current_block)){
        // rebuild the table

        let table = document.createElement("table");
        table.classList.add("table", "table-striped", "table-borderless", "intro-table");
        if (dark) table.classList.add("table-dark");
        let tmp = `<thead><tr><th>Time</th><th>Team #</th><th>Team Name</th><th>Table</th><th>Type</th><th>Round</th></tr></thead><tbody>`

        let time = display_state.match_blocks[display_state.current_block].time
        display_state.match_blocks[display_state.current_block].matches.forEach(match => {
            tmp += `<tr><td>${time}</td><td>${match.team}</td><td>${match.name}</td><td>${match.table}</td><td>${match.type}</td><td>${match.round}</td></tr>`
        });
        tmp += "</tbody>";

        table.innerHTML = tmp;
        document.querySelector("#intro-display-area").innerHTML = table.outerHTML;
    }

    if (old_state.message != display_state.message){
        document.querySelector("#message-area").innerHTML = display_state.message;
    }

    if (old_state.show_message_on_tables != display_state.show_message_on_tables){
        document.querySelector("#message-wrapper").style.display = display_state.show_message_on_tables ? "block" : "none";
    }
});

var dark = false;
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(location.search);
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