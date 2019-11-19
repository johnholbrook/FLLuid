var web_scraper = require("./scores_web_scraper.js");

module.exports = {
    set_event_ids : set_event_ids,
    set_comp_mode : set_comp_mode,
    show_next_table : show_next_table,
    start : start,
    stop : stop,
    results_tables : results_tables
};

//list of other event ids to show
var event_ids = [];
//true for comp matches, false for practice matches
var comp_mode = true;

//tables for all the events
var results_tables = [];
var current_table = 0;

function set_event_ids(new_ids){
    event_ids = new_ids;
    console.log(event_ids);
    update_tables();
}

function set_comp_mode(new_mode){
    comp_mode = new_mode;
    console.log(new_mode);
    update_tables();
}

function update_tables(){
    // console.log("Updating other events scores...");
    // console.log(event_ids.length);

    event_ids = [];

    //create an array full of empty divs
    for (let i=0; i<event_ids.length; i++){
        results_tables.push(document.createElement("div"));
    }

    for (let i=0; i<event_ids.length; i++){
        results_tables[i].innerHTML = "";

        web_scraper.getScores(event_ids[i], comp_mode, function(table){
            table.className = "other-events-scores"
            results_tables[i].appendChild(table);
        });

        web_scraper.getEventName(event_ids[i], function(name){
            let title = document.createElement("h1");
            title.className = "other-event-name"
            title.innerHTML = name;
            results_tables[i].insertBefore(title, results_tables[i].firstChild);
        });
    }
    show_next_table();
}

function show_next_table(){
    current_table += 1;
    if (current_table >= results_tables.length){
        current_table = 0;
    }

    // console.log("new value of current_table: " + current_table);

    if (results_tables.length != 0){
        document.querySelector("#other-events-wrapper").innerHTML = "";
        document.querySelector("#other-events-wrapper").innerHTML = results_tables[current_table].outerHTML;
    }
}

var cycle_events_interval = null;
var update_scores_interval = null;
function start(){
    clearInterval(cycle_events_interval);
    clearInterval(update_scores_interval);

    update_tables();

    cycle_events_interval = setInterval(show_next_table, 15000);
    update_scores_interval = setInterval(update_tables, 2*60*1000);
}

function stop(){
    clearInterval(cycle_events_interval);
    clearInterval(update_scores_interval);
}