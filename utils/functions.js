module.exports.generateDbEntry = (usableId) => {
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
		manning_face: 0,
		discord_gold: 0
	}
	logger.info("Should have created a DB entry for user " + usableId.username);
	return returnedDb;
}

module.exports.generateD3Char = (id) => {
	var returnedDb;
	returnedDb = {
		id: id,
		charName: "None",
		class: "None",
		head: "None",
		torso: "None",
		shoulders: "None",
		arms: "None",
		bracers: "None",
		pants: "None",
		boots: "None",
		primary_hand: "None",
		off_hand: "None",
		ring_1: "None",
		ring_2: "None",
		amulet: "None",
		legendary_gems: "None",
		cube_armor: "None",
		cube_weapon: "None",
		cube_ring: "None"
	}
}

module.exports.calculateLevel = (points) => {
	const currentLevel = 2 * (Math.pow(points, 2 / 3)) - 1;
	return currentLevel;
}
module.exports.calculatePoints = (level) => {
	const currentPoints = Math.pow((level + 1) / 2, 1 / (2 / 3));
	return currentPoints;
}

module.exports.TryParseInt = (str, defaultValue) => {
	var retValue = defaultValue;
	if (str !== null) {
		if (str.length > 0) {
			if (!isNaN(str)) {
				retValue = parseInt(str);
			}
		}
	}
	return retValue;
}

module.exports.stringifyArray = (array) => {
	arrayAsString = "";
	for (var i = 0; i < array.length; i++) {
		var entry = array[i];
		if (i != array.length - 1) {
			arrayAsString += entry + ", ";
		} else {
			arrayAsString += entry;
		}
	}
	return arrayAsString;
}

module.exports.stringify2DArray = (array, index) => {
	arrayAsString = "";
	for (var i = 0; i < array.length; i++) {
		var entry = array[i];
		if (i != array.length - 1) {
			arrayAsString += entry + ", ";
		} else {
			arrayAsString += entry;
		}
	}
	return arrayAsString;
}

module.exports.ariana4mogs = (type, channel, author, guild) => {
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

module.exports.randomString = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 12; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports.codeBlokkit = (message, lang) => {
	var result = "";
	if (lang == 0) {
		result += "```\n";
	} else {
		result += `\`\`\`${lang}\n`;
	}
	result += message;
	result += "\n```";
	return result;
	}
	
module.exports.isEmpty = (str) => {
		return (!str || /^\s*$/.test(str));
	}
	
var percentageDefault = 1;
var currentPercentage = 0;
var insultArray = [
		"a pleb",
		"a nonce",
		"a square",
		"an :eggplant:",
		"feg"
	];
module.exports.fuckWithMax = (message) => {
	if(message.guild.id == 487547206283427840) {
		if (currentPercentage < percentageDefault) currentPercentage = percentageDefault;
		var rng = seedrandom(`${message.author.id}-${message.content}-${Date.now()}`);
		if (rng() * 100 < currentPercentage) {
			message.channel.send(`Max is ${insultArray[Math.floor(rng() * insultArray.length)]}`).then(msg => {
				var messageToDelete = msg;
				setTimeout( msg => {
					messageToDelete.delete();
					}, 2500);
			});
			currentPercentage = percentageDefault;
		} else {
			currentPercentage += 0.5;;
		}
	}
}
