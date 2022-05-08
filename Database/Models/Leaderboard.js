const mongoose = require("mongoose");

const Leaderboard = new mongoose.Schema({
    serverID: String,
    scoresaberID: String,
	discordID: String,
	ranking: Number,
	pastRanking: Number,
	globalRank: Number,
	pp: mongoose.Types.Decimal128,
	userDetails: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Users'
	}
}, {
    collection: 'Leaderboard'
}, {
	minimize: false
});

module.exports = mongoose.model("Leaderboard", Leaderboard, "Leaderboard");