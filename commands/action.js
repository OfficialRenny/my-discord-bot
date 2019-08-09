const Discord = require('discord.js');
const usedActionRecently = { };
const util = require('../utils/functions.js');
const vars = require('../utils/vars.js');
const seedrandom = require('seedrandom');

var listOfActions =
	["mine", "chop", "fish", "hunt", "dig"];

module.exports = {
	name: 'Action',
	help: 'Allows you to do actions for currency.',
	func: (Client, message, args) => {
		if (!usedActionRecently[message.author.id]) {
			usedActionRecently[message.author.id] = { };
		}
		if (args[0] == "help") return message.channel.send("Available actions are: " + util.stringifyArray(listOfActions) + ". `SYNTAX: " + Client.prefix.prefix + "action [action]`");
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
					var rnd = seedrandom((message.author.id * Client.temp.chatChannel.id * new Date().getTime()).toString());
					var randNum = Math.floor(rnd() * 101);
					if (!usedActionRecently[message.author.id][action]) {
						Client.temp.dbGet.points += 2;
						Client.temp.dbGet.currency += randNum;
						message.channel.send(`You used '${action}' and gained ${randNum}:money_with_wings:!`);
						usedActionRecently[message.author.id][action] = true;
						setUsedFunction(message.author.id, action);
						vars.logger.info(`${message.author.username} used ${action} and got a score of ${randNum}`);
					} else if (usedActionRecently[message.author.id][action]) {
						reusedActions.push(action);
					}
				}
			}
			vars.logger.info(usedActionRecently);
			if (reusedActions.length > 0) {
				return message.channel.send(`You need to wait 2 minutes before using actions ${util.stringifyArray(reusedActions)} again.`);
			}
			
			async function setUsedFunction(id, action) {
				setTimeout(() => {
					if (usedActionRecently[id][action]) {
						usedActionRecently[message.author.id][action] = false;
					}
				}, 60000 * 2);
			}
	}
}
