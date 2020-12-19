const DabiImages = require("dabi-images");
const DabiClient = new DabiImages.Client(); 
const {MessageAttachment} = require('discord.js')

module.exports = {
	name: 'nsfw',
	description: 'NSFW images from Dabi Library npm',
	async execute(message) {
		const args = message.content.slice(1).trim().split(/ +/);
		
		DabiClient.nsfw.real.random().then(res => {
            message.channel.send(new MessageAttachment(res.url))
        }).catch(error => {
            console.log(error);
		});
	},
};