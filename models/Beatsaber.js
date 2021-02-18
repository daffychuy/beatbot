const mongoose = require("mongoose");

const BeatSaber = new mongoose.Schema({
    serverID: { type: String, unique: true},
    discordID: { type: String, unique: true},
    scoresaberID: { type: String, unique: true},
	UserData: Object,
}, {
    collection: 'beatsaber'
});

module.exports = mongoose.model("beatsaber", BeatSaber, "beatsaber");