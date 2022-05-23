const { SlashCommandBuilder } = require("@discordjs/builders");
const Servers = require('../../../Database/Models/Servers');
const Leaderboard = require('../../../Database/Models/Leaderboard');

const { errorEmbed, successEmbed, warningEmbed } = require('../../../constants/messageTemplate');
const dateFormat = require('date-fns/format');

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setleaderboard")
		.setDescription("Set the leaderboard for the server")
		.addSubcommand(subcommand => 
			subcommand
				.setName("weekly")
				.setDescription("Set the leaderboard for the server, will update every week"))
		.addSubcommand(subcommand =>
			subcommand
				.setName("daily")
				.setDescription("Set the leaderboard for the server, will update every day"))
	,
	async execute(interaction) {
		const command = interaction.options.getSubcommand();
		const serverID = interaction.guildId;
		const leaderboardData = await Leaderboard.find( { serverID } )
			.populate({
				path: 'userDetails', 
				select: 'discordID name country rank countryRank pp pastPP scoreStats.averageRankedAccuracy'
			})
			.limit(10)
			.sort({ 'pp': -1 })
		let i = 0, arrLen = leaderboardData.length;
		const toUpdate = [];
		let leaderboardOutput = '';
		while (i < arrLen) {
			let rankChanges = (leaderboardData[i].pastRanking === -1 || 
				(leaderboardData[i].ranking - leaderboardData[i].pastRanking) === 0) ? 
				'-' : 
				leaderboardData[i].ranking - leaderboardData[i].pastRanking;

			leaderboardData[i].pastRanking = leaderboardData[i].ranking;
			leaderboardData[i].ranking = i+1;
			leaderboardData[i].globalRank = leaderboardData[i].rank;
			
			toUpdate.push({
				updateOne: {
					filter: { 
						serverID: leaderboardData[i].serverID,
						scoresaberID: leaderboardData[i].scoresaberID,
						discordID: leaderboardData[i].discordID
					},
					update: { $set: {
						globalRank: leaderboardData[i].userDetails.rank,
						ranking: leaderboardData[i].ranking, 
						pastRanking: leaderboardData[i].pastRanking
					}},
					upsert: true,
				}
			})
			

			if (rankChanges >= 0) {
				rankChanges = `+${rankChanges}`;
			} else if (rankChanges < 0) {
				rankChanges = `-${rankChanges}`;
			}

			leaderboardOutput += '' +
				// `${rankChanges} ` + ' '.repeat(3 - rankChanges.length) +
				`#${leaderboardData[i].ranking}: ` +
				`**${leaderboardData[i].userDetails.name}** ` + 
				`${leaderboardData[i].pp}pp ` + 
				`| Ranked: ${leaderboardData[i].userDetails.rank}` +
				`\n`;
			i++;
		}
		leaderboardOutput += '';

		if (toUpdate.length !== 0) {
			Leaderboard.collection.bulkWrite(toUpdate);
		} else {
			leaderboardOutput = "No user found"
		}
		
		const leaderboardEmbed = successEmbed()
			.setColor('#ffa502')
			.setTitle( "<:saberleft:812173106705334272> BeatSaber Leaderboard <:redsaberright:812180742683099136>")
			.addField(`${capitalizeFirstLetter(command)} Server Leaderboard`, leaderboardOutput)
			.setFooter({text: `Last Updated: ${dateFormat(new Date(), 'PPpp')}`});
		await interaction.reply("Working on it...");
		await interaction.deleteReply()
		const sendMsg = await interaction.channel.send({
			embeds: [leaderboardEmbed]
		});

		const msgID = {
			messageID: sendMsg.id,
			channelID: sendMsg.channelId,
			lastUpdated: new Date()
		}
		// Update the message ID in the database so we can update later
		if (command === 'weekly') {
			await Servers.updateOne({ serverID }, {
				$set: {
					weeklyLeaderboard: msgID
				}
			});
		} else if (command === 'daily') {
			await Servers.updateOne({ serverID }, {
				$set: {
					dailyLeaderboard: msgID
				}
			})
		} else if (command === 'sticky') {
			await Servers.updateOne({ serverID }, {
				$set: {
					stickyLeaderboard: msgID
				}
			})
		}

	}
}