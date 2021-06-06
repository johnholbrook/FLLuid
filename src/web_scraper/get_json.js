// pretty sure this is used by the update checker?
var needle = require('needle');

module.exports = function(url, callback){
    let options = {user_agent: "FLLuid (https://github.com/johnholbrook/flluid)"}
    needle.get(url, options, function(error, response){
        if (error){
            console.error(`Error connecting to ${url}: ${error}`);
        }
        else{
            // callback(JSON.parse(response.body));
            callback(response.body);
        }
    });
}