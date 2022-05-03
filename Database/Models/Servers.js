const mongoose = require("mongoose");

const Servers = new mongoose.Schema({
	serverID: String,
	prefix: String,
	user_count: Int,
}, {
	collection: 'servers'
});

module.exports = mongoose.model("BeatSaber", Servers, "servers");