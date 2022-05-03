const { MessageEmbed, Collection } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("link")
		.setDescription("Link your account with your scoresaber.com account.")
		.addStringOption((option) =>
			option
				.setName("userid")
				.setDescription("The userID of your scoresaber.com account.")
		),

	async execute(interaction) {
		const commands = interaction.client.slashCommands;
		let userid = interaction.options.getString("userid");

		// await interaction.reply({
		// 	embeds: [helpEmbed],
		// });
	}
}