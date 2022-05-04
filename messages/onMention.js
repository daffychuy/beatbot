const { prefix } = require("../config.json");

module.exports = {
	/**
	 * @description Executes when the bot is pinged.
	 * @param {Object} message The Message Object of the command.
	 */

	async execute(message) {
		return message.channel.send(
			`Don't ping me.`
		);
	},
};
