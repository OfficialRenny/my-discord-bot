const Discord = require('discord.js');
const vars = require('../utils/vars.js');

module.exports = {
	name: 'Inventory',
	help: 'Check your current inventory.',
	func: (Client, message, args) => {
			const embed = new Discord.RichEmbed()
				.setTitle(message.author.username)
				.setThumbnail(message.author.displayAvatarURL)
				.setDescription("This is a list of all of your current items.")
				.setFooter(`Your balance is ${Client.temp.dbGet.currency}`)
				.setColor(0x406DA2);
			for (k = 0; k < vars.listOfStoreItems.length; k++) {
				embed.addField(`${vars.listOfStoreItems[k]["name"]}`, `${Client.temp.dbGet[vars.listOfStoreItems[k]["dbname"]]}`, true);
			}
			message.channel.send({
				embed
			});
	}
}
