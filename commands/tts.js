const Discord = require('discord.js');
const fs = require('fs');
const request = require('request');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
 


module.exports = {
	name: 'Text to Speech',
	help: 'For when you do not have a mic but want to speak in voice chat.',
	func: async (Client, message, args) => {
		var VC = message.member.voice.channel;
		var botVoiceChannels = Client.bot.voice.connections.map(vc => vc.channel);
		var nickname = ((message.member.nickname != null) ? message.member.nickname : message.author.username);
		switch (args[0]) {
			case "join":
				if (args.length == 1) {
					joinVC();
					break;
				}
			case "leave":
				if (args.length == 1) {
					leaveVC();
					break;
				}
			default:
				TTS(message.guild.voice.connection);
		}
		
		async function TTS(connection) {
			if (connection == null) return message.channel.send(`Please use \`${Client.prefix.prefix}tts join\` before sending any TTS commands.`);
			const dispatcher = connection.play(`http://mary.dfki.de:59125/process?INPUT_TEXT=${encodeURI(args.join(' '))}&INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&AUDIO=WAVE_FILE&LOCALE=en_US`);
			dispatcher.on('debug', (info) => console.log(info));
			dispatcher.on('error', (error) => console.log(error));
		}
		
		function joinVC() {
			if (!VC) return message.channel.send("You are not currently in a voice channel.");
			VC.join();
		}
		
		function leaveVC() {
			for (var voice in botVoiceChannels) {
				let curVC = botVoiceChannels[voice];
				if (curVC.guild == message.guild) {
					return curVC.leave();
				}
			}
		}
	}
}
