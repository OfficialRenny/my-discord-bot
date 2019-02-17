const Discord = require('discord.js');
const vars = require('../utils/vars.js');

module.exports = {
	name: 'Store',
	help: 'A store, to buy things with your currency.',
	func: (Client, message, args) => {
		cmd = args.shift();
		if (cmd == 'buy') {
		var cmdItem = args.shift();
		for (var item in vars.listOfStoreItems) {
			if (cmdItem == vars.listOfStoreItems[item]["cmd"]) {
				if (vars.listOfStoreItems[item]["price"] <= Client.temp.dbGet.currency) {
					Client.temp.dbGet.points += vars.listOfStoreItems[item]["price"] / 100;
					Client.temp.dbGet.currency -= vars.listOfStoreItems[item]["price"];
					Client.temp.dbGet[vars.listOfStoreItems[item]["dbname"]]++;
					Client.setScore.run(Client.temp.dbGet);
					return message.reply(`thank you for buying a ${vars.listOfStoreItems[item]["name"]}, your balance is now ${Client.temp.dbGet.currency}:money_with_wings:`);
					break;
				} else {
					return message.reply(`you do not have enough :money_with_wings: to purchase a ${vars.listOfStoreItems[item]["name"]}.`);
				}
				break;
			}
		}
		return message.reply(`${args[0]} is not a valid item, please check \`${Client.prefix.prefix}buy store\` for a list of all items.`);
	} else {
		const embed = new Discord.RichEmbed()
			.setTitle("Store")
			.setThumbnail(message.author.displayAvatarURL)
			.setDescription("Welcome to the store, spend your :money_with_wings: here!")
			.setFooter(`Your balance is ${Client.temp.dbGet.currency}`)
			.setColor(0x406DA2);
		for (k = 0; k < vars.listOfStoreItems.length; k++) {
			embed.addField(`${vars.listOfStoreItems[k]["name"]} - ${Client.prefix.prefix}store buy ${vars.listOfStoreItems[k]["cmd"]}`, `${vars.listOfStoreItems[k]["price"]}:money_with_wings:`);
		}
		return message.channel.send({
			embed
			});
		}
	}
}
