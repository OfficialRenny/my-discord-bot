const Discord = require('discord.js');
const fs = require('fs');
const d3skills = JSON.parse(fs.readFileSync('./data/d3/databases/skill.json', 'utf8'));
const d3items = JSON.parse(fs.readFileSync('./data/d3/databases/item.json', 'utf8'));
const f = require('../utils/functions.js');
const v = require('../utils/vars.js');

module.exports = {
	name: 'Diablo 3 Item and Skill stuff',
	help: 'Allows you to search for Diablo 3 items and skills.',
	func: (Client, message, args) => {
			var cmd = args.shift();
			var search = args.join(' ');
			if (cmd == "item"){
				var listOfD3items = [];
				for (var item in d3items) {
					if (d3items[item].name.replace(/\'/i, '').toLowerCase() == search.replace(/\'/i, '').toLowerCase()) {
						listOfD3items = [];
						listOfD3items.push(d3items[item]);
						break;
					}
					if (d3items[item].name.replace(/\'/i, '').toLowerCase().includes(search.replace(/\'/i, '').toLowerCase())) {
						listOfD3items.push(d3items[item]);
					}
				}
				if (listOfD3items.length == 0) return message.channel.send(`Unable to find \`${search}\`.`);
				if (listOfD3items.length > 1) {
					var limit = 10;
					var namesOfItems = [];
					if (listOfD3items.length < limit) limit = listOfD3items.length;
					for (i = 0; i < limit; i++) namesOfItems.push(listOfD3items[i].name);
					if (listOfD3items.length > 10) namesOfItems.push(`And ${listOfD3items.length - 10} more!`);
					return message.channel.send(`Your search results brought back: ${f.codeBlokkit(namesOfItems.join('\n'), 0)} Please refine your search.`);
				} else {
					const item = listOfD3items[0];
					switch (item.color) {
					case "white":
						item.color = 0xffffff;
						break;
					case "blue":
						item.color = 0x0000dd;
						break;
					case "yellow":
						item.color = 0xffff00;
						break;
					case "orange":
						item.color = 0xffa500;
						break;
					case "green":
						item.color = 0x00dd00;
						break;
					}
					var embed = new Discord.RichEmbed().setTitle(item.name).setColor(item.color).setThumbnail(item.icon);
					if (item.desc != "") {
						embed.setDescription(item.desc);
					} else { 
						embed.setDescription(item.legend);
					}
					embed.addField("Level Requirement", item.level).addField("Type", `${item.quality} ${item.type}`, true);
					if (!f.isEmpty(item.owner)) embed.addField("Class Item", item.owner, true); 
					if (item.attrs.aws.length > 0 ) embed.addField("Attributes", item.attrs.aws.join('\n'));
					if (item.attrs.legendaryeffect.length > 0) embed.addField("Legendary Effect", item.attrs.legendaryeffect.join(' '));
					var choicesAndEffects = item.attrs.choices.concat(item.attrs.effects);
					if (choicesAndEffects.length > 0) embed.addField("Can Roll With", choicesAndEffects.join('\n'), true);
					if (!f.isEmpty(item.attrs.extras)) embed.addField("Extras", item.attrs.extras.join('\n'), true);
					if (!f.isEmpty(item.set.name)) {
						let temp = item.set.bonus.shift();
						embed.addField("Set Bonus", item.set.name.split().concat(item.set.bonus).join('\n'));
					}
					if (!f.isEmpty(item.source.cost)) {
						var itemMaterials = [];
						var itemStrings = [];
						for (var material in item.source.parts) {
							for (var w in d3items) {
								if (d3items[w].id == item.source.parts[material].id) {
								itemMaterials.push(d3items[w]);
								continue;
								}
							}
						}
						for (var mat in itemMaterials) itemStrings.push(`${item.source.parts[mat].num}x ${itemMaterials[mat].name}`);
						embed.addField("Crafting Requirements", `${item.source.cost} Gold\n${itemStrings.join('\n')}`);
						embed.addField("Required Artisan Level", item.source.rank, true);
					}
					return message.channel.send({embed});
				}
			} else if (cmd == "skill") {
				var listOfD3skills = [];
				for (var skill in d3skills) {
					if (d3skills[skill].name.replace(/\'/i, '').toLowerCase() == search.replace(/\'/i, '').toLowerCase()) {
						listOfD3skills = [];
						listOfD3skills.push(d3skills[skill]);
						break;
					}
					if (d3skills[skill].name.replace(/\'/i, '').toLowerCase().includes(search.replace(/\'/i, '').toLowerCase())) {
						listOfD3skills.push(d3skills[skill]);
					}
				}
				if (listOfD3skills.length == 0) return message.channel.send(`Unable to find \`${search}\`.`);
				if (listOfD3skills.length > 1) {
					var limit = 10;
					var namesOfSkills = [];
					if (listOfD3skills.length < limit) limit = listOfD3skills.length;
					for (i = 0; i < limit; i++) namesOfSkills.push(listOfD3skills[i].name);
					if (listOfD3skills.length > 10) namesOfSkills.push(`And ${listOfD3skills.length - 10} more!`);
					return message.channel.send(`Your search results brought back: ${f.codeBlokkit(namesOfSkills.join('\n'), 0)} Please refine your search.`);
				} else {
					const skill = listOfD3skills[0];
					const type = skill.active ? "Active" : "Passive";
					var embed = new Discord.RichEmbed().setTitle(`${type} - ${skill.name}`).setColor(0xa50000).setThumbnail(skill.icon).setDescription(skill.desc.join('\n'));
					if (!f.isEmpty(skill.legend)) embed.addField("Legend", skill.legend);
					if (!f.isEmpty(skill.cost)) embed.addField("Skill Cost", skill.cost);
					if (!f.isEmpty(skill.generate)) embed.addField("Generates", skill.generate);
					if (!f.isEmpty(skill.category)) embed.addField("Category", skill.category, true);
					embed.addField("Class", skill.owner.split('-').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' '), true);
					if (skill.runes.length > 0) {
						var runeStrings = [];
						for (var r in skill.runes) {
							let rune = skill.runes[r];
							runeStrings.push(`**${rune.name}** - ${rune.desc} - *Unlocked at Level ${rune.level}*`);
						}
						embed.addField("Runes", runeStrings.join('\n\n'));
					}
					return message.channel.send({embed});
				}
			} else if (cmd == "char") {
				var itemTypes = [
					"head",
					"torso",
					"shoulders",
					"arms",
					"bracers",
					"pants",
					"boots",
					"primary_hand",
					"off_hand",
					"ring_1",
					"ring_2",
					"amulet",
					"legendary_gems",
					"cube_armor",
					"cube_weapon",
					"cube_ring"
				];
				return message.channel.send("WIP");
				subCmd = args.shift().toLowerCase();
				if (subCmd == "help" || "h") return message.channel.send(`List of commands for the Diablo 3 loadout saver:\n ${f.codeBlokkit("Help (You are here)\nCreate - Creates a new character.\nAdd - Add an item to your loadout\nRemove - Removes an item from your loadout\nView - Views your current loadout\nSet Name - Sets your character's name\nSet Class - Sets your character's class", 0)}`);
				var charGet = Client.getD3Char.get(message.author.id);
				if (!charGet && subCmd != "create") return message.channel.send(`Please use \`${Client.prefix.prefix}d3 char create\` to create your loadout.`);
				if (subCmd == "create") {
						charGet = f.generateD3Char(message.author.id);
						Client.setD3char.run(charGet);
						return message.channel.send("Successfully created a new character.");
					}
				
				}
	}
}
