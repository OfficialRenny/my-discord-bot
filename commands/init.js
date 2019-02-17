const Discord = require('discord.js');
const adminID = ['197376829408018432', '108875959628795904'];

module.exports = {
	name: 'DB Initialisation',
	help: 'Used to add everyone from a server into the Database.',
	func: (Client, message, args) => {
		if (adminID.includes(message.author.id) && message.guild) {
			const arrayOfMembers = message.guild.members.array();
			var membersString = "";
			for (var guildMemberId in arrayOfMembers) {
				if (arrayOfMembers[guildMemberId].user.bot)
					continue;

				Client.temp.dbGet = client.getScore.get(arrayOfMembers[guildMemberId].user.id);
				if (!Client.temp.dbGet) {
					Client.temp.dbGet = generateDbEntry(arrayOfMembers[guildMemberId].user);
					client.setScore.run(Client.temp.dbGet);
					membersString += arrayOfMembers[guildMemberId].user.username + '\n';
				}
			}
			if (membersString == "") {
				message.channel.send(`Everyone in ${message.guild.name} already has an entry in the DB!`);
				logger.info(`Everyone in ${message.guild.name} already has an entry in the DB. Skipping....`);
				return;
			}
			return message.channel.send(`Created database entries for users: \`\`\`${membersString}\`\`\``);
		}
	}
}
