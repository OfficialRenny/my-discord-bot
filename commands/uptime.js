const Discord = require('discord.js');
module.exports = {
	name: 'Uptime',
	help: 'Shows the bot\'s uptime.',
	func: (Client, message, args) => {
		return message.channel.send(`Current Uptime: ${timeConversion(Client.bot.uptime)}`);
	}
}

function timeConversion(duration) {
	var milliseconds = parseInt((duration % 1000) / 100),
		seconds = parseInt((duration / 1000) % 60),
		minutes = parseInt((duration / (1000 * 60)) % 60),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
