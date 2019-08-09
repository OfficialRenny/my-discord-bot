const Discord = require('discord.js');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
 
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:;'@#~[]{}-=_+/?.>,<|¬!£$%^&*()";

module.exports = {
	name: 'Rand',
	help: 'Random String Generator',
	func: async (Client, message, args) => {
		var length = F.TryParseInt(args.shift(), 0);
		var randString = '';
		if (length > 0) {
			for (i = 0; i < length; i++) {
				randString += chars.charAt(Math.floor(Math.random() * chars.length));
			}
		} else {
			for (i = 0; i < 32; i++) {
				randString += chars.charAt(Math.floor(Math.random() * chars.length));
			}
		}
		
		message.channel.send(`\`\`\`${randString}\`\`\``);
	}
}
