const Discord = require('discord.js');
const utils = require('../utils/functions.js');

module.exports = {
	name: 'Stats',
	help: 'Shows your profile\'s stats.',
	func: (Client, message, args) => {
			var usableId;
			if (!message.mentions.users.first()) {
				usableId = message.author;
			} else {
				usableId = message.mentions.users.first();
			}
			var dbGet = Client.getScore.get(usableId.id);
			if (!dbGet) {
				dbGet = utils.generateDbEntry(usableId);
			}

			dbGet.level = Math.floor(utils.calculateLevel(dbGet.points));
			const pointsForCurrentLevel = utils.calculatePoints(parseInt(dbGet.level));
			const pointsForNextLevel = utils.calculatePoints(parseInt(dbGet.level) + 1);
			const embed = new Discord.MessageEmbed()
				.setTimestamp()
				.setAuthor(usableId.username)
				.setThumbnail(usableId.displayAvatarURL)
				.setDescription(`Here are your stats, ${usableId.username}`)
				.setTitle(`Stats for ${usableId.username}`)
				.addField("Level", Math.floor(dbGet.level), true)
				.addField("XP", dbGet.points, true)
				.addField("Points To Next Level", `${Math.ceil(pointsForNextLevel - pointsForCurrentLevel)}`, true)
				.addField("Currency", dbGet.currency)
				.addField("Inventory", `To see your inventory, please use ${Client.prefix.prefix}inv`);
			message.channel.send({
				embed
			});
	}
}
