const Discord = require('discord.js');
const F = require('../utils/functions.js');
const V = require('../utils/vars.js');
 


module.exports = {
	name: 'Eval',
	help: 'Eval.',
	servers: ['256139176225931264'],
	func: async (Client, message, args) => {
		if (message.author.id != 197376829408018432) return;

		try {
			const code = args.join(" ");
			let evaled = eval(code);
		 
			if (typeof evaled !== "string")
				evaled = require("util").inspect(evaled);
		 
			message.channel.send(clean(evaled), {code:"xl"});
			} catch (err) {
			message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}
}

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}
