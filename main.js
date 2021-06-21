`strict mode`
//Better to stay safe as to spend Hours on finding weird Variables

const Discord = require("discord.js");
const Client = new Discord.Client();
const token = "DEIN TOKEN"
const fs = require("fs")
const warnFile = require("./warns.json");
const serverstats = require("./servers.json");
const moment = require("moment");


Client.on("guildMemberAdd", async member =>{
    const channel = member.guild.channels.cache.find(ch => ch.id === serverstats[member.guild.id].welcomechannel);
    if(!channel || channel.id === "nowelcome") return;
    channel.send(`<:member_join:846729870964949002> <@!${member.id}> is just joining **${member.guild.name}**\n**Welcome!** <a:flyingironman:842294044393996328>\nCurrent Members -> **${member.guild.memberCount}**`);

})

Client.on("guildMemberRemove", async member =>{
    const channel = member.guild.channels.cache.find(ch => ch.id === serverstats[member.guild.id].leavechannel);
    if(!channel || channel.id === "noleave") return;
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
            welcomechannel:"nowelcome",
            welcomemsg:"nomessage",
            leavechannel :"noleave",
            globalchat:"noID"
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

    else if(message.content.startsWith(prefix+"setprefix")){
        const newprefix = message.content.split(" ").slice(1).join("");

        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        serverstats[message.guild.id].prefix = newprefix;

        message.channel.send("<a:Loading:800341232870096938> Updateing ... Fettching Data [10/10]").then(msg=>{
            msg.edit('Updated the prefix to **'+newprefix+'**. <a:flyingironman:842294044393996328>')
        })

        fs.writeFile("./servers.json",JSON.stringify(serverstats),function(err){
            if(err) console.log(err);
        })
    }

     // Set Global 

    else if(message.content.startsWith(prefix+"setglobal")){
        const channel = message.mentions.channels.first();
        if(channel === undefined) return message.channel.send("Du hast keinen Kanal aneggeben.").then(msg=>msg.delete({timeout:"5000"}));
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send("Du hast keien Rechte dafür.").then(msg=>msg.delete({timeout:"5000"}));
        if(serverstats[message.guild.id].globalchat === undefined){
            serverstats[message.guild.id].globalchat = "noID"
        }
        serverstats[message.guild.id].globalchat = channel.id;
        message.channel.send("Der Globalchat ist nun <#"+channel.id+">.").then(msg=>msg.delete({timeout:"8000"}));
    }

    else if(message.content === prefix+"delglobal"){
        if(!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send("Du hast keien Rechte dafür.").then(msg=>msg.delete({timeout:"5000"}));
        if(serverstats[message.guild.id].globalchat === undefined){
            serverstats[message.guild.id].globalchat = "noID"
        }
        serverstats[message.guild.id].globalchat = "noID";
        message.channel.send("Der Globalchat wurde geunsetupped.").then(msg=>msg.delete({timeout:"8000"}));
    }

    else if(message.channel.id === serverstats[message.guild.id].globalchat && !message.content.startsWith(prefix) && !message.author.bot){
        Client.guilds.cache.forEach(guild=>{
      if(serverstats[guild.id] !== undefined){
          if(serverstats[guild.id].globalchat){
            if(serverstats[guild.id].globalchat != "noID"){
              if(guild.channels.cache.get(serverstats[guild.id].globalchat)){     

        const normalembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setAuthor("People")
        .setTitle(message.author.tag)
        .setColor("ff0dae")
        .setDescription(`${message.content}`)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField("*Link ->*",`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)
        

        const ownerembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setAuthor("Bot-Leitung")
        .setTitle("<a:krone:856254172432171039> "+message.author.tag)
        .setColor("GOLD")
        .setDescription(`${message.content}`)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField("*Link ->*",`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q) | [Server Invite](https://discord.gg/rys9xBgF3q)`)

        
        //gönn Grün XD
        const adminembed = new Discord.MessageEmbed()
        .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
        .setAuthor("Admin")
        .setTitle("<:support_badge:856254638608613436> "+message.author.tag)
        .setColor("#61ffef")
        .setDescription(`${message.content}`)
        .setFooter(`${message.guild.name} | ${message.guild.id} - ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField("*Link ->*",`[Bot Invite](https://discord.com/api/oauth2/authorize?client_id=813498240477560834&permissions=8&scope=bot) | [Support](https://discord.gg/rys9xBgF3q)`)

        
        //Finde jetzt nicht das es so besser zu lesen ist als mit else if aber ist nicht wirklich worth zu optimieren
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
                        guild.channels.cache.get(serverstats[guild.id].globalchat).send(normalembed);

                    }
                }
                
            }
            

        }
        //Warum ist es hier so leer? War hier mal was und du hast es entfernt?

        
            

            

        
            
        
                
                    
                  
                
                    
                
                



                
                
              
            }
                


                
            }
              
            }
          }
      

        })
        //what?
        message.delete()
      }

     
      else if(message.content.startsWith(prefix+"userinfo")){

        const user = message.mentions.members.first() || message.member;
        let status = user.presence.status;

        
        


        if(status == "dnd") status = "Do Not Disturb"
        if(status == "idle") status = "Idle"
        if(status == "online") status = "Online"
        if(status == "offline") status = "Offline"

        const userflags = user.user.flags.toArray();
        


        const roles = user.roles.cache
        .sort((a,b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, -1)

        let displayroles;
          
        //array.length are never negative
        if(roles.length === 0){
            displayroles = "No Roles"
        }else{
            if(roles.length < 20) {
                displayroles= roles.join(' ')
            } else {
                displayroles= roles.slice(20).join(' ')
            }

        }

        let displayflags;
        

        if(userflags.length === 0){
            displayflags = "No Flags"
        }else{
            if(userflags.length >= 1) {
                displayflags = userflags.join(' ')
            } 

        }

        if(!user.nickname) user.nickname = "None"

        

        
        const userinfoembed = new Discord.MessageEmbed()
        .setThumbnail(user.user.displayAvatarURL({dynamic: true}))
        .setTitle(`<a:flyingironman:842294044393996328> The Avengers UserInfo Desk`)
        .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        .setDescription(`<@!${user.user.id}>`)
        .setColor("GOLD")
        .addField(`**Link**`, `[Avatar URL](${user.user.displayAvatarURL({dynamic:true})})`)
        .addField(`**Username**`, `${user.user.username}`)
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

        const roles = message.guild.roles.cache
        .sort((a,b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, -1)

        let displayroles;

        if(roles.length === 0){
            displayroles = "No Roles"
        }else{
            if(roles.length < 20) {
                displayroles= roles.join(' ')
            } else {
                displayroles= roles.slice(20).join(' ')
            }

        }
    
            const server = {
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
    
            const embed = new Discord.MessageEmbed()
            .setTitle(`<a:flyingironman:842294044393996328> The Avengers ServerInfo Desk`)
            .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
            .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
            .setColor("GOLD")
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


    // Set Welcome und Leave 

    if(message.content.startsWith(prefix+"setwelcome")){
        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        if(!serverstats[message.guild.id].welcomechannel){
            serverstats[message.guild.id].welcomechannel = "nowelcome"
        }

        const newcwelcome = message.mentions.channels.first();

        if(!newcwelcome) return message.reply("Du hast keinen Kanal angegeben!").then(msg=>msg.delete({timeout:"5000"}));
    
        serverstats[message.guild.id].welcomechannel = newcwelcome.id;

        message.channel.send("<a:Loading:800341232870096938> Updateing ...").then(msg=>{
            msg.edit("Updatet the welcome channel to <#"+newcwelcome.id+"> <a:flyingironman:842294044393996328>")
        })

        fs.writeFile("./servers.json", JSON.stringify(serverstats), function(err){
            if(err) console.log(err);
        })
    }

    if(message.content.startsWith(prefix+"setleave")){
        if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("You need **ADMINISTRATPR** rights.");

        if(serverstats[message.guild.id].leavechannel === undefined){
            serverstats[message.guild.id].leavechannel = "noleave"
        }

        const newleave = message.mentions.channels.first();

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
        
        serverstats[message.guild.id].leavechannel = "noleave"

        message.channel.send("<a:Loading:800341232870096938> Deleting ...").then(msg=>{
            msg.edit("Removed the leave channel. <a:flyingironman:842294044393996328>")
        })
    }

    if(message.content.startsWith(prefix+"delwelcome")){
        serverstats[message.guild.id].welcomechannel = "nowelcome"

        message.channel.send("<a:Loading:800341232870096938> Deleting ...").then(msg=>{
            msg.edit("Removed the welcome channel. <a:flyingironman:842294044393996328>")
        })
    }

    if(message.content.startsWith(prefix+"kick")){
        const user = message.mentions.users.first();
        const reason = message.content.split(" ").slice(2).join(" ");
        if(message.author == user) return message.reply("**TF..?** you can't kick yourself")
        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You need **KICK_MEMBERS** rights.");

        if(user === undefined) return message.channel.send("Mention a User!")
       
    
        if(reason === undefined) reason = "No Reason given"

        if(message.guild.member(user).kickable == true){
            message.channel.send(`<@!${user.id}> was kicked by <@!${message.author.id}>, at **${message.guild.name}**\n**Reason** -> ${reason} <a:flyingironman:842294044393996328>`)
            message.guild.member(user).kick(reason)
        }
        if(message.guild.member(user).kickable == false){
            message.channel.send(`I can't kick <@!${user.id}>, he has **more premission** then I. <a:flyingironman:842294044393996328>`)
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
            message.channel.send(`I can't ban <@!${user.id}>, he has **more premission** then I. <a:flyingironman:842294044393996328>`)
        }

    }
    */
    
    // Warn System
    if(message.content.startsWith(prefix+"warn")){
        const user = message.mentions.users.first();
        const reason = message.content.split(" ").slice(2).join(" ");
        if(message.author == user) return message.reply("**TF..?** you can't warn yourself")
        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You need **KICK_MEMBERS** rights.");

        if(user === undefined) return message.channel.send("Mention a User!")
       
    
        if(reason === undefined) reason = "No Reason given"



        const embed = new Discord.MessageEmbed()
        .setTitle("WARN!")
        .setDescription(`**Attention** <@!${user.id}>, you've been **warned** <a:flyingironman:842294044393996328>!\n**Reason** -> ${reason}`)
        .setThumbnail(user.displayAvatarURL({dynamic: true}))
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        .setColor("GOLD")

        message.channel.send(embed)

        if(warnFile[user.id+message.guild.id] === undefined){
            warnFile[user.id+message.guild.id] = {
                warns:0,
                maxwarn:3
            }
        }
    
        warnFile[user.id+message.guild.id].warns += 1
        
        if(warnFile[user.id+message.guild.id].warns >= warnFile[user.id+message.guild.id].maxwarn){
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
        const user = message.mentions.users.first();
        if(!message.member.hasPermission("KICK_MEMBERS")) return message.reply("You need **KICK_MEMBERS** rights.");

        if(user === undefined) return message.channel.send("Mention a User!")

        message.channel.send(`<@!${user.id}> has  **${warnFile[user.id+message.guild.id].warns}** warns, at **${message.guild.name}** ! <a:flyingironman:842294044393996328>`)

    }

    // Clear 

    

    if(message.content.startsWith(prefix+"clear")){
     if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send(':x: You need ``manage messages`` for that!')
      const args = message.content.split(' ').slice(1); 
      const amount = args.join(' '); 
        
       if (!amount) return message.channel.send(" :x: You havn't given an amount of messages which should be deleted!"); 
       if (isNaN(amount)) return message.channel.send(" :x: The amount parameter isn't a number!"); 
       if (amount > 100) return message.channel.send(" :x: You can't delete more than 100 messages at once!");
       if (amount < 1) return message.channel.send(':x: You have to delete at least 1 message!');
                
       message.channel.messages.fetch({ limit: amount }).then(messages => { 
       message.channel.bulkDelete(messages)});

       message.channel.send("Deleting Messages... <a:Loading:800341232870096938> ").then(msg=>{
       msg.edit(`Deleted **${amount}** messages, at **${msg.guild.name}** <a:flyingironman:842294044393996328>`)
    })
}
         

    // Help

    if(message.content.toLowerCase() === `${prefix}help`){
        let helpembed = new Discord.MessageEmbed()
        .setThumbnail(message.guild.iconURL({dynamic: true}))
        .setTitle(`<a:flyingironman:842294044393996328> The Avengers Help Desk`)
        .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
        .setColor("GOLD")
        .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
        .addField("-> <a:S3_Loki:854479997607084032> Marvel\nLeaks and **News**.", "> Soon... Version 1.1")
        .addField("-> <a:Ban:798619812283940885> **Moderation**\nModerate your **Server**.", "> ``setwelcome/leave <#channel>``\n> ``delwelcome/leave``\n> ``warn <@user> <reason>``\n-> *From the fourth warning the user gets kicked*\n> ``clear <ammount>``\n-> *Messages over 14 Days can't deleted.*\n > ``nowwarn <@user>``\n > ``delwarn <@user>``\n > ~~ban/~~``kick <@user> <reason>``")
        .addField("-> :map: **Global Chat**", "> ``setglobal <#channel>``\n > ``delgloabal``")
        .addField("-> <a:PE_PandaFire:851569870234452019> **Main/Fun**", "> Soon... Version 1.1")
        .addField("-> <a:config:846451153411637328> **Bot-Logs** \nBot **things**.", "> ``nowprefix?``\n> ``setprefix <newprefix>``\n> ``ping``")

        message.channel.send(`I hope I’m helping you...`, helpembed).then(msg=>{
            msg.channel.send("<a:Loading:800341232870096938> **Important Infortmation**\nThe bot owner has to ``re-establish`` me, based on a data loss...\n**John Walker#1234** takes the trouble to bring me back to **Version 1.6** as soon as possible.")
        })

    }

    if(message.content.startsWith(prefix+"ping")){
        message.channel.send("<a:Loading:800341232870096938> Pinging...").then(resultmessage=>{
            const ping = resultmessage.createdTimestamp - message.createdTimestamp

            const pingembed = new Discord.MessageEmbed()
            .setThumbnail(message.guild.iconURL({dynamic: true}))
            .setTitle(`The Avengers Ping Desk`)
            .setDescription(`<:verify_bot:856172918928965632> Bot-Prefix: **${prefix}**`)
            .setColor("GOLD")
            .setFooter(`${message.guild.name} | ${message.guild.id} | ${message.id}`, message.guild.iconURL({dynamic: true}))
            .addField("**"+message.guild.name+"** Latency is **"+ping+"** ms.\n**API** Latency is **"+Client.ws.ping+"** ms.","Note: ``Good!`` <a:flyingironman:842294044393996328>")



            message.channel.send(pingembed)
        })
    }
})



Client.on("ready", () =>{
    console.log(`ONLINE!`);

    const statuse = [
      "a!help | "+Client.guilds.cache.size+" servers",
      `nowprefix?`,
      "with John Walker😏"
      ]
  
      let number = 0;
  
      Client.user.setActivity(statuse[statuse.length]);
  
      setInterval(()=>{
          const rstatus = statuse[number];
  
          Client.user.setActivity(rstatus, {
            type: "PLAYING"
            });
          //memory management: number++ speichert noch den alten Wert, ++number nicht
          ++number;
       if(number >= statuse.length){
       number = 0;
     }
   },5000) 
})

Client.login(token)
