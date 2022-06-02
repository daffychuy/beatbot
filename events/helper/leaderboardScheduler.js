const cron = require("cron");
const dateFormat = require('date-fns/format');
const chalk = require('chalk');
const got = require('got');

const Servers = require('../../Database/Models/Servers');
const Users = require('../../Database/Models/Users');
const Leaderboard = require('../../Database/Models/Leaderboard');
const { capitalizeFirstLetter } = require('../../interactions/slash/leaderboard/setLeaderboard')
const { successEmbed } = require('../../constants/messageTemplate');
const { scoresaberAPI } = require('../../constants/URL');
const { rankingEmoji } = require('../../constants/ranking');

// Timer to wait for in milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

const leaderboardUpdater = async (serverID, type) => {
	// Update all this server's user count
	let usersData = await Users.find({ serverID });
	if (usersData.length === 0) return;

	let i = 0, arrLen = usersData.length;
	const usersToUpdate = [];
	let leaderboardToUpdate = [];

	while (i < arrLen) {
		const userData = usersData[i];
		const scoresaberData = await got.get(scoresaberAPI + '/player/' + userData.scoresaberID + '/full')
			.then(
				res => {
					return JSON.parse(res.body);
				},
				err => {
					console.log(`Failed to update user ${userData.scoresaberID}`);
					console.log(chalk.bgRed(`Error: ${err}`));
				}
			)

		if (scoresaberData) {
			usersToUpdate.push({
				updateOne: {
					filter: {
						serverID: userData.serverID,
						scoresaberID: userData.scoresaberID,
						discordID: userData.discordID,
					},
					update: { $set: {
						name: scoresaberData.name,
						profilePicture: scoresaberData.profilePicture,
						rank: scoresaberData.rank,
						countryRank: scoresaberData.countryRank,
						pp: scoresaberData.pp,
						pastPP: userData.pp,
						scoreStats: {
							totalScore: scoresaberData.scoreStats.totalScore,
							totalRankedScore: scoresaberData.scoreStats.totalRankedScore,
							averageRankedAccuracy: scoresaberData.scoreStats.averageRankedAccuracy,
							totalPlayCount: scoresaberData.scoreStats.totalPlayCount,
							rankedPlayCount: scoresaberData.scoreStats.rankedPlayCount
						}
					}},
					upsert: true,
				}
			});

			leaderboardToUpdate.push({
				updateOne: {
					filter: {
						serverID: userData.serverID,
						scoresaberID: userData.scoresaberID,
						discordID: userData.discordID,
					},
					update: { $set: {
						pp: scoresaberData.pp,
					}},
					upsert: true,
				}
			})
		}
		i++;
	}
	await Users.collection.bulkWrite(usersToUpdate);
	await Leaderboard.collection.bulkWrite(leaderboardToUpdate);
	leaderboardToUpdate = [];

	// Update leaderboard
	const leaderboardData = await Leaderboard.find( { serverID } )
			.populate({
				path: 'userDetails', 
				select: 'discordID name country rank countryRank pp pastPP scoreStats.averageRankedAccuracy'
			})
			.limit(10)
			.sort({ 'pp': -1 })
	i = 0;
	arrLen = leaderboardData.length;
	console.log(type)
	const leaderboardEmbed = successEmbed()
		.setColor('#ffa502')
		.setTitle( "<:saberleft:812173106705334272> BeatSaber Leaderboard <:redsaberright:812180742683099136>")
		.setDescription(`${capitalizeFirstLetter(type)} Server Leaderboard`);
	let leaderboardOutput = '';
	while (i < arrLen) {
		let rankChanges = (leaderboardData[i].pastRanking === -1 || 
			(leaderboardData[i].ranking - leaderboardData[i].pastRanking) === 0) ? 
			'-' : 
			leaderboardData[i].pastRanking - leaderboardData[i].ranking;

		const ppChanges = Math.round(( Number.EPSILON + (leaderboardData[i].userDetails.pastPP === -1 ? '0' : leaderboardData[i].pp - leaderboardData[i].userDetails.pastPP)) * 100) / 100;
		leaderboardData[i].pp = leaderboardData[i].userDetails.pp;
		if (type === 'weekly') {
			leaderboardData[i].pastRanking = leaderboardData[i].ranking;
		}
		leaderboardData[i].ranking = i+1;
		leaderboardData[i].globalRank = leaderboardData[i].rank;
		
		leaderboardToUpdate.push({
			updateOne: {
				filter: { 
					serverID: leaderboardData[i].serverID,
					scoresaberID: leaderboardData[i].scoresaberID,
					discordID: leaderboardData[i].discordID
				},
				update: { $set: {
					ranking: leaderboardData[i].ranking, 
					pastRanking: leaderboardData[i].pastRanking,
					globalRank: leaderboardData[i].globalRank,
				}},
				upsert: true,
			}
		})

		await Leaderboard.collection.bulkWrite(leaderboardToUpdate);
		

		if (rankChanges >= 0) {
			rankChanges = `+${rankChanges}`; 
		} else if (rankChanges < 0) {
			rankChanges = `${rankChanges}`;
		}

		if (i < 3) {
			leaderboardEmbed.addFields({
				name: `${rankingEmoji[i+1]} ${leaderboardData[i].userDetails.name}`,
				value: `\`\`\`py\nPP: ${leaderboardData[i].pp} (+${ppChanges})\nRanked: ${leaderboardData[i].userDetails.rank}\n\`\`\``,
				inline: true
			})
		} else {
			leaderboardOutput += '' +
				// `${rankChanges} ` + ' '.repeat(3 - rankChanges.length) +
				`#${leaderboardData[i].ranking}: ` +
				`**${leaderboardData[i].userDetails.name}** ` + 
				`${leaderboardData[i].pp}pp (+${ppChanges}) ` + 
				`| Ranked: ${leaderboardData[i].userDetails.rank}` +
				`\n`;
		}
		i++;
	}

	leaderboardEmbed
		.addFields({
			name: '\u200B',
			value: leaderboardOutput ? leaderboardOutput : '\u200B'
		})
		.setTimestamp(new Date())
		.setFooter({
			text: `Updated ${type} `
		})

	return leaderboardEmbed;
}

