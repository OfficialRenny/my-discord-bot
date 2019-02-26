const Discord = require('discord.js');
const seedrandom = require('seedrandom');
const F = require('../utils/functions.js');

module.exports = {
	name: 'Dice Roll',
	help: 'Rolls dice.',
	func: (Client, message, args) => {
			if (!args[0]) return message.channel.send(`Please choose a number. \`SYNTAX: ${Client.prefix.prefix}roll 1d20\`.`);
			const dice = args[0].toLowerCase().split('d');
			
			var timesToRoll = Math.ceil(parseInt(dice[0]));
			var diceNumber = Math.ceil(parseInt(dice[1]));
			var rolledNumbers = [];
			
			if (dice.length == 1) {
				diceNumber = timesToRoll;
				timesToRoll = 1;
			}
			if (diceNumber > 99999999999999) return message.channel.send("That number is wayyy too high.");
			
			if (timesToRoll > 1000) return message.channel.send("I cannot send that many numbers.");
			if (timesToRoll < 1 || diceNumber < 1) return message.channel.send("Please choose numbers larger than 0.");
			if (!timesToRoll || !diceNumber) return message.channel.send(`Please choose a number of dice to roll. \`SYNTAX: ${Client.prefix.prefix}roll 1d20\`.`);
			var time = new Date().getTime();
			for (i = 0; i < timesToRoll; i++) {
				var seed = (message.author.id * Client.temp.chatChannel.id * time * (i + 1)).toString();
				var rng = seedrandom(seed);
				rolledNumbers.push(Math.ceil(rng() * diceNumber));
			}
			
			messageToSend = `${message.author.username} rolled ${F.stringifyArray(rolledNumbers)}.`;
			
			if (messageToSend.length  > 2000) {
				message.channel.send("The message would be too long...");
			} else {
				message.channel.send(messageToSend);
			}
	}
}
