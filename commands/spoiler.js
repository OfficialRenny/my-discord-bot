const Discord = require('discord.js');
module.exports = {
	name: 'Spoilers',
	help: 'Have the bot turn your message into 2 different kinds of spoilers.',
	func: (Client, message, args) => {
		var cmd = args.shift();
		if (cmd == "1") {
			if (args.length < 1) return message.channel.send("That is an empty message.");
			message.channel.send(`||${args.join(' ')}|| - ${message.author.username}`).then((msg) => {
			message.delete().catch(() => {
				msg.edit(`||${args.join(' ')}|| - ${message.author.username}\nCould not delete your message, make sure to delete it yourself.`);
			});
			});
		}
		
		if (cmd == "2") {
			if (args.length < 1) return message.channel.send("That is an empty message.");
			var str = args.join(' ');
			var str2 = "";
			for (i = 0; i < str.length; i++) {
				str2 += `||${str.charAt(i)}||`;
			}
			message.channel.send(`${str2} - ${message.author.username}`).then((msg) => {
			message.delete().catch(() => {
				msg.edit(`${str2} - ${message.author.username}\nCould not delete your message, make sure to delete it yourself.`);
			});
			});
		}
	}
}
