const mongoose = require("mongoose");

const Users = new mongoose.Schema({
    serverID: String,
    discordID: String,
    name: String,
    profilePicture: String,
    scoresaberID: String,
    country: String,
    rank: Number,
    pastRank: Number,
    countryRank: Number,
    pastCountryRank: Number,
    pp: mongoose.Types.Decimal128,
    pastPP: mongoose.Types.Decimal128, // Used to track weekly pp
    scoreStats: {
        type: Map,
        totalScore: mongoose.Types.Decimal128,
        totalRankedScore: mongoose.Types.Decimal128,
        averageRankedAccuracy: mongoose.Types.Decimal128,
        totalPlayCount: Number,
        rankedPlayCount: Number,
    },
}, {
    collection: 'Users'
}, {
	minimize: false
});

module.exports = mongoose.model("Users", Users, "Users");