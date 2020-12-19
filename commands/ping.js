const Discord = require('discord.js');
const client = new Discord.Client();
module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message) {
		const embed = new Discord.MessageEmbed()
		const color = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6); //Generates random hex color code
		embed.setColor(`${color}`).setAuthor('Mama Gang Bot', 'https://cdn.discordapp.com/app-icons/500547253048442880/6d93b7bf0e9bfaa73046a1dfde5eeb70.png').addFields({name:"Ping",value:`${message.client.ws.ping}`}).setTimestamp();
		message.channel.send(embed);
	}
};