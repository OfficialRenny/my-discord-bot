const Discord = require('discord.js');
const Kahoot = require('kahoot.js-republished');
const f = require('../utils/functions.js');

module.exports = {
	name: 'Kahoot Nuke',
	help: 'Floods a Kahhot server with as many bots as you want, limited at the maximum member cap for Kahoot.',
	func: (Client, message, args) => {
				if (args.length < 2) return message.channel.send("Please provide the number of bots for the kahoot and the kahoot ID number. `SYNTAX: [number of bots] [room number]`.");
				var numOfBots = f.TryParseInt(args[0], 0);
				var roomID = f.TryParseInt(args[1], 0);
				if (roomID < 1) return message.channel.send("Invalid Room ID.");
				if ((numOfBots < 1) || (numOfBots > 50)) return message.channel.send("Please choose a number between 1 and 50.");
				var num = 0;
				for (i = 0; i < numOfBots; i++) {
					num++;
					var kahootClient = new Kahoot;
					var kahootName = f.randomString();
					kahootClient.join(roomID, kahootName).then(console.log(`Bot ${kahootName} joined Room ${roomID}. Bot ${num} of ${numOfBots}.`));
				}
	}
}
