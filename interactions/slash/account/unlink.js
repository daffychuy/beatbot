const { SlashCommandBuilder } = require("@discordjs/builders");
const chalk = require('chalk');

const Users = require('../../../Database/Models/Users');
const Servers = require('../../../Database/Models/Servers');
const Leaderboard = require("../../../Database/Models/Leaderboard");

const { errorEmbed, successEmbed, warningEmbed } = require('../../../constants/messageTemplate');


module.exports = {
	data: new SlashCommandBuilder()
		.setName("unlink")
		.setDescription("Unlink your account from previously registered scoresaber.com account")
		.addSubcommand(subcommand =>
			subcommand
				.setName("scoresaber")
				.setDescription("Unlink your account from previously registered scoresaber.com account"))
	,
	async execute(interaction) {
		const discordID = interaction.user.id;
		const serverID = interaction.guildId;

		const userData = await Users.find({ discordID, serverID });
		if (userData.length !== 1) {
			return interaction.reply({
				embeds: [
					warningEmbed().setDescription("You have to link an account before you can unlink an account"),
				]
			});
		}

		Users.deleteOne({ discordID, serverID })
		.then((err, _) => {
			if (err?.deletedCount !== 1) {
				console.log(chalk.black.bgRed("Error", JSON.stringify(err)));
				return interaction.reply(
					{embeds: [errorEmbed().setDescription("Something's wrong")]}
				)
			}
			console.log(chalk.black.bgGreen(`Removed User for ${userData[0].discordID} with scoresaberID of ${userData[0].scoresaberID}`))
			interaction.reply({
				embeds: [successEmbed().setDescription("Account has been unlinked")]
			})
			Leaderboard.deleteOne({ serverID, discordID })
			.then((err, _) => {
				if (err?.deletedCount !== 1) {
					console.log(chalk.black.bgRed("Error", JSON.stringify(err)));
				}})
			
			Servers.findOneAndUpdate(
				{ serverID  },
				{ $inc : { 'user_count': -1 } },
				
				(err, _) => {
					if (err) {
						console.log(chalk.black.bgRed("Error", err));
					}
				})
		})

		
	}
}