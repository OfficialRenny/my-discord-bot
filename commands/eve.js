const Discord = require('discord.js');
const async = require('async');
const request = require('request');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');


module.exports = {
    name: 'not in use',
    help: 'not in use',
    servers: ['256139176225931264'],
    func: (Client, msg, args) => {
        msg.channel.send('Processing.... please wait.').then((message) => {
		var arg1 = args.shift().toLowerCase();
		
		switch (arg1) {
		    case "search":
			Search();
			break;
		    default:
			return message.edit("You did not use a valid command.");
		}
			    
		async function Search() {
		    let subCmd = args.shift().toLowerCase();
		    switch (subCmd) {
			case "name":
			case "char":
			case "character":
			    	let char = await SearchCharByName(args.join("%20"));
				if (char['info'].length < 1) return message.edit("Could not find that user.");
				let corps = [];
				for (var i = char.history.length; i >= char.history.length - 5; i--) {
					if (char.history[i] == null || undefined) continue;
					corps.push(char.history[i]);
				}
				var embed = new Discord.RichEmbed()
				    .setTitle(char['info']['name'])
				    .setThumbnail("https://image.eveonline.com/Character/" + char['info']['character_id'] + "_1024.jpg")
				    .setDescription(`Character Info Lookup for ${char['info']['name']}.`)
				    .setColor(0x673AB7);
				let curCorp = await SearchCorpByID(char['info']['corporation_id']);
				if (curCorp['info']['name'] == undefined || null) {
				    curCorp = "None";
				} else {
				    curCorp = `${curCorp['info']['name']} - ${curCorp['info']['ticker']}`;
				}
				let curAlliance = await SearchAllianceByID(char['info']['alliance_id']);
				if (curAlliance['info']['name'] == undefined || null) {
				    curAlliance = "None";
				} else {
				    curAlliance = `${curAlliance['info']['name']} - ${curAlliance['info']['ticker']}`;
				}
				embed.addField('Security Status', char['info']['sec_status']);
				embed.addField('Current Corporation', curCorp, true);
				embed.addField('Current Alliance', curAlliance, true);
				embed.addField('Last 5 Corporations', await Last5Corps(corps));
				embed.setFooter('https://evewho.com/pilot/' + char['info']['name'].split(' ').join('+'));
				return message.edit({embed});
			    	break;
			case "corp":
			case "corporation":
				let corp = await SearchCorpByName(args.join("%20"));
				if (corp['info'].length < 1) return message.edit("Could not find that corporation.");
				let ceo = await SearchCharByID(corp['info']['ceoID']);
				var embed = new Discord.RichEmbed()
				    .setTitle(`${corp['info']['name']} - ${corp.info.ticker}`)
				    .setThumbnail("https://image.eveonline.com/Corporation/" + corp['info']['corporation_id'] + "_256.png")
				    .setColor(0x673AB7);
				let corpDesc = corp['info']['description'].replace(/<\/?[^>]+(>|$)/g, "");
				let isNpcCorp = (corp['info']['is_npc_corp'] == 1) ? "Yes" : "No";
				if (corp['info']['alliance_id'] == 0) {
				    var corpAlliance = "None";
				} else {
				    let tempAllVar = await SearchAllianceByID(corp['info']['alliance_id']);
				    var corpAlliance = tempAllVar['info']['name'];
				}
				embed.addField("CEO", ceo.info.name, true);
				embed.addField("Total Members", corp.info.member_count, true);
				embed.addField("NPC Corp?", isNpcCorp, true);
				embed.addField("Average Security Status", corp['info']['avg_sec_status'], true);
				embed.addField("Alliance", corpAlliance, true);
				embed.addField("Description", corpDesc, false);
				return message.edit({ embed });
				break;
			default:
			    return;
		    }
		}
		async function Last5Corps(corps) {
		    let text = "";
		    for (var corp in corps) {
			let curCorp = await SearchCorpByID(corps[corp]["corporation_id"])
			if (corp == 0) {
			    text += `**${curCorp['info']['name']}:** ${corps[corp]['start_date'].substring(0, 10)} - Present\n`;
			} else {
			    text += `**${curCorp['info']['name']}:** ${corps[corp]['start_date'].substring(0, 10)} - ${corps[corp]['end_date'].substring(0, 10)}\n`;
			}
		    }
		    return text;
		}
		
		function SearchCharByName(name) {
		    return new Promise(function (resolve, reject) {
			request.get("https://evewho.com/api.php?type=character&name=" + name, (error, response, body) => {
			    if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			    } else {
				reject(error);
			    }			    
			});
		    });
		}
		
		function SearchCharByID(id) {
		    return new Promise(function (resolve, reject) {
			request.get("https://evewho.com/api.php?type=character&id=" + id, (error, response, body) => {
			    if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			    } else {
				reject(error);
			    }			    
			});
		    });
		}
		
		function SearchCorpByName(name) {
			return new Promise(function (resolve, reject) {
				request.get("https://evewho.com/api.php?type=corporation&name=" + name, (error, response, body) => {
					if (!error && response.statusCode == 200) {
						resolve(JSON.parse(body));
					} else {
						reject(error);
					}
				});
			});
		}

		function SearchCorpByID(id) {
		    return new Promise(function (resolve, reject) {
			request.get("https://evewho.com/api.php?type=corporation&id=" + id, (error, response, body) => {
			    if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			    } else {
				reject(error);
			    }			    
			});
		    });
		}
		function SearchAllianceByID(id) {
		    return new Promise(function (resolve, reject) {
			request.get("https://evewho.com/api.php?type=alliance&id=" + id, (error, response, body) => {
			    if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			    } else {
				reject(error);
			    }			    
			});
		    });
		}
	});
    }
}
