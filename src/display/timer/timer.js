const socket = io();
socket.on('connect', () => {
    console.log("Connected!")
});

var display_state = {timer_options: {}};
var brick_font = false;
var current_val = "";

socket.on("set-state", newState => {
    let old_state = display_state;
    display_state = JSON.parse(newState);

    if (old_state.timer_options.font != display_state.timer_options.font){
        if (display_state.timer_options.font == "bricks"){
            brick_font = true;
            setTimerValue(current_val);
            document.querySelector("#timer-text-wrapper").classList.add("brick");
        }
        else{
            brick_font = false;
            setTimerValue(current_val);
            document.querySelector('#timer-text').style.fontFamily = display_state.timer_options.font;
            document.querySelector("#timer-text-wrapper").classList.remove("brick");
        }
    }
});

socket.on("timer-value", val => {
    current_val = val;
    setTimerValue(val);

    if (val == "0:30" && display_state.timer_options.warning_sound){
        thirty_sec_sound.play();
    }
    else if (val == "0:00" && display_state.timer_options.end_sound){
        end_sound.play();
    }
});

socket.on("play-start-sound", () => {
    if (display_state.timer_options.start_sound){
        start_sound.play();
    }
})

//pre-load sounds
var start_sound = new Audio('/sounds/charge.mp3');
var thirty_sec_sound = new Audio('/sounds/laser.mp3');
var end_sound = new Audio('/sounds/buzzer.mp3');

function textToImage(text){
    if (text.charAt(1) != ":" || text.length != 4){
        console.error("Format: x:yz");
    }
    else{
        let left = text.charAt(0);
        let mid = text.charAt(2);
		let right = text.charAt(3);
        
		return `<svg class="brick-font" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1600 1200">
        <image x="0px" y="0px" width="650px" height="1200px" href="/fonts/brick_digits/${left}-left.png"></image>
        <image x="649px" y="0px" width="470px" height="1200px" href="/fonts/brick_digits/${mid}-mid.png"></image>
        <image x="1118px" y="0px" width="480px" height="1200px" href="/fonts/brick_digits/${right}-right.png"></image>
	</svg>`
    }
}

function setTimerValue(val){
    document.querySelector('#timer-text').innerHTML = brick_font ? textToImage(val) : val;
}