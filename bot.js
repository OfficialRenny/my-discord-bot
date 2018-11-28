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
		sql.prepare("CREATE TABLE mainDb (id TEXT PRIMARY KEY, user TEXT, last_known_displayName TEXT, points INTEGER, level INTEGER, currency INTEGER, total_messages_sent INTEGER);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_mainDb_id ON mainDb (id);").run();
		sql.pragma("synchronous = 1");
	}
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'cooldownDb';").get();
	if (!table['count(*)']) {
		// If the table isn't there, create it and setup the database correctly.
		sql.prepare("CREATE TABLE cooldownDb (id TEXT PRIMARY KEY, user TEXT, command TEXT, lastUsed INTEGER);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_cooldownDb_id ON cooldownDb (id);").run();
		sql.pragma("synchronous = 1");
	}
	// And then we have two prepared statements to get and set the score data.
	client.getScore = sql.prepare("SELECT * FROM mainDb WHERE user = ?");
	client.setScore = sql.prepare("INSERT OR REPLACE INTO mainDb (id, user, last_known_displayName,  points, level, currency, total_messages_sent) VALUES (@id, @user, @last_known_displayName, @points, @level, @currency, @total_messages_sent);");
	client.getCooldown = sql.prepare("SELECT * FROM cooldownDb WHERE user = ? AND command = ?;");
	client.setCooldown = sql.prepare("INSERT OR REPLACE INTO cooldownDb (id, user, command, lastUsed) VALUES (NULL, @user, @command, @lastUsed);");

	console.log('Ready and logged in as ' + client.user.username + '!');
	client.user.setPresence({
		game: {
			name: 'you. ;)',
			type: 'WATCHING'
		}
	})
});

client.on('warn', warn => {
	console.log(info);
});

client.on('message', message => {
	if (message.author.bot)
		return;
	var wordsInMessage = message.content.split(" ");
	var lul = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "lul");
	var pogchamp = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "pogchamp");
	var cachedStorage = JSON.parse(JSON.stringify(storage));
	var listOfCounters = [
		["lul", lul, storage.counters.luls],
		["pogchamp", pogchamp, storage.counters.pogs],
	];
	var listOfActions = [
		["mine", "chop", "fish", "hunt"],
	];
	var listOfActionsAsString = "";
	
	var dbGet = client.getScore.get(message.author.id);
	currentTime = Math.floor(Date.now() / 1000);
	if (!dbGet) {
		console.log(`User ${message.member.displayName} does not currently have an entry in the DB. Making one now`);
		dbGet = {
			id: `${message.author.id}_${currentTime}`,
			user: message.author.id,
			last_known_displayName: message.member.displayName,
			points: 0,
			level: 1,
			currency: 0,
			total_messages_sent: 0
		}
		console.log("Should have created a DB entry for user " + message.member.displayName);
	}

	if (!message.content.startsWith(config.prefix)) {
		var randNum = Math.floor(Math.random() * 11);
		dbGet.points += randNum
		dbGet.currency += randNum
		dbGet.total_messages_sent++
		dbGet.last_known_displayName = message.member.displayName;
	}

	if (message.content.toLowerCase().startsWith(config.prefix + "action")) {
		var actionC = "";
		for (var i = 0; i < listOfActions[0].length; i++) {
			if (listOfActions[0][i] == wordsInMessage[1]) {
				actionC = listOfActions[0][i];
			}
			var actionCs = listOfActions[0][i];
			if (i != listOfActions.length - 1) {
				listOfCountersAsString += actionCs + ", ";
			} else {
				listOfCountersAsString += actionCs;
			}
		}
		if (actionC != "") {
			var cooldownGet = client.getCooldown.get(message.author.id, actionC);
			if (!cooldownGet) {
				console.log(`User ${message.member.displayName} does not currently have an entry in the Cooldown DB. Making one now`);
				cooldownGet = {
					id: `${message.author.id}_${currentTime}`,
					user: message.author.id,
					command: `${actionC}`,
					lastUsed: `${currentTime}`
				}
				console.log("Should have created a Cooldown DB entry for user " + message.member.displayName);
			}
			var randNum = Math.floor(Math.random() * 101);
			if (cooldownGet.lastUsed < currentTime + 300 || cooldownGet.lastUsed == null) {
				dbGet.points += randNum;
				dbGet.currency += randNum;
				cooldownGet.lastUsed = currentTime;
				message.channel.send(`You used '${actionC}' and gained ${randNum} points!`);

			} else {
				message.channel.send(`You must wait ${cooldownGet.lastUsed - currentTime} seconds before using that command again!`);
			}
			client.setCooldown.run(cooldownGet);
		} else {
			message.channel.send("Unknown action. Available actions are: " + listOfActionsAsString + ". `SYNTAX: " + config.prefix + "action [action]`");
		}
	}

	if (message.content.toLowerCase().startsWith(config.prefix + 'admin') && message.author.id == 197376829408018432) {
		dbGet = client.getScore.get(message.mentions.users.first().id);
		if (!dbGet) {
			console.log(`User ${message.mentions.users.first().displayName} does not currently have an entry in the DB. Making one now`);
			dbGet = {
				id: `${message.mentions.users.first().id}_${currentTime}`,
				user: message.mentions.users.first().id,
				last_known_displayName: message.mentions.users.first().displayName,
				points: 0,
				level: 1,
				currency: 0,
				total_messages_sent: 0
			}
			console.log("Should have created a DB entry for user " + message.mentions.users.first().displayName);
		}
		if (wordsInMessage[2] == "givepoints") {
			dbGet.points += parseInt(wordsInMessage[3]);
		} else if (wordsInMessage[2] == "setpoints") {
			dbGet.points = parseInt(wordsInMessage[3]);
		} else if (wordsInMessage[2] == "setlevel") {
			dbGet.level = parseInt(wordsInMessage[3]);
		} else {
			message.channel.send("Invalid arguments!");
		}
	}
	var curLevel = dbGet.points / 10;
	if (message.content.toLowerCase().startsWith(config.prefix + 'stats')) {
		message.channel.send(`You currently have ${dbGet.points} points and are Level ${dbGet.level}!`);
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
		//message.react("🌟");
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
