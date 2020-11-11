/* 
Pins 'edit' 11/6/2020  
Added channel/category exceptions (maybe?)
TODO:
Add logchannel feature
add checks for invalid channels and categories
push to pins-edit branch of repo
make sure checks stop the rest of code from executing or whatever

Pins' edit 11/7
Added role filter(s)
Added debug command
Cleaned up just a few things (not really lmao)
To Do:
clean up things for real
make a better help command
bug testing!!!
*/

const db = require('./dbdriver');
const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client;
const debug = new Set();

client.once('ready', () => { console.log('Bot authed into Discord API, bot ready') });

client.on('message', msg => {
    if (msg.author.bot) return;
    if (debug.has(msg.author.id)) console.log(`Message: "${msg.content}" from "${msg.author.tag}" sent in channel "${msg.channel.name}" in server "${msg.guild}"`)
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
            //change to an embed when i feel like it
            if (args[0]) {
                if (args[0] == 'add') {
                    if (args[1] === undefined) return msg.reply("invalid arguments!");
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
                    if (args[1] === undefined) return msg.reply("invalid arguments!");
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
                } else if (args[0] === "channel") {
                    /*
                    if (!(args[1] === 'add')) return msg.reply("invalid arguments!").then(replyMsg => {
                        replyMsg.delete({ timeout: 5000 });
                    });
                    if (!(args[1] === 'remove')) return msg.reply("invalid arguments!").then(replyMsg => {
                        replyMsg.delete({ timeout: 5000 });
                    });
                    */
                   /*
                    if (args[2] === undefined) return msg.reply("invalid channel!").then(replyMsg => {
                        replyMsg.delete({ timeout: 5000 });
                    });
                    */
                    if (args[1] === 'add') {
                    if (args[2] === undefined) return msg.reply("invalid arguments!");
                    db.newChannel(msg.member.guild.id, args[2]).then(err => {
                        let checkchannel = msg.guild.channels.cache.get(args[2]);
                        if (checkchannel === undefined) return msg.reply("invalid channel!");
                        if (!err) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`✅ Channel <#${args[2]}> added as an exception`);
                            embed.setColor(0x00ff1a);
                            msg.channel.send(embed);
                        } else {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`⛔ Channel <#${args[2]}> is already an exception.`);
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                        };
                    });
                } else {
                    if (args[1] === 'remove') {
                        if (args[2] === undefined) return msg.reply("invalid arguments!");
                        db.deleteChannel(msg.member.guild.id, args[2]).then(result => {
                            if (!result) {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription('⛔ No matching channel!');
                                embed.setColor(0xff1100);
                                msg.channel.send(embed);
                            } else {
                                const embed = new Discord.MessageEmbed();
                                embed.setDescription(`✅ Channel <#${args[2]}> deleted from exceptions`);
                                embed.setColor(0x00ff1a);
                                msg.channel.send(embed);
                            };
                        });
                    }
                }
            } else if (args[0] === "category") {
                /*
                if (!(args[1] === 'add')) return msg.reply("invalid arguments!").then(replyMsg => {
                    replyMsg.delete({ timeout: 5000 });
                });
                if (!(args[1] === 'remove')) return msg.reply("invalid arguments!").then(replyMsg => {
                    replyMsg.delete({ timeout: 5000 });
                });
                */
               /*
                if (args[2] === undefined) return msg.reply("invalid channel!").then(replyMsg => {
                    replyMsg.delete({ timeout: 5000 });
                });
                */
                if (args[1] === 'add') {
                    if (args[2] === undefined) return msg.reply("invalid arguments!");
                    db.newCategory(msg.member.guild.id, args[2]).then(err => {
                    // add code for category check
                    //if (checkcategory === undefined) return msg.reply("invalid channel!");
                    if (!err) {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`✅ Category <#${args[2]}> added as an exception`);
                        embed.setColor(0x00ff1a);
                        msg.channel.send(embed);
                    } else {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`⛔ Category <#${args[2]}> is already an exception.`);
                        embed.setColor(0xff1100);
                        msg.channel.send(embed);
                    };
                });
                
            } else {
                if (args[1] === 'remove') {
                    if (args[2] === undefined) return msg.reply("invalid arguments!");
                    db.deleteCategory(msg.member.guild.id, args[2]).then(result => {
                        if (!result) {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription('⛔ No matching category!');
                            embed.setColor(0xff1100);
                            msg.channel.send(embed);
                        } else {
                            const embed = new Discord.MessageEmbed();
                            embed.setDescription(`✅ Category <#${args[2]}> deleted from exceptions`);
                            embed.setColor(0x00ff1a);
                            msg.channel.send(embed);
                        };
                    });
                }
            }
        } else if (args[0] === "role") {
            if (args[1] === "add") {
                if (args[2] === undefined) return msg.reply("invalid arguments!");
                db.newRole(msg.member.guild.id, args[2]).then(err => {
                    // add code for category check
                    //if (checkcategory === undefined) return msg.reply("invalid channel!");
                    if (!err) {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`✅ Role <@&${args[2]}> added as an exception`);
                        embed.setColor(0x00ff1a);
                        msg.channel.send(embed);
                    } else {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`⛔ Role <@&${args[2]}> is already an exception.`);
                        embed.setColor(0xff1100);
                        msg.channel.send(embed);
                    };
                });
            } else 
            if (args[1] === "remove") {
                if (args[2] === undefined) return msg.reply("invalid arguments!");
                db.deleteRole(msg.member.guild.id, args[2]).then(result => {
                    if (!result) {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription('⛔ No matching role!');
                        embed.setColor(0xff1100);
                        msg.channel.send(embed);
                    } else {
                        const embed = new Discord.MessageEmbed();
                        embed.setDescription(`✅ Role <@&${args[2]}> deleted from exceptions`);
                        embed.setColor(0x00ff1a);
                        msg.channel.send(embed);
                    };
                });
            } else {
                msg.channel.send(`Incorrent command usage. Use the \'${config.prefix}help\` command for help.`)
            }
        } else {
                    msg.channel.send(`Command invalid, correct usage is \`${config.prefix}filter (add/remove/*channel*) <word/phrase/*add*> [*channelID*]\``)
                };
            } else {
                db.getFilter(msg.member.guild.id).then(filter => {
                    let words = '';
                    let phrases = '';
                    let channels = '';
                    let categories = '';
                    let roles = '';

                    filter.words.forEach(word => words += `\n${word.text}`);
                    filter.phrases.forEach(phrase => phrases += `\n${phrase.text}`);
                    filter.channels.forEach(channel => channels += `\n<#${channel.text}>`);
                    filter.categories.forEach(category => categories += `\n<#${category.text}>`)
                    filter.roles.forEach(role => roles += `\n<@&${role.text}>`)

                    words = words == '' ? 'Empty' : words;
                    phrases = phrases == '' ? 'Empty' : phrases;
                    channels = channels == '' ? 'Empty' : channels;
                    categories = categories == '' ? 'Empty' : categories;
                    roles = roles == '' ? 'Empty' : roles;

                    const embed = new Discord.MessageEmbed();
                    embed.setTitle('Filter 🔇');
                    embed.addField('Words:', words);
                    embed.addField('Phrases:', phrases);
                    embed.addField('Channels:', channels);
                    embed.addField('Categories:', categories);
                    embed.addField(`Roles:`, roles);
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
        } else if (command == 'kill' && msg.member.hasPermission('MANAGE_MEMBERS')) {
            console.log(`USER ${msg.author.tag} KILLED BOT AT ${Date.now()}`)
            process.exit(0)
        } else if (command === `help`) {
            let hm = new Discord.MessageEmbed()
                hm.setTitle(`Help Menu`)
                hm.addField(`Commands`, `--------------------------------------------------\n**Check the list of current filters/exceptions:**\n\`${config.prefix}filter\`\n\n**Add a filter term:**\n\`${config.prefix}filter add <word/phrase>\`\n\n**Remove a filter term:**\n\`${config.prefix}filter remove <word/phrase>\`\n\n**Add a channel exception:**\n\`${config.prefix}filter channel add <channelID>\`\n\n**Remove a channel exception:**\n\`${config.prefix}filter channel remove <channelID>\`\n\n**Kill the bot in an emergency:**\n\`${config.prefix}kill\``)
                hm.setFooter(`Pins\`s MiniMod v2`, config.embedIcon)
                hm.setTimestamp(Date.now());
                hm.setColor(`#fad609`)
            msg.channel.send(hm)
        } else if (command === `debug` || msg.member.hasPermission('MANAGE_MEMBERS')) {
            if(debug.has(msg.author.id)) {
                msg.reply("you've left debug mode!")
                debug.delete(msg.author.id)
            } else
            if (!debug.has(msg.author.id)) {
            debug.add(msg.author.id)
            msg.reply("you've entered debug mode. Run the command again to exit.")
            }
        }
    } else {
        let filtered = false;
        let channel = msg.guild.channels.cache.get(msg.channel.id);
        db.getFilter(msg.member.guild.id).then(filter => {
            filter.words.forEach(word => { if (msg.content.includes(word.text)) filtered = true });
            filter.phrases.forEach(phrase => { if (msg.content.includes(phrase.text)) filtered = true });
            filter.channels.forEach(channel => { if (msg.channel.id.includes(channel.text)) filtered = false });
            filter.categories.forEach(category => { if (channel.parentID.includes(category.text)) filtered = false });
            filter.roles.forEach(role => { if (msg.member.roles.cache.has(role.text) && !debug.has(msg.author.id)) filtered = false });
            if (filtered) {
                msg.delete();
                console.log(`Message sent by ${msg.member.displayName} deleted in ${msg.channel.name}.\nMessage content: "${msg.content}"`)
                /*
                const embed = new Discord.MessageEmbed();
                embed.setDescription(`<@${msg.author.id}>, please don\'t matchmake in this channel!`);
                embed.setFooter('Pin\'s Mini-Mod v2', config.embedIcon)
                embed.setColor('#db4444');
                */
               let response = `<@${msg.author.id}>, please don't matchmake in this channel!` 
                msg.channel.send(response)
                    .then(replyMsg => {
                        setTimeout(() => {
                            replyMsg.delete();
                        }, 8000);
                    });
            };
        });
    };
});

client.login(config.token);