const { MessageEmbed } = require("discord.js");

const errorEmbed = () => {
	return new MessageEmbed()
		.setColor(0xff4757);
} 

const successEmbed = () => {
	return new MessageEmbed()
		.setColor(0x2ed573);
}

const warningEmbed = () => {
	return new MessageEmbed()
		.setColor(0xff7f50);
}

const genericEmbed = () => {
	return new MessageEmbed()
		.setColor(0xced6e0);
}

module.exports = {
	errorEmbed,
	successEmbed,
	warningEmbed,
	genericEmbed
}