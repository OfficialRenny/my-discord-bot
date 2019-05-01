const Discord = require('discord.js');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
module.exports = {
    name: 'Help Command',
    help: 'yeet',
    func: (Client, msg, args) => {
        if (args.length > 0) {
            if (args[0] in Client.commands && Client.commands[args[0]].help) {
		let helpText = `${Client.prefix.prefix + args[0]} :: ${Client.commands[args[0]].help}\n`;
		if (Client.commands[args[0]].syntax) helpText += Client.commands[args[0]].syntax;
		msg.channel.send(F.codeBlokkit(helpText, 'asciidoc'));
	    }
        } else {
            let help = "";
            for (var command in Client.commands) {
		if (Client.commands[command].servers) {
		    if (!Client.commands[command].servers.includes(msg.guild.id)) continue;
		}
                help += `${Client.prefix.prefix + command} :: ${Client.commands[command].help}\n`
            }
            msg.channel.send(F.codeBlokkit(help, 'asciidoc'));
	    }
	}
}
