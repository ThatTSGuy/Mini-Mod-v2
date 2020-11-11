const db = require('./dbdriver');
const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client;
client.once('ready', () => { console.log('Bot authed into Discord API, bot ready') });

client.on('message', msg => {
    //console.log(`message: "${msg.content}" from "${msg.author.tag}" in channel "${msg.channel.name}" in server "${msg.guild}"`) Debug stuff (pls no deletey)
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
        } else if (command == 'help' && msg.member.roles.cache.find(role => role.name == 'Bot Master')) {
            let embed = new Discord.MessageEmbed();
            embed.setTitle('📰 List of Commands');
            embed.addField('ping', 'Pings the bot and returns the ping\n`f!ping`');
            embed.addField('list', 'Lists all entrys in filter\n`f!list`');
            embed.addField('add', 'Adds a filter entry\n`f!add <filter/role/channel> <text/role/channel to be filtered`');
            embed.addField('remove', 'Removes a filter entry\n`f!add <filter/role/channel> <text/role/channel to be filtered`');
            embed.addField('purge', 'Bulk deletes messages\n`f!purge <amount to delete>`');
            embed.addField('kill', '**Only use in emergencies**\nKills all bot processes, and restart\n`f!kill`');
            embed.setFooter('Pin\'s Mini-Mod v2', config.embedIcon)
            embed.setColor(0x4287f5);
            msg.channel.send(embed);
        } else if (command == 'add' && msg.member.roles.cache.forEach(role => { if(role.name == 'Filter Controller') return true })) {
            //Checks to make sure there are arguments present and makes sure the type of filter is on of the four  
            if (['filter', 'role', 'channel'].includes(args[0])) {
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
                            embed.setDescription(`⛔ The role <@&${text}> is not valid`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                            
                            return;
                        };
                    } else if (args[0] == 'channel') {
                        if (text.startsWith('<#')) text = text.slice(2, -1);
                        if (isNaN(text) || !msg.member.guild.channels.cache.has(text)) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The channel <#${text}> is not valid`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                            
                            return;
                        };
                    };

                    db.newFilter(msg.member.guild.id, args[0], text).then(err => {
                        if (err) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The ${args[0]}, ${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : `"${text}"`} is already in the filter`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                        } else {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`✅ The ${args[0]}, ${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : `"${text}"`} has been added to the filter`);
                            embed.setColor(0x00ff1a);
                            msg.channel.send(embed);
                        };
                    });
                };
            } else {
                msg.channel.send(`Command invalid, correct usage is \`f!add <filter/role/channel> <text or role to filter>\``);
            };
        } else if (command == 'remove' && msg.member.roles.cache.forEach(role => { if(role.name == 'Filter Controller') return true })) {
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
                            embed.setDescription(`⛔ The role <@&${text}> is not valid`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                            
                            return;
                        };
                    } else if (args[0] == 'channel') {
                        if (text.startsWith('<#')) text = text.slice(2, -1);
                        if (isNaN(text) || !msg.member.guild.channels.cache.has(text)) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ The channel <#${text}> is not valid`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                            
                            return;
                        };
                    };
                
                    db.removeFilter(msg.member.guild.id, args[0], text).then(err => {
                    if (err) {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`⛔ The ${args[0]}, "${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : `"${text}"`} is not in the filter`);
                        embed.setColor(0xff1100);
                        msg.channel.send(embed);
                    } else {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`✅ The ${args[0]}, ${args[0] == 'role' ? `<@&${text}>` : args[0] == 'channel' ? `<#${text}>` : `"${text}"`} has been removed from the filter`);
                        embed.setColor(0x00ff1a);
                        msg.channel.send(embed);
                    };
                });
            };
            } else {
                msg.channel.send(`Command invalid, correct usage is \`f!remove <filter/role/channel> <text or role to filter>\``);
            };
        } else if (command == 'list' && msg.member.roles.cache.forEach(role => { if(role.name == 'Filter Controller') return true })) {
            db.getFilter(msg.member.guild.id).then(filter => {
                let filters = '';
                let roles = '';
                let channels = '';

                //Go throught each filter entry and add it to a text based list to display it
                filter.filters.forEach(filter => filters += `\n${filter.text}`);
                filter.roles.forEach(role => roles += `\n<@&${role.text}>`);
                filter.channels.forEach(channel => channels += `\n<#${channel.text}>`);

                //If filters are empty, set text to "Empty"
                filters = filters == '' ? 'Empty' : filters;
                roles = roles == '' ? 'Empty' : roles;
                channels = channels == '' ? 'Empty' : channels

                const embed = new Discord.MessageEmbed();
                embed.setTitle('🔇 Filter/Exeptions List');
                embed.addField('Text Filters:', filters);
                embed.addField('Role Exeptions:', roles);
                embed.addField('Channel Exeptions:', channels);
                embed.setColor(0x4a54ed);

                msg.channel.send(embed);
            });
        } else if (command == 'purge' && msg.member.roles.cache.forEach(role => { if(role.name == 'Filter Controller') return true })) {
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
        } else if (command == 'kill' && msg.member.roles.cache.forEach(role => { if(role.name == 'Filter Controller') return true })) {
            console.log(`USER ${msg.author.tag} KILLED BOT`)
            process.exit(0);
        };
    } else {
        let filtered = false;
        db.getFilter(msg.member.guild.id).then(filter => {
            //Checks if text from the message is in the filter, if so, remove it
            filter.filters.forEach(filter => { if (msg.content.includes(filter.text)) filtered = true });
            
            //Checks to see if the users has a exeption role or is in an exeption channel    
            filter.roles.forEach(role => { if (msg.member.roles.cache.has(role.text)) filtered = false });
            filter.channels.forEach(channel => { if (msg.channel.id == channel.text) filtered = false });   

            //If message should be filtered, remove it and send moderation message
            if (filtered) {
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