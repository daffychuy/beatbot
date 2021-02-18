require('./Database')
const Discord = require('discord.js');

const config = require('./config.json');
const { 
    getUserData, 
    linkUserData,
    updateUserData,
    getLeaderboard,
    getMap,
} = require('./DataParser');

const GlobalPrefix = config.prefix;
const client = new Discord.Client({
    presence: {
        activity: {
           type: `PLAYING`,
           name: `BeatSaber`,
        },
        status: "idle",
        ws: { intents: ["GUILDS", "GUILD_VOICE_STATES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] }
     }
});

client.login(config.BOT_TOKEN);

client.on("message", async (message) => {
    // Base case to check if request is coming from user or a bot and if its a command
    if (message.author.bot || !message.content.startsWith(GlobalPrefix)) return;
    
    const commandBody = message.content.slice(GlobalPrefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    const userID = message.author.id;

    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        const timeToPing = client.ws.ping;
        message.reply(`Pong! Latency: ${timeTaken}ms. API latency: ${timeToPing}`);
    } else if (command === "bs") {
        if (args.length >= 1) {
            message.reply("are you trying to break me?");
            return;
        }

        await getUserData(userID, message);
    
    } else if (command === "link") {
        if (args.length !== 1) {
            message.reply("are you trying to break me?");
            return;
        }
        let bsID = args[0];

        await linkUserData(userID, bsID, message);
    } else if (command === "updatebs") {
        if (args.length >= 1) {
            message.reply("are you trying to break me?");
            return;
        }

        await updateUserData(userID, message);
    } else if (command === "leaderboard") {
        if (args.length >= 1) {
            message.reply("are you trying to break me?");
            return;
        }

        await getLeaderboard(message)

    } else if (command === "song") {
        return message.reply("this feature is currently not supported :(");
    }
})

