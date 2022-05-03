const config = require('../config.json');
const mongoose = require("mongoose");

(async () =>{
	try {
		await mongoose.connect(`mongodb://${config.DB_USER}:${config.DB_PASS}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });
		if (mongoose.connection.readyState === 1) console.log("MongoDB Connected")
	} catch (err) {
		console.error(err);
	}
})()