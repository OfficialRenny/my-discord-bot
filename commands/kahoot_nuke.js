const Discord = require('discord.js');
const usedKahootNuke = new Set();
const Kahoot = require('kahoot.js-republished');
const f = require('../utils/functions.js');

module.exports = {
	name: 'Kahoot Nuke',
	help: 'Floods a Kahhot server with as many bots.',
	func: (Client, message, args) => {
			if (!usedKahootNuke.has(`${message.author.id}-kahoot`)) {
				if (args.length < 2) return message.channel.send("Please provide the number of bots for the kahoot and the kahoot ID number. `SYNTAX: [number of bots] [room number]`.");
				var numOfBots = f.TryParseInt(args[0], 0);
				var roomID = f.TryParseInt(args[1], 0);
				if (roomID < 1) return message.channel.send("Invalid Room ID.");
				if ((numOfBots < 1) || (numOfBots > 50)) return message.channel.send("Please choose a number between 1 and 50.");
				var num = 0;
				if (!adminID.includes(message.author.id)) usedKahootNuke.add(`${message.author.id}-kahoot`);
				setTimeout(() => {
							if (usedKahootNuke.has(`${message.author.id}-kahoot`)) {
							usedKahootNuke.delete(`${message.author.id}-kahoot`);
							}
						}, 60000 * 10);
				var num = 0;
				for (i = 0; i < numOfBots; i++) {
					num++;
					var kahootClient = new Kahoot;
					var kahootName = randomString();
					kahootClient.join(roomID, kahootName).then(logger.info(`Bot ${kahootName} joined Room ${roomID}. Bot ${num} of ${numOfBots}.`));
				}
			} else {
				return message.channel.send("You must wait 10 minutes before using the kahoot nuke again.");
			}
	}
}
