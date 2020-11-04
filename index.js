const db = require('./dbdriver');
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
        } else if (command == 'filter' && msg.member.hasPermission('MANAGE_MESSAGES')) {
            if (args[0]) {
                if (args[0] == 'add') {
                    if (args.length < 3) {
                        db.newWord(msg.member.guild.id, args[1]).then(err => {
                            if (!err) {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription(`✅ Word "${args[1]}" added to filter`);
                                embed.setColor(0x00ff1a);
                                msg.channel.send(embed);
                            } else {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription(`⛔ Word "${args[1]}" already in filter`);
                                embed.setColor(0xff1100);
                                msg.channel.send(embed);
                            };
                        });
                    } else {
                        let phrase = args.slice(1).join(' ');
                        db.newPhrase(msg.member.guild.id, phrase).then(err => {
                            if (!err) {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription(`✅ Phrase "${phrase}" added to filter`);
                                embed.setColor(0x00ff1a);
                                msg.channel.send(embed);
                            } else {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription(`⛔ Phrase "${phrase}" already in filter`);
                                embed.setColor(0xff1100);
                                msg.channel.send(embed);
                            };
                        });
                    };
                } else if (args[0] == 'remove') {
                    if (args.length < 3) {
                        db.deleteWord(msg.member.guild.id, args[1]).then(result => {
                            if (!result) {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription('⛔ No matching word');
                                embed.setColor(0xff1100);
                                msg.channel.send(embed);
                            } else {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription(`✅ Word "${args[1]}" deleted from filter`);
                                embed.setColor(0x00ff1a);
                                msg.channel.send(embed);
                            };
                        });
                    } else {
                        let phrase = args.slice(1).join(' ');
                        db.deletePhrase(msg.member.guild.id, phrase).then(result => {
                            if (!result) {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription('⛔ No matching phrase');
                                embed.setColor(0xff1100);
                                msg.channel.send(embed);
                            } else {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription(`✅ Phrase "${phrase}" deleted from filter`);
                                embed.setColor(0x00ff1a);
                                msg.channel.send(embed);
                            };
                        });
                    };
                } else {
                    msg.channel.send(`Command invalid, correct usage is \`!pins filter (add/remove) word/phrase\``)
                };
            } else {
                db.getFilter(msg.member.guild.id).then(filter => {
                    let words = '';
                    let phrases = '';

                    filter.words.forEach(word => words += `\n${word.text}`);
                    filter.phrases.forEach(phrase => phrases += `\n${phrase.text}`);

                    words = words == '' ? 'Empty' : words;
                    phrases = phrases == '' ? 'Empty' : phrases

                    const embed = new Discord.MessageEmbed();
                    embed.setTitle('Filter 🔇');
                    embed.addField('Words:', words);
                    embed.addField('Phrases:', phrases);
                    embed.setColor(0x4a54ed);

                    msg.channel.send(embed);
                });
            };
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
        let filtered = false;
        db.getFilter(msg.member.guild.id).then(filter => {
            filter.words.forEach(word => { if (msg.content.includes(word.text)) filtered = true });
            filter.phrases.forEach(phrase => { if (msg.content.includes(phrase.text)) filtered = true });

            if (filtered && !msg.member.hasPermission('MANAGE_MESSAGES')) {
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
    };
});

client.login(config.token);