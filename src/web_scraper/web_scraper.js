var needle = require('needle');

module.exports = {
    getScores : getScores,
    getEventName : getEventName,
    getTeamNames : getTeamNames
};

//Make a request to the specified URL and pass the
//result (assuming no error) on to the handler function
function make_request(url, handler_function, next_step){
    let headers = {
        cookies : {
            //any string seems to work for the session ID:
            'ASP.NET_SessionId' : "FLLuid - https://github.com/johnholbrook/flluid"
        }
    }

    needle.post(encodeURI(url), '', headers, function(error, response, body){
        if (error === null){
            //if request returned without error, call the 
            //handler function with the result body
            handler_function(body, next_step);
        }
        else{
            console.error(`Error making request to ${url}: ${error}`);
        }
    });
}

//takes the raw HTML returned from the server and turns it into
//a list of JSON objects representing the results for each team, then passes it
//on to assembleTable
function url_response_handler(body, next_step){
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(body, "text/html");

    let results_table_body = htmlDoc.body.querySelector("table").querySelector("table").querySelector("tbody");

    //assemble the list of table headers
    let table_header_objects = results_table_body.querySelector("tr").querySelectorAll("th");
    let table_headers = [];
    for (let i=0; i<table_header_objects.length; i++){
        table_headers.push(table_header_objects[i].querySelector("font").innerHTML);
    }

    //generate the list of JSON objects representing the results for each team
    let json_table = [];
    let num_table_rows = results_table_body.querySelectorAll("tr").length;
    let table_body = results_table_body.querySelectorAll("tr");
    for (let i=1; i<table_body.length; i++){
        let this_row = {};
        for (let j=0; j<table_headers.length; j++){
            this_row[table_headers[j]] = table_body[i].querySelectorAll("td")[j].querySelector("font").textContent;
        }
        json_table.push(this_row);
    }

    //pass the JSON table on to the next step
    next_step(json_table);
}

//makes a request for the specified data and passes it on to the specified callback
//@param event_id - the FLLTournament.com ID of the event
//@param is_comp - true to get competition round scores, false to get practice round scores
//@param next_step - callback to send DOM <table> to
function getScores(event_id, is_comp, next_step){
    // let url = "https://flltournament.com/Scoreboard.aspx?TID=" + event_id;
    // url += "&Display=" + (is_comp ? 0 : 1);
    let url = `https://flltournament.com/Scoreboard.aspx?TID=${event_id}&Display=${is_comp ? 0 : 1}`;
    make_request(url, url_response_handler, next_step);
}

//takes the raw html returned from the server and returns the name of the event in question
function name_extractor(body, next_step){
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(body, "text/html");

    console.log("Event name: " + htmlDoc.querySelector("caption").innerText.trim());

    next_step(htmlDoc.querySelector("caption").innerText.trim());
}

//get the name of a particular event ID and pass it on to next_step
function getEventName(event_id, next_step){
    let url = "https://flltournament.com/Scoreboard.aspx?TID=" + event_id;

    make_request(url, name_extractor, next_step);
}

//takes the raw html returned from the server and returns an array of all the team names
function team_name_extractor(body, next_step){
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(body, "text/html");

    let results_table_body = htmlDoc.body.querySelector("table").querySelector("table").querySelector("tbody");

    let table_rows = results_table_body.querySelectorAll("tr");
    let result = {};
    for (let i=1; i<table_rows.length; i++){
        let cols = table_rows[i].querySelectorAll("td");
        result[cols[1].innerText] = cols[2].innerText;
    }

    next_step(result);
}

//get all the team names for a particular event ID and pass them on to next_step
function getTeamNames(event_id, next_step){
    let url = "https://flltournament.com/Scoreboard.aspx?TID=" + event_id;

    make_request(url, team_name_extractor, next_step);
}