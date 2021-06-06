const csv = require('fast-csv');
const scraper = require('../web_scraper/web_scraper.js');
const { remote, ipcRenderer } = require('electron');

// var displayWindow = remote.getGlobal('displayWindow');


// console.log("Hello from schedule.js");

module.exports = {
    parseCSV : parseCSV,
    next_block : next_block,
    previous_block : previous_block,
    set_event_id : set_event_id
}

//a global list of all the scheduled match blocks
//a 'scheduled match block' is a group of 1 or more
//matches scheduled to occur at the same time
let blocks = [];
// example formatting for blocks:
{
// [
//     {
//         time : "9:00 AM",
//         matches : [
//             {
//                 type : "Practice",
//                 round : 1,
//                 table : "Table A 1",
//                 team : "31855"
//             },
//             {
//                 type : "Practice",
//                 round : 1,
//                 table : "Table A 2",
//                 team : "39538"
//             },
//             etc...
//         ]
//     },
//     {
//         time : "9:10 AM",
//         matches : [
//             {
//                 type : "Practice",
//                 round : 1,
//                 table : "Table A 1",
//                 team : "31890"
//             },
//             {
//                 type : "Practice",
//                 round : 1,
//                 table : "Table A 2",
//                 team : "46955"
//             },
//             etc...
//         ]
//     },
//     etc...
// ]
}

//the currently-selected mach block (i.e., the current or next block)
let current_block = 0;

function set_current_block(new_value){
    if (new_value < blocks.length && new_value >= 0){
        current_block = new_value;
        document.querySelector("#current-match-block").innerHTML = blocks[new_value].time;
        ipcRenderer.send("current-match-block", blocks[new_value].time) // for the touch bar?
        ipcRenderer.send("set-current-block", current_block) // for the displays
        console.log(current_block);
    }
}

function next_block(){
    set_current_block(current_block+1);
    // displayWindow.webContents.send("set-current-block", current_block);
}

function previous_block(){
    set_current_block(current_block-1);
    // displayWindow.webContents.send("set-current-block", current_block);
}

let event_id = null;

function set_event_id(new_id){
    event_id = new_id;
}


//insert the specified match into the block at the
//specified time, creating the block if it doesn't already exist
function addMatch(match, time){
    let found = false;
    for (let i=0; i<blocks.length; i++){
        if (blocks[i].time == time){
            found = true;
            blocks[i].matches.push(match);
        }
    }
    if (!found){
        //create a new block
        blocks.push({
            "time" : time,
            "matches" : [match]
        });
    }
}

//parse a CSV file at the specified file path and
//populate the blocks list with all its matches
function parseCSV(filePath){
    let indexes = {};
    
    //clear out any existing blocks
    blocks = [];

    csv.parseFile(filePath).on('data', row => {
        if (row[0] == "Date"){
            // this is the title row
            indexes.time = row.indexOf("Begin Time");
            indexes.type = row.indexOf("Type");
            indexes.round = row.indexOf("Round");
            indexes.team = row.indexOf("Team #");
            indexes.table = row.indexOf("Room");
            // console.log(indexes);
        }
        else{
            // this is not the title row
            // is this schedule item a practice or competition match?
            if (["Practice", "Table"].includes(row[indexes.type])){
                //yes! add it to the appropriate block
                let tmp = {};
                tmp.type = row[indexes.type];
                tmp.round = row[indexes.round];
                tmp.table = row[indexes.table];
                tmp.team = row[indexes.team];
                addMatch(tmp, row[indexes.time]);
            }
        }
    });

    setTimeout(function(){
        set_current_block(0);
    }, 250);

    setTimeout(function(){
        if (event_id){
            scraper.getTeamNames(event_id, function(names){
                for (let i=0; i<blocks.length; i++){
                    for(let j=0; j<blocks[i].matches.length; j++){
                        blocks[i].matches[j].name = names[blocks[i].matches[j].team];
                    }
                }
            });
        }
    }, 250);

    setTimeout(function(){
        ipcRenderer.send("set-blocks", blocks);
        console.log(blocks);
    }, 1000);
}