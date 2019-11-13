var needle = require('needle');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//Make a request to the specified URL and pass the
//result (assuming no error) on to the handler function
function make_request(url, handler_function, next_step){
    console.log(encodeURI(url));
    needle.get(encodeURI(url), function(error, response, body){
        if (error === null){
            //if request returned without error, call the 
            //handler function with the result body
            handler_function(body, next_step);
        }
        else{
            //TODO: error handling!
        }
    });
}

function url_response_handler(body, next_step){
    const htmlDoc = new JSDOM(body).window.document;

    next_step(htmlDoc.querySelector("body").innerHTML);
}

let url = "https://flltournament.com/Scoreboard.aspx?TID=21989&AspxAutoDetectCookieSupport=1";

make_request(url, url_response_handler, console.log);