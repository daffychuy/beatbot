const { SlashCommandBuilder } = require("@discordjs/builders");
const chalk = require('chalk');

const dateFormat = require('date-fns/format');
const Servers = require('../../../Database/Models/Servers');
const Leaderboard = require('../../../Database/Models/Leaderboard');
const { rankingEmoji } = require('../../../constants/ranking');

const { errorEmbed, successEmbed, warningEmbed } = require('../../../constants/messageTemplate');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leaderboard")
		.setDescription("Get a leaderboard for this server's users.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("by-pp")
				.setDescription("Get a leaderboard based on the amount of PP."))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("by-ranking")
				.setDescription("Get a leaderboard based on the global ranking."))

	,
	async execute(interaction) {
		const command = interaction.options.getSubcommand();
		const serverID = interaction.guildId;
		let sortedBy = 'PP';
		let leaderboardData = await Leaderboard.find( { serverID } )
			.populate({
				path: 'userDetails', 
				select: 'discordID name country rank countryRank pp pastPP scoreStats.averageRankedAccuracy'
			})
			.limit(10)
			.sort({ 'pp': -1 })
		if (command === "by-ranking") {
			leaderboardData = await Leaderboard.find( { serverID } )
				.populate({
					path: 'userDetails', 
					select: 'discordID name country rank countryRank pp pastPP scoreStats.averageRankedAccuracy'
				})
				.limit(10)
				.sort({ 'globalRank': 1 })
			sortedBy = 'Global Ranking'
		}
		
		// First update all the data for users 
		// (Might have to disable updating if gets too big)
		let i = 0, arrLen = leaderboardData.length;
		const toUpdate = [];
		let leaderboardOutput = '';
		const leaderboardEmbed = successEmbed()
			.setColor('#ffa502')
			.setTitle( "<:saberleft:812173106705334272> BeatSaber Leaderboard <:redsaberright:812180742683099136>")
			.setDescription(`Server Leaderboard Sorted by ${sortedBy}`);

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

			if (i < 3) {
				leaderboardEmbed.addFields({
					name: `${rankingEmoji[i+1]} ${leaderboardData[i].userDetails.name}`,
					value: `\`\`\`py\nPP: ${leaderboardData[i].pp}\nRanked: ${leaderboardData[i].userDetails.rank}\n\`\`\``,
					inline: true
				})
			} else {
				leaderboardOutput += '' +
				// `${rankChanges} ` + ' '.repeat(3 - rankChanges.length) +
				`#${leaderboardData[i].ranking}: ` +
				`**${leaderboardData[i].userDetails.name}** ` + 
				`${leaderboardData[i].pp}pp ` + 
				`| Ranked: ${leaderboardData[i].userDetails.rank}` +
				`\n`;
			}	
			
			i++;
		}
		
		leaderboardOutput += '';

		if (toUpdate.length !== 0) {
			Leaderboard.collection.bulkWrite(toUpdate);
		} else {
			leaderboardOutput = "No user found"
		}

		leaderboardEmbed
			.addFields({
				name: '\u200B',
				value: leaderboardOutput ? leaderboardOutput : '\u200B'
			})
			.setTimestamp(new Date())
			// .setFooter({
			// 	text:  
			// })
		// const leaderboardEmbed = successEmbed()
		// 	.setColor('#ffa502')
		// 	.setTitle( "<:saberleft:812173106705334272> BeatSaber Leaderboard <:redsaberright:812180742683099136>")
		// 	.addField(`Server Leaderboard sorted by ${sortedBy}`, leaderboardOutput)
		// 	.setFooter({text: `Last Updated: ${lastUpdatedDate}`});

		interaction.reply({
			embeds: [leaderboardEmbed]
		});

	}
}