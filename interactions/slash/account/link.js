const { SlashCommandBuilder } = require("@discordjs/builders");
const chalk = require('chalk');
const got = require('got');

const Users = require('../../../Database/Models/Users');
const Servers = require('../../../Database/Models/Servers');
const { errorEmbed, successEmbed, warningEmbed } = require('../../../constants/messageTemplate');
const { scoresaberAPI } = require('../../../constants/URL');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("link")
		.setDescription("Link your account with your scoresaber.com account.")
		.addStringOption((option) =>
			option
				.setName("userid")
				.setDescription("The userID of your scoresaber.com account.")
				.setRequired(true)
		),

	async execute(interaction) {		
		const userid = interaction.options.getString("userid");
		
		if (!userid) {
			return interaction.reply({embeds: [errorEmbed().setDescription("Please supply a scoresaber ID")]});
		}

		const guildid = interaction.guildId; 
		const userData = await Users.findOne({ discordID: interaction.user.id, serverID: guildid });
		if (userData) {
			return interaction.reply(
				{embeds: [warningEmbed().setDescription("You have already linked your scoresaber account, /unlink if you want to link with a different account")]}
			)
		}
		if (await Users.findOne({scoresaberID: userid, serverID: guildid})) {
            return interaction.reply(
				{embeds: [errorEmbed().setDescription("This id has already been linked")]}
			)
        }
		const scoresaberData = await got.get(scoresaberAPI + '/player/' + userid + '/full')
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
				discordID: interaction.user.id,
				name: scoresaberData.name,
				profilePicture: scoresaberData.profilePicture,
				scoresaberID: scoresaberData.id,
				country: scoresaberData.country,
				rank: scoresaberData.rank,
				countryrank: scoresaberData.countryRank,
				pp: scoresaberData.pp,
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
		}

	}
}