// const config = require('../config.json');
require('dotenv').config()

const mongoose = require("mongoose");

const config = process.env;
(async () =>{
	try {
		await mongoose.connect(`mongodb://${config.DB_USER}:${config.DB_PASS}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });
		if (mongoose.connection.readyState === 1) console.log("MongoDB Connected")
	} catch (err) {
		console.error(err);
	}
})()