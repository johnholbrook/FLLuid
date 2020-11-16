const { remote, ipcRenderer } = require('electron');
var accurateInterval = require('accurate-interval');
var scraper = require('../web_scraper/web_scraper.js');

module.exports = {
	start: start,
	pause: pause,
	reset: reset,
	toggle: toggle,
	set_chroma_key: set_chroma_key,
	set_chroma_key_team_info: set_chroma_key_team_info,
	set_blocks: set_blocks,
	set_current_block: set_current_block,
	set_event_id: set_event_id
};

//chroma key color
var chroma_key_color = '#00ff00';

//chroma key mode
var chroma_key_mode = false;

//show team info on chroma key timer
var chroma_key_team_info = false;

//match schedule (necessary if showing current match info in chroma key mode)
var blocks = null;
var current_block = 0;

//event info
var event_id = null;
var team_names = null;

//timer globals
const RESET_VALUE = 150;
var count = RESET_VALUE;
var isRunning = false;
var counter = null;
var timer_display;
var play_start_sound = true;
var play_30sec_sound = true;
var play_end_sound = true;
var brick_font = false;

//pre-load sounds
var start_sound = new Audio('../sounds/charge.mp3');
var thirty_sec_sound = new Audio('../sounds/laser.mp3');
var end_sound = new Audio('../sounds/buzzer.mp3');

//global for sending messages back to controller
var controllerWindow = remote.getGlobal('controllerWindow');

function textToImage(text){
    if (text.charAt(1) != ":" || text.length != 4){
    // if (text.length != 3){
        console.error("Format: x:yz");
    }
    else{
        let left = text.charAt(0);
        let mid = text.charAt(2);
		let right = text.charAt(3);
        
		return `<svg class="brick-font" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1600 1200">
        <image x="0px" y="0px" width="650px" height="1200px" href="../fonts/brick_digits/${left}-left.png"></image>
        <image x="649px" y="0px" width="470px" height="1200px" href="../fonts/brick_digits/${mid}-mid.png"></image>
        <image x="1118px" y="0px" width="480px" height="1200px" href="../fonts/brick_digits/${right}-right.png"></image>
	</svg>`
    }
}

function setTimerValue(text){
	document.querySelector('.timer-text').innerHTML = brick_font ? textToImage(text) : text;
}

document.addEventListener('DOMContentLoaded', () => {
	// timer_display = document.querySelector('.timer-text');
	// reset();
	setTimerValue(secsToClock(count));
	// timer_display.innerHTML = secsToClock(count);
	ipcRenderer.send('set-timer-text', secsToClock(count));
});

var auto_advance = false;

//converts a number of seconds to a clock display
//@param time - a number of seconds
function secsToClock(time) {
	var secs = time % 60;
	if (secs < 10) {
		//force 2-digit display of seconds
		secs = '0' + secs;
	}
	var mins = Math.floor(time / 60);
	return mins + ':' + secs;
}

function timer() {
	count = count - 1;
	if (count <= 0) {
		console.log('timer ended');
		pause();
		clearInterval(counter);
		//counter ended, do something here
		// timer_display.innerHTML = secsToClock(0);
		setTimerValue(secsToClock(0));
		ipcRenderer.send('set-timer-text', secsToClock(0));
		if (play_end_sound) {
			end_sound.play();
		}
		//Wait 5 seconds, then reset
		setTimeout(reset, 5000);

		//auto-advance to next match block after 5 seconds if desired
		if (auto_advance) {
			setTimeout(function() {
				controllerWindow.webContents.send('next-match-block');
			}, 5000);
		}
		return;
	}
	//update the time on the display
	// timer_display.innerHTML = secsToClock(count);
	setTimerValue(secsToClock(count));
	ipcRenderer.send('set-timer-text', secsToClock(count));

	//play 30sec warning, if applicable
	if (count == 30 && play_30sec_sound) {
		thirty_sec_sound.play();
	}
}

function start() {
	console.log('Starting timer');
	//play the "start" sound effect, if applicable
	if (play_start_sound) {
		start_sound.play();
	}
	if (!isRunning) {
		isRunning = true;
		//   counter = setInterval(timer, 1000);
		counter = accurateInterval(timer, 1000);
		ipcRenderer.send('set-start-button-text', 'Pause');
	}
}

