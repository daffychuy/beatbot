const mongoose = require("mongoose");

const Users = new mongoose.Schema({
    serverID: String,
    discordID: String,
    scoresaberID: String,
	UserData: Object,
}, {
    collection: 'users'
});

module.exports = mongoose.model("users", Users, "users");