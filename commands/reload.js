const Discord = require('discord.js');
const V = require('../utils/vars.js');
module.exports = {
	name: 'Reloader',
    help: 'Reload a command.',
    func: (Client, msg, args) => {
        if (V.admins.includes(msg.author.id)){
            if (args.length > 0 && args[0] in Client.commands) {
                Client.load(args[0]);
                msg.channel.send(`Reloaded the ${args[0]} command.`);
            }
            else {
                Client.load();
                msg.channel.send(`Reloaded all of the commands.`);
            }
        }
    }
}
