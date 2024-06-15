const config = require('./config.json')

class process_handler {

    //Return a boolean of whether the user calling the command is whitelisted or not
    check_whitelist(data, id) {
        if (data.whitelist[0] === `${config.whitelist_prefix}everyone`) return true
        for (const item of data.whitelist) {
            if (
                item.startsWith(config.whitelist_prefix) && //Whitelist starts with !
                Object.keys(config.whitelists)
                    .includes(item.slice(config.whitelist_prefix.length)) && //Whitelist exists
                config.whitelists[item].includes(id) //Whitelist contains id
            ) return true
            else if (item === id) return true
            else return false
        }
    }
    
    //Return an array containing the command used and an array (nested) of argument words delimited by a space
    handle_content(content) {
        var arg = content.trim().split(' ')
        var cmd = arg.shift().toLowerCase()
        return [cmd, arg]
    }

    //Return an array of processes from a full string of text split by & if not 'escaped' by +
    handle_string(content) {
        var lines = content.slice(config.prefix.length).split(/[^\+]&/)
        var queue = new Array()
        for (const line in lines) {
            queue.push({
                status: 0,
                content: lines[line].trim().replace(/\+&/g, '&')
            })
        }
        return queue
    }

    //Return an integer pertaining to the index containing a valid alias / -1 if not found
    validate_process(command, files) {
        //var _files = new Array()
        //for (const file of files) {_files.push(file.replace(/\.js/g, ''))}
        for (const file in files) {
            if (files[file].aliases.includes(command)) return file
        }
        return -1
    }
}

module.exports = process_handler