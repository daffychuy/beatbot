const Servers = require('../Database/Models/Servers');
const chalk = require('chalk');

 module.exports = {
	name: "guildDelete",

	async execute(guild) {
		console.log(`Bot left a server with ID: ${guild.id}`);
		Servers.deleteOne({ discordID: guild.id }, (err) => {
			if (err) {
				console.log(chalk.black.bgRed("Error", err));
			}
		});
	},
};
