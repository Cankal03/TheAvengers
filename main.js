const Discord = require("discord.js");
const Client = new Discord.Client();
require('discord-buttons')(Client);
const { MessageButton, MessageActionRow } = require("discord-buttons")
const token = "12345678910"
const fs = require("fs")
const warnFile = require("./warns.json");
const serverstats = require("./servers.json");
const enmap = require("enmap");
const moment = require("moment");
const { error, time } = require("console");

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
        .setTitle("Close ticket machine")
        .setColor("RED")
        .setDescription(`*Are you sure you want to close that ticket?*`)
        .setThumbnail(message.author.displayAvatarURL({dynamic:true, size: 1024}))
        .setFooter(`${message.guild.name} | ${message.guild.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`[yes] = ✅ [no] = ❌\n<a:missminuteshello:857915185087905802> **[15 seconds]**`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)

        let yescloseembed = new Discord.MessageEmbed()
        .setDescription("Deleting the channel")
        .setColor("RED")

        let nocloseembed = new Discord.MessageEmbed()
        .setDescription(`**The process successfully aborted**\n*Anyone can take a prescription:)* <a:flyingironman:842294044393996328>`)
        .setColor("GREEN")

        let filtererrorembed = new Discord.MessageEmbed()
        .setDescription(`<a:missminuteshello:857915185087905802> The time is up **[15 seconds]**`)
        .setColor("GREEN")
        
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
                }).then(.message.guild.channels.delete("tickets", {type:"category"})

    
            })
     
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
        .setTitle("Ticket")
        .setDescription("To ``create`` a ticket react with 🎫")
        .setFooter(`${Client.user.tag} | Version 1.1 `, Client.user.displayAvatarURL({dynamic: true}))
        .setColor("5865f2")
        );

        sent.react("🎫")
        settings.set(`${message.guild.id}-tickt`, sent.id)

        message.channel.send("Set Up Done!")

    }

if(message.content.toLowerCase() === `${prefix}invite`){
let button = new MessageButton()
  .setStyle('red') 
  .setLabel(`The Avengers#0919 | Vers. 1.11 | ${Client.guilds.cache.size} servers!`) 
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
        message.channel.send("Der Globalchat ist nun <#"+channel.id+">.").then(msg=>msg.delete({timeout:"8000"}));
    }

    if(message.content.startsWith(prefix+"delglobal")){
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send("Du hast keien Rechte dafür.").then(msg=>msg.delete({timeout:"5000"}));
        if(!serverstats[message.guild.id].globalchat){
            serverstats[message.guild.id].globalchat = undefined
        }
        serverstats[message.guild.id].globalchat = "noID";
        message.channel.send("Der Globalchat wurde geunsetupped.").then(msg=>msg.delete({timeout:"8000"}));
    }

    if(message.channel.id === serverstats[message.guild.id].globalchat && !message.content.startsWith(prefix) && !message.author.bot){
        Client.guilds.cache.forEach(guild=>{
      if(serverstats[guild.id] !== undefined){
          if(serverstats[guild.id].globalchat){
            if(serverstats[guild.id].globalchat != "noID"){
              if(guild.channels.cache.get(serverstats[guild.id].globalchat)){     

        let normalembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("People")
        .setDescription("-> "+message.author.tag)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)
        

        let ownerembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("Bot-Leitung")
        .setDescription("-> "+message.author.tag)
        .setColor("5865f2")
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q) | [Server Invite](https://discord.gg/rys9xBgF3q)`)

        let supportembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("Support-Server")
        .setDescription("-> "+message.author.tag)
        .setColor("GREEN")
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)


        let adminembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("Moderator")
        .setDescription("-> "+message.author.tag)
        .setColor("#61ffef")
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)

        let vipembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("People")
        .setDescription("-> "+message.author.tag)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q) | [Server Invite](https://discord.gg/yNtYBycKQP)`)

        let vip1embed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setTitle("People")
        .setDescription("-> "+message.author.tag)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField(`${message.content}`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q) | [Server Invite](https://discord.gg/Gqqq9npbg8)`)

        let newsembed = new Discord.MessageEmbed()
        .setTitle("<:Mitteilung:847968046143504405> News")
        .setDescription(message.content)
        .setColor("BLACK")

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
                                    }}}}}}}}}}}}})
        message.delete()
      }

      if(message.content.startsWith(prefix+"whoavenger")){
        
        let user = message.mentions.members.first() || message.member;

        var rating = Math.floor(Math.random() * 9)
        
            let CaptainEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/003cap_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **Captain America**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let Captain1Embed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/434usa_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **U.S. Agent**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let ThorEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/004tho_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **Thor**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let WandaEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/012scw_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **Scarltet Witch**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
        
            let FalconEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/014fal_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **Sam Wilson**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
        
            let TonyEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://www.comicbasics.com/wp-content/uploads/2019/08/Tony-Stark-Comic.png")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **Tony Stark**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        

            let PeterEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/005smp_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **Peter Paker**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
        
            let PeterQuillEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/021slq_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setColor("5865f2")
        .setDescription(`<@!${user.user.id}> are **Peter Quill**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        
    
            let BlackWEmbed = new Discord.MessageEmbed()
        .setThumbnail("https://terrigen-cdn-dev.marvel.com/content/prod/1x/011blw_com_crd_01.jpg")
        .setTitle(`<a:flyingironman:842294044393996328> Avengers r8 machine`)
        .setDescription(`<@!${user.user.id}> are **Natasha Romanoff**`)
        .setColor("5865f2")
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

        message.channel.send("<a:Loading:800341232870096938> Getting Data... [10/10]").then(msg=>{
            msg.edit("<a:right:800338621144104990> Succesfull")
        })

        let user = message.mentions.members.first() || message.member;
        var status = user.presence.status;


        if(status == "dnd") status = "<:dnd2:852635614645977158> Do Not Disturb"
        if(status == "idle") status = "<:idle:852635747470540810> Idle"
        if(status == "online") status = "<:online:852635705749798912> Online"
        if(status == "offline") status = "<:offline:852635667720568842> Offline"

        const userflags = user.user.flags.toArray();
        
        const roles = user.roles.cache
        .sort((a,b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, -1)

        let displayroles;

        if(roles.length < 1){
            displayroles = "No Roles"
        }else{
            if(roles.length < 20) {
                displayroles= roles.join(' ')
            } else {
                displayroles= roles.slice(20).join(' ')
            }

        }

        let displayflags;
        

        if(userflags.length < 1){
            displayflags = "No Flags"
        }else{
            if(userflags.length > 1) {
                displayflags= userflags.join(' ')
            } 

        }

        if(!user.nickname) user.nickname = "None"
        
        let userinfoembed = new Discord.MessageEmbed()
        .setThumbnail(user.user.displayAvatarURL({dynamic: true}))
        .setTitle(`<a:flyingironman:842294044393996328> UserInfo machine`)
        .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        .setDescription(`<@!${user.user.id}>`)
        .setColor("5865f2")
        .addField(`**Link**`, `[Avatar URL](${user.user.displayAvatarURL({dynamic:true})})`)
        .addField(`**Username**`, `${user.user.tag}`)
        .addField(`**Nickname**`, `${user.nickname}`)
        .addField(`**ID**`, `${user.user.id}`)
        .addField(`**Created**`, `${moment(user.user.createdAt).format("DD-MM-YYYY [at] HH:mm")}`)
        .addField(`**Joined Server**`, `${moment(user.joinedAt).format("DD-MM-YYYY [at] HH:mm")}`)
        .addField(`**Status**`, `${status}`)
        .addField(`**Roles** [${roles.length}]`, `${displayroles}`)
        .addField(`**Flags**` ,`[${userflags.length}]`)
        message.channel.send(userinfoembed)
       
      }

      if(message.content.startsWith(prefix+"serverinfo")){

        message.channel.send("<a:Loading:800341232870096938> Getting Data... [10/10]").then(msg=>{
            msg.edit("<a:right:800338621144104990> Succesfull")
        })

        const roles = message.guild.roles.cache
        .sort((a,b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, -1)

        let displayroles;

        if(roles.length < 1){
            displayroles = "No Roles"
        }else{
            if(roles.length < 20) {
                displayroles= roles.join(' ')
            } else {
                if(roles.length >= 20){
                    displayroles= roles.slice(50).join(' ')
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
            .setTitle(`<a:flyingironman:842294044393996328> ServerInfo machine`)
            .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
            .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
            .setColor("5865f2")
            .setThumbnail(server.logo)
            .addField("**Name**: ",server.name)
            .addField("**ID**: ",server.id)
            .addField("**Boost**",`${message.guild.premiumTier ? `Tier ${message.guild.premiumTier}` : 'None'}`)
            .addField("**Owner**: ",`<@!${server.owner}>`)
            .addField("**Region**: ",server.region)
            .addField("**Verifiziert**: ",server.verified)
            .addField(`**Created**`, `${moment(message.guild.createdAt).format("DD-MM-YYYY [at] HH:mm")}`)
            .addField(`**Roles** [${roles.length}]`, `${displayroles}`)
            .addField('**Statistics**', [
                `*Emojis* -> ${emojis.size}`,
                `*Regular Emojis* -> ${emojis.filter(emoji => !emoji.animated).size}`,
                `*Animated Emojis* -> ${emojis.filter(emoji => emoji.animated).size}`,
                `*Members* -> ${message.guild.memberCount}`,
                `*Humans*-> ${members.filter(member => !member.user.bot).size}`,
                `*Bots* -> ${members.filter(member => member.user.bot).size}`,
                `*Text* -> ${channels.filter(channel => channel.type === 'text').size}`,
                `*Voice* -> ${channels.filter(channel => channel.type === 'voice').size}`,
                `*Boosts* -> ${message.guild.premiumSubscriptionCount || '0'}`,
                '\u200b'
            ])
    
            message.channel.send(embed);
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
        let user = message.mentions.users.first();
        let grund = message.content.split(" ").slice(2).join(" ");
        if(message.author == user) return message.reply("**TF..?** you can't ban yourself")
        if(!message.member.hasPermission("BAN_MEMBERS")) return message.reply("You need **BAn_MEMBERS** rights.");

        if(!user) return message.channel.send("Mention a User!")
       
    
        if(!grund) grund = "No Reason given"

        if(message.guild.member(user).bannable == true){
            message.channel.send(`<@!${user.id}> was banned by <@!${message.author.id}>, at **${message.guild.name}**\n**Reason** -> ${grund} <a:flyingironman:842294044393996328>`)
            message.guild.member(user).ban(grund)
        }
        if(message.guild.member(user).bannable == false){
            message.channel.send(`I can't ban <@!${user.id}>, he has **more premission** then me. <a:flyingironman:842294044393996328>`)
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
        .setColor("5865f2")

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
    .setColor("5865f2")
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
    .setColor("GREEN")

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
    .setColor("GREEN")

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
        .setTitle(`Helping Desk`)
        .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**\n`)
        .setColor("5865f2")
        .setTimestamp()
        .setFooter(`${message.guild.name}`, message.guild.iconURL({dynamic: true}))
        .addField("Example","``"+prefix+"setticket <#channel>``",true)
        .addField("> __Marvel__ [1]", "*whoavenger*")
        .addField("> __Module__ [12]", "*setticket,setsuprole*\n**-> Set the ticket system, *<setsuprole>* see the Ticket channel and ping it there.**\n*setwelcome,setleave,setwelcmsg,delwelcome,delleave*\n**-> Set *welcome/leave* channel**\n*warn,nowwarn,delwarn*\n*clear,kick,~~ban~~*\n**-> Moderate your server**")
        .addField("> __Main__ [6]", "*serverinfo,userinfo,avatar*\n*howgay,howsimp,react*")
        .addField("> __Logs__ [4]", "*nowprefix?,setprefix,ping,invite*")
        .addField("> __Corona__ [5]", "*covidwho,~~covidinz,covidneu,covidrwer~~*")
        .addField("> __Global Chat__ [2]", "*setglobal,delglobal*")
        .addField(`Helpful URL's`,`[Bot-Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support-Server](https://discord.gg/rys9xBgF3q)`)


        message.channel.send(`**I hope I’m *helping* you...** <a:flyingironman:842294044393996328>`, helpembed)

    }
    if(message.content.startsWith(prefix+"covidwho")){
        let corona1embed = new Discord.MessageEmbed()
        .setColor("5865f2")
        .setTitle(`<a:Virus:846450994195726356> Covid Desk`)
        .setImage("https://cdn.discordapp.com/attachments/794390733813579777/857351873781432360/image0.png")
        .setFooter(`${message.guild.name}`, message.guild.iconURL({dynamic: true}))
        .setTimestamp()
        let button1 = new disbut.MessageButton()
  .setStyle('url') 
  .setLabel('Forwarding to WHO') 
  .setURL('https://covid19.who.int/')

  message.channel.send({embed: corona1embed, button: button1})

    }

    if(message.content.startsWith(prefix+"ping")){
        message.channel.send("<a:Loading:800341232870096938> Pinging...").then(resultmessage=>{
            var ping = resultmessage.createdTimestamp - message.createdTimestamp

            
            

        let pingembed = new Discord.MessageEmbed()
        .setThumbnail(Client.user.displayAvatarURL({dynamic: true}))
        .setTitle(`Ping Desk`)
        .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
        .setColor("5865f2")
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
        .setTitle(`Thank you! <a:flyingironman:842294044393996328>`)
        .setDescription(`<:verify_bot:856172918928965632> Standard-Bot-Prefix: **a!**`)
        .setColor("5865f2")
        .setFooter(`${Client.user.tag}`, Client.user.displayAvatarURL({dynamic: true}))
        .setTimestamp()
        .addField("**The Avengers#0919**", "**Thank you so much for inviting me to your server.**\n*You get an overview of my commands with*\n> ```a!help```\nThe bot is **restarted weekly**, for this reason it may be that you need to set up the ticket new.\n**Otherwise, I hope I was able to help you.**")
        .addField(`Helpful URL's`,`[Bot-Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support-Server](https://discord.gg/rys9xBgF3q)`)

        channelToSendTo.send("<:member_join:846729870964949002> **The Avengers#0919** joined the Server!",channelembed)
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
        
        if(reaction.message.guild.channels.cache.find(`ticket-${user.username}`)) return reaction.message.reply("You can only create one ticket in a same guild!")



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
            .setTitle("Ticket machine")
            .setColor("5865f2")
            .setDescription(`${Client.user.tag} **has *sucessfully* created a ticket!**`)
            .setThumbnail(user.displayAvatarURL({dynamic:true, size: 1024}))
            .setFooter(`${reaction.message.guild.name} | ${reaction.message.guild.id}`, reaction.message.guild.iconURL({dynamic: true}))
            .addField(`> Type *close* __to delete the channel__`,`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)
            
            

            ch.send(`<@&${serverstats[reaction.message.guild.id].suprole}>\n**<@!${user.id}> you can describe our problem here!**`, welcticket);
        }).catch(err=>{
            if(err) return reaction.message.channel.send("An error happend "+err);
            reaction.message.guild.channels.cache.delete(ct=>ct.name === "tickets" && ct.type === "category")
        })
    }

});

Client.on("ready", () =>{
    console.log(`ONLINE!`);

    let statuse = [
      "a!help | "+Client.guilds.cache.size+" servers",
      `nowprefix?`,
      `with ${Client.users.cache.size} Users`
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
