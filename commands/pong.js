module.exports = {
    aliases: ["pong"],
    whitelist: ["!everyone"],
    exec: function(message, content) {
        message.channel.send("Ping!")
    }
}