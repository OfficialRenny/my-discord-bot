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
		if (!args[0]) args[0] = 'yote this is just for a test';
		switch (args[0].toLowerCase()) {
			case 'subscribe':
			case 'sub':
			case '+':
				subscribe();
				//console.log(Client.temp.rp2ytSubbed);
				break;
			case 'unsubscribe':
			case 'unsub':
			case '-':
				unsubscribe();
				//console.log(Client.temp.rp2ytSubbed);
				break;
			default:
				rp2yt();
		}
		
		function subscribe() {
			for (sub of Client.temp.rp2ytSubbed) {
				if (sub.user.id == message.author.id && sub.channel.id == message.channel.id) return message.channel.send("You have already subscribed your rich presence activity to this channel!");
			}
			Client.temp.rp2ytSubbed.push(new Subscription(message.author, message.channel));
			message.channel.send("Subscribed your rich presence activity to this channel!");
		}
		
		function unsubscribe() {
			for (var [i, sub] of Client.temp.rp2ytSubbed.entries()) {
				if (sub.user.id == message.author.id && sub.channel.id == message.channel.id) {
					Client.temp.rp2ytSubbed.splice(i, 1);
					return message.channel.send("Unsubscribed your rich presence activity from this channel.");
				}
			}
			return message.channel.send("Either I couldn't find your subscription or you haven't subscribed your rich presence activity to this channel.");
		}
		
		function Subscription(user, channel) {
			this.user = user;
			this.channel = channel;
			this.songs = [];
		}
			
		function rp2yt() {
			var mentionedUser = message.mentions.users.first();
			if (!mentionedUser)
				mentionedUser = message.author;
			if (mentionedUser.bot)
				return message.channel.send("That is a bot...");
			if (!mentionedUser.presence.activity)
				return message.channel.send("This user is not listening to anything.");
			if (!mentionedUser.presence.activity.details || !mentionedUser.presence.activity.state)
				return message.channel.send(`Unable to find music for User ${mentionedUser.username}.`);
			ytSearch(`${mentionedUser.presence.activity.details} - ${mentionedUser.presence.activity.state}`, opts, function (err, results) {
				if (err)
					message.channel.send("Sorry, there was an error.");
					return console.log(err);
				if (results.length == 0)
					return message.channel.send("No results found for user.");
				message.channel.send(results[0].link);
				console.log(`User ${message.author.username} requested ${mentionedUser.username}'s song which has the URL of ${results[0].link}`);
			});
		}
	}
}
