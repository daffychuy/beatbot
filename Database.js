const config = require('./config.json');
const mongoose = require("mongoose");

try {
	mongoose.connect(`mongodb://${config.DB_USER}:${config.DB_PASS}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true });
} catch (err) {
	console.error(err);
}