const Discord = require('discord.js');
const seedrandom = require('seedrandom');

module.exports = {
	name: 'Coinflip',
	help: 'Just a simple coinflip.',
	func: (Client, message, chatChannel) => {
		var time = new Date().getTime();
		var seed = (message.author.id * chatChannel.id * time).toString();
		var rng = seedrandom(seed);
		
		if (rng() < 0.5) {
			message.channel.send(`You flipped a coin and it landed on Heads.`);
		} else {
			message.channel.send(`You flipped a coin and it landed on Tails.`);
		}
	}
}
