const Discord = require('discord.js');
const fs = require('fs');
const {google} = require('googleapis');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
var vehsPending = [];

module.exports = {
	name: 'Dinoco Imports Checker',
	help: 'Fetches a list of pending Aviation imports.',
	servers: ['275388903547076610', '256139176225931264'],
	func: (Client, message, args) => {
		let txt = "Pending Aviations Requests\n\n";
		if (Client.temp.aviations.length < 1) return message.channel.send("There are no pending imports");
		for (veh in Client.temp.aviations) {
			curVeh = Client.temp.aviations[veh];
			txt += `${curVeh.charName} (( ${curVeh.forumName} )) requested a ${curVeh.vehicle} at ${curVeh.timestamp}.\nLink: ${curVeh.vehLink}\n\n`;
		}
		var temp = Client.temp.timestamps.aviations;
		var date = temp.getFullYear()+'-'+(temp.getMonth()+1)+'-'+temp.getDate();
		var time = temp.getHours() + ":" + temp.getMinutes() + ":" + temp.getSeconds();
		txt += `Last Updated: ${date} ${time}`;
		return message.channel.send(F.codeBlokkit(txt, 'asciidoc'));
	}
}

/* row indexes
 * 0 = timestamp
 * 1 = full name
 * 2 = address
 * 3 = forum name
 * 4 = phone
 * 5 = business or personal
 * 6 = link
 * 7 = veh name
 * 8 = location
 * 9 = agreement 1
 * 10 = agreement 2
 */
