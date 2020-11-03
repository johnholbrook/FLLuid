const getJSON = require("../web_scraper/get_json.js");
const md = require("markdown-it")();

document.addEventListener("DOMContentLoaded", function(){
    // Show this version number
    document.querySelector("#this_version").innerHTML = require("electron").remote.app.getVersion();

    // get info about the latest version
    getJSON("https://api.github.com/repos/johnholbrook/flluid/releases/latest", function(latest_release){
        // show latest version number
        let latest_version = latest_release.tag_name;
        if (latest_version.charAt(0) == 'v') latest_version = latest_version.substr(1);
        document.querySelector("#latest_version").innerHTML = latest_version;

        // show update notes for latest version
        document.querySelector("#update_notes").innerHTML = md.render(latest_release.body);
    });

    document.querySelector("#update_now").onclick = function(){
        require("electron").shell.openExternal("https://github.com/johnholbrook/FLLuid/releases/latest");
    }

    document.querySelector("#no_thanks").onclick = function(){
        require("electron").remote.getCurrentWindow().close();
    }

})