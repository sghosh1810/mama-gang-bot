//File system lib
const fs = require('fs');

//Discord.js libs and config.json import
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const mongoose = require('mongoose');
const Announcements = require('./models/Announcements')
const cron = require('node-cron');
const client = new Discord.Client();
client.commands = new Discord.Collection();

//Loads env file
require('dotenv').config();

//Maps available commands from commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

//Used for error tracking via Sentry.io
const Sentry = require('@sentry/node');
const { config, nextTick } = require('process');
Sentry.init({ dsn: process.env.SENTRY_URI });

//Loads all commands from commands folder
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

//Sets activity state of bot on ready
client.on("ready", async() =>{
    console.log(`Logged in as ${client.user.tag}!`);
	client.user.setPresence({
		status: 'online',
		activity: {
			name: 'type !help',
			type: 'WATCHING'
		}
	});
	await connect_db();
	await announcments_scheduler();
 });

//Sets default role of members when they join
 client.on('guildMemberAdd', (guildMember) => {
	guildMember.roles.add(guildMember.guild.roles.cache.find(role => role.name === "MINI MAMA"));
 });


//All Commands
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (!client.commands.has(command)) return;

	try {
        client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('There was an error trying to execute that command!');
	}
});

//Connects to MongoDb
async function connect_db() {
	mongoose.connect(
    	process.env.DATABASE_URI,
    	{ useNewUrlParser: true ,useUnifiedTopology: true}
	).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));
}

//Sets a cron job to run get_announcements every 5 minute
async function announcments_scheduler(){
	cron.schedule('*/5 * * * *', async() => {
		await get_announcements();
	});
}

//Posts and fetch new Annoucments from db
async function get_announcements() {
	const channel = client.channels.cache.get('516609534228168706');
	const announcement = await Announcements.find({});
	announcement.forEach(async(element) => {
		const embed = new Discord.MessageEmbed()
		embed.setColor('DARKER_GREY')
		.setTitle('Announcement')
		.setDescription(element.message)
		.setFooter(`Announced by ${element.author}`)
		await channel.send(embed);
		await Announcements.findByIdAndDelete({_id:element._id});
	});
	
}

client.login(process.env.TOKEN);
