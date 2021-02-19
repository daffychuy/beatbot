const mongoose = require("mongoose");

const BeatSaber = new mongoose.Schema({
    serverID: String,
    discordID: String,
    scoresaberID: String,
	UserData: Object,
}, {
    collection: 'beatsaber'
});

module.exports = mongoose.model("beatsaber", BeatSaber, "beatsaber");