

module.exports = {
    set_current_block : set_current_block,
    set_blocks : set_blocks,
    update_table_position : update_table_position
}

var blocks = []
var current_block = 0;

function set_current_block(new_block){
    current_block = new_block;
    update_table();
    // console.log(`New block is ${current_block}`);
}

function set_blocks(new_blocks){
    blocks = new_blocks;
    update_table;
    // console.log(blocks);
}

function update_table(){
    let tmp = document.createElement("table");
    // tmp.className = "match-intro-table";
    tmp.className = "scores-table";
    let head = document.createElement("tr");
    head.innerHTML = "<th>Start Time</th><th>Team #</th><th>Team Name</th><th>Table</th><th>Type</th><th>Round</th>";
    tmp.append(head);

    let matches = blocks[current_block].matches;
    for (let i=0; i<matches.length; i++){
        let subtmp = document.createElement("tr");
        subtmp.className = i%2==0 ? "table-row-even" : "table-row-odd";
        subtmp.innerHTML += `<td><div>${blocks[current_block].time}</div></td><td><div>${matches[i].team}</div></td><td><div>${matches[i].name}</div></td><td><div>${matches[i].table}</div></td><td><div>${matches[i].type}</div></td><td><div>${matches[i].round}</div></td>`;
        subtmp.querySelectorAll("div")[2].className = "team-name";
        tmp.append(subtmp);
    }
    document.querySelector("#next-match").innerHTML = tmp.outerHTML;
}

function update_table_position(){
    let title_height = document.querySelector('#intro-title').offsetHeight;
	let msg_height = document.querySelector('#intro-message-area').offsetHeight;
	document.querySelector('#next-match').style.top = String(title_height + msg_height) + 'px';
}