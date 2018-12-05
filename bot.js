const Discord = require('discord.js');
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const fs = require('fs');
const log4js = require('log4js');
const seedrandom = require('seedrandom');
const config = require('./data/config.json');
const sql = new SQLite('./data/db.sqlite');

var storage = JSON.parse(fs.readFileSync('./data/storage.json', 'utf8'));
const usedActionRecently = new Set();
const adminID = 197376829408018432;
var adminMode = false;

log4js.configure({
	appenders: {
		consoleLogs: {
			type: 'file',
			filename: './data/logs/console.log'
		},
		console: {
			type: 'console'
		}
	},
	categories: {
	default: {
			appenders: ['console', 'consoleLogs'],
			level: 'trace'
		}
	}
});

var logger = log4js.getLogger('default');

var listOfStoreItems = [
	["discord_silver", "silver", "Discord Silver", 500, "https://i.imgur.com/Vt7NLdA.png"],
	["rick_roll", "rick", "Rick Roll", 250, "https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif"],
	["manning_face", "manning", "ManningFace", 100, "https://i.imgur.com/ENPyFSU.jpg"]
];

client.on('ready', async() => {
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

	var arrayOfDBColumns = sql.prepare("PRAGMA table_info(mainDb);").all();
	var allColumns = [];
	var allColumnsValues = [];

	for (i = 0; i < arrayOfDBColumns.length; i++) {
		allColumns.push(arrayOfDBColumns[i].name);
	}

	for (i = 0; i < listOfStoreItems.length; i++) {
		if (!allColumns.includes(listOfStoreItems[i][0])) {
			sql.prepare(`ALTER TABLE mainDb ADD COLUMN ${listOfStoreItems[i][0]} INTEGER DEFAULT 0;`).run();
		}
	}

	for (i = 0; i < allColumns.length; i++) {
		allColumnsValues.push(`@${allColumns[i]}`);
	}

	// And then we have two prepared statements to get and set the score data.
	client.getScore = sql.prepare("SELECT * FROM mainDb WHERE user = ?");
	client.setScore = sql.prepare(`INSERT OR REPLACE INTO mainDb (${allColumns.toString()}) VALUES (${allColumnsValues.toString()});`);

	client.getPrefix = sql.prepare("SELECT * FROM prefixDb WHERE id = ?");
	client.setPrefix = sql.prepare("INSERT OR REPLACE INTO prefixDb (id, prefix) VALUES (@id, @prefix);");

	logger.info('Ready and logged in as ' + client.user.username + '!');
	client.user.setPresence({
		game: {
			name: 'you. ;)',
			type: 'WATCHING'
		}
	})

});

