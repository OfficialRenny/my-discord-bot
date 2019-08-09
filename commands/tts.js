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
				var speechURL = await urlTester(args[0]);
				if (speechURL) { 
					TTS(message.guild.voice, speechURL);
				} else {
					TTS(message.guild.voice, args.join(' '));
				}
		}
		
		async function TTS(voice, text) {
			try {
				if (!voice || !voice.connection) return message.channel.send(`Please use \`${Client.prefix.prefix}tts join\` before sending any TTS commands.`);
				var speech = text.replace(/&/g, 'and').replace(/\n/g, ' ');
				//const dispatcher = voice.connection.play(`https://talk.moustacheminer.com/api/gen.wav?dectalk=${encodeURI(speech)}`);
				//const dispatcher = voice.connection.play(`http://mary.dfki.de:59125/process?INPUT_TEXT=${encodeURI(args.join(' '))}&INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&AUDIO=WAVE_FILE&LOCALE=en_US`);
				const dispatcher = voice.connection.play(`http://192.168.1.10/dec/api/say/${encodeURI(text)}`);
				dispatcher.on('debug', (info) => console.log(info));
				dispatcher.on('error', (error) => console.log(error));
			} catch (e) {
				console.log(e);
				return message.channel.send("There was some error with that command.");
			}
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
		
		function urlTester(url) {
		    return new Promise(function (resolve, reject) {
					request.get(url, (error, response, body) => {
						if (!error && response.statusCode == 200 && response.headers['content-type'].includes('text/plain')) {
							resolve(body);
						} else {
							resolve(false);
						}			    
					});
		    });
		}
	}
}
