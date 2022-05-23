const { SlashCommandBuilder } = require("@discordjs/builders");
const { Permissions } = require('discord.js');

const chalk = require('chalk');
const got = require('got');

const Users = require('../../../Database/Models/Users');
const Servers = require('../../../Database/Models/Servers');
const Leaderboard = require('../../../Database/Models/Leaderboard');
const { errorEmbed, successEmbed, warningEmbed } = require('../../../constants/messageTemplate');
const { scoresaberAPI } = require('../../../constants/URL');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("link")
		.setDescription("Link your account with your scoresaber.com account.")
		.addSubcommand(subcommand =>
			subcommand
				.setName("scoresaber")
				.setDescription("Link your account with your scoresaber.com account.")
			.addStringOption((option) =>
				option
					.setName("scoresaber-id")
					.setDescription("The ID of your scoresaber.com account.")
					.setRequired(true)
			))
		.addSubcommand(subcommand => 
			subcommand
				.setName("other")
				.setDescription("Set other discord user with their scoresaber account.")
			.addUserOption(option => 
				option
					.setName("user")
					.setDescription("The user to get the info of")
					.setRequired(true)
				)
			.addStringOption(option => 
				option
					.setName("scoresaber-id")
					.setDescription("The ID of other person's scoresaber.com account")
					.setRequired(true))
			)
		,
	async execute(interaction) {
		const command = interaction.options.getSubcommand();
		let scoresaberID = interaction.options.getString('scoresaber-id');;
		let discordID;

		if (command === 'scoresaber') {
			discordID = interaction.user.id;
		} else if (command === 'other') {
			discordID = interaction.options.getUser('user').id
			if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) && 
				!interaction.member.roles.cache.some(role => role.name === 'mod' || role.name === 'admin')) {
				return interaction.reply({
					embeds: [errorEmbed().setDescription("You do not have permission to use this command")],
					ephemeral: true
				})
			}
		}
		
		
		if (!scoresaberID) {
			return interaction.reply({embeds: [errorEmbed().setDescription("Please supply a scoresaber ID")]});
		}

		const guildid = interaction.guildId; 
		const userData = await Users.findOne({ discordID, serverID: guildid });
		if (userData) {
			return interaction.reply(
				{embeds: [warningEmbed().setDescription("You have already linked your scoresaber account, /unlink if you want to link with a different account")]}
			)
		}
		if (await Users.findOne({scoresaberID, serverID: guildid})) {
            return interaction.reply(
				{embeds: [errorEmbed().setDescription("This id has already been linked")]}
			)
        }
		const scoresaberData = await got.get(scoresaberAPI + '/player/' + scoresaberID + '/full')
			.then(
				res => {
					const data = JSON.parse(res.body);
					return data;
				},
				err => {
					return interaction.reply(
						{embeds: [warningEmbed().setDescription("Account not found, please verify by going to [https://scoresaber.com](https://scoresaber.com)")]}
					)
				}
			)
		if (scoresaberData) {
			const userDataInsertion = new Users({
				serverID: guildid,
				discordID,
				name: scoresaberData.name,
				profilePicture: scoresaberData.profilePicture,
				scoresaberID: scoresaberData.id,
				country: scoresaberData.country,
				rank: scoresaberData.rank,
				pastRank: -1,
				countryRank: scoresaberData.countryRank,
				pastCountryRank: -1,
				pp: scoresaberData.pp,
				pastPP: -1,
				scoreStats: {
					totalScore: scoresaberData.scoreStats.totalScore,
					totalRankedScore: scoresaberData.scoreStats.totalRankedScore,
					averageRankedAccuracy: scoresaberData.scoreStats.averageRankedAccuracy,
					totalPlayCount: scoresaberData.scoreStats.totalPlayCount,
					rankedPlayCount: scoresaberData.scoreStats.rankedPlayCount
				}
			})
			userDataInsertion.save((err) => {
				if (err) {
					console.log(chalk.black.bgRed("Error", err));
					return interaction.reply(
						{embeds: [warningEmbed.setDescription("Something's wrong")]}
					)
				} else {
					const userEmbed = successEmbed()
						.setTitle(scoresaberData.name)
						.setURL(`https://scoresaber.com/u/${scoresaberData.id}`)
						.addField('Player Data', 
							` \`\`\`c\n` + 
							`Global Rank: ${scoresaberData.rank} \n` +
							`Country: ${scoresaberData.country} (${scoresaberData.countryRank}) \n` +
							`PP: ${scoresaberData.pp}\n` +
							`Avg Acc: ${Math.round((scoresaberData.scoreStats.averageRankedAccuracy + Number.EPSILON) * 100) / 100}\n` +
							`Songs Played: ${scoresaberData.scoreStats.totalPlayCount}\n` + 
							`\`\`\``)
						.setThumbnail(scoresaberData.profilePicture);
					console.log(chalk.black.bgGreen(`Added User ${scoresaberData.id}`))
					interaction.reply({
						embeds: [userEmbed]
					})

					Servers.findOneAndUpdate(
						{ serverID: guildid },
						{$inc : { 'user_count': 1 }},
						
						(err, _) => {
							if (err) {
								console.log(chalk.black.bgRed("Error", err));
							}
						})
				}
			})

			const leaderboard = new Leaderboard({
				serverID: guildid,
				scoresaberID: scoresaberData.id,
				discordID,
				ranking: -1,
				pastRanking: -1,
				globalRank: scoresaberData.rank,
				pp: scoresaberData.pp,
				userDetails: userDataInsertion._id
			})
			leaderboard.save();
		}

	}
}