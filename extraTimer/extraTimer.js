const { remote, ipcRenderer } = require('electron');

ipcRenderer.on("set-timer-text", function(event, arg){
    console.log("Setting timer text to " + arg);
    document.querySelector(".timer-numbers").innerHTML = arg;
});

ipcRenderer.on("set-timer-font", function(event, arg){
    document.querySelector(".timer-numbers").style.fontFamily = arg;
});