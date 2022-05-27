const { weeklyScheduler, dailyScheduler } = require('./helper/leaderboardScheduler');

module.exports = {
	name: "ready",
	once: true,

	/**
	 * @description Executes the block of code when client is ready (bot initialization)
	 * @param {Object} client Main Application Client
	 */
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		console.log('Hooking up scheduler...')
		client.user.setPresence({
			activities:[{
				name: `BeatSaber`,
				type: 'PLAYING'
			}]
		})
		
		weeklyScheduler(client);
		dailyScheduler(client);
	

	},
};
