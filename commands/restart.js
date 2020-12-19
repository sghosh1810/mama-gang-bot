module.exports = {
	name: 'restart',
	description: 'Bot Restart Module',
	async execute(message) {
        if(message.author.id=='254892192991019009'){
            await message.channel.send('Restarting backend services...');
            process.exit();
        } else {
            message.channel.send('Bot can only be restarted by Duxorhell');
        }
        
	}
};