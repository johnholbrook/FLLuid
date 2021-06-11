const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {};

socket.on("set-state", newState => {
    let old_state = display_state;
    display_state = JSON.parse(newState);

    if (old_state.scores != display_state.scores){
        let rounds = Object.keys(display_state.scores[0]).filter(name => name.includes("Round")||name.includes("Practice"));
        let data = [["Rank", "Team #", "Team Name", "Best"].concat(rounds)];
        display_state.scores.forEach(entry => {
            let tmp = [entry.Rank, entry["Team #"], entry["Team Name"], entry["Best Score"]];
            rounds.forEach(rname => {
                tmp.push(entry[rname]);
            })
            data.push(tmp);
        });
        // console.log(data);
        scores_table.setTable(data);
        scores_table.start();
    }

    if (old_state.images != display_state.images){
        scores_table.setImages(display_state.images);
    }

    if (old_state.message != display_state.message){
        document.querySelector("#message-area").innerHTML = display_state.message;
    }

    if (old_state.show_message_on_tables != display_state.show_message_on_tables){
        document.querySelector("#message-wrapper").style.display = display_state.show_message_on_tables ? "block" : "none";
    }

    if (old_state.scroll_speed != display_state.scroll_speed){
        scores_table.updateOptions({speed: display_state.scroll_speed});
    }

});

var scores_table;
window.addEventListener("DOMContentLoaded", () => {
    console.log("hello")
    scores_table = new Scrollable(
        document.querySelector("#scores-display-area"),
        {"extraClasses" : "table table-striped table-borderless"}
    );
});