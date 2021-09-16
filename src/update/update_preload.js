const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('update_data', {
    this_version: require("@electron/remote").app.getVersion(),
    getJSON: require("../web_scraper/get_json.js"),
    marked: require("marked"),
    openExternal: require("electron").shell.openExternal
});