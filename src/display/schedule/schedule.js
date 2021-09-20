const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

function array_cmp(a1, a2){
    return JSON.stringify(a1) === JSON.stringify(a2);
}

socket.on("set-state", newState => {
    let old_state = display_state;
    display_state = JSON.parse(newState);

    // if ((old_state.match_blocks != display_state.match_blocks) ||
        // (old_state.current_block != display_state.current_block)){
    if (!array_cmp(old_state.match_blocks, display_state.match_blocks) ||
        (old_state.current_block != display_state.current_block)){
        // console.log(display_state.match_blocks);
        let tmp = [["Time", "Team #", "Team Name", "Table", "Type", "Round"]];
        display_state.match_blocks.forEach((block, idx) => {
            if (idx >= display_state.current_block){
                block.matches.forEach(match => {
                    tmp.push([block.time, match.team, match.name, match.table, match.type, match.round]);
                });
            }
        });
        console.log(tmp);
        schedule_table.setTable(tmp);
        schedule_table.start();
    }

    if (old_state.images != display_state.images){
        schedule_table.setImages(display_state.images);
    }

    if (old_state.message != display_state.message){
        document.querySelector("#message-area").innerHTML = display_state.message;
    }

    if (old_state.show_message_on_tables != display_state.show_message_on_tables){
        document.querySelector("#message-wrapper").style.display = display_state.show_message_on_tables ? "block" : "none";
    }

    if (old_state.scroll_speed != display_state.scroll_speed){
        schedule_table.updateOptions({speed: display_state.scroll_speed});
        console.log("speed");
    }
});

var schedule_table;
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(location.search);
    let dark = false;
    if (urlParams.get("dark") >= 1){
        // dark mode
        dark = true;
        document.querySelector("body").classList.add("dark");
        document.querySelector(".title-bg").classList.add("dark", "text-light");
        document.querySelector("#message-wrapper").classList.add("dark", "text-light");
    }

    schedule_table = new Scrollable(
        document.querySelector("#schedule-display-area"),
        {"extraClasses" : `table table-striped table-borderless ${dark ? "table-dark" : ""}`}
    );

});