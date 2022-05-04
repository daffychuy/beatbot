const mongoose = require("mongoose");

const Users = new mongoose.Schema({
    serverID: String,
    discordID: String,
    name: String,
    profilePicture: String,
    scoresaberID: String,
    country: String,
    rank: Number,
    countryRank: Number,
    pp: mongoose.Types.Decimal128,
    scoreStats: {
        type: Map,
        totalScore: mongoose.Types.Decimal128,
        totalRankedScore: mongoose.Types.Decimal128,
        averageRankedAccuracy: mongoose.Types.Decimal128,
        totalPlayCount: Number,
        rankedPlayCount: Number,
    }
}, {
    collection: 'Users'
});

module.exports = mongoose.model("Users", Users, "Users");