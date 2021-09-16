console.log(window.update_data);

const getJSON = window.update_data.getJSON;

document.addEventListener("DOMContentLoaded", function(){
    // Show this version number
    document.querySelector("#this_version").innerHTML = window.update_data.this_version;

    document.querySelector("#update_now").onclick = function(){
        window.update_data.openExternal("https://github.com/johnholbrook/FLLuid/releases/latest");
    }

    document.querySelector("#no_thanks").onclick = function(){
        window.close();
    }

    // get info about the latest version
    getJSON("https://api.github.com/repos/johnholbrook/flluid/releases/latest", function(latest_release){
        // show latest version number
        let latest_version = latest_release.tag_name;
        if (latest_version.charAt(0) == 'v') latest_version = latest_version.substr(1);
        document.querySelector("#latest_version").innerHTML = latest_version;

        // show update notes for latest version
        document.querySelector("#update_notes").innerHTML = window.update_data.marked(latest_release.body);
    });

})