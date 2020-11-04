const wordFilter = require('./filter/filter.js');
const http = require('http');
const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client;

client.once('ready', () => { console.log('Bot authed into Discord API, bot ready') });

client.on('message', msg => {
    console.log(`message: "${msg.content}" from "${msg.author.tag}" in channel "${msg.channel.name}" in server "${msg.guild}"`)
    if (msg.author.bot) return;

    if (msg.content.startsWith(config.prefix)) {
        const args = msg.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command == 'ping') {
            let apiPing = { 'name': 'API Ping: ', 'value': Date.now() - msg.createdAt + 'ms' };
            let clientPing = { 'name': 'Client Ping: ', 'value': client.ws.ping + 'ms' };

            let embed = new Discord.MessageEmbed();
            embed.setTitle('Pong! :ping_pong:');
            embed.addFields([apiPing, clientPing])
            embed.setColor(0x4287f5);

            msg.channel.send(embed);
        } else if (command == 'purge' && msg.member.hasPermission('MANAGE_MESSAGES')) {
            if (args[0] > 100) {
                msg.delete();
                msg.channel.send(`Can't delete more than 100 messages`).then(replyMsg => {
                    setTimeout(() => { replyMsg.delete() }, 3000);
                });
            } else {
                msg.delete();
                msg.channel.bulkDelete(((args[0]) ? args[0] : 20), true).then(messages => {
                    msg.channel.send(`Purged ${messages.size} messages`).then(replyMsg => {
                        setTimeout(() => { replyMsg.delete() }, 3000);
                    });
                }).catch((err) => {
                    msg.channel.send(`Error purging`).then(replyMsg => {
                        setTimeout(() => { replyMsg.delete() }, 3000);
                    });
                });
            };
        } else if (command == 'kill' && msg.member.hasPermission('MANAGE_MESSAGES')) {
            console.log(`USER ${msg.author.tag} KILLED BOT`)
            process.exit(0);
        };
    } else {
        if (wordFilter.filter(msg.content) /*&& !msg.member.hasPermission('MANAGE_MESSAGES')*/) {
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
    };
});

client.login(config.token);

//Server
const server = http.createServer((req, res) => {
    res.end('Hello World!');
}).listen('8080');