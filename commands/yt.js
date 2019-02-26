const Discord = require('discord.js');
const ytSearch = require('youtube-search');
const V = require('../utils/vars.js');

var opts = {
	maxResults: 10,
	key: Client.config.GoogleApiKey
};

module.exports = {
		name: 'Youtube Search',
		help: 'Searches for a YouTube video or playlist.',
		func: (Client, message, args) => {
			ytSearch(args.join(' '), opts, function (err, results) {
				if (err)
					return V.logger.error(err);
				if (results.length == 0)
					return message.channel.send("No results found.");
				message.channel.send(results[0].link);
				V.logger.info(`User ${message.author.username} requested a video with the URL of ${results[0].link}`);
			});
		}
}
