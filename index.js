const wordFilter = require('./filter/filter.js');
const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client;

client.once('ready', () => { console.log('Bot authed into Discord API, bot ready') });

client.on('message', msg => {
    if (wordFilter.filter(msg.content)) {
        msg.delete();

        const embed = new Discord.MessageEmbed();
        embed.setDescription(`<@${msg.author.id}>, please don\'t matchmake in this channel!`);
        embed.setFooter('Pin\'s Mini-Mod v2', config.embedIcon)
        embed.setColor('#db4444');

        msg.channel.send(embed)
            .then(replyMsg => {
                setTimeout(() => {
                    replyMsg.delete();
                }, 3000);
            });
    };
});

client.login(config.token);