client.on('message', async(message) => {
	if (message.author.bot || !message.guild)
		return;
	logger.trace(`${message.author.username} in "${message.guild.name} - #${message.channel.name}" said - "${message.content}"`);
	var alreadyLevelledUp = false;

	var prefixGet = client.getPrefix.get(message.guild.id);
	if (!prefixGet) {
		logger.info(`Guild ${message.guild.name} does not yet have a prefix, defaulting to ~.`);
		prefixGet = {
			id: `${message.guild.id}`,
			prefix: "~"
		}
		client.setPrefix.run(prefixGet);
		logger.info("Done.");
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
		["mine", "chop", "fish", "hunt", "dig"];
	var listOfActionsAsString = "";

	var dbGet = client.getScore.get(message.author.id);
	var currentTime = Math.floor(Date.now() / 1000);
	if (!dbGet) {
		dbGet = generateDbEntry(message.author);
	}

	for (var word in wordsInMessage) {
		//logger.info(wordsInMessage[word]);
		for (var i = 0; i < listOfCounters.length; i++) {
			if (wordsInMessage[word] == listOfCounters[i][0]) {
				listOfCounters[i][2]++;
			}
		}
	}

	const args = message.content.split(/\s+/g);
	const command = args.shift().slice(prefixGet.prefix.length).toLowerCase();

	if (message.content.indexOf(prefixGet.prefix) !== 0) {
		let randNum = Math.floor(Math.random() * 11);
		dbGet.points++;
		dbGet.currency += randNum;
		dbGet.total_messages_sent++;
		dbGet.last_known_displayName = message.member.displayName;
		client.setScore.run(dbGet);
	} else {
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
					dbGet.points += 2;
					dbGet.currency += randNum;
					message.channel.send(`You used '${actionC}' and gained ${randNum}:money_with_wings:!`);

					usedActionRecently.add(authorIDandAction);
					setTimeout(() => {
						usedActionRecently.delete(authorIDandAction);
					}, 60000 * 2);
					logger.info(`${message.author.username} used ${actionC} and got a score of ${randNum}`);
				} else {
					message.channel.send(`You must wait 2 minutes before using that command again!`);
				}
			} else {
				message.channel.send("Unknown action. Available actions are: " + listOfActionsAsString + ". `SYNTAX: " + prefixGet.prefix + "action [action]`");
			}
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

			dbGet.level = calculateLevel(dbGet.points);
			alreadyLevelledUp = true;
			const pointsForCurrentLevel = calculatePoints(dbGet.level);
			const pointsForNextLevel = calculatePoints(parseInt(dbGet.level) + 1);
			const embed = new Discord.RichEmbed()
				.setTimestamp()
				.setAuthor(usableId.username)
				.setThumbnail(usableId.displayAvatarURL)
				.setDescription(`Here are your stats, ${usableId.username}`)
				.setTitle(`Stats for ${usableId.username}`)
				.addField("Level", Math.floor(dbGet.level), true)
				.addField("XP", dbGet.points, true)
				.addField("Points To Next Level", `${Math.ceil(pointsForNextLevel - pointsForCurrentLevel)}`, true)
				.addField("Currency", dbGet.currency)
				.addField("Inventory", `To see your inventory, please use ${prefixGet.prefix}inv`);
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
			if (args[0].toLowerCase() == null || "help") {
				return message.channel.send(`The current available counters are: ${listOfCountersAsString}`);
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
				return message.channel.send({
					embed
				});
			} else {
				for (var item in listOfStoreItems) {
					if (args[0] == listOfStoreItems[item][1]) {
						if (listOfStoreItems[item][3] <= dbGet.currency) {
							dbGet.points += listOfStoreItems[item][3] / 100;
							dbGet.currency -= listOfStoreItems[item][3];
							dbGet[listOfStoreItems[item][0]]++;
							client.setScore.run(dbGet);
							return message.reply(`thank you for buying a ${listOfStoreItems[item][2]}, your balance is now ${dbGet.currency}:money_with_wings:`);
							break;
						} else {
							return message.reply(`you do not have enough :money_with_wings: to purchase a ${listOfStoreItems[item][2]}.`);
						}
						break;
					}
				}
				return message.reply(`${args[0]} is not a valid item, please check \`${prefixGet.prefix}buy store\` for a list of all items.`);
			}
		}

		if (command == 'give') {
			if (args[0] == 'help') {
				return message.channel.send(`\`SYNTAX: ${prefixGet.prefix}give [item] [user(s)] [amount]\``);
			}
			var channelMembers = message.channel.members.array();
			var channelMembersNoBots = [];
			var channelMembersNoBotsToString = "";
			var mentionedUsers = [];
			var mentionedUsersToString = "";
			var itemsToGive = 0;
			var usersToGiveTo = [];
			var isAnItem = false;

			if (!(message.mentions.users.array() || message.mentions.everyone || message.content.indexOf("@someone") != -1)) {
				return message.reply("you need to mention a user, or use `@someone`!");
			}
			var botGifted = false;
			for (var member in message.mentions.users.array()) {
				if (message.mentions.users.array()[member].id == client.user.id && botGifted == false) {
					message.channel.send("Oh.... no thanks, you can keep it! Continuing with the gifting....");
					botGifted = true;
				}
			}

			for (i = 0; i < listOfStoreItems.length; i++) {
				if (args[0] == listOfStoreItems[i][1]) {
					isAnItem = true;
					break;
				} else {
					isAnItem = false;
				}
			}

			if (!isAnItem)
				return message.reply("this item does not exist or is not able to be given as a gift.");

			for (var member in channelMembers) {
				if (channelMembers[member].user.bot)
					continue;
				if (channelMembers[member].user.id == message.author.id)
					continue;
				channelMembersNoBots.push(channelMembers[member]);
			}
			for (var member in channelMembersNoBots) {
				if (member != channelMembersNoBots.length - 1) {
					channelMembersNoBotsToString += channelMembers[member].username + ", ";
				} else {
					channelMembersNoBotsToString += "and " + channelMembers[member].username;
				}
			}

			for (var member in message.mentions.users.array()) {
				if (message.mentions.users.array()[member].bot)
					continue;
				mentionedUsers.push(message.mentions.users.array()[member]);
			}

			for (var member in mentionedUsers) {
				if (member != mentionedUsers.length - 1) {
					mentionedUsersToString += mentionedUsers[member].username + ", ";
				} else {
					mentionedUsersToString += "and " + mentionedUsers[member].username;
				}
			}

			var randomMember = channelMembersNoBots[Math.floor(Math.random() * channelMembersNoBots.length)].user;

			if (message.mentions.everyone) {
				for (var member in channelMembersNoBots) {
					usersToGiveTo.push(channelMembersNoBots[member].user);
				}
				itemsToGive = usersToGiveTo.length;
			} else if (args[1] == "@someone") {
				usersToGiveTo.push(randomMember);
				itemsToGive = 1;
			} else if (mentionedUsers.length > -1) {
				for (var member in mentionedUsers) {
					if (mentionedUsers[member].bot)
						continue;
					usersToGiveTo.push(mentionedUsers[member]);
				}
				itemsToGive = usersToGiveTo.length;
			}

			if (args[0] == "test") {
				return logger.info(usersToGiveTo);
			}
			var usersToGiveToString = "";
			for (var member in usersToGiveTo) {
				if (usersToGiveTo.length == 1) {
					usersToGiveToString += usersToGiveTo[member].username;
					break;
				}
				if (member != usersToGiveTo.length - 1) {
					usersToGiveToString += usersToGiveTo[member].username + ", ";
				} else {
					usersToGiveToString += "and " + usersToGiveTo[member].username;
				}
			}
			
			if (usersToGiveTo.length == 0)
				return messae.channel.send("No users specified!");
			var itemsToReceive = Math.floor(itemsToGive / (usersToGiveTo.length)) * TryParseInt(wordsInMessage[wordsInMessage.length - 1], 1);
			itemsToGive *= TryParseInt(wordsInMessage[wordsInMessage.length - 1], 1);
			
			for (i = 0; i < listOfStoreItems.length; i++) {
				if (args[0] == listOfStoreItems[i][1]) {
					if (dbGet[listOfStoreItems[i][0]] >= itemsToGive) {
						dbGet[listOfStoreItems[i][0]] -= itemsToGive;
						client.setScore.run(dbGet);
						for (var member in usersToGiveTo) {
							var someoneDBget = client.getScore.get(usersToGiveTo[member].id);
							if (!someoneDBget) {
								someoneDBget = generateDbEntry(usersToGiveTo[member]);
							}
							someoneDBget[listOfStoreItems[i][0]] += itemsToReceive;
							client.setScore.run(someoneDBget);
							logger.info(`User ${message.author.username} gave ${usersToGiveTo[member].username} ${itemsToReceive}x ${listOfStoreItems[i][2]}!`);
						}
						const embed = new Discord.RichEmbed()
							.setTimestamp()
							.setDescription(`${message.author.username} has just gifted ${usersToGiveToString} ${itemsToReceive}x ${listOfStoreItems[i][2]}!`)
							.setTitle(`You have a gift!`)
							.setImage(`${listOfStoreItems[i][4]}`);
						return message.channel.send({
							embed
						});
					} else {
						return message.channel.send(`You do not have enough ${listOfStoreItems[i][2]} to give, why not buy some from the store?`);
					}
				}
			}
			return message.channel.send("You should never be able to see this message....");
		}

		if (command == 'inv') {
			const embed = new Discord.RichEmbed()
				.setTitle(message.author.username)
				.setThumbnail(message.author.displayAvatarURL)
				.setDescription("This is a list of all of your current items.")
				.setFooter(`Your balance is ${dbGet.currency}`)
				.setColor(0x406DA2);
			for (k = 0; k < listOfStoreItems.length; k++) {
				embed.addField(`${listOfStoreItems[k][2]}`, `${dbGet[listOfStoreItems[k][0]]}`, true);
			}
			message.channel.send({
				embed
			});
		}

		if (command == 'initialise' && message.author.id == adminID) {
			const arrayOfMembers = message.guild.members.array();
			var membersString = "";
			for (var guildMemberId in arrayOfMembers) {
				if (arrayOfMembers[guildMemberId].user.bot)
					continue;

				var dbGet = client.getScore.get(arrayOfMembers[guildMemberId].user.id);
				if (!dbGet) {
					dbGet = generateDbEntry(arrayOfMembers[guildMemberId].user);
					client.setScore.run(dbGet);
					membersString += arrayOfMembers[guildMemberId].user.username + '\n';
				}
			}
			if (membersString == "") {
				message.channel.send(`Everyone in ${message.guild.name} already has an entry in the DB!`);
				logger.info(`Everyone in ${message.guild.name} already has an entry in the DB. Skipping....`);
				return;
			}
			return message.channel.send(`Created database entries for users: \`\`\`${membersString}\`\`\``);
		}

		if (command == "admin") {
			adminMode = !adminMode;
			if (adminMode == true) {
				message.channel.send("Admin mode has been enabled!");
			} else {
				message.channel.send("Admin mode has been disabled!");
			}
		}
	}

	if (message.guild.id == 275388903547076610 || 256139176225931264) {

		for (var i = 0; i < wordsInMessage.length; i++) {
			if (wordsInMessage[i].toLowerCase() == "tra") {
				message.channel.startTyping();
				message.channel.send("tra");
				message.channel.stopTyping();
				return;
			}

			if (wordsInMessage[i].toLowerCase() == "ariana") {
				message.channel.startTyping();
				fileName = ariana4mogs(0, message.channel, message.author, message.guild);
				message.channel.send({
					file: fileName
				});
				message.channel.stopTyping();
				return;
			}
			if (wordsInMessage[i].toLowerCase() == "monky") {
				message.channel.startTyping();
				fileName = ariana4mogs(1, message.channel, message.author, message.guild);
				message.channel.send({
					file: fileName
				});
				message.channel.stopTyping();
				return;
			}
		}
	}

	if (message.content.toLowerCase().startsWith('>tfw') || message.content.toLowerCase().startsWith('tfw')) {
		message.channel.send('feels bad man :(')
	}

	if (alreadyLevelledUp == false) {
		dbGet.level = calculateLevel(dbGet.points);
	}

	client.setScore.run(dbGet);

	if (JSON.stringify(cachedStorage) != JSON.stringify(storage)) {
		fs.writeFile('./data/storage.json', JSON.stringify(storage), (err) => {
			if (err)
				logger.error(err)
		});
	}

});

