const Discord = require('discord.js');
const fs = require('fs');
const {google} = require('googleapis');

module.exports = {
	name: 'Dinoco Imports Checker',
	help: 'Fetches a list of pending Aviation imports.',
	servers: ['275388903547076610', '256139176225931264'],
	func: async (Client, message, args) => {
		message.channel.send('Be patient, this takes some time....').then((msg) => {
			try {
				Client.temp.sheets.spreadsheets.get({
					spreadsheetId: '1I0pP7DMrV_QprEWmnJrhMPEonQ4Ky3a7Plv_SBsyrfY',
					ranges: 'FORM RESPONSES!A2:K300',
					includeGridData: true
				}, (err, res) => {
					if (err) {
						console.log('The API returned an error: ' + err);
						return msg.edit("There was some error...");
					}
					const rows = res.data.sheets[0].data[0].rowData;
					if (rows) {
						i = 0;
						let txt = "Pending Aviations Imports:\n";
						for (var r in rows) {
							curRow = rows[r].values;
							if (!(curRow[0].effectiveValue)) continue;
							cellColor = curRow[0].effectiveFormat.backgroundColor;
							if (!(cellColor.red == 1 && cellColor.green == 1 && cellColor.blue == 1)) continue;
							let timestamp = curRow[0].formattedValue;
							let charName = curRow[1].formattedValue;
							let forumName = curRow[3].formattedValue;
							let vehicle = curRow[7].formattedValue;
							let vehLink = curRow[6].formattedValue;
							txt += `${charName} (( ${forumName} )) requested a ${vehicle} at ${timestamp}.\n\n`;
							i++;
						}
						if (i < 1) {
							msg.edit('There are currently no pending Aviations requests.');
						} else {
							msg.edit('```' + txt + '```');
						}
					} else {
						msg.edit("Something fucked up, send the commands again.");
					}
				});
			} catch (e) {
				msg.edit('There was some error.');
			}
		});
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
