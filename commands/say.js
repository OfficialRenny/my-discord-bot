const Discord = require('discord.js');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
 


module.exports = {
	name: 'Say',
	help: 'Tells the bot to say something.',
	func: async (Client, message, args) => {
		var toSay = args.join(' ');
		message.channel.send(toSay).then((msg) => message.delete());
	}
}
