const request = require('request');// Request for api
const {MessageAttachment} = require('discord.js')

module.exports = {
	name: 'meme',
	description: 'Generates random memes from api!',
	execute(message) {
		request(' https://meme-api.herokuapp.com/gimme', { json: true }, (err, req, res) => {
			if (err) { return console.log(err); }
            message.channel.send(new MessageAttachment(res.url));
        });
	},
};