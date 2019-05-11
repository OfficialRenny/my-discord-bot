const Discord = require('discord.js');
const fs = require('fs');
const {google} = require('googleapis');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
var vehsPending = [];

module.exports = {
	name: 'Dinoco Exotics Checker',
	help: 'Fetches a list of pending Exotic imports.',
	servers: ['275388903547076610', '256139176225931264'],
	func: (Client, message, args) => {
		let txt = "Pending Exotic Requests\n\n";
		if (Client.temp.exotics.length < 1) return message.channel.send("There are no pending imports");
		for (veh in Client.temp.exotics) {
			curVeh = Client.temp.exotics[veh];
			txt += `${curVeh.charName} (( ${curVeh.forumName} )) requested a ${curVeh.vehicle} at ${curVeh.timestamp}.\n\n`;
		}
		var temp = Client.temp.timestamps.exotics;
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
 * 2 = address
 * 3 = email/forum name
 * 4 = phone number
 * 5 = reasoning
 * 6 = link
 * 7 = vehicle name
 * 8 = vehicle location
 * 9 = agreement 1
 * 10 = agreement 2
 * 11 = denial reason
 */
