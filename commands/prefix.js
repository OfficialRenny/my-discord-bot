const Discord = require('discord.js');
module.exports = {
	name: 'Prefix Settings',
	help: 'Allows you to get and set the prefix for your server (or DM).',
	func: (Client, message, args) => {
		cmd = args.shift();
		if (cmd == 'set') {
			Client.prefix.prefix = args.join(' ');
			Client.setPrefix.run(prefixGet);
			message.channel.send(`Successfully changed the prefix to \`${Client.prefix.prefix}\``);
		}
		if (cmd == 'get' || message.content.startsWith('~prefix get')) {
			message.channel.send(`The prefix for this server is \`${Client.prefix.prefix}\``);
		}
	}
}
