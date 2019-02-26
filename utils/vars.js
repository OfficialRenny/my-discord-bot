const log4js = require('log4js');
module.exports.listOfStoreItems = [
	{dbname: "discord_silver", cmd: "silver", name: "Discord Silver", price: 500, url: "https://i.imgur.com/Vt7NLdA.png"},
	{dbname: "discord_gold", cmd: "gold", name: "Discord Gold", price: 1000, url: "https://i.imgur.com/D42SF2A.png"},
	{dbname: "rick_roll", cmd: "rick", name: "Rick Roll", price: 250, url: "https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif"},
	{dbname: "manning_face", cmd: "manning", name: "Manning Face", price: 100, url: "https://i.imgur.com/ENPyFSU.jpg"}
];

log4js.configure({
	appenders: {
		consoleLogs: {
			type: 'file',
			filename: '../data/logs/console.log',
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

module.exports.logger = log4js.getLogger('default');
module.exports.admins = ['197376829408018432', '108875959628795904'];
