const { SlashCommandBuilder } = require("@discordjs/builders");
const chalk = require('chalk');

const Users = require('../../../Database/Models/Users');
const Servers = require('../../../Database/Models/Servers');

const { errorEmbed, successEmbed, warningEmbed } = require('../../../constants/messageTemplate');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Unlink your account from previously registered scoresaber.com account")
	,
	async execute(interaction) {
		const discordID = interaction.user.id;
		const serverID = interaction.guildId;




		
	}
}