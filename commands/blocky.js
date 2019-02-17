const Discord = require('discord.js');
module.exports = {
	name: 'Blocky Text',
	help: 'Turn any string into Regional Indicator letters.',
	func: (Client, message, args) => {
			var regionalIndicatorString = "";
			var arrayOfNums = [
				"zero",
				"one",
				"two",
				"three",
				"four",
				"five",
				"six",
				"seven",
				"eight",
				"nine",
			];
			for (var word in args) {
					var w = args[word];
					for (var letter in w) {
						var l = w[letter];
						if (l.match(/[a-z]/i)) {
							var rand = Math.random();
							if (l.toLowerCase() == 'a') {
								if (rand < 0.5) {
								regionalIndicatorString += `:a:\u200B`;
								} else regionalIndicatorString += `:regional_indicator_a:\u200B`;
							} else if (l.toLowerCase() == 'b') {
								if (rand < 0.5) {
								regionalIndicatorString += `:b:\u200B`;
								} else regionalIndicatorString += `:regional_indicator_b:\u200B`;
							} else {
								regionalIndicatorString += `:regional_indicator_${l.toLowerCase()}:\u200B`;
							}
						} else if (l.match(/[0-9]/)) {
							var n = TryParseInt(l, l);
							regionalIndicatorString += `:${arrayOfNums[n]}:\u200B`;							
						} else {
							regionalIndicatorString += `${l}`;
						}
					}
					regionalIndicatorString += "  ";
				}
			if (regionalIndicatorString.length > 2000) return message.channel.send("That would be too long.");
			if (regionalIndicatorString.length < 1) return message.channel.send("That would be an empty message.");
			return message.channel.send(`${regionalIndicatorString}`);
	}
}
