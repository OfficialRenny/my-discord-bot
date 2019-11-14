const Discord = require('discord.js');

module.exports = {
	name: 'ping connor',
	help: 'pings connor',
	servers: ['487547206283427840'],
	func: async (Client, message, args) => {
		for (i = 0; i < 10; i++) message.channel.send('<@527125397729574943>').then((msg) => msg.delete());
	}
}