function pause() {
	console.log('Pausing timer');
	// clearInterval(counter);
	counter.clear();
	ipcRenderer.send('set-start-button-text', 'Start');
	isRunning = false;
}

function reset() {
	// location.reload();
	pause();
	console.log('Resetting timer');
	count = RESET_VALUE;
	// timer_display.innerHTML = secsToClock(count);
	setTimerValue(secsToClock(count));
	ipcRenderer.send('set-timer-text', secsToClock(count));
}

function toggle() {
	if (isRunning) {
		pause();
	} else {
		start();
	}
}

function set_chroma_key(chroma_key) {
    chroma_key_mode = chroma_key;
	if (chroma_key) {
		document.querySelector('#timer-display').style.backgroundColor = chroma_key_color;
		document.querySelector('#timer-text-wrapper').className = `timer-text-wrapper-chroma ${brick_font ? "brick" : ""}`;
		if (chroma_key_team_info){
			//show the timer team info strip
			document.querySelector(".timer-team-info-wrapper").style.display = "";
		}
		else{
			//hide the timer team info strip
			document.querySelector(".timer-team-info-wrapper").style.display = "none";
		}
	} else {
		document.querySelector('#timer-text-wrapper').className = `timer-text-wrapper ${brick_font ? "brick" : ""}`;
		document.querySelector('#timer-display').style.backgroundColor = '';
		//hide the timer team info strip
		document.querySelector(".timer-team-info-wrapper").style.display = "none";
	}
}

function set_chroma_key_team_info(new_val){
	chroma_key_team_info = new_val;
	if (chroma_key_team_info && chroma_key_mode){
		//show the timer team info strip
		document.querySelector(".timer-team-info-wrapper").style.display = "";
	}
	else{
		//hide the timer team info strip
		document.querySelector(".timer-team-info-wrapper").style.display = "none";
	}
}

function set_blocks(new_blocks){
	blocks = new_blocks;
	fill_team_info_strip();
}

function set_current_block(new_current_block){
	current_block = new_current_block;
	console.log(blocks[current_block]);
	fill_team_info_strip();
}

function fill_team_info_strip(){
	// let curr = blocks[current_block];
	// document.querySelector("#timer-team-info").innerHTML = "";
	let tmp = "";
	blocks[current_block].matches.forEach((match, i) => {
		// tmp += `<span class="team-match-info">${match.table}: <b>${match.team}</b></span>`;
		tmp += `<span class="team-match-info">${match.table}: <b>${team_names[match.team]}</b></span>`;
		if (i < blocks[current_block].matches.length-1){
			tmp += `<span class="hsep"></span>`;
		}
	});
	document.querySelector("#timer-team-info").innerHTML = tmp;
}

function set_event_id(new_id){
	event_id = new_id;
	scraper.getTeamNames(event_id, names => {
		team_names = names;
	})
}

ipcRenderer.on('set-chroma-key-color', function(event, arg) {
    chroma_key_color = arg;
    if (chroma_key_mode){
        document.querySelector('#timer-display').style.backgroundColor = chroma_key_color;
    }
    document.querySelector("#none-display").style.backgroundColor = arg;
});

ipcRenderer.on('set-start-sound', function(event, arg) {
	play_start_sound = arg;
});

ipcRenderer.on('set-30sec-warning', function(event, arg) {
	play_30sec_sound = arg;
});

ipcRenderer.on('set-end-sound', function(event, arg) {
	play_end_sound = arg;
});

ipcRenderer.on('set-timer-font', function(event, arg) {
	if (arg == "bricks"){
		brick_font = true;
		setTimerValue(secsToClock(count));
		document.querySelector("#timer-text-wrapper").classList.add("brick");
	}
	else{
		brick_font = false;
		setTimerValue(secsToClock(count));
		document.querySelector('.timer-text').style.fontFamily = arg;
		document.querySelector("#timer-text-wrapper").classList.remove("brick");
	}
});

ipcRenderer.on('set-auto-advance', function(event, arg) {
	// console.log("Setting auto advance to " + arg);
	auto_advance = arg;
});

document.addEventListener('DOMContentLoaded', () => {
	// reset();
});
