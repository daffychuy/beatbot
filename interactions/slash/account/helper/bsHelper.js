const chalk = require('chalk');
const got = require('got');

const Users = require('../../../../Database/Models/Users');
const { scoresaberAPI } = require('../../../../constants/URL');
const { errorEmbed, successEmbed, warningEmbed } = require('..//../../../constants/messageTemplate');

const getUserAndUpdate = async (discordID, serverID, scoresaberID, interaction) => {
	const scoresaberData = await got.get(scoresaberAPI + '/player/' + scoresaberID + '/full')
		.then(
			res => {
				return JSON.parse(res.body);
			}
		)
	
	if (scoresaberData) {
		Users.updateOne({ scoresaberID: scoresaberID, discordID: discordID, serverID: serverID }, {
			$set: {
				serverID: serverID,
				discordID,
				name: scoresaberData.name,
				profilePicture: scoresaberData.profilePicture,
				scoresaberID,
				country: scoresaberData.country,
				rank: scoresaberData.rank,
				countryRank: scoresaberData.countryRank,
				pp: scoresaberData.pp,
				scoreStats: {
					totalScore: scoresaberData.scoreStats.totalScore,
					totalRankedScore: scoresaberData.scoreStats.totalRankedScore,
					averageRankedAccuracy: scoresaberData.scoreStats.averageRankedAccuracy,
					totalPlayCount: scoresaberData.scoreStats.totalPlayCount,
					rankedPlayCount: scoresaberData.scoreStats.rankedPlayCount
				}
			}
		}, (err, _) => {
			if (err) {
				console.log(chalk.black.bgRed("Error", err));
				return interaction.reply(
					{embeds: [warningEmbed.setDescription("Something's wrong, please try again later")]}
				)
			}
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
			console.log(chalk.black.bgGreen(`Updated User ${scoresaberData.id}`))
			return interaction.reply({
				embeds: [userEmbed]
			})
		})
	}

}

const getMe = async (interaction) => {
	const discordID = interaction.user.id;
	const serverID = interaction.guildId;

	let userData = await Users.findOne({ discordID, serverID });
	if (!userData) {
		return interaction.reply({
			embeds: [
				warningEmbed().setDescription("You have to link an account before you can update your account"),
			]
		});
	}

	const scoresaberData = await got.get(scoresaberAPI + '/player/' + userData.scoresaberID + '/full')
		.then(
			res => {
				return JSON.parse(res.body);
			},
			err => {
				return interaction.reply(
					{embeds: [warningEmbed().setDescription("Account not found, please verify by going to [https://scoresaber.com](https://scoresaber.com)")]}
				)
			}
		)
	
	if (scoresaberData) {
		Users.updateOne({ scoresaberID: userData.scoresaberID, discordID: userData.discordID, serverID: userData.serverID }, {
			$set: {
				serverID: serverID,
				discordID: interaction.user.id,
				name: scoresaberData.name,
				profilePicture: scoresaberData.profilePicture,
				scoresaberID: scoresaberData.id,
				country: scoresaberData.country,
				rank: scoresaberData.rank,
				countryRank: scoresaberData.countryRank,
				pp: scoresaberData.pp,
				scoreStats: {
					totalScore: scoresaberData.scoreStats.totalScore,
					totalRankedScore: scoresaberData.scoreStats.totalRankedScore,
					averageRankedAccuracy: scoresaberData.scoreStats.averageRankedAccuracy,
					totalPlayCount: scoresaberData.scoreStats.totalPlayCount,
					rankedPlayCount: scoresaberData.scoreStats.rankedPlayCount
				}
			}
		}, (err, _) => {
			if (err) {
				console.log(chalk.black.bgRed("Error", err));
				return interaction.reply(
					{embeds: [warningEmbed.setDescription("Something's wrong, please try again later")]}
				)
			}
			const userEmbed = successEmbed()
				.setTitle(scoresaberData.name)
				.setURL(`https://scoresaber.com/u/${scoresaberData.id}`)
				.addField('Updated Player Data', 
					` \`\`\`c\n` + 
					`Global Rank: ${scoresaberData.rank} \n` +
					`Country: ${scoresaberData.country} (${scoresaberData.countryRank}) \n` +
					`PP: ${scoresaberData.pp}\n` +
					`Avg Acc: ${Math.round((scoresaberData.scoreStats.averageRankedAccuracy + Number.EPSILON) * 100) / 100}\n` +
					`Songs Played: ${scoresaberData.scoreStats.totalPlayCount}\n` + 
					`\`\`\``)
				.setThumbnail(scoresaberData.profilePicture);
			console.log(chalk.black.bgGreen(`Updated User ${scoresaberData.id}`))
			return interaction.reply({
				embeds: [userEmbed]
			})
		})
	}
}

const getDiscordUser = async (interaction) => {
	const serverID = interaction.guildId;
	const userID = interaction.options.getUser('user').id;
	
	const userData = await Users.findOne({ discordID: userID, serverID });
	if (!userData) {
		return interaction.reply({
			embeds: [
				successEmbed().setDescription("User has no scoresaber account. MAKE THEM GET ONE AND LINK IT"),
			]
		});
	}

	await getUserAndUpdate(userID, serverID, userData.scoresaberID, interaction);

}

const getUserByScoresaber = async (interaction) => {
	const serverID = interaction.guildId;
	const scoresaberID = interaction.options.getString('scoresaberid');

	let userData = await Users.findOne({ scoresaberID, serverID });

	if (!userData) {
		return interaction.reply({
			embeds: [
				successEmbed().setDescription("Found no user matching this ID."),
			]
		});
	}

	return interaction.reply({
		embeds: [
			successEmbed().setDescription(`*Cough* That's <@${userData.discordID}> *Cough*`),
		]
	})
}

module.exports = {
	getMe,
	getDiscordUser,
	getUserByScoresaber
}