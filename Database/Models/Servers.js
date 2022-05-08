const mongoose = require("mongoose");

const Servers = new mongoose.Schema({
	serverID: String,
	prefix: String, // Not used, my be used in the future
	user_count: Number,
	stickyLeaderboard: {
		type: new mongoose.Schema({
			messageID: String,
			channelID: String,
			lastUpdated: Date, // For stats purpose
		}), 
		default: undefined,
	},
	weeklyLeaderboard: {
		type: new mongoose.Schema({
			messageID: String,
			channelID: String,
			lastUpdated: Date, // For stats purpose
		}), 
		default: undefined,
	},
	dailyLeaderboard: {
		type: new mongoose.Schema({
			messageID: String,
			channelID: String,
			lastUpdated: Date, // For stats purpose
		}), 
		default: undefined,
	},
}, {
	collection: 'Servers'
}, {
	minimize: false
});

module.exports = mongoose.model("Servers", Servers, "Servers");