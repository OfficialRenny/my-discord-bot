const Discord = require('discord.js');
module.exports = {
    name: 'Help Command',
    help: 'Plz send help!!',
    func: (Client, msg, args) => {
        if (args.length > 0) {
            if (args[0] in Client.commands && Client.commands[args[0]].help)
                msg.channel.sendCode('asciidoc', `${Client.prefix.prefix + args[0]} :: ${Client.commands[args[0]].help}`);
        else {
            let help = "";
            for (var command in Client.commands) {
                help += `${Client.prefix.prefix + command} :: ${Client.commands[command].help}\n`
            }
            msg.channel.sendCode('asciidoc', help);
			}
		}
	}
}
