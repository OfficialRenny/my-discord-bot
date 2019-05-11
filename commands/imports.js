const Discord = require('discord.js');
const fs = require('fs');
const {google} = require('googleapis');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
var vehsPending = [];

module.exports = {
	name: 'Dinoco Imports Checker',
	help: 'Fetches a list of pending General imports.',	
	servers: ['275388903547076610', '256139176225931264'],
	func: (Client, message, args) => {
		let txt = "Pending General Requests\n\n";
		if (Client.temp.general.length < 1) return message.channel.send("There are no pending imports");
		for (veh in Client.temp.general) {
			curVeh = Client.temp.general[veh];
			txt += `${curVeh.charName} (( ${curVeh.forumName} )) requested a ${curVeh.vehicle} at ${curVeh.timestamp}.\n\n`;
		}
		var temp = Client.temp.timestamps.general;
		var date = temp.getFullYear()+'-'+(temp.getMonth()+1)+'-'+temp.getDate();
		var time = temp.getHours() + ":" + temp.getMinutes() + ":" + temp.getSeconds();
		txt += `Last Updated: ${date} ${time}`;
		if (txt.length > 2000) {
			return message.channel.send("There are way too many requests to fit into a single discord message, sort them out!");
		} else {
			return message.channel.send(F.codeBlokkit(txt, 'asciidoc'));
		}
	}
}

/* row indexes
 * 0 = timestamp
 * 1 = full name
 * 2 = forum name
 * 3 = address
 * 4 = phone
 * 5 = reasoning
 * 6 = link
 * 7 = veh name
 * 8 = ooc preference
 * 9 = location
 * 10 = agreement 1
 * 11 = agreement 2
 * 12 = denial reason
 */
