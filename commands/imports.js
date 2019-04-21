const Discord = require('discord.js');
const fs = require('fs');
const {google} = require('googleapis');

module.exports = {
	name: 'Dinoco Imports Checker',
	help: 'Fetches a list of pending General imports.',	
	servers: ['275388903547076610', '256139176225931264'],
	func: (Client, message, args) => {
		message.channel.startTyping();
		message.channel.send('Be patient, this takes some time....').then((msg) => {
			Client.temp.sheets.spreadsheets.get({
				spreadsheetId: '1__oeLjgRicHRb8WKPxJe6tgU6dMHotPXfc-M7InAi80',
				ranges: 'Responses!A1000:M2253',
				includeGridData: true
			}, (err, res) => {
				if (err) {
					console.log('The API returned an error: ' + err);
					return msg.edit("There was some error...");
				}
				const rows = res.data.sheets[0].data[0].rowData;
				if (rows) {
					i = 0;
					let txt = "Pending General Imports:\n";
					for (var r in rows) {
						curRow = rows[r].values;
						if (!(curRow[0].effectiveValue)) continue;
						cellColor = curRow[0].effectiveFormat.backgroundColor;
						if (!(cellColor.red == 1 && cellColor.green == 1 && cellColor.blue == 1)) continue;
						let timestamp = curRow[0].formattedValue;
						let charName = curRow[1].formattedValue;
						let forumName = curRow[2].formattedValue;
						let vehicle = curRow[7].formattedValue;
						let vehLink = curRow[6].formattedValue;
						txt += `${charName} (( ${forumName} )) requested a ${vehicle} at ${timestamp}.\nLink: ${vehLink}\n\n`;
						i++;
					}
					if (i < 1) {
						msg.edit('There are currently no pending General requests.');
					} else {
						msg.edit('```' + txt + '```');
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
