const DabiImages = require("dabi-images");
const DabiClient = new DabiImages.Client(); 
const {MessageAttachment} = require('discord.js')

module.exports = {
	name: 'hentai',
	description: 'Hentai images from Dabi Library npm',
	execute(message) {
		DabiClient.nsfw.hentai.panties().then(res => {
            message.channel.send(new MessageAttachment(res.url))
        }).catch(error => {
			message.channel.send("An error occurred while fulfilling this request. Ask Duxorhell to check Sentry logs UwU");
            console.log(error);
        });
	}
};