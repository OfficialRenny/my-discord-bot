const Discord = require('discord.js');
const _b = new Discord.Client();
const SQLite = require("better-sqlite3");
const fs = require('fs');
const log4js = require('log4js');
const seedrandom = require('seedrandom');
const sql = new SQLite('./data/db.sqlite');
const F = require('./utils/functions.js');
const V = require('./utils/vars.js');
const adminID = ['197376829408018432', '108875959628795904'];
var userThatIsOnlyReferencedOnce;

Client = {
    config: require('./data/config.json'),
    bot: _b,
    temp: 	{

			}
}

log4js.configure({
	appenders: {
		consoleLogs: {
			type: 'file',
			filename: './data/logs/console.log',
			maxLogSize: 256000
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

let commandsList = fs.readdirSync('./commands/');
Client.commands = {};
for (i = 0; i < commandsList.length; i++) {
    let item = commandsList[i];
    if (item.match(/\.js$/)) {
        delete require.cache[require.resolve(`./commands/${item}`)];
        Client.commands[item.slice(0, -3)] = require(`./commands/${item}`);
    }
}

Client.load = (command) => {
    let commandsList = fs.readdirSync('./commands/');
    if (command) {
        if (commandsList.indexOf(`${command}.js`) >= 0) {
            delete require.cache[require.resolve(`./commands/${command}`)];
            Client.commands[command] = require(`./commands/${command}`);
        }
    } else {
        Client.commands = {};
        for (i = 0; i < commandsList.length; i++) {
            let item = commandsList[i];
            if (item.match(/\.js$/)) {
                delete require.cache[require.resolve(`./commands/${item}`)];
                Client.commands[item.slice(0, -3)] = require(`./commands/${item}`);
            }
        }
    }
}
Client.load();

Client.bot.on('ready', async() => {
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'mainDb';").get();
	if (!table['count(*)']) {
		sql.prepare("CREATE TABLE mainDb (id TEXT PRIMARY KEY, user TEXT, last_known_displayName TEXT, points INTEGER, level INTEGER, currency INTEGER, total_messages_sent INTEGER, discord_silver INTEGER);").run();
		sql.prepare("CREATE UNIQUE INDEX idx_mainDb_id ON mainDb (id);").run();
		sql.pragma("synchronous = 1");
	}
	
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'prefixDb';").get();
	if (!table['count(*)']) {
		sql.prepare("CREATE TABLE prefixDb (id TEXT PRIMARY KEY, prefix TEXT);").run();
		sql.prepare("CREATE UNIQUE INDEX idx_prefixDb_id ON prefixDb (id);").run();
		sql.pragma("synchronous = 1");
	}
	
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'd3CharDb';").get();
	if (!table['count(*)']) {
		sql.prepare("CREATE TABLE d3CharDb (id TEXT PRIMARY KEY, charName TEXT, class TEXT, head TEXT, torso TEXT, shoulders TEXT, arms TEXT, bracers TEXT, pants TEXT, boots TEXT, primary_hand TEXT, off_hand TEXT, ring_1 TEXT, ring_2 TEXT, amulet TEXT, legendary_gems TEXT, cube_armor TEXT, cube_weapon TEXT, cube_ring TEXT);").run();
		sql.prepare("CREATE UNIQUE INDEX idx_d3CharDb_id ON d3CharDb (id);").run();
		sql.pragma("synchronous = 1");
	}

	var arrayOfDBColumns = sql.prepare("PRAGMA table_info(mainDb);").all();
	var allColumns = [];
	var allColumnsValues = [];

	for (i = 0; i < arrayOfDBColumns.length; i++) {
		allColumns.push(arrayOfDBColumns[i].name);
	}

	for (i = 0; i < V.listOfStoreItems.length; i++) {
		if (!allColumns.includes(V.listOfStoreItems[i]["dbname"])) {
			logger.info(`${V.listOfStoreItems[i]["dbname"]} does not yet exist in the database. Creating...`);
			sql.prepare(`ALTER TABLE mainDb ADD COLUMN ${V.listOfStoreItems[i]["dbname"]} INTEGER DEFAULT 0;`).run();
		}
	}

	for (i = 0; i < allColumns.length; i++) {
		allColumnsValues.push(`@${allColumns[i]}`);
	}

	Client.getScore = sql.prepare("SELECT * FROM mainDb WHERE user = ?");
	Client.setScore = sql.prepare(`INSERT OR REPLACE INTO mainDb (${allColumns.toString()}) VALUES (${allColumnsValues.toString()});`);

	Client.getPrefix = sql.prepare("SELECT * FROM prefixDb WHERE id = ?");
	Client.setPrefix = sql.prepare("INSERT OR REPLACE INTO prefixDb (id, prefix) VALUES (@id, @prefix);");
	
	Client.getD3Char = sql.prepare("SELECT * FROM d3CharDb WHERE id = ?");
	Client.setD3Char = sql.prepare("INSERT OR REPLACE INTO d3CharDb (id, charName, class, head, torso, shoulders, arms, bracers, pants, boots, primary_hand, off_hand, ring_1, ring_2, amulet, legendary_gems, cube_armor, cube_weapon, cube_ring) VALUES (@id, @charName, @class, @head, @torso, @shoulders, @arms, @bracers, @pants, @boots, @primary_hand, @off_hand, @ring_1, @ring_2, @amulet, @legendary_gems, @cube_armor, @cube_weapon, @cube_ring);");
	
	userThatIsOnlyReferencedOnce = await Client.bot.fetchUser(adminID[0]);
	logger.info('Ready and logged in as ' + Client.bot.user.username + '!');
	Client.bot.user.setPresence({
		game: {
			name: 'commands. Prefix: ~',
			type: 2
		}
	})

});

Client.bot.on('message', async(message) => {
	if (message.author.bot)
		return;

	if (!message.guild) {
		Client.temp.chatChannel = message.author;
		Client.temp.chatName = message.author.username;
		if (message.author.id != userThatIsOnlyReferencedOnce.id && message.mentions.users.array().includes(userThatIsOnlyReferencedOnce)) userThatIsOnlyReferencedOnce.send(`DM from ${chatName} - ${message.content}`);
	} else {
		F.fuckWithMax(message);
		Client.temp.chatChannel = message.guild;
		Client.temp.chatName = message.guild.name;
	}
	Client.prefix = Client.getPrefix.get(Client.temp.chatChannel.id);
	if (!Client.prefix) {
		logger.info(`${Client.temp.chatName} does not yet have a prefix, defaulting to ~.`);
		message.channel.send(`${Client.temp.chatName} does not yet have a prefix, defaulting to ~.`);
		Client.prefix = {
			id: `${chatChannel.id}`,
			prefix: "~"
		}
		Client.setPrefix.run(Client.prefix);
		logger.info("Done.");
	}
	
	var wordsInMessage = message.content.split(/\s+/g);
	Client.temp.dbGet = Client.getScore.get(message.author.id);
	var currentTime = Date.now();
	if (!Client.temp.dbGet) {
		Client.temp.dbGet = generateDbEntry(message.author);
	}

	const args = message.content.split(/\s+/g);
	var command = args.shift().slice(Client.prefix.prefix.length).toLowerCase();
	var quotedStrings = message.content.match(/(?=["'])(?:"[^"\\]*(?:\\[\s\S][^"\\]*)*"|'[^'\\]*(?:\\[\s\S][^'\\]*)*')/g);
	
	if (message.content.indexOf(Client.prefix.prefix) !== 0) {
		let randNum = Math.floor((Math.random() * 10) + 1);
		Client.temp.dbGet.points++;
		Client.temp.dbGet.currency += randNum;
		Client.temp.dbGet.total_messages_sent++;
		Client.temp.dbGet.last_known_displayName = message.author.username;
		Client.temp.dbGet.level = Math.floor(F.calculateLevel(Client.temp.dbGet.points));
		Client.setScore.run(Client.temp.dbGet);
	} else 	if (command in Client.commands) {
		Client.commands[command].func(Client, message, args);
	}

	if (message.guild && message.guild.id == 275388903547076610 || 256139176225931264) {
		for (var i = 0; i < wordsInMessage.length; i++) {
			if (wordsInMessage[i].toLowerCase() == "tra") {
				message.channel.startTyping();
				message.channel.send("tra");
				message.channel.stopTyping();
				return;
			}

			if (wordsInMessage[i].toLowerCase() == "ariana") {
				message.channel.startTyping();
				fileName = ariana4mogs(0, chatChannel, message.author, chatChannel);
				message.channel.send({
					file: fileName
				});
				message.channel.stopTyping();
				return;
			}
			if (wordsInMessage[i].toLowerCase() == "monky") {
				message.channel.startTyping();
				fileName = ariana4mogs(1, chatChannel, message.author, chatChannel);
				message.channel.send({
					file: fileName
				});
				message.channel.stopTyping();
				return;
			}
		}
	}
	
	if (message.content.toLowerCase().indexOf('the greater good') !== -1) {
		message.channel.send('The greater good.');
		}

	if (message.content.toLowerCase().startsWith('>tfw') || message.content.toLowerCase().startsWith('tfw')) {
		message.channel.send('feels bad man :(')
	}

});

Client.bot.on('error', (error) => {
	logger.error(error);
});

Client.bot.login(Client.config.token);
