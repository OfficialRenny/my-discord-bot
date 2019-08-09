const Discord = require('discord.js');
module.exports = {
    name: 'Invite Link',
    help: 'Invitw Link for the bot.',
    func: (Client, msg, args) => {
        return msg.channel.send('Invite Link: https://discordapp.com/api/oauth2/authorize?client_id=423980168671920138&permissions=1580727634&scope=bot');
    }
}
