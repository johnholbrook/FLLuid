const REFRESH_INTERVAL_MIN = 5; //how often to refresh the table (in minutes)
const REFRESH_INTERVAL_MS = REFRESH_INTERVAL_MIN * 60 * 1000; //in milliseconds

var needle = require('needle');

module.exports = {
    getScores : getScores
};

//Make a request to the specified URL and pass the
//result (assuming no error) on to the handler function
function make_request(url, handler_function, next_step){
    let headers = {
        cookies : {
            // 'ASP.NET_SessionId' : 'bud0aktqhice34das2onk3uu'
            //any string seems to work for the session ID:
            'ASP.NET_SessionId' : "fll-audience-display in development"
        }
    }

    console.log(encodeURI(url));
    needle.post(encodeURI(url), '', headers, function(error, response, body){
        if (error === null){
            //if request returned without error, call the 
            //handler function with the result body
            handler_function(body, next_step);
        }
        else{
            //TODO: error handling!
            console.log("Error!")
        }
    });
}

//takes the raw HTML returned from the server and turns it into
//a list of JSON objects representing the results for each team, then passes it
//on to assembleTable
function url_response_handler(body, next_step){
    // const htmlDoc = new JSDOM(body).window.document;
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(body, "text/html");

    let results_table_body = htmlDoc.body.querySelector("table").querySelector("table").querySelector("tbody");

    //assemble the list of table headers
    let table_header_objects = results_table_body.querySelector("tr").querySelectorAll("th");
    let table_headers = [];
    for (let i=0; i<table_header_objects.length; i++){
        table_headers.push(table_header_objects[i].querySelector("font").innerHTML);
    }
    // console.log(table_headers);

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

    //pass the JSON table on to assembleTable, which will assemble a DOM <table> object
    assembleTable(json_table, next_step);
}

//Takes a JSON table produced by url_response_handler and assembles a DOM <table> object,
//then passes it on to next_step
function assembleTable(json_table, next_step){
    let parser = new DOMParser();
    let doc = parser.parseFromString("", "text/html");

    let table = doc.createElement("table");
    table.className = "scores-table";

    //First add the header row to the table
    let header_row = doc.createElement("tr");
    header_row.className = "table-header";
    // let col_headers = json_table[0].keys();
    let col_headers = Object.keys(json_table[0]);
    for (let i=0; i<col_headers.length; i++){
        let tmp = doc.createElement("th");
        tmp.innerHTML = "<div>" + col_headers[i] + "</div>";
        header_row.append(tmp);
    }
    table.append(header_row);

    //Now add each team's row to the table
    for (let i=0; i<json_table.length; i++){
        let this_row = doc.createElement("tr");
        this_row.className = i%2==0 ? "table-row-even" : "table-row-odd";
        for (let j=0; j<col_headers.length; j++){
            let tmp = doc.createElement("td");
            tmp.className = cell_class_name(col_headers[j]);
            tmp.innerHTML = "<div>" + json_table[i][col_headers[j]] + "</div>";
            this_row.append(tmp);
        }
        table.append(this_row);
    }

    next_step(table);
}

//returns a class name for a cell in a particular column of the table
function cell_class_name(header){
    if (header == "Rank"){
        return "rank";
    }
    else if (header == "Team #"){
        return "team-number";
    }
    else if (header == "Team Name"){
        return "team-name";
    }
    else if (header == "Best Score"){
        return "best-score";
    }
    else{
        return "score";
    }
}

//makes a request for the specified data, assembles it into a DOM <table>
//element, and passes it on to the specified callback
//@param event_id - the FLLTournament.com ID of the event
//@param is_comp - true to get competition round scores, false to get practice round scores
//@param next_step - callback to send DOM <table> to
function getScores(event_id, is_comp, next_step){
    let url = "https://flltournament.com/Scoreboard.aspx?TID=" + event_id;
    url += "&Display=" + (is_comp ? 0 : 1);
    make_request(url, url_response_handler, next_step);
}