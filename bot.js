const Discord = require('discord.js');
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const fs = require('fs');
const config = require('./config.json');
var storage = JSON.parse(fs.readFileSync('./storage.json', 'utf8'));
var sql = new SQLite('./db.sqlite');

client.on('ready', function () {
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'mainDb';").get();
	if (!table['count(*)']) {
		// If the table isn't there, create it and setup the database correctly.
		sql.prepare("CREATE TABLE mainDb (id TEXT PRIMARY KEY, user TEXT, points INTEGER, level INTEGER, currency INTEGER, total_messages_sent INTEGER);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_mainDb_id ON mainDb (id);").run();
		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");
	}
	// And then we have two prepared statements to get and set the score data.
	client.getScore = sql.prepare("SELECT * FROM mainDb WHERE user = ?");
	client.setScore = sql.prepare("INSERT OR REPLACE INTO mainDb (id, user, points, level, currency, total_messages_sent) VALUES (@id, @user, @points, @level, @currency, @total_messages_sent);");

	console.log('Ready and logged in as ' + client.user.username + '!');
});

client.on('warn', warn => {
	console.log(info);
});

client.on('message', message => {
	if (message.author.bot)
		return;
	var dbGet = client.getScore.get(message.author.id);
	currentTime = Math.floor(Date.now() / 1000);
	if (!dbGet) {
		console.log(`User ${message.member.displayName} does not currently have an entry in the DB. Making one now`);
		dbGet = {
			id: `${message.author.id}_${currentTime}`,
			user: message.author.id,
			points: 0,
			level: 1,
			currency: 0,
			total_messages_sent: 0
		}
		console.log("Should have created a DB entry for user " + message.member.displayName);
	}
	dbGet.points++
	dbGet.currency++
	dbGet.total_messages_sent++
	
	var curLevel = Math.floor(0.1 * Math.sqrt(dbGet.points));
	var lul = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "lul");
	var pogchamp = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "pogchamp");
	var cachedStorage = JSON.parse(JSON.stringify(storage));
	var listOfCounters = [
		["lul", lul, storage.counters.luls],
		["pogchamp", pogchamp, storage.counters.pogs],
	];
	var wordsInMessage = message.content.split(" ");

	if (message.content.toLowerCase().startsWith(config.prefix + 'admin') && message.author.id == 197376829408018432) {
		if (wordsInMessage[1] == "givepoints"){
			dbGet.points += parseInt(wordsInMessage[2]);
		} else {
			message.channel.send("Invalid arguments!");
		}
	}
	
	if (message.content.toLowerCase().startsWith(config.prefix + 'stats')){
		message.channel.send(`You currently have ${dbGet.points} and are Level ${dbGet.level}!`);
	}
	
	for (var word in wordsInMessage) {
		//console.log(wordsInMessage[word]);
		for (var i = 0; i < listOfCounters.length; i++) {
			if (wordsInMessage[word] == listOfCounters[i][0]) {
				listOfCounters[i][2]++;
			}
		}
	}

	if (message.content.toLowerCase().startsWith(config.prefix + 'count')) {
		var wordsInMessage = message.content.split(" ");
		var listOfCountersAsString = "";
		for (var i = 0; i < listOfCounters.length; i++) {
			var counter = listOfCounters[i][0];
			if (i != listOfCounters.length - 1) {
				listOfCountersAsString += counter.toString() + ", ";
			} else {
				listOfCountersAsString += counter.toString();
			}
		}
		if (wordsInMessage[1] == null)
			return;
		if (wordsInMessage[1].toLowerCase() == "help") {
			message.channel.send(`The current available counters are: ${listOfCountersAsString}`);
		} else {
			for (var i = 0; i < listOfCounters.length; i++) {
				var counterString = listOfCounters[i][0];
				var counterEmoji = listOfCounters[i][1];
				var counterStorage = listOfCounters[i][2];
				if (wordsInMessage[1] == counterString || wordsInMessage[1] == counterEmoji) {
					if (counterEmoji == null) {
						message.channel.send("This guild does not have an emoji with the name of \"" + counterString + "\", therefore you cannot view the counts of it here.");
					} else {
						message.channel.send("There have been a total number of " + counterStorage + " " + counterEmoji + "'s sent since the creation of this feature was implemented.");
						break;
					}
				}
			}
		}
	}

	if (message.content.toLowerCase().startsWith(config.prefix + 'defaultdance')) {
		message.channel.send('*pulls both arms outwards in front of his chest and pumps them behind his back, then repeats this motion in a smaller range of motion down to his hips two times once more all while sliding his legs in a faux walking motion, claps his hands together in front of him while both his knees knock together, pumps his arms downward, pronating his wrists and abducting his fingers outward while crossing his legs back and forth, then repeats this motion again two times while keeping his shoulders low and hunching over, then does a finger gun with right hand with left hand bent on his hip while looking directly forward and putting his left leg forward then crossing his arms and leaning back a little while bending his knees at an angle.*');
	}

	if (message.content.toLowerCase().startsWith('>tfw') || message.content.toLowerCase().startsWith('tfw')) {
		message.channel.send('feels bad man :(')
	}
	
	if (dbGet.level < curLevel) {
		dbGet.level++
		message.reply(`Well done you leveled up! You are now Level ${dbGet.level} with ${dbGet.points} points!`);
	}
	
	client.setScore.run(dbGet);

	if (JSON.stringify(cachedStorage) != JSON.stringify(storage)) {
		fs.writeFile('./storage.json', JSON.stringify(storage), (err) => {
			if (err)
				console.error(err)
		});
	}
});

client.login(config.token);
