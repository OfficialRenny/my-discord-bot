const Discord = require('discord.js');
const fs = require('fs');
const {google} = require('googleapis');

module.exports = {
	name: 'Dinoco Exotics Checker',
	help: 'Fetches a list of pending Exotic imports.',
	servers: ['275388903547076610', '256139176225931264'],
	func: (Client, message, args) => {
		message.channel.startTyping();
		message.channel.send('Be patient, this takes some time....').then((msg) => {
			Client.temp.sheets.spreadsheets.get({
				spreadsheetId: '1pDAGbdSjALnWs2l2CSOjRxliatNHiaIAxTPjYl1iSzI',
				ranges: 'Responses',
				includeGridData: true
			}, (err, res) => {
				if (err) {
					console.log('The API returned an error: ' + err);
					return msg.edit("There was some error...");
				}
				const rows = res.data.sheets[0].data[0].rowData;
				if (rows) {
					i = 0;
					let txt = "Pending Exotic Imports:\n";
					for (var r in rows) {
						curRow = rows[r].values;
						if (!(curRow[0].effectiveValue)) continue;
						cellColor = curRow[0].effectiveFormat.backgroundColor;
						if (!(cellColor.red == 1 && cellColor.green == 1 && cellColor.blue == 1)) continue;
						//console.log(curRow);
						let timestamp = curRow[0].formattedValue;
						let charName = curRow[1].formattedValue;
						let forumName = curRow[3].formattedValue;
						let vehicle = curRow[7].formattedValue;
						let vehLink = curRow[6].formattedValue;
						txt += `${charName} (( ${forumName} )) requested a ${vehicle} at ${timestamp}.\nLink: ${vehLink}\n\n`;
						i++;
					}
					if (i < 1) {
						msg.edit('There are currently no pending Exotics requests.');
					} else {
						msg.edit('```' + msg + '```');
					}
					message.channel.stopTyping();
				} else {
					msg.edit("Something fucked up, send the commands again.");
					message.channel.stopTyping();
				}
			});
		});
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
