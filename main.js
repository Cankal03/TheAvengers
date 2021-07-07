const Discord = require("discord.js");
DisTube = require('distube')
const Client = new Discord.Client();
require('discord-buttons')(Client);
const { MessageButton, MessageActionRow } = require("discord-buttons")
const token = 'DEIN TOKEN'
const fs = require("fs")
const warnFile = require("./warns.json");
const serverstats = require("./servers.json");
const musikserverstats = require("./musik.json");
const enmap = require("enmap");
const moment = require("moment");
const api = require("imageapi.js");
const distube = new DisTube(Client, { searchSongs: true, emitNewSongOnly: true });
const { error } = require("console");
const UrlofImages = require('get-image-urls');
const queryString = require('querystring');

const settings = new enmap({
    name: "settings",
    autoFetch: true ,
    cloneLevel: "deep",
    fetchAll: true


});

Client.on("guildMemberAdd", async member =>{
    let channel = member.guild.channels.cache.find(ch => ch.id === serverstats[member.guild.id].welcomechannel);
    if(!channel || channel.id === undefined) return;
    if(!serverstats[member.guild.id].welcomemsg) return;
    channel.send(`<:member_join:846729870964949002> <@!${member.id}> ${serverstats[member.guild.id].welcomemsg}\nCurrent Members -> **${member.guild.memberCount}** <a:flyingironman:842294044393996328>`);

})

Client.on("guildMemberRemove", async member =>{
    let channel = member.guild.channels.cache.find(ch => ch.id === serverstats[member.guild.id].leavechannel);
    if(!channel || channel.id === undefined) return;
    channel.send(`<:RedArrow:846744117844377600> **${member.user.username}** are left **${member.guild.name}**\n**Goodbye!** <a:flyingironman:842294044393996328>\nCurrent Members -> **${member.guild.memberCount}**`);

})

