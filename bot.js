const Discord = require('discord.js');
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const fs = require('fs');
const config = require('./data/config.json');
var storage = JSON.parse(fs.readFileSync('./data/storage.json', 'utf8'));
var sql = new SQLite('./data/db.sqlite');
const usedActionRecently = new Set();
const adminID = 197376829408018432;

client.on('ready', function () {
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'mainDb';").get();
	if (!table['count(*)']) {
		// If the table isn't there, create it and setup the database correctly.
		sql.prepare("CREATE TABLE mainDb (id TEXT PRIMARY KEY, user TEXT, last_known_displayName TEXT, points INTEGER, level INTEGER, currency INTEGER, total_messages_sent INTEGER, discord_silver INTEGER);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_mainDb_id ON mainDb (id);").run();
		sql.pragma("synchronous = 1");
	}

	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'prefixDb';").get();
	if (!table['count(*)']) {
		// If the table isn't there, create it and setup the database correctly.
		sql.prepare("CREATE TABLE prefixDb (id TEXT PRIMARY KEY, prefix TEXT);").run();
		// Ensure that the "id" row is always unique and indexed.
		sql.prepare("CREATE UNIQUE INDEX idx_prefixDb_id ON prefixDb (id);").run();
		sql.pragma("synchronous = 1");
	}
	// And then we have two prepared statements to get and set the score data.
	client.getScore = sql.prepare("SELECT * FROM mainDb WHERE user = ?");
	client.setScore = sql.prepare("INSERT OR REPLACE INTO mainDb (id, user, last_known_displayName,  points, level, currency, total_messages_sent, discord_silver) VALUES (@id, @user, @last_known_displayName, @points, @level, @currency, @total_messages_sent, @discord_silver);");

	client.getPrefix = sql.prepare("SELECT * FROM prefixDb WHERE id = ?");
	client.setPrefix = sql.prepare("INSERT OR REPLACE INTO prefixDb (id, prefix) VALUES (@id, @prefix);");

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

client.on('message', async(message) => {

	fs.appendFile(`./data/${message.guild.name}-log.txt`, `${new Date().toUTCString()} - ${message.author.username} - "${message.content}"\n`, (err) => {
		if (err)
			throw err;
	});

	if (message.author.bot || !message.guild)
		return;
	var alreadyLevelledUp = false;

	var prefixGet = client.getPrefix.get(message.guild.id);
	if (!prefixGet) {
		console.log(`Guild ${message.guild.name} does not yet have a prefix, defaulting to ~.`);
		prefixGet = {
			id: `${message.guild.id}`,
			prefix: "~"
		}
		client.setPrefix.run(prefixGet);
		console.log("Done.");
	}

	var wordsInMessage = message.content.split(" ");
	var lul = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "lul");
	var pogchamp = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "pogchamp");
	var cachedStorage = JSON.parse(JSON.stringify(storage));
	var listOfCounters = [
		["lul", lul, storage.counters.luls],
		["pogchamp", pogchamp, storage.counters.pogs]
	];
	var listOfActions =
		["mine", "chop", "fish", "hunt"];
	var listOfActionsAsString = "";

	var dbGet = client.getScore.get(message.author.id);
	var currentTime = Math.floor(Date.now() / 1000);
	if (!dbGet) {
		console.log(`User ${message.member.displayName} does not currently have an entry in the DB. Making one now`);
		dbGet = {
			id: `${message.author.id}_${currentTime}`,
			user: message.author.id,
			last_known_displayName: message.member.displayName,
			points: 0,
			level: 1,
			currency: 0,
			total_messages_sent: 0,
			discord_silver: 1
		}
		console.log("Should have created a DB entry for user " + message.member.displayName);
	}
		
	var silver = dbGet.discord_silver;
	var listOfStoreItems = [
		["discord_silver", "silver", "Discord Silver", 500, "https://i.imgur.com/Vt7NLdA.png"]
	];

	if (!message.content.startsWith(prefixGet.prefix)) {
		var randNum = Math.floor(Math.random() * 11);
		dbGet.points += randNum
		dbGet.currency += randNum
		dbGet.total_messages_sent++
		dbGet.last_known_displayName = message.member.displayName;
	}

	for (var word in wordsInMessage) {
		//console.log(wordsInMessage[word]);
		for (var i = 0; i < listOfCounters.length; i++) {
			if (wordsInMessage[word] == listOfCounters[i][0]) {
				listOfCounters[i][2]++;
			}
		}
	}

	const args = message.content.split(/\s+/g);
	const command = args.shift().slice(prefixGet.prefix.length).toLowerCase();

	if (message.content.indexOf(prefixGet.prefix) !== 0) {}
	else {
		if (command == "action") {
			var actionC = "";
			for (var i = 0; i < listOfActions.length; i++) {
				if (listOfActions[i] == wordsInMessage[1]) {
					actionC = listOfActions[i];
				}
				var actionCs = listOfActions[i];
				if (i != listOfActions.length - 1) {
					listOfActionsAsString += actionCs + ", ";
				} else {
					listOfActionsAsString += actionCs;
				}
			}
			if (actionC != "") {
				var authorIDandAction = `${message.author.id}-${actionC}`;
				var randNum = Math.floor(Math.random() * 101);
				if (!usedActionRecently.has(authorIDandAction)) {
					dbGet.points += randNum;
					dbGet.currency += randNum;
					message.channel.send(`You used '${actionC}' and gained ${randNum}:money_with_wings:!`);

					usedActionRecently.add(authorIDandAction);
					setTimeout(() => {
						usedActionRecently.delete(authorIDandAction);
					}, 60000 * 2);
					console.log(`${message.author.username} used ${actionC} and got a score of ${randNum}`);
				} else {
					message.channel.send(`You must wait 2 minutes before using that command again!`);
				}
			} else {
				message.channel.send("Unknown action. Available actions are: " + listOfActionsAsString + ". `SYNTAX: " + prefixGet.prefix + "action [action]`");
			}
		}

		if (command == 'admin' && message.author.id == adminID) {
			var adminCmds =
				["givepoints", "setpoints", "setlevel", "setcurrency", "givesilver", "setsilver"];
			var validCmd = true;
			var usableId;
			if (!message.mentions.users.first()) {
				usableId = message.author;
			} else {
				usableId = message.mentions.users.first();
			}
			dbGet = client.getScore.get(usableId.id);
			if (!dbGet) {
					dbGet = generateDbEntry(usableId);
				}
			var listOfAdminCmds = "";
			for (var i = 0; i < adminCmds.length; i++) {
				var adminCmdC = adminCmds[i];
				if (i != adminCmds.length - 1) {
					listOfAdminCmds += adminCmdC + ", ";
				} else {
					listOfAdminCmds += adminCmdC;
				}
			}
			if (message.content.match(/\d+/) != null) {
				var firstNumber = message.content.match(/\d+/).shift();
			} else {
				return message.channel.send("Invalid command! List of commands: " + listOfAdminCmds + ". `SYNTAX: " + prefixGet.prefix + "admin [mention, if any] [command] [value]`");
			}
			for (var l = 0; l < args.length; l++) {
				if (args[l] == "givepoints") {
					dbGet.points += parseInt(firstNumber);
					message.channel.send("Giving " + parseInt(firstNumber) + " points to " + usableId.username + ".");
					break;
				} else if (args[l] == "setpoints") {
					dbGet.points = parseInt(firstNumber);
					message.channel.send("Setting points to " + parseInt(firstNumber) + " for " + usableId.username + ".");
					break;
				} else if (args[l] == "setlevel") {
					dbGet.level = parseInt(firstNumber);
					message.channel.send("Setting level to " + parseInt(firstNumber) + " for " + usableId.username + ".");
					break;
				} else if (args[l] == "setcurrency") {
					dbGet.currency = parseInt(firstNumber);
					message.channel.send("Setting :money_with_wings: to " + parseInt(firstNumber) + " for " + usableId.username + ".");
					break;
				} else if (args[l] == "givesilver") {
					dbGet.discord_silver += parseInt(firstNumber);
					message.channel.send("Giving " + parseInt(firstNumber) + " Silver to " + usableId.username + ".");
					break;
				} else if (args[l] == "setsilver") {
					dbGet.discord_silver = parseInt(firstNumber);
					message.channel.send("Setting Silver to " + parseInt(firstNumber) + " for " + usableId.username + ".");
					break;
				}
				message.channel.send("Invalid command! List of commands: " + listOfAdminCmds + ". `SYNTAX: " + prefixGet.prefix + "admin [command] [value] [mention, if any]`");
			}
			var curLevel = dbGet.points / 10;
			dbGet.level = Math.floor(curLevel);
			alreadyLevelledUp = true;
		}

		if (command == 'stats') {
			var usableId;
			if (!message.mentions.users.first()) {
				usableId = message.author;
			} else {
				usableId = message.mentions.users.first();
			}
			dbGet = client.getScore.get(usableId.id);
			if (!dbGet) {
				dbGet = generateDbEntry(usableId);
			}

			var curLevel = dbGet.points / 10;
			dbGet.level = Math.floor(curLevel);
			alreadyLevelledUp = true;

			const embed = new Discord.RichEmbed()
				.setTimestamp()
				.setAuthor(usableId.username)
				.setThumbnail(usableId.displayAvatarURL)
				.setDescription(`Here are your stats, ${usableId.username}`)
				.setTitle(`Stats for ${usableId.username}`)
				.addField("Level", dbGet.level, true)
				.addField("XP", dbGet.points, true)
				.addField("XP to next level", 10 - (dbGet.points - (Math.floor(curLevel) * 10)), true)
				.addField("Currency", dbGet.currency)
				.addField("Discord Silver", dbGet.discord_silver);
			message.channel.send({
				embed
			});

		}

		if (command == 'count') {
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

		if (command == 'setprefix') {
			prefixGet.prefix = args[0];
			client.setPrefix.run(prefixGet);
			message.channel.send(`Successfully changed the prefix to \`${prefixGet.prefix}\``);
		}

		if (command == 'getprefix') {
			message.channel.send(`The prefix for this server is \`${prefixGet.prefix}\``);
		}

		if (command == 'defaultdance') {
			message.channel.send('*pulls both arms outwards in front of his chest and pumps them behind his back, then repeats this motion in a smaller range of motion down to his hips two times once more all while sliding his legs in a faux walking motion, claps his hands together in front of him while both his knees knock together, pumps his arms downward, pronating his wrists and abducting his fingers outward while crossing his legs back and forth, then repeats this motion again two times while keeping his shoulders low and hunching over, then does a finger gun with right hand with left hand bent on his hip while looking directly forward and putting his left leg forward then crossing his arms and leaning back a little while bending his knees at an angle.*');
		}

		if (command == 'buy') {
			var k;

			if (args[0] == 'store') {
				const embed = new Discord.RichEmbed()
					.setTitle("Store")
					.setThumbnail(message.author.displayAvatarURL)
					.setDescription("Welcome to the store, spend your :money_with_wings: here!")
					.setFooter(`Your balance is ${dbGet.currency}`)
					.setColor(0x406DA2);
				for (k = 0; k < listOfStoreItems.length; k++) {
					embed.addField(`${listOfStoreItems[k][2]} - ${prefixGet.prefix}buy ${listOfStoreItems[k][1]}`, `${listOfStoreItems[k][3]}:money_with_wings:`);
				}
				message.channel.send({
					embed
				});
			} else {
				for (k = 0; k < listOfStoreItems.length; k++) {
					if (args[0] == listOfStoreItems[k][1]) {
						if ((listOfStoreItems[k][3] - 1) < dbGet.currency) {
							dbGet.currency -= listOfStoreItems[k][3];
							dbGet[listOfStoreItems[k][0]]++;
							message.reply(`thank you for buying a ${listOfStoreItems[k][2]}, your balance is now ${dbGet.currency}:money_with_wings:`);
						} else {
							message.reply(`you do not have enough :money_with_wings: to purchase a ${listOfStoreItems[k][2]}.`);
						}
						break;
					} else {
						message.reply(`${args[0]} is not a valid item, please check \`${prefixGet.prefix}buy store\` for a list of all items.`);
					}
				}
			}
		}

		if (command == 'give-silver') {
			if (!message.mentions.users.first())
				return message.channel.send("You need to mention a user!");

			if (dbGet.discord_silver > 0) {
				dbGet.discord_silver--;
				client.setScore.run(dbGet);
				usableId = message.mentions.users.first();
				dbGet = client.getScore.get(usableId.id);
				if (!dbGet) {
					dbGet = generateDbEntry(usableId);
				}
				dbGet.discord_silver++;
				client.setScore.run(dbGet);
				const embed = new Discord.RichEmbed()
					.setTimestamp()
					.setAuthor(usableId.username)
					.setDescription(`${message.mentions.users.first().username}, ${message.author.username} has just gifted you Discord Silver!`)
					.setTitle(`You have a gift!`)
					.setImage("https://i.imgur.com/Vt7NLdA.png");
				message.channel.send({embed});
			} else {
				return message.channel.send("You do not have any silver to give, why not buy some from the store?");
			}
		}
	}

	if (message.content.toLowerCase().startsWith('>tfw') || message.content.toLowerCase().startsWith('tfw')) {
		message.channel.send('feels bad man :(')
	}

	if (alreadyLevelledUp == false) {
		dbGet.level = Math.floor(dbGet.points / 10);
	}

	client.setScore.run(dbGet);

	if (JSON.stringify(cachedStorage) != JSON.stringify(storage)) {
		fs.writeFile('./storage.json', JSON.stringify(storage), (err) => {
			if (err)
				console.error(err)
		});
	}

});

function generateDbEntry (usableId) {
		var currentTime = Math.floor(Date.now() / 1000);
				console.log(`User ${usableId.username} does not currently have an entry in the DB. Making one now`);
				var returnedDb;
				returnedDb = {
					id: `${usableId.id}_${currentTime}`,
					user: usableId.id,
					last_known_displayName: usableId.username,
					points: 0,
					level: 1,
					currency: 0,
					total_messages_sent: 0,
					discord_silver: 1
				}
				console.log("Should have created a DB entry for user " + usableId.username);
			return returnedDb;
}

client.login(config.token);
