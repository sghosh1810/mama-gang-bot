const Discord = require("discord.js");
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const queue = new Map();
const axios = require("axios");

module.exports = {
    name: "music",
    description: "Music bot",
    execute(message) {
        const prefix = "!music";
        if (message.author.bot) return;
        const serverQueue = queue.get(message.guild.id);
        if (message.content.startsWith(`${prefix} play`)) {
            execute(message, serverQueue);
            return;
        } else if (message.content.startsWith(`${prefix} skip`)) {
            skip(message, serverQueue);
            return;
        } else if (message.content.startsWith(`${prefix} stop`)) {
            stop(message, serverQueue);
            return;
        } else {
            message.channel.send("You need to enter a valid command!");
        }
        async function execute(message, serverQueue, retry = 0) {
            const args = message.content.split(" ");
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) return message.channel.send("You need to be in a voice channel to play music!");
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.channel.send("I need the permissions to join and speak in your voice channel!");
            }
            console.log(args);
            try {
                const songInfo = await ytdl.getInfo(args[2]);
                const song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                };

                if (!serverQueue) {
                    const queueContruct = {
                        textChannel: message.channel,
                        voiceChannel: voiceChannel,
                        connection: null,
                        songs: [],
                        volume: 5,
                        playing: true,
                    };

                    queue.set(message.guild.id, queueContruct);

                    queueContruct.songs.push(song);

                    try {
                        var connection = await voiceChannel.join();
                        queueContruct.connection = connection;
                        play(message.guild, queueContruct.songs[0]);
                    } catch (err) {
                        console.log(err);
                        queue.delete(message.guild.id);
                        return message.channel.send(err);
                    }
                } else {
                    serverQueue.songs.push(song);
                    return message.channel.send(`${song.title} has been added to the queue!`);
                }
            } catch (e) {
                if (retry > 0) {
                    return;
                }
                var config = {
                    method: "get",
                    url: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${args.slice(2, args.length).join(" ")}&type=video&key=${process.env.YT_API_KEY}`,
                    headers: {},
                };
                // console.log(config.url);
                axios(config)
                    .then(function (response) {
                        message.content = `${prefix} play https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
                        execute(message, serverQueue, ++retry);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        }

        function skip(message, serverQueue) {
            if (!message.member.voice.channel) return message.channel.send("You have to be in a voice channel to stop the music!");
            if (!serverQueue) return message.channel.send("There is no song that I could skip!");
            serverQueue.connection.dispatcher.end();
        }

        function stop(message, serverQueue) {
            if (!message.member.voice.channel) return message.channel.send("You have to be in a voice channel to stop the music!");

            if (!serverQueue) return message.channel.send("There is no song that I could stop!");

            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end();
        }

        function play(guild, song) {
            const serverQueue = queue.get(guild.id);
            if (!song) {
                serverQueue.voiceChannel.leave();
                queue.delete(guild.id);
                return;
            }

            const dispatcher = serverQueue.connection
                .play(ytdl(song.url))
                .on("finish", () => {
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0]);
                })
                .on("error", (error) => console.error(error));
            dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            serverQueue.textChannel.send(`Start playing: **${song.title}**`);
        }
    },
};
