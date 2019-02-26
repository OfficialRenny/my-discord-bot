const Discord = require('discord.js');
const seedrandom = require('seedrandom');

module.exports = {
	name: 'Chance',
	help: 'Give it a percentage and the bot will decide whether you suceed or fail.',
	func: (Client, message, args) => {
			const num = Math.ceil(parseInt(args[0], 10));
			if (!num) return message.channel.send(`Please choose a number.`);
			if (num < 1 || num > 100) return message.channel.send("Please choose a number between 1 and 100.");

			var time = new Date().getTime();
			var seed = (message.author.id * Client.temp.chatChannel.id * time).toString();
			var rng = seedrandom(seed);
			
			if (Math.floor((rng() * 100 + 1)) > num) {
				message.channel.send(`Your ${num}% chance has failed.`);
			} else {
				message.channel.send(`Your ${num}% chance has succeeded.`);
			}	
	}
}
