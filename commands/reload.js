const Discord = require('discord.js');
module.exports = {
	name: 'Reloader',
    help: 'Reload the command',
    func: (Client, msg, args) => {
        if (args.length > 0) Client.load(args[0]);
        else Client.load();
    }
}
