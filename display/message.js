module.exports = {
    set_message_text : set_message_text
};

function set_message_text(new_text){
    document.querySelector("#message-text").innerHTML = new_text;
}