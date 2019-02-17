const Discord = require('discord.js');
module.exports = {
	name: 'Account IDs',
	help: 'Check a user\'s account ID without Developer Options.',
	func: (Client, message, args) => {
		if (!message.mentions.users.first()) return message.channel.send("Please mention a user.");
		const taggedUser = message.mentions.users.first();
		return message.channel.send(`${taggedUser.username} has the ID of \`${taggedUser.id}\`.`);
	}
}