const weeklyScheduler = async (client) => new cron.CronJob('0 0 0 * * 1', async () => {
	for (const guildArr of client.guilds.cache) {
		const guild = guildArr[1];
		const server = await Servers.findOne({ serverID: guild.id });
		if (server?.weeklyLeaderboard?.channelID && server?.weeklyLeaderboard?.messageID) {
			const data = await guild.channels.cache.get(server.weeklyLeaderboard.channelID)
				.messages.fetch(server.weeklyLeaderboard.messageID)
			const leaderboardEmbed = await leaderboardUpdater(guild.id, 'weekly');
			data.edit({embeds: [leaderboardEmbed]});
			// Wait 30 seconds before next one is allowed
			await timer(0.5 * 60 * 1000);
		}
		
	}},
	null,
	true,
	'America/Toronto');

const dailyScheduler = async (client) => new cron.CronJob('0 0 0 * * *', async () =>{
	for (const guildArr of client.guilds.cache) {
		const guild = guildArr[1];
		const server = await Servers.findOne({ serverID: guild.id });
		if (server?.dailyLeaderboard?.channelID && server?.dailyLeaderboard?.messageID) {
			const data = await guild.channels.cache.get(server.dailyLeaderboard.channelID)
				.messages.fetch(server.dailyLeaderboard.messageID)
			const leaderboardEmbed = await leaderboardUpdater(guild.id, 'daily');
			data.edit({embeds: [leaderboardEmbed]});
			// Wait 30 seconds before next one is allowed
			await timer(0.5 * 60 * 1000);
		}
		
	}},
	null,
	true,
	'America/Toronto');

module.exports = {
	weeklyScheduler,
	dailyScheduler,
}