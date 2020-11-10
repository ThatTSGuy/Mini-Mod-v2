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
        } else if (command == 'add' && msg.member.hasPermission('MANAGE_MESSAGES')) {
            //Checks to make sure there are arguments present and makes sure the type of filter is on of the four  
            if (['word', 'phrase', 'role', 'channel'].includes(args[0])) {
                //Makes sure the type of filter is on of the four    
                let text = args.slice(1).join(' ').trim();
                if (text == '') {
                    const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The ${args[0]} can't be empty`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                } else {
                    if (args[0] == 'role') {
                        //Make sure the role is in role-id format not <@&id-here> format and that it is a valid role
                        if (text.startsWith('<@&')) text = text.slice(3, -1);
                        if (isNaN(text) || !msg.member.guild.roles.cache.has(text)) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The ${args[0]}, "${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : text}" is not a valid`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                            
                            return;
                        };
                    } else if (args[0] == 'channel') {

                    };

                    db.newFilter(msg.member.guild.id, args[0], text).then(err => {
                        if (err) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The ${args[0]}, "${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : text}" is already in the filter`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                        } else {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`✅ The ${args[0]}, "${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : text}" has been added to the filter`);
                            embed.setColor(0x00ff1a);
                            msg.channel.send(embed);
                        };
                    });
                };
            } else {
                msg.channel.send(`Command invalid, correct usage is \`f!add <word/phrase/role/channel> <text to filter>\``);
            };
        } else if (command == 'remove' && msg.member.hasPermission('MANAGE_MESSAGES')) {
            //Checks to make sure there are arguments present and makes sure the type of filter is on of the four  
            if (['word', 'phrase', 'role', 'channel'].includes(args[0])) {
                //Makes sure the type of filter is on of the four    
                let text = args.slice(1).join(' ').trim();
                if (text == '') {
                    const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The ${args[0]} can't be empty`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                } else {
                    if (args[0] == 'role') {
                        //Make sure the role is in role-id format not <@&id-here> format and that it is a valid role
                        if (text.startsWith('<@&')) text = text.slice(3, -1);
                        if (isNaN(text) || !msg.member.guild.roles.cache.has(text)) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The ${args[0]}, "${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : text}" is not a valid`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                            
                            return;
                        };
                    } else if (args[0] == 'channel') {

                    };
                
                    db.removeFilter(msg.member.guild.id, args[0], text).then(err => {
                    if (err) {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`⛔ The ${args[0]}, "${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : text}" is not in the filter`);
                        embed.setColor(0xff1100);
                        msg.channel.send(embed);
                    } else {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`✅ The ${args[0]}, "${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : text}" has been removed from the filter`);
                        embed.setColor(0x00ff1a);
                        msg.channel.send(embed);
                    };
                });
            };
            } else {
                msg.channel.send(`Command invalid, correct usage is \`f!remove <word/phrase/role/channel> <text to filter>\``);
            };
        } else if (command == 'list' && msg.member.hasPermission('MANAGE_MESSAGES')) {
            db.getFilter(msg.member.guild.id).then(filter => {
                let words = '';
                let phrases = '';
                let roles = '';
                let channels = '';

                //Go throught each filter entry and add it to a text based list to display it
                filter.words.forEach(word => words += `\n${word.text}`);
                filter.phrases.forEach(phrase => phrases += `\n${phrase.text}`);
                filter.roles.forEach(role => roles += `\n<@&${role.text}>`);
                filter.channels.forEach(channel => channels += `\n<#${channel.text}>`);

                //If filters are empty, set text to "Empty"
                words = words == '' ? 'Empty' : words;
                phrases = phrases == '' ? 'Empty' : phrases
                roles = roles == '' ? 'Empty' : roles;
                channels = channels == '' ? 'Empty' : channels

                const embed = new Discord.MessageEmbed();
                embed.setTitle('🔇 Filter');
                embed.addField('Words:', words);
                embed.addField('Phrases:', phrases);
                embed.addField('Role Exeptions:', roles);
                embed.addField('Channel Exeptions:', channels);
                embed.setColor(0x4a54ed);

                msg.channel.send(embed);
            });
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