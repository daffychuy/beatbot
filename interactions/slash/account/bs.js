const { SlashCommandBuilder } = require("@discordjs/builders");
const chalk = require('chalk');
const got = require('got');

const Users = require('../../../Database/Models/Users');
const Servers = require('../../../Database/Models/Servers');
const Leaderboard = require('../../../Database/Models/Leaderboard');
const {
	getMe, getDiscordUser, getUserByScoresaber
} = require('./helper/bsHelper');
module.exports = {
	data: new SlashCommandBuilder()
		.setName("bs")
		.setDescription("Get you or someone elses linked account")
		.addSubcommand(subcommand => 
			subcommand
				.setName("me")
				.setDescription("Update and display your beatsaber account"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("discord-user")
				.setDescription("Get info of another discord user scoresaber account if exists")
				.addUserOption(option => 
					option
						.setName("user")
						.setDescription("The user to get the info of")
						.setRequired(true)
				)
			)
		// .addSubcommand(subcommand =>
		// 	subcommand
		// 		.setName("scoresaber")
		// 		.setDescription("Get info of a scoresaber account by id or by name")
		// 		.addStringOption(option => 
		// 			option
		// 				.setName("id")
		// 				.setDescription("The id of the scoresaber account")
		// 		)
		// 		.addStringOption(option => 
		// 			option
		// 				.setName("name")
		// 				.setDescription("The name of the scoresaber account")
		// 		)
		// 	)
		.addSubcommand(subcommand =>
			subcommand
				.setName("snipe")
				.setDescription("Snipe a user based on their scoresaber id (Returns corresponding user)")
				.addStringOption(option =>
					option
						.setName("scoresaberid")
						.setDescription("The scoresaber id of the user to snipe")
						.setRequired(true)
				)
			)
		,

	async execute(interaction) {
		const command = interaction.options.getSubcommand();
		switch (command) {
			case 'me':
				await getMe(interaction);
				break;
			case 'discord-user':
				await getDiscordUser(interaction);
				break;
			case 'scoresaber':
				break;
			case 'snipe':
				await getUserByScoresaber(interaction);
			default:
				break;
		}
		
	}
}