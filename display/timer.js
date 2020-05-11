const { remote, ipcRenderer } = require('electron');
var accurateInterval = require('accurate-interval');

module.exports = {
	start: start,
	pause: pause,
	reset: reset,
	toggle: toggle,
	set_chroma_key: set_chroma_key
};

//chroma key color
var chroma_key_color = '#00ff00';

//chroma key mode
var chroma_key_mode = false;

//timer globals
const RESET_VALUE = 150;
var count = RESET_VALUE;
var isRunning = false;
var counter = null;
var timer_display;
var play_start_sound = true;
var play_30sec_sound = true;
var play_end_sound = true;

//pre-load sounds
var start_sound = new Audio('../sounds/charge.mp3');
var thirty_sec_sound = new Audio('../sounds/laser.mp3');
var end_sound = new Audio('../sounds/buzzer.mp3');

//global for sending messages back to controller
var controllerWindow = remote.getGlobal('controllerWindow');

document.addEventListener('DOMContentLoaded', () => {
	timer_display = document.querySelector('.timer-numbers');
	// reset();
	timer_display.innerHTML = secsToClock(count);
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
		timer_display.innerHTML = secsToClock(0);
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
	timer_display.innerHTML = secsToClock(count);
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
	timer_display.innerHTML = secsToClock(count);
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
		// document.querySelector("#timer-display").className = "display-type timer-display-chroma";
		document.querySelector('#timer-display').style.backgroundColor = chroma_key_color;
		document.querySelector('#timer-numbers-wrapper').className = 'timer-numbers-wrapper-chroma';
	} else {
		// document.querySelector("#timer-display").className = "display-type timer-display";
		document.querySelector('#timer-numbers-wrapper').className = 'timer-numbers-wrapper';
		document.querySelector('#timer-display').style.backgroundColor = '';
	}
}

ipcRenderer.on('set-chroma-key-color', function(event, arg) {
    chroma_key_color = arg;
    if (chroma_key_mode){
        document.querySelector('#timer-display').style.backgroundColor = chroma_key_color;
    }
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
	document.querySelector('.timer-numbers').style.fontFamily = arg;
});

ipcRenderer.on('set-auto-advance', function(event, arg) {
	// console.log("Setting auto advance to " + arg);
	auto_advance = arg;
});

document.addEventListener('DOMContentLoaded', () => {
	// reset();
});
