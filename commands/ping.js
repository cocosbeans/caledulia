module.exports = {
    aliases: ["ping"],
    whitelist: ["!everyone"],
    exec: function(message, content) {
        message.channel.send("Pong!")
    }
}