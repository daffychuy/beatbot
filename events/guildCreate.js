const Servers = require('../Database/Models/Servers');
const chalk = require('chalk');

 module.exports = {
	name: "guildCreate",

	async execute(guild) {
		console.log(`Bot joined a new server with ID: ${guild.id}`);
		const serverInsertion = new Servers({
			serverID: guild.id,
			prefix: '!', // Not used, my be used in the future
			user_count: 0,
			lastWeeklyLeaderBoardUpdate: new Date('Jan 1, 1970'),
		})
		serverInsertion.save((err) => {
			if (err) {
				console.log(chalk.black.bgRed("Error", err));
			}
		})
	},
};