function generateDbEntry(usableId) {
	var currentTime = Math.floor(Date.now() / 1000);
	logger.info(`User ${usableId.username} does not currently have an entry in the DB. Making one now`);
	var returnedDb;
	returnedDb = {
		id: `${usableId.id}_${currentTime}`,
		user: usableId.id,
		last_known_displayName: usableId.username,
		points: 0,
		level: 1,
		currency: 0,
		total_messages_sent: 0,
		discord_silver: 0,
		rick_roll: 0,
		manning_face: 0
	}
	logger.info("Should have created a DB entry for user " + usableId.username);
	return returnedDb;
}

function calculateLevel(points) {
	const currentLevel = 2 * (Math.pow(points, 2 / 3)) - 1;
	return currentLevel;
}
function calculatePoints(level) {
	const currentPoints = Math.pow((level + 1) / 2, 1 / (2 / 3));
	return currentPoints;
}

function TryParseInt(str,defaultValue) {
     var retValue = defaultValue;
     if(str !== null) {
         if(str.length > 0) {
             if (!isNaN(str)) {
                 retValue = parseInt(str);
             }
         }
     }
     return retValue;
}

function ariana4mogs(type, channel, author, guild) {
	var time = new Date().getTime();
	var seed = (author.id * guild.id * time).toString();
	var rng = seedrandom(seed);

	if (type == 0) {
		var path = './data/server-specifics/4mogs/';
		var files = fs.readdirSync(path)
			ranFile = files[Math.floor(rng() * files.length)]
	}
	if (type == 1) {
		var path = './data/server-specifics/bumpics/';
		var files = fs.readdirSync(path)
			ranFile = files[Math.floor(rng() * files.length)]
	}
	logger.info(`Sending a file with the name of ${path + ranFile} to ${channel.name} in ${guild.name}, requested by ${author.username}. Seed: '${seed}'.`);
	return path + ranFile;
}

client.login(config.token);
