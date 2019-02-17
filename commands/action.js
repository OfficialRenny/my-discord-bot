const Discord = require('discord.js');
const usedActionRecently = new Set();
const util = require('../utils/functions.js');
const seedrandom = require('seedrandom');

var listOfActions =
	["mine", "chop", "fish", "hunt", "dig"];

module.exports = {
	name: 'Action',
	help: 'Allows you to do actions for currency.',
	func: (Client, message, args) => {
		if (args[0] == "help") return message.channel.send("Available actions are: " + util.stringifyArray(listOfActions) + ". `SYNTAX: " + Client.prefix + "action [action]`");
			var usedActions = [];
			var reusedActions = [];
			for (var word in args) {
				var action = args[word].toLowerCase();
				if (listOfActions.includes(action)) {
					if (usedActions.includes(action) && !reusedActions.includes(action)) {
						reusedActions.push(action);
						continue;
					}
					usedActions.push(action);
					var authorIDandAction = `${message.author.id}-${action}`;
					var rnd = seedrandom((message.author.id * chatChannel.id * new Date().getTime()).toString());
					var randNum = Math.floor(rnd() * 101);
					if (!usedActionRecently.has(authorIDandAction)) {
						dbGet.points += 2;
						dbGet.currency += randNum;
						message.channel.send(`You used '${action}' and gained ${randNum}:money_with_wings:!`);
						usedActionRecently.add(authorIDandAction);
						setTimeout(() => {
							if (usedActionRecently.has(authorIDandAction)) {
							usedActionRecently.delete(authorIDandAction);
							}
						}, 60000 * 2);
						logger.info(`${message.author.username} used ${action} and got a score of ${randNum}`);
					} else if (usedActionRecently.has(authorIDandAction)) {
						reusedActions.push(action);
					}
				}
			}
			logger.info(usedActionRecently);
			if (reusedActions.length > 0) {
				return message.channel.send(`You need to wait 2 minutes before using actions ${stringifyArray(reusedActions)} again.`);
			}
	}
}
