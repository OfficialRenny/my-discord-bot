const Discord = require('discord.js');
module.exports = {
	name: 'Source',
    help: 'Links the bot\'s source.',
    func: (Client, msg, args) => {
        return msg.channel.send('Source: https://github.com/OfficialRenny/my-discord-bot/');
    }
}