Client.on("message", async (message) => {

if(!musikserverstats[message.guild.id]){
        musikserverstats[message.guild.id] = {
            mprefix:"a!",
           
        }
    }
    fs.writeFile("./servers.json", JSON.stringify(musikserverstats), err =>{
        if(err){
            console.log(err);
        }
    })


    let mprefix = musikserverstats[message.guild.id].mprefix

    if(message.content.toLowerCase() === "nowmusicprefix?"){
        message.channel.send("Fettching Data [**10/10]**...").then(msg1=>{
            msg1.edit("<a:Loading:800341232870096938> Loading...").then(msg=>{
                msg.edit('The current Music prefix is **'+musikserverstats[message.guild.id].mprefix+'** . <a:flyingironman:842294044393996328>')

            })
        })
    }

    if(message.content.startsWith(mprefix+"setmusicprefix")){
        let newprefix = message.content.split(" ").slice(1).join("");

        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        musikserverstats[message.guild.id].mprefix = newprefix;

        message.channel.send("<a:Loading:800341232870096938> Updateing ... Fettching Data [10/10]").then(msg=>{
            msg.edit('Updated the Music prefix to **'+newprefix+'**. <a:flyingironman:842294044393996328>')
        })

        fs.writeFile("./servers.json",JSON.stringify(serverstats),function(err){
            if(err) console.log(err);
        })
    }


    if (message.author.bot) return;
    if (!message.content.startsWith(mprefix)) return;
    const args = message.content.slice(mprefix.length).trim().split(/ +/g);
    const command = args.shift();

    if (command == "play")
        distube.play(message, args.join(" "));

    if (["repeat", "loop"].includes(command))
        distube.setRepeatMode(message, parseInt(args[0]));

    if (command == "stop") {
        distube.stop(message);
        message.channel.send("Stopped the music!");
    }

    if (command == "skip")
        distube.skip(message);

    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).slice(0, 10).join("\n"));
    }

    if ([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`].includes(command)) {
        let filter = distube.setFilter(message, command);
        message.channel.send("Current queue filter: " + (filter || "Off"));
    }
});

// Queue status template
const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// DisTube event listeners, more in the documentation page
distube
    .on("playSong", (message, queue, song) => message.channel.send(
        `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
    .on("error", (message, e) => {
        console.error(e)
        message.channel.send("An error encountered: " + e);
    });

Client.on("message", async message =>{
    // WarnFile -> warns.json
    if(!warnFile[message.author.id+message.guild.id]){
        warnFile[message.author.id+message.guild.id] = {
            warns:0,
            maxwarn:3
        }
    }

    fs.writeFile("./warns.json", JSON.stringify(warnFile), function(err){
        if(err) console.log(err)
    })

    // Serverstats -> servers.json
    if(!serverstats[message.guild.id]){
        serverstats[message.guild.id] = {
            prefix:"a!",
            welcomechannel: undefined,
            welcomemsg: undefined,
            leavechannel : undefined,
            globalchat: undefined,
            suprole: undefined
        }
    }

    fs.writeFile("./servers.json", JSON.stringify(serverstats), err =>{
        if(err){
            console.log(err);
        }
    })

    let prefix = serverstats[message.guild.id].prefix;

    if(message.content.toLowerCase() === "nowprefix?"){
        message.channel.send("Fettching Data [**10/10]**...").then(msg1=>{
            msg1.edit("<a:Loading:800341232870096938> Loading...").then(msg=>{
                msg.edit('The current prefix is **'+serverstats[message.guild.id].prefix+'** . <a:flyingironman:842294044393996328>')

            })
        })
    }

    if(message.content.toLowerCase() === `close`){
        if(!message.channel.name.includes("ticket-")) return


        let closeembed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag)
        .setTitle("𝘾𝙡𝙤𝙨𝙚-𝙩𝙞𝙘𝙠𝙚𝙩 𝙢𝙖𝙘𝙝𝙞𝙣𝙚")
        .setColor("RED")
        .setDescription(`𝙔𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙘𝙡𝙤𝙨𝙚 𝙩𝙝𝙖𝙩 𝙩𝙞𝙘𝙠𝙚𝙩?`)
        .setThumbnail(message.author.displayAvatarURL({dynamic:true, size: 1024}))
        .setFooter(`${message.guild.name} | ${message.guild.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`[𝙮𝙚𝙨] = ✅ [𝙣𝙤] = ❌\n<a:missminuteshello:857915185087905802> [𝟭𝟱 𝙨𝙚𝙘𝙤𝙣𝙙𝙨]`,`[𝘽𝙤𝙩-𝙄𝙣𝙫𝙞𝙩𝙚](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [𝙎𝙪𝙥𝙥𝙤𝙧𝙩](https://discord.gg/rys9xBgF3q)`)

        let yescloseembed = new Discord.MessageEmbed()
        .setDescription("𝘿𝙚𝙡𝙚𝙩𝙞𝙣𝙜 𝙩𝙝𝙚 𝙘𝙝𝙖𝙣𝙣𝙚𝙡...")
        .setColor("RED")

        let nocloseembed = new Discord.MessageEmbed()
        .setDescription(`𝙏𝙝𝙚 𝙥𝙧𝙤𝙘𝙚𝙨𝙨 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙖𝙗𝙤𝙧𝙩𝙚𝙙... <a:flyingironman:842294044393996328>`)
        .setColor("FEE75C")

        let filtererrorembed = new Discord.MessageEmbed()
        .setDescription(`<a:missminuteshello:857915185087905802> 𝙏𝙝𝙚 𝙩𝙞𝙢𝙚 𝙞𝙨 𝙪𝙥... [𝟭𝟱 𝙨𝙚𝙘𝙤𝙣𝙙𝙨]`)
        .setColor("FEE75C")
        
            message.channel.send(closeembed).then(msg=>{
    
                msg.react("✅").then(()=>{
                    msg.react("❌");
                });
    
                const filter = (reaction, user) =>{
                    return ["✅","❌"].includes(reaction.emoji.name) && user.id === message.author.id;
                }
    
                msg.awaitReactions(filter,{time:15000, max:1}).then(collected=>{
                    const reaction = collected.first();
    
                    switch(reaction.emoji.name){
                        case "✅": message.channel.send(yescloseembed).then(()=>{
                            message.channel.delete()
                        })
                                reaction.users.remove(message.author);
                            break;
                        case "❌": message.channel.send(nocloseembed);
                            reaction.users.remove(message.author);
                            break;
                    }
    
                }).catch(err=>{
                    if(err) message.channel.send(filtererrorembed).then(()=>{
                        message.delete({timeout: 5000})
                    })
                })
    
            })
     
    }

    if(message.content.startsWith(prefix+"meme")){
        const subReddits = ["meme", "dankmemes", "memes"];
        const subreddit = subReddits[Math.floor(Math.random() * subReddits.length)];
        const meme = await api.advanced(subreddit)

        let memeembed = new Discord.MessageEmbed()
        .setColor("FEE75C")
        .setImage(meme.img)
        .setTitle(`r/${subreddit}`)
        .setDescription(`${meme.upvoteRatio}% 𝙤𝙛 𝙥𝙚𝙤𝙥𝙡𝙚 𝙡𝙞𝙠𝙚𝙙 𝙩𝙝𝙞𝙨.`)
        .setURL(`https://reddit.com/r/${subreddit}`)

        message.channel.send(memeembed)
    }

    if(message.content.startsWith(prefix+"setprefix")){
        let newprefix = message.content.split(" ").slice(1).join("");

        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        serverstats[message.guild.id].prefix = newprefix;

        message.channel.send("<a:Loading:800341232870096938> Updateing ... Fettching Data [10/10]").then(msg=>{
            msg.edit('Updated the prefix to **'+newprefix+'**. <a:flyingironman:842294044393996328>')
        })

        fs.writeFile("./servers.json",JSON.stringify(serverstats),function(err){
            if(err) console.log(err);
        })
    }

    if(message.content.startsWith(prefix+"setticket")){
        let channel = message.mentions.channels.first();
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply("You need **MANAGE_CHANNELS** premissions.")
        if(!channel) return message.reply("Usage: ``setticket <#channel>``");

        let sent = await channel.send(new Discord.MessageEmbed()
        .setTitle("𝙏𝙞𝙘𝙠𝙚𝙩𝙨")
        .setDescription("𝙏𝙤 𝙘𝙧𝙚𝙖𝙩𝙚 𝙖 𝙩𝙞𝙘𝙠𝙚𝙩 𝙧𝙚𝙖𝙘𝙩 𝙬𝙞𝙩𝙝 🎫")
        .setFooter(`${message.guild.name} | 𝙏𝙞𝙘𝙠𝙚𝙩-𝙎𝙮𝙨𝙩𝙚𝙢 `, message.guild.iconURL({dynamic: true}))
        .setColor("FEE75C")
        );

        sent.react("🎫")
        settings.set(`${message.guild.id}-tickt`, sent.id)

        message.channel.send("Set Up Done!")

    }

if(message.content.toLowerCase() === `${prefix}invite`){

let button = new MessageButton()
  .setStyle('red') 
  .setLabel(`The Avengers#0919 | Vers. 1.2 | ${Client.guilds.cache.size} servers!`) 
  .setID('red')
  .setEmoji("798602709371977759") 

let button2 = new MessageButton()
  .setStyle('url') 
  .setLabel('Support') 
  .setEmoji("842294044393996328")
  .setURL("https://discord.gg/rys9xBgF3q'")
  
let button3 = new MessageButton()
  .setStyle('url') 
  .setLabel('Bot-Invite') 
  .setEmoji("858080315217936424")
  .setURL('https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot')

message.channel.send('Hey, i am **'+Client.user.tag+"** support me and invite me into your server <a:missminuteshello:857915185087905802>", {
  buttons: [
    button,button2,button3
  ]
});
    }
   

     // Set Global 

    if(message.content.startsWith(prefix+"setglobal")){
        let channel = message.mentions.channels.first();
        if(!channel) return message.channel.send("Du hast keinen Kanal aneggeben.").then(msg=>msg.delete({timeout:"5000"}));
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send("Du hast keien Rechte dafür.").then(msg=>msg.delete({timeout:"5000"}));
        if(!serverstats[message.guild.id].globalchat){
            serverstats[message.guild.id].globalchat = undefined
        }
        serverstats[message.guild.id].globalchat = channel.id;
        
        
        message.channel.send("**Updatet the *global* channel to <#"+channel.id+">.** ")
        
        let unlockedembed = new Discord.MessageEmbed()
        .setColor("FEE75C")
        .setDescription("**The Global chat is now *unlocked*, have fun!**\n*Please read the rules in the channel topic* <a:flyingironman:842294044393996328>")
        channel.send(unlockedembed)
        channel.setTopic("┖─ 〡<:TA_A1Resamble:798602709371977759> The Avengers global [Beta]  〡─┒\nGerman and English Server\n> You like Marvel?\nBe it Comic or Films, then come in!\nOf curse, everyone else is welcome too.\nWhat we offer :\n<:support_badge:856254638608613436> ┃ Own Discord Bot\n<a:chat:846468463550660649> ┃A clean layout\n<a:tonylike:822953023025971271> ┃A level system with Features\n<:Loki:828557265111482377> ┃ Yearly Events\n<a:S1_WV:842291947920949259> ┃ Marvel News\n<a:missminuteshello:857915185087905802> ┃ Exclusive Marvel Emotes\nRules[3]\n• Dein grundlegender Umgangston sollte fortlaufend höflich und respektvoll und menschenfreundlich sein.\n• Ein aufmüpfiges Verhalten wie z.B. Beleidigungen und Provokation sollten tunlichts vermieden werden.\n•SPAM, NSFW sind ebenfalls zu unterlassen, Missachtung kann zum ausschluss des global Chat führen.\n(BETA)You can send only Discords Gifs!\n->  Join now  https://discord.gg/rys9xBgF3q")
    }

    if(message.content.startsWith(prefix+"delglobal")){
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send("You need the **MANAGE CHANNELS** premission.").then(msg=>msg.delete({timeout:"5000"}));
        if(!serverstats[message.guild.id].globalchat){
            serverstats[message.guild.id].globalchat = undefined
        }
        serverstats[message.guild.id].globalchat = "noID";
        message.channel.send("**Deleted the **global** channel from this guild.** ")
    }

    if(message.channel.id === serverstats[message.guild.id].globalchat && !message.content.startsWith(prefix) && !message.author.bot){
        Client.guilds.cache.forEach(async guild=>{
      if(serverstats[guild.id] !== undefined){
          if(serverstats[guild.id].globalchat){
            if(serverstats[guild.id].globalchat != "noID"){
              if(guild.channels.cache.get(serverstats[guild.id].globalchat)){   
                  
                

        let normalembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("People")
        .setColor("EB459E")
        .setDescription(`**${message.author.tag}**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)

        let ownerembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("Bot-Leitung")
        .setDescription(`**${message.author.tag}**`)
        .setColor("FEE75C")
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q) | [Server Invite](https://discord.gg/rys9xBgF3q)`)

        let supportembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("Support-Server")
        .setDescription(`**${message.author.tag}**`)
        .setColor("GREEN")
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)


        let adminembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("Moderator")
        .setDescription(`**${message.author.tag}**`)
        .setColor("#61ffef")
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)

        let vipembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("People")
        .setDescription(`**${message.author.tag}**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q) | [Server Invite](https://discord.gg/yNtYBycKQP)`)

        let vip1embed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("People")
        .setDescription(`**${message.author.tag}**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q) | [Server Invite](https://discord.gg/Gqqq9npbg8)`)

        let newsembed = new Discord.MessageEmbed()
        .setTitle("<:Mitteilung:847968046143504405> News")
        .setDescription(message.content)
        .setColor("BLACK")


        let lengthmessage = new Discord.MessageEmbed()
        .setColor("RED")
        .addField(`**Upps!**`,`**${message.author.tag}** at *${message.guild.name}*\n**You can also a message with *500 spaces.* ** <a:flyingironman:842294044393996328>`)
        
        
        let uploadfailed = new Discord.MessageEmbed()
        .setColor('RED')
        .addField('**Upload Failed**',`**${message.author.tag}** at **${message.guild.name}** *you can't sent **images** here*`)
        
                        
        

        
        
        
    

        if(!message.referenceIsNull(message.referenced_message))
        {
            ownerembed.addField(`*replys to* ${message.referenced_message.embeds[0].description}`, `${message.referenced_message.embeds[0].fields[0].name}`);
            normalembed.addField(`*replys to* ${message.referenced_message.embeds[0].description}`, `${message.referenced_message.embeds[0].fields[0].name}`);
            adminembed.addField(`*replys to* ${message.referenced_message.embeds[0].description}`, `${message.referenced_message.embeds[0].fields[0].name}`);
            vipembed.addField(`*replys to* ${message.referenced_message.embeds[0].description}`, `${message.referenced_message.embeds[0].fields[0].name}`);
            vip1embed.addField(`*replys to* ${message.referenced_message.embeds[0].description}`, `${message.referenced_message.embeds[0].fields[0].name}`);
            lengthmessage.addField(`*replys to* ${message.referenced_message.embeds[0].description}`, `${message.referenced_message.embeds[0].fields[0].name}`)
        }

        

        
        if(message.embeds.length > 0)
                        { 
                            guild.channels.cache.get(serverstats[guild.id].globalchat).send(uploadfailed);
                        }else{
                            if(message.content.length > 500){
                                guild.channels.cache.get(serverstats[guild.id].globalchat).send(lengthmessage);
                                }else{
                                    if(message.author.id === "679001378500247554"){
                                        guild.channels.cache.get(serverstats[guild.id].globalchat).send(ownerembed);
                                    }else{
                                        if(message.author.id === "774752109064486932"){
                                            guild.channels.cache.get(serverstats[guild.id].globalchat).send(adminembed);
                                        }else{
                                            if(message.author.id === "609546162415861810"){
                                                guild.channels.cache.get(serverstats[guild.id].globalchat).send(adminembed);
                                            }else{
                                                if(message.author.id === "734834308883415141"){
                                                    guild.channels.cache.get(serverstats[guild.id].globalchat).send(adminembed);
                                                }else{
                                                    if(message.author.id === "455469757467066369"){
                                                        guild.channels.cache.get(serverstats[guild.id].globalchat).send(newsembed);
                                                    }else{
                                                        if(message.guild.id === "740989028060495872"){
                                                            guild.channels.cache.get(serverstats[guild.id].globalchat).send(vipembed);
                                                        }else{
                                                            if(message.guild.id === "818434821465964555"){
                                                                guild.channels.cache.get(serverstats[guild.id].globalchat).send(vip1embed);
                                                            }else{
                                                                if(message.guild.id === "707636268074270751"){
                                                                    guild.channels.cache.get(serverstats[guild.id].globalchat).send(supportembed);
                                
                                                                }else{
                                                                guild.channels.cache.get(serverstats[guild.id].globalchat).send(normalembed);
                                                                }}}}}}}}}}}}
        
                                                            }}

                        }
                    
            

            
        
                            
    
            

          
                            

                           
                            
                                
                    
    
    
                            

                            
                            
        
            
        
            
            
                
                
    
            


        
       

        

            
            

        
        
        )
        message.delete()
        
      }

      if(message.content.startsWith(prefix+"whoavenger")){
        
        let user = message.mentions.members.first() || message.member;

        var rating = Math.floor(Math.random() * 9)
        
            let CaptainEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/003cap_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **Captain America**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let Captain1Embed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/434usa_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **U.S. Agent**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let ThorEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/004tho_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **Thor**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let WandaEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/012scw_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **Scarltet Witch**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
        
            let FalconEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/014fal_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **Sam Wilson**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
        
            let TonyEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://www.comicbasics.com/wp-content/uploads/2019/08/Tony-Stark-Comic.png")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **Tony Stark**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let PeterEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/005smp_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **Peter Paker**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
        
            let PeterQuillEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/021slq_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("FEE75C")
        .setDescription(`<@!${user.user.id}> are **Peter Quill**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
    
            let BlackWEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/011blw_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setDescription(`<@!${user.user.id}> are **Natasha Romanoff**`)
        .setColor("FEE75C")
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
        
            let NoAvengerEmbed = new Discord.MessageEmbed()
        .setColor("RED")
        .setThumbnail("https://banner2.cleanpng.com/20180822/rg/kisspng-portable-network-graphics-computer-icons-error-ima-soylent-red-error-7-icon-free-soylent-red-error-5b7d3124044210.2536301815349312360175.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setDescription(`<@!${user.user.id}> not **everyone** can be a Avenger! `)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))

        if(rating == 1){
            message.channel.send(CaptainEmbed)
        }else{
            if(rating == 2){
                message.channel.send(Captain1Embed)

            }else{
                if(rating == 3){
                    message.channel.send(ThorEmbed)
                }else{
                    if(rating == 4){
                        message.channel.send(WandaEmbed)
                    }else{
                        if(rating == 5){
                            message.channel.send(FalconEmbed)
                        }else{
                            if(rating == 6){
                                message.channel.send(TonyEmbed)
                            }else{
                                if(rating == 7){
                                    message.channel.send(PeterEmbed)
                                }else{
                                    if(rating == 8){
                                        message.channel.send(PeterQuillEmbed)
                                    }else{
                                        if(rating == 9){
                                            message.channel.send(BlackWEmbed)
                                        }else{
                                            message.channel.send(NoAvengerEmbed)
}}}}}}}}}
}

     
      if(message.content.startsWith(prefix+"userinfo")){

        message.channel.send("<a:Loading:800341232870096938> 𝙂𝙚𝙩𝙩𝙞𝙣𝙜 𝘿𝙖𝙩𝙖... [𝟭𝟬/𝟭𝟬]")

        let user = message.mentions.members.first() || message.member;
        var status = user.presence.status;


        if(status == "dnd") status = "<:dnd2:852635614645977158> 𝘿𝙤 𝙉𝙤𝙩 𝘿𝙞𝙨𝙩𝙪𝙧𝙗"
        if(status == "idle") status = "<:idle:852635747470540810> 𝙄𝙙𝙡𝙚"
        if(status == "online") status = "<:online:852635705749798912> 𝙊𝙣𝙡𝙞𝙣𝙚"
        if(status == "offline") status = "<:offline:852635667720568842> 𝙊𝙛𝙛𝙡𝙞𝙣𝙚"

        const userflags = user.user.flags.toArray();
        
        const roles = user.roles.cache
        .sort((a,b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, -1)

        let displayroles;

        if(roles.length < 1){
            displayroles = "𝙉𝙤 𝙍𝙤𝙡𝙚𝙨"
        }else{
            if(roles.length < 20) {
                displayroles= roles.join(' ')
            } else {
                if(roles.length >= 20){
                    displayroles= roles.slice(20).join(' ')
                } else {
                    if(roles.length >= 30){
                        displayroles= roles.slice(30).join(' ')
                    } else {
                        if(roles.length >= 40){
                            displayroles= roles.slice(40).join(' ')
                        } else {
                            if(roles.length >= 50){
                                displayroles= roles.slice(50).join(' ')
                            } else {
                                if(roles.length >= 60){
                                    displayroles= roles.slice(60).join(' ')
                                } else {
                                    if(roles.length >= 70){
                                        displayroles= roles.slice(70).join(' ')
                                    } else {
                                        if(roles.length >= 80){
                                            displayroles= roles.slice(80).join(' ')
                                        } else {
                                            if(roles.length >= 90){
                                                displayroles= roles.slice(90).join(' ')
                                            } else {
                                                if(roles.length >= 100){
                                                    displayroles= roles.slice(100).join(' ')
                                                } else {
                                                    if(roles.length >= 110){
                                                        displayroles= roles.slice(110).join(' ')
                                                    } else {
                                                        if(roles.length >= 120){
                                                            displayroles= roles.slice(120).join(' ')
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } 
                            }
                        }
                    }
                }
                
            } 
            

        }

        let displayflags;
    
        if(userflags.length < 1){
            displayflags = "𝙉𝙤 𝘿𝙞𝙨𝙘𝙤𝙧𝙙-𝙁𝙡𝙖𝙜𝙨"
        }else{
            if(userflags.length > 1) {
                displayflags= userflags.join(' ')
            } 

        }

        if(!user.nickname) user.nickname = "𝙉𝙤𝙣𝙚"
        
        let userinfoembed = new Discord.MessageEmbed()
        .setThumbnail(user.user.displayAvatarURL({dynamic: true}))
        .setTitle(`<a:flyingironman:842294044393996328> 𝙐𝙨𝙚𝙧𝙄𝙣𝙛𝙤 𝙢𝙖𝙘𝙝𝙞𝙣𝙚`)
        .setDescription(`<:verify_bot:856172918928965632> 𝘽𝙤𝙩-𝙋𝙧𝙚𝙛𝙞𝙭 -> **${prefix}**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        .setDescription(`<@!${user.user.id}>`)
        .setColor("FEE75C")
        .addField(`𝙐𝙨𝙚𝙧𝙣𝙖𝙢𝙚`, `${user.user.tag}`)
        .addField(`𝙉𝙞𝙘𝙠𝙣𝙖𝙢𝙚`, `${user.nickname}`)
        .addField(`𝙄𝘿`, `${user.user.id}`)
        .addField(`𝙇𝙞𝙣𝙠`, `[𝘼𝙫𝙖𝙩𝙖𝙧 𝙐𝙍𝙇](${user.user.displayAvatarURL({dynamic:true})})`)
        .addField(`𝘾𝙧𝙚𝙖𝙩𝙚𝙙`, `${moment(user.user.createdAt).format("DD-MM-YYYY [at] HH:mm")}`)
        .addField(`𝙅𝙤𝙞𝙣𝙚𝙙 𝙎𝙚𝙧𝙫𝙚𝙧`, `${moment(user.joinedAt).format("DD-MM-YYYY [at] HH:mm")}`)
        .addField(`𝘿𝙞𝙨𝙘𝙤𝙧𝙙-𝙎𝙩𝙖𝙩𝙪𝙨`, `${status}`)
        .addField(`𝘿𝙞𝙨𝙘𝙤𝙧𝙙-𝙁𝙡𝙖𝙜𝙨` ,`[${userflags.length}]`)
        .addField(`𝙍𝙤𝙡𝙚𝙨 [${roles.length}]`, `${displayroles}`)
        
        message.channel.send(userinfoembed).catch(err=>{
            if(err) return message.channel.send("An error happend "+err);
            
        });

       
      }

      if(message.content.startsWith(prefix+"serverinfo")){

        message.channel.send("<a:Loading:800341232870096938> 𝙂𝙚𝙩𝙩𝙞𝙣𝙜 𝘿𝙖𝙩𝙖... [𝟭𝟬/𝟭𝟬]")

        const roles = message.guild.roles.cache
        .sort((a,b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, -1)

        let displayroles;

        if(roles.length < 1){
            displayroles = "𝙉𝙤 𝙍𝙤𝙡𝙚𝙨"
        }else{
            if(roles.length < 20) {
                displayroles= roles.join(' ')
            } else {
                if(roles.length >= 20){
                    displayroles= roles.slice(18).join(' ')
                } else {
                    if(roles.length >= 30){
                        displayroles= roles.slice(28).join(' ')
                        
                    } else {
                        if(roles.length >= 40){
                            displayroles= roles.slice(38).join(' ')
                            
                        } else {
                            if(roles.length >= 50){
                                displayroles= roles.slice(48).join(' ')
                                
                            } else {
                                if(roles.length >= 60){
                                    displayroles= roles.slice(58).join(' ')
                                    
                                } else {
                                    if(roles.length >= 70){
                                        displayroles= roles.slice(68).join(' ')
                                        
                                    } else {
                                        if(roles.length >= 80){
                                            displayroles= roles.slice(78).join(' ')
                                            
                                        } else {
                                            if(roles.length >= 90){
                                                displayroles= roles.slice(88).join(' ')
                                                
                                            } else {
                                                if(roles.length >= 100){
                                                    displayroles= roles.slice(98).join(' ')
                                                    
                                                } else {
                                                    if(roles.length >= 110){
                                                        displayroles= roles.slice(108).join(' ')
                                                        
                                                    } else {
                                                        if(roles.length >= 120){
                                                            displayroles= roles.slice(118).join(' ')
                                                            
                                                        } else {
                                                            if(roles.length >= 130){
                                                                displayroles= roles.slice(128).join(' ')
                                                                
                                                            } else {
                                                                
                                                                displayroles= roles.slice(138).join(' ')
                                                                    
                                                                
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }  

            
        }
    
            let server = {
                logo: message.guild.iconURL({dynamic: true}),
                name: message.guild.name,
                createdAt: message.guild.createdAt,
                id: message.guild.id,
                owner: message.guild.owner.user.id,
                region: message.guild.region,
                verified:  message.guild.verified,
        
            }

            const members = message.guild.members.cache;
            const channels = message.guild.channels.cache;
            const emojis = message.guild.emojis.cache;
    
            let embed = new Discord.MessageEmbed()
            .setTitle(`<a:flyingironman:842294044393996328> 𝙎𝙚𝙧𝙫𝙚𝙧𝙄𝙣𝙛𝙤 𝙢𝙖𝙘𝙝𝙞𝙣𝙚`)
            .setDescription(`<:verify_bot:856172918928965632> 𝘽𝙤𝙩-𝙋𝙧𝙚𝙛𝙞𝙭 -> **${prefix}**`)
            .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
            .setColor("FEE75C")
            .setThumbnail(server.logo)
            .addField("𝙎𝙚𝙧𝙫𝙚𝙧-𝙉𝙖𝙢𝙚",server.name)
            .addField("𝙎𝙚𝙧𝙫𝙚𝙧-𝙊𝙬𝙣𝙚𝙧",`<@!${server.owner}>`)
            .addField("𝙎𝙚𝙧𝙫𝙚𝙧-𝙄𝘿",server.id)
            .addField("𝙎𝙚𝙧𝙫𝙚𝙧-𝙍𝙚𝙜𝙞𝙤𝙣",server.region)
            .addField("𝙎𝙚𝙧𝙫𝙚𝙧-𝘽𝙤𝙤𝙨𝙩-𝙇𝙚𝙫𝙚𝙡",`${message.guild.premiumTier ? `Tier ${message.guild.premiumTier}` : 'None'}`)
            .addField(`𝘾𝙧𝙚𝙖𝙩𝙚𝙙`, `${moment(message.guild.createdAt).format("DD-MM-YYYY [at] HH:mm")}`)
            .addField("𝙑𝙚𝙧𝙞𝙛𝙞𝙯𝙞𝙚𝙧𝙩",server.verified)
            .addField(`𝙍𝙤𝙡𝙚𝙨`, `[${roles.length}]`)
            .addField('𝙎𝙩𝙖𝙩𝙞𝙨𝙩𝙞𝙘𝙨', [
                `𝙀𝙢𝙤𝙟𝙞𝙨 -> ${emojis.size}`,
                `𝙍𝙚𝙜𝙪𝙡𝙖𝙧 𝙀𝙢𝙤𝙟𝙞𝙨 -> ${emojis.filter(emoji => !emoji.animated).size}`,
                `𝘼𝙣𝙞𝙢𝙖𝙩𝙚𝙙 𝙀𝙢𝙤𝙟𝙞𝙨 -> ${emojis.filter(emoji => emoji.animated).size}`,
                `𝙈𝙚𝙢𝙗𝙚𝙧𝙨 -> ${message.guild.memberCount}`,
                `𝙃𝙪𝙢𝙖𝙣𝙨 -> ${members.filter(member => !member.user.bot).size}`,
                `𝘽𝙤𝙩𝙨 -> ${members.filter(member => member.user.bot).size}`,
                `𝙏𝙚𝙭𝙩-𝙘𝙝𝙖𝙣𝙣𝙚𝙡𝙨 -> ${channels.filter(channel => channel.type === 'text').size}`,
                `𝙑𝙤𝙞𝙘𝙚-𝙘𝙝𝙖𝙣𝙣𝙚𝙡𝙨 -> ${channels.filter(channel => channel.type === 'voice').size}`,
                `𝘽𝙤𝙤𝙨𝙩𝙚𝙧𝙨 -> ${message.guild.premiumSubscriptionCount || '0'}`,
                '\u200b'
            ])
    
            message.channel.send(embed).catch(err=>{
                if(err) return message.channel.send("An error happend "+err);
                
            });
            

            

      }

    if(message.content === prefix+"react"){

        let text = message.content.split(" ").slice(1).join(" ");
        if(!text) return message.channel.send("NO reacting staff.")

        message.channel.send(text).then(msg=>{
            msg.react('👍') 
        })
    }

    if(message.content.startsWith(prefix+"setwelcmsg")){

        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        if(!serverstats[message.guild.id].welcomemsg){
            serverstats[message.guild.id].welcomemsg = undefined
        }

        let newmsg = message.content.split(" ").slice(1).join(" ");

        if(!newmsg) return message.reply("Du hast keine Nachricht angegeben.").then(msg=>msg.delete({timeout:"5000"}));
    
        serverstats[message.guild.id].welcomemsg = newmsg

        message.channel.send("<a:Loading:800341232870096938> Updateing ...").then(msg=>{
            msg.edit(`Updatet the **welcome message** to ->\n${newmsg} <a:flyingironman:842294044393996328>`)
        })
        

        fs.writeFile("./servers.json", JSON.stringify(serverstats), function(err){
            if(err) console.log(err);
        })
    }


    // Set Welcome und Leave 

    if(message.content.startsWith(prefix+"setwelcome")){
        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        if(!serverstats[message.guild.id].welcomechannel){
            serverstats[message.guild.id].welcomechannel = undefined
        }

        let newcwelcome = message.mentions.channels.first();

        if(!newcwelcome) return message.reply("Du hast keinen Kanal angegeben!").then(msg=>msg.delete({timeout:"5000"}));
    
        serverstats[message.guild.id].welcomechannel = newcwelcome.id;

        message.channel.send("<a:Loading:800341232870096938> Updateing ...").then(msg=>{
            msg.edit("Updatet the welcome channel to <#"+newcwelcome.id+"> <a:flyingironman:842294044393996328>")
        })

        fs.writeFile("./servers.json", JSON.stringify(serverstats), function(err){
            if(err) console.log(err);
        })
    }

    if(message.content.startsWith(prefix+"setsuprole")){
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply("You need **MANAGE CHANNELS** rights.");

        if(!serverstats[message.guild.id].suprole){
            serverstats[message.guild.id].suprole = undefined
        }

        let newsuprole = message.mentions.roles.first();

        if(!newsuprole) return message.reply("add a role!").then(msg=>msg.delete({timeout:"5000"}));
    
        serverstats[message.guild.id].suprole = newsuprole.id;

        message.channel.send("<a:Loading:800341232870096938> Updateing ...").then(msg=>{
            msg.edit(`Updatet the suprole to <@&${newsuprole.id}> <a:flyingironman:842294044393996328>`)
        })
        

        fs.writeFile("./servers.json", JSON.stringify(serverstats), function(err){
            if(err) console.log(err);
        })
    }

    if(message.content.startsWith(prefix+"setleave")){
        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        if(!serverstats[message.guild.id].leavechannel){
            serverstats[message.guild.id].leavechannel = undefined
        }

        let newleave = message.mentions.channels.first();

        if(!newleave) return message.reply("Du hast keinen Kanal angegeben!").then(msg=>msg.delete({timeout:"5000"}));
    
        serverstats[message.guild.id].leavechannel = newleave.id;

        message.channel.send("<a:Loading:800341232870096938> Updateing ...").then(msg=>{
            msg.edit("Updatet the welcome channel to <#"+newleave.id+"> <a:flyingironman:842294044393996328>")
        })
        

        fs.writeFile("./servers.json", JSON.stringify(serverstats), function(err){
            if(err) console.log(err);
        })
    }

    if(message.content.startsWith(prefix+"delleave")){
        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");
        
        serverstats[message.guild.id].leavechannel = undefined

        message.channel.send("<a:Loading:800341232870096938> Deleting ...").then(msg=>{
            msg.edit("Removed the leave channel. <a:flyingironman:842294044393996328>")
        })
    }

    if(message.content.startsWith(prefix+"delwelcome")){
        serverstats[message.guild.id].welcomechannel = undefined

        message.channel.send("<a:Loading:800341232870096938> Deleting ...").then(msg=>{
            msg.edit("Removed the welcome channel. <a:flyingironman:842294044393996328>")
        })
    }

    if(message.content.startsWith(prefix+"kick")){
        let user = message.mentions.users.first();
        let grund = message.content.split(" ").slice(2).join(" ");
        if(message.author == user) return message.reply("**TF..?** you can't kick yourself")
        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You need **KICK_MEMBERS** rights.");

        if(!user) return message.channel.send("Mention a User!")
       
    
        if(!grund) grund = "No Reason given"

        if(message.guild.member(user).kickable == true){
            message.channel.send(`<@!${user.id}> was kicked by <@!${message.author.id}>, at **${message.guild.name}**\n**Reason** -> ${grund} <a:flyingironman:842294044393996328>`)
            message.guild.member(user).kick(grund)
        }
        if(message.guild.member(user).kickable == false){
            message.channel.send(`I can't kick <@!${user.id}>, he has **more premission** then me. <a:flyingironman:842294044393996328>`)
        }

    }

    /*if(message.content.startsWith(prefix+"ban")){
        const user = message.mentions.users.first(); // returns the user object if an user mention exists
        const banReason = message.slice(2).join(' '); // Reason of the ban (Everything behind the mention)

        if (!user) {
            
            if (user === message.author) return message.channel.send('You can\'t ban yourself'); // Check if the user mention or the entered userID is the message author himsmelf
            if (!reason) return message.reply('You forgot to enter a reason for this ban!'); // Check if a reason has been given by the message author
            if (!message.guild.member(user).bannable) return message.reply('You can\'t ban this user because you the bot has not sufficient permissions!'); // Check if the user is bannable with the bot's permissions
            await message.guild.ban(user) // Bans the user
            ​
            const banConfirmationEmbed = new Discord.MessageEmbed()
            .setColor('RED')
            .setDescription(`✅ ${user.tag} has been successfully banned!\nReason -> ${banReason}`);
            message.channel.send({
            embed: banConfirmationEmbed
            })
            
    }
}*/
    

    
    // Warn System
    if(message.content.startsWith(prefix+"warn")){
        let user = message.mentions.users.first();
        let grund = message.content.split(" ").slice(2).join(" ");
        if(message.author == user) return message.reply("**TF..?** you can't warn yourself")
        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You need **KICK_MEMBERS** rights.");

        if(!user) return message.channel.send("Mention a User!")
    
        if(!grund) grund = "No Reason given"

        let embed = new Discord.MessageEmbed()
        .setTitle("WARN!")
        .setDescription(`**Attention** <@!${user.id}>, you've been **warned** <a:flyingironman:842294044393996328>!\n**Reason** -> ${grund}`)
        .setThumbnail(user.displayAvatarURL({dynamic: true}))
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        .setColor("FEE75C")

        message.channel.send(embed)

        if(!warnFile[user.id+message.guild.id]){
            warnFile[user.id+message.guild.id] = {
                warns:0,
                maxwarn:3
            }
        }
    
        warnFile[user.id+message.guild.id].warns += 1

        if(warnFile[user.id+message.guild.id].warns > warnFile[user.id+message.guild.id].maxwarn){
            if(message.guild.member(user).kickable == true){
                message.channel.send(`<@!${user.id}> was kicked beacause of **4 Warns**! <a:flyingironman:842294044393996328>`)
                message.guild.member(user).kick(grund)
            }
        
            delete warnFile[user.id+message.guild.id]
        }

        fs.writeFile("./warns.json", JSON.stringify(warnFile), function(err){
            if(err) console.log(err)
        })
    
    }

    

    if(message.content.startsWith(prefix+"nowwarn")){
        let user = message.mentions.users.first() || message.author

        if(!warnFile[user.id+message.guild.id]){
            warnFile[user.id+message.guild.id] = {
                warns:0,
                maxwarn:3
            }
        }

        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You need **KICK_MEMBERS** rights.");

        if(!user) return message.channel.send("Mention a User!")
        
            
        message.channel.send(`<@!${user.id}> has  **${warnFile[user.id+message.guild.id].warns}** warns, at **${message.guild.name}** ! <a:flyingironman:842294044393996328>`).catch(err=>{
            message.channel.send(err)
        })

    }

    if(message.content.startsWith(prefix+"delwarn")){
        let user = message.mentions.users.first() || message.author

        if(!warnFile[user.id+message.guild.id]){
            warnFile[user.id+message.guild.id] = {
                warns:0,
                maxwarn:3
            }
        }

        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You need **KICK_MEMBERS** rights.");

        warnFile[user.id+message.guild.id].warns = 0
        
            
        message.channel.send(`<@!${user.id}> has been removed all warns.\n Now he has **${warnFile[user.id+message.guild.id].warns}** warns, at **${message.guild.name}** ! <a:flyingironman:842294044393996328>`).catch(err=>{
            message.channel.send(err)
        })
    }
// Clear 
if(message.content.startsWith(prefix+"clear")){
     if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(':x: You need ``manage messages`` for that!')
      const args = message.content.split(' ').slice(1); 
      const amount = args.join(' '); 
        
       if (!amount) return message.channel.send(' :x: You havent given an amount of messages which should be deleted!'); 
       if (isNaN(amount)) return message.channel.send(' :x: The amount parameter isnt a number!'); 
       if (amount > 100) return message.channel.send(' :x: You cant delete more than 100 messages at once!');
       if (amount < 1) return message.channel.send(':x: You have to delete at least 1 message!');
                
       message.channel.messages.fetch({ limit: amount }).then(messages => { 
       message.channel.bulkDelete(messages)});

       message.channel.send("Deleting Messages... <a:Loading:800341232870096938> ").then(msg=>{
       msg.edit(`Deleted **${amount}** messages, form <#${message.channel.id}> at **${msg.guild.name}** <a:flyingironman:842294044393996328>`)
    })
}

if(message.content.startsWith(prefix+"react")){

    let text = message.content.split(" ").slice(1).join(" ");

    message.channel.send(text).then(msg=>{
        msg.react('👍')
        msg.react('👎')
    })
}

if(message.content.startsWith(prefix+"avatar")){
    let user = message.mentions.users.first() || message.author;

    let avatarembed = new Discord.MessageEmbed()
    .setTitle("avatar machine")
    .setColor("FEE75C")
    .setDescription(`**<@!${user.id}>'s Avatar**`)
    .setImage(user.displayAvatarURL({dynamic:true, size: 1024}))
    .addField("*Download*", `[URL](${user.displayAvatarURL({dynamic:true})}) | [Problems](https://discord.gg/rys9xBgF3q)`)
    .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
    message.channel.send(avatarembed)
  }

if(message.content.startsWith(`${prefix}howgay`)){
    let user = message.mentions.users.first() || message.author;

    var rating = Math.floor(Math.random() * 101)

    let how1gayembed = new Discord.MessageEmbed()
    .setTitle("gay r8 machine")
    .setDescription(`<@!${user.id}> is **${rating} %** gay. :rainbow_flag:`)
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setColor("RED")
    .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))

    let how2gayembed = new Discord.MessageEmbed()
    .setTitle("gay r8 machine")
    .setDescription(`<@!${user.id}> is **${rating} %** gay. :rainbow_flag:`)
    .setThumbnail(user.displayAvatarURL({dynamic:true}))
    .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
    .setColor("FEE75C")

    if(rating <= 50){
        message.channel.send(how1gayembed)
    }else{
        message.channel.send(how2gayembed)
    }
  }

if(message.content.startsWith(`${prefix}howsimp`)){
    let user = message.mentions.users.first() || message.author;

    var rating = Math.floor(Math.random() * 101)


    let how1simpembed = new Discord.MessageEmbed()
    .setTitle("gay r8 machine")
    .setDescription(`<@!${user.id}> is **${rating} %** simping.`)
    .setThumbnail(user.displayAvatarURL({dynamic: true}))
    .setColor("RED")
    .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))

    let how2simpembed = new Discord.MessageEmbed()
    .setTitle("gay r8 machine")
    .setDescription(`<@!${user.id}> is **${rating} %** simping.`)
    .setThumbnail(user.displayAvatarURL({dynamic: true}))
    .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
    .setColor("FEE75C")

    if(rating <= 50){
        message.channel.send(how1simpembed)
    }else{
        message.channel.send(how2simpembed)
    }   
}
// Help

if(message.content.toLowerCase() === `${prefix}help`){
        let helpembed = new Discord.MessageEmbed()
        .setThumbnail(message.guild.iconURL({dynamic: true}))
        .setTitle(`𝙃𝙚𝙡𝙥𝙞𝙣𝙜 𝘿𝙚𝙨𝙠`)
        .setDescription(`<:Bot:846734548652785714> 𝘽𝙤𝙩-𝙋𝙧𝙚𝙛𝙞𝙭 -> **${prefix}**\n`)
        .setColor("FEE75C")
        .setTimestamp()
        .setFooter(`${message.guild.name}`, message.guild.iconURL({dynamic: true}))
        .addField("Example",prefix+"𝙨𝙚𝙩𝙩𝙞𝙘𝙠𝙚𝙩 <#𝙘𝙝𝙖𝙣𝙣𝙚𝙡>",true)
        .addField("> __𝙈𝙖𝙧𝙫𝙚𝙡__ [1] <:marvel:798603820946423928>", "𝙬𝙝𝙤𝙖𝙫𝙚𝙣𝙜𝙚𝙧")
        .addField("> __𝙈𝙤𝙙𝙪𝙡𝙚__ [12] <a:config:846451153411637328>", "𝙨𝙚𝙩𝙩𝙞𝙘𝙠𝙚𝙩 <#channel>,𝙨𝙚𝙩𝙨𝙪𝙥𝙧𝙤𝙡𝙚 <@Role>\n𝙨𝙚𝙩𝙬𝙚𝙡𝙘𝙤𝙢𝙚/𝙨𝙚𝙩𝙡𝙚𝙖𝙫𝙚 <#channel>,𝙨𝙚𝙩𝙬𝙚𝙡𝙘𝙢𝙨𝙜,𝙙𝙚𝙡𝙬𝙚𝙡𝙘𝙤𝙢𝙚,𝙙𝙚𝙡𝙡𝙚𝙖𝙫𝙚\n𝙬𝙖𝙧𝙣/𝙣𝙤𝙬𝙬𝙖𝙧𝙣 <@User>,𝙙𝙚𝙡𝙬𝙖𝙧𝙣\n𝙘𝙡𝙚𝙖𝙧 <Amount>,𝙠𝙞𝙘𝙠/~~𝙗𝙖𝙣~~ <@User>")
        .addField("> __𝙈𝙖𝙞𝙣__ [7] <a:walker:842293073794564098>", "𝙨𝙚𝙧𝙫𝙚𝙧𝙞𝙣𝙛𝙤,𝙪𝙨𝙚𝙧𝙞𝙣𝙛𝙤 <@User>,𝙖𝙫𝙖𝙩𝙖𝙧 <@User>,𝙝𝙤𝙬𝙜𝙖𝙮 <@User>,𝙝𝙤𝙬𝙨𝙞𝙢𝙥 <@User>,𝙧𝙚𝙖𝙘𝙩 <Text>,𝙢𝙚𝙢𝙚")
        .addField("> __𝙇𝙤𝙜𝙨__ [4] <:support_badge:856254638608613436>", "𝙣𝙤𝙬𝙥𝙧𝙚𝙛𝙞𝙭?,𝙨𝙚𝙩𝙥𝙧𝙚𝙛𝙞𝙭 <newprefix>,𝙥𝙞𝙣𝙜,𝙞𝙣𝙫𝙞𝙩𝙚")
        .addField("> __𝘾𝙤𝙧𝙤𝙣𝙖__ [3] <a:Virus:846450994195726356>", "𝙘𝙤𝙫𝙞𝙙𝙧𝙤𝙗𝙚𝙧𝙩𝙠,𝙘𝙤𝙫𝙞𝙙𝙧𝙚𝙜𝙞𝙤𝙣,𝙘𝙤𝙫𝙞𝙙𝙘𝙤𝙪𝙣𝙩𝙧𝙮")
        .addField("> __𝙂𝙡𝙤𝙗𝙖𝙡 𝘾𝙝𝙖𝙩__ [2] (BETA)", "𝙨𝙚𝙩𝙜𝙡𝙤𝙗𝙖𝙡,𝙙𝙚𝙡𝙜𝙡𝙤𝙗𝙖𝙡")
        .addField("> __𝙈𝙪𝙨𝙞𝙘__ [7] <a:gamingthor:849176695675027457>","nowmusicprefix?,a!setmusicprefix <newprefix>,𝙖!𝙥𝙡𝙖𝙮 <YouTube URL> or <Title>,𝙖!𝙨𝙠𝙞𝙥,𝙖!𝙨𝙩𝙤𝙥,𝙖!𝙦𝙪𝙚𝙪𝙚,𝙖!𝙡𝙤𝙤𝙥")
        .addField(`Helpful URL's`,`[𝘽𝙤𝙩-𝙄𝙣𝙫𝙞𝙩𝙚](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [𝙎𝙪𝙥𝙥𝙤𝙧𝙩](https://discord.gg/rys9xBgF3q)`)


        message.channel.send(`𝙄 𝙝𝙤𝙥𝙚 𝙞𝙢 𝙝𝙚𝙡𝙥𝙞𝙣𝙜 𝙮𝙤𝙪... <a:flyingironman:842294044393996328>`, helpembed)

    }
    if(message.content.startsWith(prefix+"covidregion")){
        let corona1embed = new Discord.MessageEmbed()
        .setColor("FEE75C")
        .setTitle(`<a:Virus:846450994195726356> Corona situation global`)
        .setDescription("**DATA:** *Situation by WHO Region*")
        .setImage("https://cdn.discordapp.com/attachments/794390733813579777/859863558316359680/image1.png")
        .setFooter(`${message.guild.name}`, message.guild.iconURL({dynamic: true}))
        .setTimestamp()
        let button1 = new MessageButton()
  .setStyle('url') 
  .setEmoji("859867511520231434")
  .setLabel('Forwarding to WHO') 
  .setURL('https://covid19.who.int/')

  message.channel.send({embed: corona1embed, button: button1})

    }
    if(message.content.startsWith(prefix+"covidcountry")){
        let corona1embed = new Discord.MessageEmbed()
        .setColor("FEE75C")
        .setTitle(`<a:Virus:846450994195726356> Corona situation global`)
        .setDescription("**DATA:** *Situation by Country, Territory or Area*")
        .setImage("https://cdn.discordapp.com/attachments/794390733813579777/859863558590431242/image2.png")
        .setFooter(`${message.guild.name}`, message.guild.iconURL({dynamic: true}))
        .setTimestamp()
        let button1 = new MessageButton()
  .setStyle('url')
  .setEmoji("859867511520231434")
  .setLabel('Forwarding to WHO') 
  .setURL('https://covid19.who.int/')

  message.channel.send({embed: corona1embed, button: button1})

    }
    if(message.content.startsWith(prefix+"covidrobertk")){
        let corona1embed = new Discord.MessageEmbed()
        .setColor("FEE75C")
        .setTitle(`<a:Virus:846450994195726356> Corona situation germany`)
        .setDescription("**DATA:** *Situation by germany*")
        .setImage("https://cdn.discordapp.com/attachments/770763414960209930/861197737953460254/image0.png")
        .setFooter(`${message.guild.name}`, message.guild.iconURL({dynamic: true}))
        .setTimestamp()
        let button1 = new MessageButton()
  .setStyle('url') 
  .setEmoji("859867511520231434")
  .setLabel('Forwarding to Robert-Koch-Institut') 
  .setURL('https://experience.arcgis.com/experience/478220a4c454480e823b17327b2bf1d4/page/page_1/')

  message.channel.send({embed: corona1embed, button: button1})

    }
    




    if(message.content.startsWith(prefix+"ping")){
        message.channel.send("<a:Loading:800341232870096938> Pinging...").then(resultmessage=>{
            var ping = resultmessage.createdTimestamp - message.createdTimestamp

            
            

        let pingembed = new Discord.MessageEmbed()
        .setThumbnail(Client.user.displayAvatarURL({dynamic: true}))
        .setTitle(`Ping Desk`)
        .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
        .setColor("FEE75C")
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField("**"+message.guild.name+"** Latency is **"+ping+"** ms.\n**API** Latency is **"+Client.ws.ping+"** ms.","Note: ``Good!`` <a:flyingironman:842294044393996328>")
        message.channel.send(pingembed)
        })
    }
})





Client.on("guildCreate", (guild) =>{
    let channelToSendTo;

    guild.channels.cache.forEach((channel) =>{
        if(
            channel.type === "text" &&
            !channelToSendTo &&
            channel.permissionsFor(guild.me).has("SEND_MESSAGES")
        )
        channelToSendTo = channel;

        
    });

    if(!channelToSendTo);

    const channelembed = new Discord.MessageEmbed()
        .setTitle(`𝙏𝙝𝙖𝙣𝙠 𝙮𝙤𝙪! <a:flyingironman:842294044393996328>`)
        .setDescription(`<:verify_bot:856172918928965632> 𝙎𝙩𝙖𝙣𝙙𝙖𝙧𝙙-𝘽𝙤𝙩-𝙋𝙧𝙚𝙛𝙞𝙭 -> **a!**`)
        .setColor("FEE75C")
        .setFooter(`${Client.user.tag}`, Client.user.displayAvatarURL({dynamic: true}))
        .setTimestamp()
        .addField("𝙏𝙝𝙚 𝘼𝙫𝙚𝙣𝙜𝙚𝙧𝙨#𝟬𝟵𝟭𝟵", "𝙏𝙝𝙖𝙣𝙠 𝙮𝙤𝙪 𝙨𝙤 𝙢𝙪𝙘𝙝 𝙛𝙤𝙧 𝙞𝙣𝙫𝙞𝙩𝙞𝙣𝙜 𝙢𝙚 𝙩𝙤 𝙮𝙤𝙪𝙧 𝙨𝙚𝙧𝙫𝙚𝙧.\n𝙔𝙤𝙪 𝙜𝙚𝙩 𝙖𝙣 𝙤𝙫𝙚𝙧𝙫𝙞𝙚𝙬 𝙤𝙛 𝙢𝙮 𝙘𝙤𝙢𝙢𝙖𝙣𝙙𝙨 𝙬𝙞𝙩𝙝\n>```a!help```")
        .addField(`Helpful URL's`,`[𝘽𝙤𝙩-𝙄𝙣𝙫𝙞𝙩𝙚](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [𝙎𝙪𝙥𝙥𝙤𝙧𝙩](https://discord.gg/rys9xBgF3q)`)

        channelToSendTo.send("<:member_join:846729870964949002> 𝙏𝙝𝙚 𝘼𝙫𝙚𝙣𝙜𝙚𝙧𝙨#𝟬𝟵𝟭𝟵 𝙟𝙤𝙞𝙣𝙚𝙙 𝙩𝙝𝙚 𝙎𝙚𝙧𝙫𝙚𝙧!\n𝙏𝙝𝙚 𝙗𝙤𝙩 𝙞𝙨 __𝙧𝙚𝙨𝙩𝙖𝙧𝙩𝙚𝙙__ 𝙬𝙚𝙚𝙠𝙡𝙮, 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙧𝙚𝙖𝙨𝙤𝙣 𝙞𝙩 𝙢𝙖𝙮 𝙗𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙣𝙚𝙚𝙙 𝙩𝙤 __𝙨𝙚𝙩__ 𝙪𝙥 𝙩𝙝𝙚 𝙩𝙞𝙘𝙠𝙚𝙩 𝙣𝙚𝙬.",channelembed)
        if(error){
            console.log(error)
        }

    
        


});






Client.on("messageReactionAdd", async (reaction, user)=>{

    serverstats[reaction.message.guild.id].suprole
    if(user.bot) return
    
    if(reaction.emoji.name == `🎫`){
        reaction.users.remove(user);
       
        
        

        let category = reaction.message.guild.channels.cache.find(ct=>ct.name === "tickets" && ct.type === "category");
        

        if(!category) await reaction.message.guild.channels.create("tickets", {type:"category"}).then(cat=>category = cat);

        


        reaction.message.guild.channels.create(`ticket-${user.username}`,{type:"text"}).then(ch=>{
            ch.setParent(category);
            ch.overwritePermissions([
                {
                    id: reaction.message.guild.id,
                    deny:["SEND_MESSAGES","VIEW_CHANNEL","ATTACH_FILES"]
                },
                {
                    id: user.id,
                    allow:["SEND_MESSAGES","VIEW_CHANNEL","ATTACH_FILES"]
                },
                {
                    id: serverstats[reaction.message.guild.id].suprole,
                    allow:["SEND_MESSAGES","VIEW_CHANNEL","ATTACH_FILES"]
                }
                   
            ]);
            let welcticket = new Discord.MessageEmbed()
            .setAuthor(user.tag)
            .setTitle("𝙏𝙞𝙘𝙠𝙚𝙩 𝙢𝙖𝙘𝙝𝙞𝙣𝙚")
            .setColor("FEE75C")
            .setDescription(`${Client.user.tag} 𝙝𝙖𝙨 𝙨𝙪𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙘𝙧𝙚𝙖𝙩𝙚𝙙 𝙖 𝙩𝙞𝙘𝙠𝙚𝙩!`)
            .setThumbnail(user.displayAvatarURL({dynamic:true, size: 1024}))
            .setFooter(`${reaction.message.guild.name} | ${reaction.message.guild.id}`, reaction.message.guild.iconURL({dynamic: true}))
            .addField(`> 𝙏𝙮𝙥𝙚 __𝙘𝙡𝙤𝙨𝙚__ 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚 𝙩𝙝𝙚 𝙘𝙝𝙖𝙣𝙣𝙚𝙡 `,`[𝘽𝙤𝙩-𝙄𝙣𝙫𝙞𝙩𝙚](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [𝙎𝙪𝙥𝙥𝙤𝙧𝙩](https://discord.gg/rys9xBgF3q)`)
            
            

            ch.send(`<@&${serverstats[reaction.message.guild.id].suprole}>\n<@!${user.id}> 𝙙𝙚𝙨𝙘𝙧𝙞𝙗𝙚 𝙮𝙤𝙪𝙧 𝙥𝙧𝙤𝙗𝙡𝙚𝙢 𝙝𝙚𝙧𝙚!`, welcticket);
        })
    }

});

Client.on("ready", () =>{
    console.log(`ONLINE!`);

    let statuse = [
      "𝙖!𝙝𝙚𝙡𝙥 | "+Client.guilds.cache.size+" 𝙨𝙚𝙧𝙫𝙚𝙧𝙨",
      `𝙐𝙥𝙙𝙖𝙩𝙚-𝙑𝙚𝙧𝙨𝙞𝙤𝙣 𝟭.𝟮`,
      `𝙬𝙞𝙩𝙝 𝙅𝙤𝙝𝙣 𝙒𝙖𝙡𝙠𝙚𝙧😏`
      ]
  
      let number = 0;
  
      Client.user.setActivity(statuse[statuse.length]);
  
      setInterval(()=>{
          let rstatus = statuse[number];
  
          Client.user.setActivity(rstatus, {
            type: "PLAYING"
            });
          number++;
       if(number >= statuse.length){
       number = 0;
     }
   },5000) 
})

Client.login(token)
