module.exports = {
	/**
	 * @description Executes when the button interaction could not be fetched.
	 * @param {Object} interaction The Interaction Object of the command.
	 */

	async execute(interaction) {
		await interaction.reply({
			content: "There was an issue while fetching this button!",
			ephemeral: true,
		});
		return;
	},
};
