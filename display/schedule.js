console.log('Hello from schedule.js!');

module.exports = {
	set_blocks: set_blocks,
	set_current_block: set_current_block,
	set_logos: set_logos,
	start: start,
	stop: stop,
	update_table_header: update_table_header
};

var blocks = null;
function set_blocks(new_blocks) {
	blocks = new_blocks;
	console.log(blocks);
	update_table();
}

var current_block = 0;
function set_current_block(new_value) {
	current_block = new_value;
	console.log(current_block);
	update_table();
}

var schedule_table = null;
function update_table() {
	let table = document.createElement('table');
	table.className = 'scores-table';
	let head = document.createElement('tr');
	head.innerHTML = '<th>Start Time</th><th>Team #</th><th>Team Name</th><th>Table</th><th>Type</th><th>Round</th>';
	table.append(head);

	let curr_row_number = 0;

	for (let i = current_block; i < blocks.length; i++) {
		let matches = blocks[i].matches;
		for (let j = 0; j < matches.length; j++) {
			let tmp = document.createElement('tr');
			tmp.className = curr_row_number % 2 == 0 ? 'table-row-even' : 'table-row-odd';
			tmp.innerHTML += `<td><div>${blocks[i].time}</div></td><td><div>${matches[j]
				.team}</div></td><td><div>${matches[j].name}</div></td><td><div>${matches[j]
				.table}</div></td><td><div>${matches[j].type}</div></td><td><div>${matches[j].round}</div></td>`;
			tmp.querySelectorAll('div')[2].className = 'team-name';
			table.append(tmp);

			curr_row_number++;
		}
	}

	schedule_table = table;
	// show_table();
}

//scroll constants and calculations
const TABLE_SCROLL_SPEED_PPS = 70; //px per second
const TABLE_SCROLL_SPEED_PPMS = TABLE_SCROLL_SPEED_PPS / 1000; //pixels per millisecond
// console.log(TABLE_SCROLL_SPEED_PPMS + " pixels per ms");
const TABLE_SCROLL_FPS = 45; //updates per second
const UPDATE_INTERVAL = 1000 / TABLE_SCROLL_FPS; //frequency between scroll updates (ms)
const PX_PER_UPDATE = TABLE_SCROLL_SPEED_PPS / TABLE_SCROLL_FPS; //amount (in px) to scroll with each update

//the current scrolling position
var current_scroll = 1;

var logo_files = [];
var current_logo = 0;
function set_logos(new_logos) {
	// console.log("setting logos in schedule.js");
	// console.log(new_logos);
	logo_files = new_logos;
}

function get_next_logo() {
	current_logo += 1;
	if (current_logo >= logo_files.length) {
		if (logo_files.length == 0) {
			return '../blank.png';
		}
		current_logo = 0;
	}
	// console.log(logo_files[current_logo])
	return logo_files[current_logo];
}

var last_time = null;
var now = null;
var time_elapsed = null;
var amt_to_scroll = null;

function advance_scroll() {
	// console.log("Advancing scroll...");
	//scroll by the appropriate amount:
	// current_scroll += PX_PER_UPDATE;

	now = Date.now();
	time_elapsed = now - last_time;
	amt_to_scroll = time_elapsed * TABLE_SCROLL_SPEED_PPMS;
	// console.log(time_elapsed + " ms elapsed, scrolling by " + amt_to_scroll + " px.");
	current_scroll += amt_to_scroll;
	last_time = now;

	document.querySelector('#schedule-scrollable').style.top = -current_scroll + 'px';

	//has the top element gone off the screen?
	//if so, remove it
	if (
		current_scroll >=
		document.querySelector('#schedule-scrollable').firstElementChild
			.offsetHeight /* - document.querySelector("#scores-title").offsetHeight*/
	) {
		// current_scroll = -1 * document.documentElement.clientHeight;
		// console.log("top element has gone off screen, removing it");
		let scrollable = document.querySelector('#schedule-scrollable');
		scrollable.removeChild(scrollable.firstElementChild);
		current_scroll = 0;
		document.querySelector('#schedule-scrollable').style.top = -current_scroll + 'px';

		update_table_header();
	}

	//is there new space at the bottom of the screen?
	//if so, insert a new element there (table or image, as appropriate)
	if (-1 * current_scroll + document.querySelector('#schedule-scrollable').offsetHeight < window.innerHeight) {
		// console.log("space has opened up at the bottom of the screen, inserting new element...");
		if (document.querySelector('#schedule-scrollable').lastElementChild.tagName == 'IMG') {
			// let new_element = current_scores_table;
			// document.querySelector("#scores-scrollable").appendChild(new_element);
			document.querySelector('#schedule-scrollable').appendChild(schedule_table.cloneNode(true));
		} else {
			let new_element = document.createElement('img');
			new_element.src = get_next_logo();
			document.querySelector('#schedule-scrollable').appendChild(new_element);
		}
	}
}

function update_table_header() {
	if (document.querySelector('#schedule-scrollable > .scores-table')) {
		//create the table header element
		let header = document.createElement('table');
		header.className = 'scores-table';

		//build the initial list of headers
		// let col_th = current_scores_table.querySelectorAll("th");

		let col_th = document.querySelector('#schedule-scrollable > .scores-table').querySelectorAll('th');
		let header_row = document.createElement('tr');
		header_row.className = 'table-header';
		for (let i = 0; i < col_th.length; i++) {
			let tmp = document.createElement('th');
			tmp.innerHTML = col_th[i].innerHTML;
			header_row.append(tmp);
		}
		header.append(header_row);

		//set the width of each column in the table header to match the
		//corresponding column in the scores table itself
		let header_cols = header.querySelectorAll('th');
		for (let i = 0; i < header_cols.length; i++) {
			// header_cols[i].offsetWidth = col_th[i].offsetWidth + col_th[i].marginLeft + col_th[i].marginRight;
			// console.log(`width of col ${i} is ${col_th[i].offsetWidth}.`);
			header_cols[i].style.width = col_th[i].offsetWidth + 'px';
		}

		// console.log(header);
		document.querySelector('#schedule-table-header').innerHTML = header.outerHTML;
	}

	//set the top position of the table header to be just below the screen title and message (if any)
	let title_height = document.querySelector('#schedule-title').offsetHeight;
	let msg_height = document.querySelector('#schedule-message-area').offsetHeight;
	document.querySelector('#schedule-table-header').style.top = String(title_height + msg_height) + 'px';
}

var screen_scrolling;
function start() {
	last_time = Date.now();
	clearInterval(screen_scrolling);
	screen_scrolling = setInterval(advance_scroll, UPDATE_INTERVAL);
}
function stop() {
	clearInterval(screen_scrolling);
}

// function show_table(){
//     document.querySelector("#schedule-scrollable").innerHTML = schedule_table.outerHTML;
// }
