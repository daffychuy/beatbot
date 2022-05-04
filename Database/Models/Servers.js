const mongoose = require("mongoose");

const Servers = new mongoose.Schema({
	serverID: String,
	prefix: String,
	user_count: Number,
}, {
	collection: 'Servers'
});

module.exports = mongoose.model("Servers", Servers, "Servers");