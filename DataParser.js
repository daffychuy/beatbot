const Discord = require('discord.js');
const got = require('got');
const BeatSaber = require('./models/Beatsaber');
const SCORESABER_URL = 'https://new.scoresaber.com'
const API_PATH =  SCORESABER_URL + '/api';
const PLAYER_PATH = API_PATH + '/player';
const config = require('./config.json');
const SCORESABER_API = 'https://beatsaver.com/api/search/text/0?q='

const getUserData = async (userID, msg) => {
    try {
        
        const bs = await BeatSaber.find({discordID: userID}).limit(1);
        if (bs.length !== 1) {
            msg.react("<a:beat:811808748036161557>")
            return msg.reply("you need to link your scoresaber first");
        }

        const bsData = bs[0];
        const bsID = bsData.scoresaberID;
        
        const scoresaberLink = `${PLAYER_PATH}/${bsID}/full`;
        const playerData = JSON.parse((await got(scoresaberLink)).body);

        const playerEmbed = new Discord.MessageEmbed()
            .setColor(config.color)
            .setTitle(playerData.playerInfo.playerName)
            .setURL(`${SCORESABER_URL}/u/${bsID}`)
            .setThumbnail(`${SCORESABER_URL}${playerData.playerInfo.avatar}`)
            .setDescription(`**Global Rank**: #${playerData.playerInfo.rank}\n**Country (${playerData.playerInfo.country})**: #${playerData.playerInfo.countryRank}\n`+
            `**PP**: ${playerData.playerInfo.pp}\n`+
            `**Avg Acc**: ${parseFloat(playerData.scoreStats.averageRankedAccuracy).toFixed(2)}%\n`+
            `**# of Ranked Played**: ${playerData.scoreStats.rankedPlayCount}`
            )
        
        msg.channel.send(playerEmbed);
        return;

    } catch (error) {
        msg.channel.send("There's some error...")
        console.debug(`ERROR: ${error}`)
    }
}

const linkUserData = async (userID, bsID, msg) => {
    try {
        if (!/^\d+$/.test(bsID)) {
            return -1
        }
        const response = await got(`${PLAYER_PATH}/${bsID}/full`);
        console.log(response.body)

        if ((await BeatSaber.find({scoresaberID: bsID}).limit(1)).length === 1) {
            msg.react("<a:beat:811808748036161557>")
            return msg.reply("trying to steal someone's id?");
        }
        if ((await BeatSaber.find({discordID: userID}).limit(1)).length === 1) {
            msg.react("<a:beat:811808748036161557>")
            return msg.reply("you already linked your account");
        }

        let data = new BeatSaber({ 
            serverID: msg.guild.id,
            discordID: userID,
            scoresaberID: bsID,
            UserData: JSON.parse(response.body),
        });

        data.save(function (err) {
            if (err) return console.error(err);
            msg.react('<a:Animated_Checkmark:811809664391053343>')
        })
        return;
    } catch (error) {
        msg.channel.send("There's some error...")
        console.debug(`ERROR: ${error}`)
    }
}

const updateUserData = async (userID, msg) => {
    try {
        const bs = await BeatSaber.find({discordID: userID}).limit(1);
        if (bs.length !== 1) {
            msg.react("<a:beat:811808748036161557>")
            return msg.reply("you need to link your scoresaber first");
        }

        const bsData = bs[0];
        const bsID = bsData.scoresaberID;

        const response = await got(`${PLAYER_PATH}/${bsID}/full`);
        BeatSaber.updateOne({scoresaberID: bsID, discordID: userID},
            {UserData: JSON.parse(response.body)}, function(err) {
                if (err) {
                    console.error(err);
                }
                msg.react('<a:Animated_Checkmark:811809664391053343>')
            })
        return;

    } catch(error) {
        msg.channel.send("There's some error...")
        console.debug(`ERROR: ${error}`)
    }
}

const getMap = async (songName, msg) => {
    try {
        console.log(`${SCORESABER_API}${songName}&?automapper=1`)
        const response = await got(`https://beatsaver.com/api/search/text/0?q=add&?automapper=1`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });
        console.log(response)
        return;

    } catch(error) {
        msg.channel.send("There's some error...")
        console.debug(`ERROR: ${error}`)
    }
}

const getLeaderboard = async (msg) => {
    try {
        console.log(msg.guild)
        let guildid = msg.guildid;
    } catch (error) {
        msg.channel.send("There's some error...")
        console.debug(`ERROR: ${error}`)
    }
}

module.exports = {
    // ScoreSaber Functionalities
    getUserData,
    updateUserData,
    linkUserData,
    getLeaderboard,
    // Scoresaver Functionalities
    getMap,
}