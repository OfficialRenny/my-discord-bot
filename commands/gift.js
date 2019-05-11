const Discord = require('discord.js');
const vars = require('../utils/vars.js');
const F = require('../utils/functions.js');

module.exports = {
	name: 'Send Gifts',
	help: 'Send items that you have to anyone on Discord.',
	func: (Client, message, args) => {
			if (args[0] == 'help') {
				return message.channel.send(`\`SYNTAX: ${Client.prefix.prefix}gift [item] [user(s)] [amount]\``);
			}
			var channelMembers = message.channel.members.array();
			var channelMembersNoBots = [];
			var channelMembersNoBotsToString = "";
			var mentionedUsers = [];
			var mentionedUsersToString = "";
			var invalidMembers = [];
			var itemsToGive = 0;
			var usersToGiveTo = [];
			var isAnItem = false;
			var item = args.shift();
			var wordsInMessage = message.content.split(' ');
			if (!(message.mentions.users.array() || message.mentions.everyone || message.content.indexOf("@someone") != -1 || Client.temp.quotedStrings)) {
				return message.reply("you need to mention a user, use their ID in quotes, or use `@someone`!");
			}
			for (var member in message.mentions.users.array()) {
				if (message.mentions.users.array()[member].id == Client.bot.user.id) {
					message.channel.send("Oh.... no thanks, you can keep it! Continuing with the gifting....");
					break;
				}
			}

			for (i = 0; i < vars.listOfStoreItems.length; i++) {
				if (item == vars.listOfStoreItems[i]["cmd"]) {
					isAnItem = true;
					break;
				} else {
					isAnItem = false;
				}
			}

			if (!isAnItem)
				return message.reply("this item does not exist or is not able to be given as a gift.");

			for (var member in channelMembers) {
				if (channelMembers[member].user.bot)
					continue;
				if (channelMembers[member].user.id == message.author.id)
					continue;
				channelMembersNoBots.push(channelMembers[member]);
			}
			for (var member in channelMembersNoBots) {
				if (member != channelMembersNoBots.length - 1) {
					channelMembersNoBotsToString += channelMembers[member].username + ", ";
				} else {
					channelMembersNoBotsToString += "and " + channelMembers[member].username;
				}
			}

			for (var member in message.mentions.users.array()) {
				if (message.mentions.users.array()[member].bot)
					continue;
				mentionedUsers.push(message.mentions.users.array()[member]);
			}

			for (var member in mentionedUsers) {
				if (member != mentionedUsers.length - 1) {
					mentionedUsersToString += mentionedUsers[member].username + ", ";
				} else {
					mentionedUsersToString += "and " + mentionedUsers[member].username;
				}
			}

			var randomMember = channelMembersNoBots.length > 1 ? channelMembersNoBots[Math.floor(Math.random() * channelMembersNoBots.length)].user : null;

			if (message.mentions.everyone) {
				for (var member in channelMembersNoBots) {
					usersToGiveTo.push(channelMembersNoBots[member].user);
				}
				itemsToGive = usersToGiveTo.length;
				gifting();
			} else if (args[1] == "@someone") {
				usersToGiveTo.push(randomMember);
				itemsToGive = 1;
				gifting();
			} else if (mentionedUsers.length > 0) {
				for (var member in mentionedUsers) {
					if (mentionedUsers[member].bot)
						continue;
					usersToGiveTo.push(mentionedUsers[member]);
				}
				itemsToGive = usersToGiveTo.length;
				gifting();
			} else if (Client.temp.quotedStrings) {
				var quoteGifting = function(index) {
					if (index >= Client.temp.quotedStrings.length) return gifting();
					var giftee = Client.temp.quotedStrings[index].slice(1, -1);
						Client.bot.fetchUser(giftee).then(
						(user) => {
						usersToGiveTo.push(user);
						itemsToGive = usersToGiveTo.length;
						quoteGifting(index + 1);
						}).catch((err) => {
							invalidMembers.push(giftee);
							quoteGifting(index + 1);
							});
				}
				quoteGifting(0);
			}
			
			function gifting() {
			if (invalidMembers.length > 0) {
				return message.channel.send(`${F.stringifyArray(invalidMembers)} is/are not valid ID(s).`);
			}
			if (usersToGiveTo.length == 0)
				return message.channel.send("No users specified!");
				
			var usersToGiveToString = "";
			for (var member in usersToGiveTo) {
				if (usersToGiveTo.length == 1) {
					usersToGiveToString += usersToGiveTo[member].username;
					break;
				}
				if (member != usersToGiveTo.length - 1) {
					usersToGiveToString += usersToGiveTo[member].username + ", ";
				} else {
					usersToGiveToString += "and " + usersToGiveTo[member].username;
				}
			}

			var itemsToReceive = Math.floor(itemsToGive / (usersToGiveTo.length)) * F.TryParseInt(wordsInMessage[wordsInMessage.length - 1], 1);
			itemsToGive *= F.TryParseInt(wordsInMessage[wordsInMessage.length - 1], 1);

			//if (adminMode && adminID.includes(message.author.id)) {
			//	itemsToGive = 0;
			//}

			for (i = 0; i < vars.listOfStoreItems.length; i++) {
				if (item == vars.listOfStoreItems[i]["cmd"]) {
					if (Client.temp.dbGet[vars.listOfStoreItems[i]["dbname"]] >= itemsToGive) {
						Client.temp.dbGet[vars.listOfStoreItems[i]["dbname"]] -= itemsToGive;
						Client.setScore.run(Client.temp.dbGet);
						for (var member in usersToGiveTo) {
							var someoneDBget = Client.getScore.get(usersToGiveTo[member].id);
							if (!someoneDBget) {
								someoneDBget = F.generateDbEntry(usersToGiveTo[member]);
							}
							someoneDBget[vars.listOfStoreItems[i]["dbname"]] += itemsToReceive;
							Client.setScore.run(someoneDBget);
							vars.logger.info(`User ${message.author.username} gave ${usersToGiveTo[member].username} ${itemsToReceive}x ${vars.listOfStoreItems[i]["name"]}!`);
						}
						const embed = new Discord.MessageEmbed()
							.setTimestamp()
							.setDescription(`${message.author.username} has just gifted ${usersToGiveToString} ${itemsToReceive}x ${vars.listOfStoreItems[i]["name"]}!`)
							.setTitle(`You have a gift!`)
							.setImage(`${vars.listOfStoreItems[i]["url"]}`);
						return message.channel.send({
							embed
						});
					} else {
						return message.channel.send(`You do not have enough ${vars.listOfStoreItems[i]["name"]} to give, why not buy some from the store?`);
					}
				}
			}
			return message.channel.send("You should never be able to see this message....");
			}
	}
}
