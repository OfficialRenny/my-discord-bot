const Discord = require('discord.js');
const request = require('request');

var cooldown = false;
module.exports = {
	name: 'SMMRY',
	help: 'Summarises an article of your choice.',
	func: (Client, message, args) => {
		if (cooldown) return message.channel.send("Sorry, this command is on cooldown due to SMMRY's API limits.");
		main();
		
		async function main() {
			msgurl = args.shift();
			try {
			var validUrl = await urlTester(msgurl);
			} catch(err) {
				console.log(err);
				validUrl = false;
			}
			if (!validUrl) return message.channel.send("That is not a valid URL.");
			request.get(`https://api.smmry.com/SM_API_KEY=${Client.config.smmry}&SM_WITH_BREAK&SM_URL=${msgurl}`, (error, response, body) => {
				body = JSON.parse(body);
				if (body.sm_api_error > -1) return message.channel.send("There was an error with the link, sorry.");
				if (!error && response.statusCode == 200 && !body.sm_api_error) {
					smmrytxt = "Here is the summary of your linked article:\n```";
					txt = body.sm_api_content.replace(/\[BREAK]\s/g, `\n`).replace("[BREAK]", "\n");
					smmrytxt += txt + "\n```";
					message.channel.send(smmrytxt);
					cooldown = true;
					setTimeout(() => {cooldown = false}, 1000 * 10);
				} else {
					message.channel.send("There was an error with the link, sorry.");
				}
			});
		}
		function urlTester(url) {
		    return new Promise(function (resolve, reject) {
				request.get(url, (error, response, body) => {
					if (!error && response.statusCode == 200) {
					resolve(true);
					} else {
					reject(error);
					}			    
				});
		    });
		}
	}
}
