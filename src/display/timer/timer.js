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

    // this stuff should only happen on the chroma timer
    if (window.location.pathname == "/timer-chroma"){
        // hide or show the teams in the current match as needed
        if (old_state.timer_options.chroma_teams != display_state.timer_options.chroma_teams){
            document.querySelector("#timer-team-info-wrapper").style.display = 
                display_state.timer_options.chroma_teams ? "" : "none";
        }

        // show the correct teams for the current match
        if ((old_state.match_blocks != display_state.match_blocks || 
            old_state.current_block != display_state.current_block) &&
            (display_state.match_blocks.length != 0)){
                let tmp = "";
                display_state.match_blocks[display_state.current_block].matches.forEach(match => {
                    tmp += `<span class="team-match-info">${match.table}: <b>${match.name}</b></span><span class="hsep"></span>`;
                });
                document.querySelector("#timer-team-info").innerHTML = tmp;
            }

        if (old_state.chroma_color != display_state.chroma_color){
            document.querySelector("body").style.backgroundColor = display_state.chroma_color;
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
        return "";
    }
    else{
        let left = text.charAt(0);
        let mid = text.charAt(2);
		let right = text.charAt(3);
        
		return `<svg class="brick-font" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1600 1200">
        <image x="0px" y="0px" width="650px" height="1200px" href="/fonts/brick_digits/${left}-left.png"></image>
        <image x="647px" y="0px" width="470px" height="1200px" href="/fonts/brick_digits/${mid}-mid.png"></image>
        <image x="1116px" y="0px" width="480px" height="1200px" href="/fonts/brick_digits/${right}-right.png"></image>
	</svg>`
    }
}

function setTimerValue(val){
    document.querySelector('#timer-text').innerHTML = brick_font ? textToImage(val) : val;
}

window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("dark") >= 1){
        // dark mode
        document.querySelector("body").classList.add("dark", "text-light");
    }
});