const Discord = require('discord.js');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
module.exports = {
    name: 'Help Command',
    help: 'yeet',
    func: (Client, msg, args) => {
        if (args.length > 0) {
            if (args[0] in Client.commands && Client.commands[args[0]].help) msg.channel.send(F.codeBlokkit(`${Client.prefix.prefix + args[0]} :: ${Client.commands[args[0]].help}`, 'asciidoc'));
        } else {
            let help = "";
            for (var command in Client.commands) {
                help += `${Client.prefix.prefix + command} :: ${Client.commands[command].help}\n`
            }
            msg.channel.send(F.codeBlokkit(help, 'asciidoc'));
	    }
	}
}
