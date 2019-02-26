const Discord = require('discord.js');
const f = require('../utils/functions.js');
const v = require('../utils/vars.js');
module.exports = {
	name: 'Poll',
	help: 'Make a quick poll, supports yes/no questions and questions with upto 10 choices.',
	func: (Client, message, args) => {
			if (args.length < 1) return message.channel.send("Please ask a question.");
			var numOfResponses = f.TryParseInt(args.shift(), 0);
			var arrayOfNums = [ "0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
			if (numOfResponses == 0) {
				return message.react('✅').then(message.react('❎'));
			}
			function multiResponse(num, msg) {
				var multiResponseFunc = function(curNum) {
					msg.react(`${arrayOfNums[curNum]}`)
						.then(() => {
						if (curNum < num) {
							multiResponseFunc(curNum + 1);
						} else return v.logger.info(`${msg.author.username} made a poll with ${curNum} responses!`);
					});
				}
				multiResponseFunc(1);
			}
			if (numOfResponses > 0 && numOfResponses < 11) {
				multiResponse(numOfResponses, message);
			} else {
				message.react('✅').then(() => {
					message.react('❎');
					});
				return;
			}
	}
}
