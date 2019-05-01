const Discord = require('discord.js');
const ytSearch = require('youtube-search');


var opts = {
	maxResults: 10,
	key: Client.config.GoogleApiKey
};

module.exports = {
	name: 'Rich Presence to YouTube',
	help: 'Converts whatever you\'re listening to through something like Spotify into a YouTube link.',
	func: (Client, message, args) => {
			var mentionedUser = message.mentions.users.first();
			if (!mentionedUser)
				mentionedUser = message.author;
			if (mentionedUser.bot)
				return message.channel.send("That is a bot...");
			if (!mentionedUser.presence.game)
				return message.channel.send("This user is not listening to anything.");
			if (!mentionedUser.presence.game.details || !mentionedUser.presence.game.state)
				return message.channel.send(`Unable to find music for User ${mentionedUser.username}.`);
			ytSearch(`${mentionedUser.presence.game.details} - ${mentionedUser.presence.game.state}`, opts, function (err, results) {
				if (err)
					return console.log(err);
				if (results.length == 0)
					return message.channel.send("No results found for user.");
				message.channel.send(results[0].link);
				console.log(`User ${message.author.username} requested ${mentionedUser.username}'s song which has the URL of ${results[0].link}`);
			});
	}
}
