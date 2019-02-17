const Discord = require('discord.js');
var eightBallAnswers = [
	"It is decidedly so.",
	"Reply hazy, try again.",
	"Ask again later.",
	"Better not tell you now.",
	"Don't count on it.",
	"Yes.",
	"My sources say no.",
	"Concentrate and ask again.",
	"Most likely.",
	"As I see it, yes.",
	"You may rely on it.",
	"Without a doubt.",
	"Yes - definitely.",
	"Signs point to yes.",
	"My reply is no.",
	"Cannot predict now.",
	"It is certain.",
	"Very doubtful.",
	"Outlook good.",
	"Outlook not so good."];
	
module.exports = {
	name: '8ball',
	help: 'Ask it a question, and it will answer.',
	func: (Client, message, args) => {
		if (args.length == 0) return message.channel.send("Please ask a question.");
		const answer = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
		message.channel.send(answer);
	}
}
