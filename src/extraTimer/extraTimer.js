const { remote, ipcRenderer } = require('electron');

var brick_font = false;

function setTimerValue(text){
	document.querySelector('.timer-text').innerHTML = brick_font ? textToImage(text) : text;
}

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

ipcRenderer.on("set-timer-text", function(event, arg){
    setTimerValue(arg);
    // console.log("Setting timer text to " + arg);
    // document.querySelector(".timer-text").innerHTML = arg;
});

ipcRenderer.on("set-timer-font", function(event, arg){
    // document.querySelector(".timer-text").style.fontFamily = arg;
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