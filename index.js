require('./Database')
const Discord = require('discord.js');

const config = require('./config.json');
const { 
    getUserData, 
    linkUserData,
    updateUserData,
    getLeaderboard,
    unlinkUserData,
    getMap,
    getRanking,
    updateLeaderboard,
} = require('./DataParser');

const client = new Discord.Client({
    presence: {
        activity: {
            type: 'PLAYING',
            name: 'BeatSaber',
        },
        status: 'idle'
    }
});
const Enmap = require('enmap');

client.settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep',
    autoEnsure: {
      prefix: ">",
      modLogChannel: "mod-log",
      modRole: "mod",
      adminRole: "admin",
      welcomeChannel: "welcome",
      welcomeMessage: "Say hello to {{user}}, everyone!",
      leaderboard: []
    },
  });


client.login(config.BOT_TOKEN);

client.on("guildDelete", guild => {
    // When the bot leaves or is kicked, delete settings to prevent stale entries.
    client.settings.delete(guild.id);
});

  

client.on("message", async (message) => {
    // Base case to check if request is coming from user or a bot and if its a command
    if (!message.guild || message.author.bot) return;
    
    const guildID = message.guild.id;
    const guildConf = client.settings.get(guildID);

    if(message.content.indexOf(guildConf.prefix) !== 0) return;

    const args = message.content.split(/\s+/g);
    const command = args.shift().slice(guildConf.prefix.length).toLowerCase();
 
    const userID = message.author.id;

    if (command === "showconf") {
        let configProps = Object.keys(guildConf).map(prop => {
            return `${prop}  :  ${guildConf[prop]}`;
        });
        message.channel.send(`The following are the server's current configuration:
        \`\`\`${configProps.join("\n")}\`\`\``);

    } else if (command === "setprefix") {
        const adminRole = message.guild.roles.cache.find(role => role.name === guildConf.adminRole);
        if(!adminRole) return message.reply("Administrator Role Not Found");

        if (args.length !== 1 || args[0].length !== 1) {
            message.reply('please supply a valid prefix');
            return
        }

        if(!message.member.roles.cache.has(adminRole.id)) {
            return message.reply("You're not an admin, sorry!");
        }

        client.settings.set(guildID, args[0], 'prefix');

        message.reply(`new prefix for the server: ${args[0]}`)

    } else if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        const timeToPing = client.ws.ping;
        message.reply(`STOP PINGING ME!!!! But... Latency: ${timeTaken}ms. API latency: ${timeToPing}ms.`);
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

        await linkUserData(userID, bsID, message, client);
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
        const adminRole = message.guild.roles.cache.find(role => role.name === guildConf.adminRole);
        if(!adminRole) return message.reply("Administrator Role Not Found");

        if(!message.member.roles.cache.has(adminRole.id)) {
            return message.reply("You're not an admin, sorry!");
        }

        await getLeaderboard(guildID, message, client)

    } else if (command === "ranking") {

        await getRanking(guildID, message, client)

    } else if (command === 'unlink') {

        await unlinkUserData(userID, message);
    } else if (command === 'updateboard') {

        updateLeaderboard(guildID, message, client)

    } else if (command === "song") {
        return message.reply("this feature is currently not supported :(");
    }
})

