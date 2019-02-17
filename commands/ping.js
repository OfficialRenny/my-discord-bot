const Discord = require('discord.js');
module.exports = {
	name: 'Ping',
	help: 'Pong! Check your latency.',
	func: (Client, message, args) => {
		var currentTime = Date.now();
		message.channel.send("Pong!").then((msg) => {
			var pingTime = Date.now();
			msg.edit(`Pong! Latency: ${pingTime - savedTime}ms.`);
		});
	}
}
