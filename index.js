const config = require('./config.json')
const { readdirSync } = require('fs')
const { Client, MessageEmbed } = require('discord.js')
const { stringify } = require('querystring')
const process_handler = require('./handler.js')
const processor = new process_handler()

const client = new Client({
    allowedMentions: {
      parse: ["users"],
      repliedUser: false
    },
    intents: [
      "GUILDS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "DIRECT_MESSAGES"
    ],
    partials: ["CHANNEL"]
  })

const files = function () { //Array of Objs
  let _f = readdirSync(config.folder_commands).filter(file => file.endsWith('.js'))
  let _o = new Array()
  for (file of _f) {
    _o.push(require(`${config.folder_commands}${file}`))
  } return _o
}()

console.log(files)

function build_embed(fillout = {title:undefined,description:undefined,color:undefined}) {
  return new MessageEmbed()
    .setTitle(fillout.title)
    .setDescription(fillout.description)
    .setColor(fillout.color)
    .setTimestamp()
}

client.on('messageCreate', message => {
  if (message.author.bot || !message.content.startsWith(config.prefix) || message.content === config.prefix) return
  let queue = processor.handle_string(message.content)
  if (queue.length >= 5) message.channel.send("**Take into account that Discord has message rate limiting, so consecutive outputs will take time!**")
  console.log(queue)

  //Check every process (Object) in the queue
  for (const process of queue) {
    //Set _process to an array of [cmd, [arr]]
    let _process = processor.handle_content(process.content)
    //Check that [cmd] doesn't exist in any file. valid represents the index in files which contains the data, so files[valid]
    var valid = processor.validate_process(_process[0], files)
    //Instance where process isn't valid
    if (valid === -1) {
      message.channel.send({
        embeds: [
          build_embed({
            title: `**Invalid Process:** \`${_process[0]}\``,
            description: "No process with the given command could be validated. Please try again.",
            color: "FF0000"
          })
        ]
      })
      return
    } //Instance where process is valid
    else {
      //Instance where status isn't Pending (0)
      if (process.status !== 0) {
        message.channel.send({
          embeds: [
            build_embed({
              title: `**Error Executing Process:** \`${_process[0]}\``,
              description: `There was an error running a process because the process does not have a \`Pending (0)\` status.\n\`\`\`js\nProcess Details:\n${JSON.stringify(queue[valid])}\n\`\`\``,
              color: "50BCEA"
            })
          ]
        })
        return
      } //Instance where status is Pending (0)
      else {
        //Instance where author isn't whitelisted
        if (!processor.check_whitelist(files[valid], message.author.id)) {

        } //Instance where author is whitelisted
        else {
          try {
            files[valid].exec(message, _process)
          } catch (err) {
            message.channel.send({
              embeds: [
                build_embed({
                  title: `**Error Executing Process:** \`${_process[0]}\``,
                  description: `There was an error running a process:\n\`\`\`js\n${err.message}\n\`\`\``,
                  color: "FF0000"
                })
              ]
            })
          }
        }
      }
    }
  }
})

client.login(config.token).then(console.log('Successfully up'))