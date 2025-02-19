/////////////////////////////////
// NODE PACKAGES CONFIGURATION //
/////////////////////////////////

require('dotenv').config(); // env file

const { Client, GatewayIntentBits, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, quote , AttachmentBuilder } = require("discord.js");
const { google } = require("googleapis");
const axios = require("axios");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const qrcode = require('qrcode');
// const syllable = require('syllable');

// Google drive & sheets configuration
// https://developers.google.com/oauthplayground
// YT ?v=1y0-IfRW114
const oauth2Client = new google.auth.OAuth2(
    process.env.DRIVE_CLIENT_ID,
    process.env.DRIVE_CLIENT_SECRET,
    process.env.DRIVE_REDIRECT_URI
);
oauth2Client.setCredentials({refresh_token: process.env.DRIVE_REFRESH_TOKEN});
const drive = google.drive({ version: 'v3', auth: oauth2Client });
const sheets = google.sheets({ version: "v4", auth: oauth2Client });





////////////////////////////////
// BOT SETUP & PROFILE STATUS //
////////////////////////////////

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // For guild-related events
        GatewayIntentBits.GuildMessages, // For message events in guilds
        GatewayIntentBits.MessageContent // To read the content of messages
    ]
});

// when client is first connected
client.on('ready', (c)=>{
    console.log(` " ${c.user.tag} " is online now `); 
    client.user.setActivity({
        name: "Watching this epic video, check it out",
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=00WCEbKM_SE"
    })
});





//////////////////////////
// ADJUSTABLE VARIABLES //
//////////////////////////

// office hours
var officeHours = [
    { // monday
        name: "Alani",
        pos:  "VP",
        dotw: 1,
        time: ["3:30", "4:00", "PM"] // time start to end
    },{ // tuesday
        name: "Alani",
        pos:  "VP",
        dotw: 2,
        time: ["5:00", "6:30", "PM"] 
    },{ // wednesday
        name: "Sparrow",
        pos: "President",
        dotw: 3,
        time: ["8:30","10:00", "AM"]
    },{ // friday
        name: "Raina",
        pos: "Secretary",
        dotw: 5,
        time: ["12:00","1:30","PM"]
    }
]
// allow officers to adjust the deadline
var submissionsDeadline = new Date("March 7, 2025 23:59:59");
// Submission link
var submissionsLink = "https://docs.google.com/forms/d/e/1FAIpQLSd77qbWK3pusXdWtwVxiHKPx0FoGwXSv0cLcFFqVll6yAS8QA/viewform";
// Meeting room and info
var meetingInfo = {
    dotw: {
        num: 5,
        name: "Friday"
    }, // friday
    time: 12, // hour
    room: "12-226"
}
// office room
var officeRoom = "3-131";
// meeting time 
var meetingTime = "";
async function updateMeetingTime(){
    // get time for next meeting
    const nextMeet = new Date();
    nextMeet.setDate(nextMeet.getDate() + ((meetingInfo.dotw.num - nextMeet.getDay() + 7) % 7)); // today + days till friday
    nextMeet.setHours(meetingInfo.time, 0, 0, 0); // Set the time to HR (1-24)
    meetingTime = `> ## We meet every **${meetingInfo.dotw.name}**, at <t:${nextMeet/1e3}:t> in room **${meetingInfo.room}**\n> **Next Meeting:** <t:${nextMeet/1e3}:f>`;
}
updateMeetingTime();

// used for mute duration, minutes to milliseconds
const minToMS = (min)=> min * 60 * 1000;
// links to allow without link perms
const allowedLinks = ["https://tenor.com","https://youtu.be","https://www.youtube.com"];





/////////////////////////////
// SHEETS API & INSPIRATOR //
/////////////////////////////
async function readSpreadsheet() {
    try {
        // spreadsheet range of info
        let range = "Sheet1!A1:E99";
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: range,
        });
        const rows = response.data.values;
        // make sure the spreadsheet isn't empty
        if (!rows || rows.length === 0){
            console.log("No data found in the spreadsheet.");
            return;
        }
        submissionsLink = rows[6][1]; // submission link
        submissionsDeadline = new Date(String(rows[5][1])); // submission deadline
        console.log(String(rows[5][1])+" ... ");
        console.log(submissionsDeadline);
        // Meeting time
        let DOTW = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        meetingInfo = {
            dotw: {
                num: DOTW.indexOf(rows[2][0].toLowerCase()),
                name: rows[2][0]
            },
            time: rows[2][1],
            room: rows[2][2]
        }
        // office room
        officeRoom = rows[7][1];
        // office hours
        officeHours = [];
        rows.forEach((row, index) => {
            if(index>10)
                officeHours.push({
                    name: row[0],
                    pos: row[1],
                    dotw: DOTW.indexOf(row[2].toLowerCase()),
                    time: [row[3],row[4]]
            })
        });
        // update meeting time
        updateMeetingTime();
    } catch (error) {
        console.error("Error reading spreadsheet:", error.message);
        submissionsDeadline = null; // if there's an error updating the date then set to null I guess
    }
}
readSpreadsheet();
// Inspirator
async function getRandomInspiration(message){
    // Define arrays for each part of speech
    const adverbs = [' > '];//'quickly', 'silently', 'gracefully', 'boldly', 'eagerly', 'dangerously', 'seriously', 'unfortunately', 'curiously', 'dearly', 'creepily', 'strangely', 'dreamily', 'hauntingly', 'endlessly', 'fearingly'];
    const adjectives = ['bright', 'dark', 'happy', 'sad', 'cheerful', 'nostalgic', 'cursed', 'forgotten', 'blind', 'curious', 'lost', 'ethereal', 'radiant', 'mystical', 'shattered', 'elusive', 'eternal', 'fragile', 'vibrant','open','closed','abstract'];
    const nouns = ['cat', 'forest', 'sky', 'ocean', 'mountain', 'tears', 'mind', 'thoughts', 'scholar', 'bird', 'demon', 'angel', 'garden', 'chaos', 'soul', 'abyss', 'whisper', 'dawn', 'twilight', 'flame', 'shadow', 'glass', 'beast', 'eyes', 'shadow', 'chains', 'light','blood'];

    // Helper function to get a random word from an array
    const getRandomWord = (array) => array[Math.floor(Math.random() * array.length)];
    // Return an object with the words
    let RP = [
        getRandomWord(adverbs),
        getRandomWord(adjectives),
        getRandomWord(nouns)
    ]
    if(message){
        // buttons
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder() // New Inspiration
                .setCustomId('inspire').setLabel('More Inspiration').setStyle(ButtonStyle.Secondary)
        );
        let mssgContent = {content: `> **Random Inspiration:**\n> \`${RP.join("` `")}\``,components: [row]}
        try{ // attempt to edit previous response
            await message.update(mssgContent);
        }catch(err){
            await message.reply(mssgContent);
        }

    }else
        return RP.join(" ");
}
// random quote generator
function getRandomQuote(message) {
    try {
        // Resolve the path to quotes.txt
        const filePath = path.join(__dirname, 'quotes.txt');
        // Read the file content
        const data = fs.readFileSync(filePath, 'utf8');
        // Split the content into an array of quotes
        const quotes = data.split('\n\n\n');

        // Choose a random quote
        let RN = Math.floor(Math.random() * quotes.length);
        if(message){
            // buttons
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder() // New Quote
                    .setCustomId('quote').setLabel('Another Quote').setStyle(ButtonStyle.Secondary)
            );
            let mssgContent = {content: `> **Quote #${RN+1}**\n> ${quotes[RN].replaceAll("\n","\n> ")}`,components: [row]}
            try{ // try to edit last response
                message.update(mssgContent);
            }catch(err){
                message.reply(mssgContent);
            }
        }else
            return quotes[RN];
    } catch (err) {
        console.error('Error reading quotes file:', err);
        return 'No quotes available.';
    }
}
// Testing random quote & inspiration
console.log(getRandomQuote());
console.log("Randm Inspiration: "+getRandomInspiration());





///////////////
// FUNCTIONS //
///////////////

// sending report to a bot reporting channel
async function sendReport(guild, messageContent, attachment) {
    try {
        // Find the "bot" text channel
        let botChannel = guild.channels.cache.find(channel => channel.name.includes('bot-reports') && channel.isTextBased());
        
        // get the officer role
        const officerRole = guild.roles.cache.find(role => role.name.toLowerCase().includes('officer'));
        
        // If the channel doesn't exist, create it
        if (!botChannel){
            botChannel = await guild.channels.create({
                name: 'bot-reports',
                type: 0, // 0 for text channels in Discord.js v14+
                reason: 'Created to log bot reports',
                permissionOverwrites: [
                    { // prevent everyone from viewing channel
                        id: guild.roles.everyone.id,
                        deny: ['ViewChannel']
                    },
                    { // allow officers to view channel and send messages
                        id: officerRole.id,
                        allow: ['ViewChannel', 'SendMessages']
                    },
                    { // allow bot to send messages as well
                        id: guild.client.user.id,
                        allow: ['SendMessages', 'ViewChannel']
                    }
                ]
            });

            console.log('Bot channel created successfully.');
        }

        // Send the report to the "bot" channel
        botChannel.send(messageContent);
        if(attachment) // if attachment exists then send file
            botChannel.send({ files: [attachment.url] });
    } catch(err) {
        console.error('Error in sendReport function: ', err);
    }
}
//  Submitting to magazine [TITLE, AUTHOR, TYPE, INFO, SUBMISSION, LINK (optional)]
async function submitToMagazine(guild, username, title, author, type, info, submission, link, email) {
    try {
        // Find the "submissions" text channel
        let subChannel = guild.channels.cache.find(channel => channel.name.includes('bot-submissions') && channel.isTextBased());
        
        // If the channel doesn't exist, create it
        if (!subChannel){
            // officer role for perms to created channel
            const officerRole = guild.roles.cache.find(role => role.name.toLowerCase().includes('officer'));

            subChannel = await guild.channels.create({
                name: 'bot-submissions',
                type: 0, // 0 for text channels in Discord.js v14+
                reason: 'Created to record submissions to magazine',
                permissionOverwrites: [
                    { // prevent everyone from viewing channel
                        id: guild.roles.everyone.id,
                        deny: ['ViewChannel']
                    },
                    { // allow officers to view channel and send messages
                        id: officerRole.id,
                        allow: ['ViewChannel', 'SendMessages']
                    },
                    { // allow bot to send messages as well
                        id: guild.client.user.id,
                        allow: ['SendMessages', 'ViewChannel']
                    }
                ]
            });

            console.log('Submissions channel created successfully.');
        }

        // Send the report to the "bot" channel
        subChannel.send(`> ||${username}|| has submitted **${title}** (${type}) under the name ||__${author}__||.\n> email address: || \`${email}\` ||\n> **INFO:** ${info}\n> \n> `+(link?`Link: ${link}`:`[no link]`));
        // submission is required; send in same sub channel if size is under 200 MB
        const maxSizeBytes = 200 * 1024 * 1024; // 200 MB in bytes
        if (submission.size < maxSizeBytes)
            subChannel.send({ files: [submission.url] });
        else
            subChannel.send(`File is too large to upload here, see drive.\nFile size: \`${submission.size/1048576} MB\` (>200MB)`);

    } catch(err) {
        console.error('Error in submitting file: ', err);
    }
}
// Sending submission (attachment) to google drive
async function uploadToDrive(submission,choice,title){
    const response = await axios.get(submission.url, { responseType: 'stream' });
    // Save the file locally before uploading to Google Drive
    const filePath = path.join(__dirname, submission.name);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    // Upload the file to Google Drive
    const fileMetadata = {
        name: title+"_"+submission.name, // renaming submission based on title
        parents: [choice.value] //[process.env.DRIVE_FOLDER_ID] // Use your folder ID here
    };

    const media = {
        mimeType: submission.contentType,
        body: fs.createReadStream(filePath)
    };

    const driveResponse = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });

    // Clean up the local file after upload
    fs.unlinkSync(filePath);
}

//// DEADLINE ////
async function sub_deadline(message){
    readSpreadsheet();
    // buttons
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder() // requirements command
            .setCustomId('requirements').setLabel('Submission Requirements').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder() // Submissions form
            .setLabel('Submission Form').setStyle(ButtonStyle.Link).setURL(submissionsLink)
    );
    let subDeadline = `<t:${Math.floor(submissionsDeadline.getTime() / 1e3)}`;
    message.reply({content: `> The deadline for the Cabbages & Kings magazine submissions is `+
        (isNaN(submissionsDeadline/1e3)?"\n> **To Be Decided...**":
         `on ${subDeadline}>, ${subDeadline}:R>\n-# You can submit through the submissions form or using the \`/submit\` command.`),
        components: [row]});
}
// REQUIREMENTS //
async function sub_requirements(message){
    // buttons
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder() // requirements command
            .setCustomId('deadline').setLabel('View Submissions Deadline').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder() // Submissions form
            .setLabel('Submission Form').setStyle(ButtonStyle.Link).setURL(submissionsLink)
    );
    const questionsChannel = message.guild.channels.cache.find(channel => channel.name.includes('question'));
    message.reply({
        content:
        "We are a small publication and cannot risk being copyright claimed, so please **DO NOT** submit anything that includes copyrighted material or characters, or we will be forced to disqualify your submission. Fan art, fan fiction, cover songs, and audio/video with copyrighted music will also not be accepted. We want your art to have a fair shot at being published, so PLEASE err on the side of caution.\n\n"+
        "## Visual Art\n"+
        "> 8.5\" x 11\" maximum size\n"+
        "> 300 DPI\n"+
        "> `JPEG`, `PNG` or `PDF`, Scanned or photographed\n\n"+
        
        "## Writing\n"+
        "> 1,500 words maximum\n"+
        "> `PDF`, Google Doc, or Word Document\n\n"+

        "## Audio/ Video\n"+
        "> Provide a link _AND_ the original file please\n\n"+

        "Titles **MUST** be included! You will be emailed if your submission is labled \"Untitled.\"\n"+
        "-# **Disclaimer:** Again, we are a small publication. We get lots of submissions every year, more than we can reasonably or financially publish, so submitting your work is not a guarantee that it will be published. This year we are limiting each submitter to three entries."+
        `\n\nIf you have any questions, feel free to ask in the ${questionsChannel} channel.\n\n-# You can submit to the magazine through the submissions form or using the \`/submit\` command.`,
        components: [row]
    });
}
//// SCHEDULE ////
async function club_schedule(message){
    message.reply(meetingTime);
}
// OFFICE HOURS //
async function office_hours(message){
    let OH = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    officeHours.forEach((v)=>{OH[v.dotw] = OH[v.dotw]+ `\n> **${v.name} [${v.pos}]**\n> \`${v.time[0]} to ${v.time[1]}\``});
    let rep = `# Office Hours\n**Our office is located in room __${officeRoom}__.**\nYou are free to walk in during any of our open office hours times listed below.`;
    OH.forEach((v)=>{
        if(v.split("\n").length>1)
            rep = rep + "\n## "+ v;
    })
    if(officeHours.length==0)
        rep += "\nOffice hours haven't been updated yet :sweat_smile:\nFeel free to contact an officer"
    message.reply(rep);
}
///// RULES //////
async function club_rules(message){
    // buttons for links
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder() // Discord Guidlines link
            .setLabel('Discord Guidlines').setStyle(ButtonStyle.Link).setURL('https://discord.com/guidelines'),
        new ButtonBuilder() // MCC Policies link
            .setLabel('MCC Policies').setStyle(ButtonStyle.Link).setURL('https://www.monroecc.edu/depts/policy/')
    );
    // link to rules channel
    const rulesChannel = message.guild.channels.cache.find(channel => channel.name.includes('server-rules'));
    message.reply({content: `For a quick list of our server rules, check out our ${rulesChannel} channel`+
        `\nIn addition to our server rules you must also follow [Discord Guidelines](https://discord.com/guidelines) and [MCC Policies](<https://www.monroecc.edu/depts/policy/>).`,
        components: [row]});
}
////// HELP //////
async function help(message){
    const dropdownRow = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_dropdown')
                .setPlaceholder('Options')
                .addOptions([
                    { label: 'Submission Deadline', value: 'deadline' },
                    { label: 'Submission Requirements', value: 'requirements' },
                    { label: 'Club Meeting Schedule', value: 'schedule' },
                    { label: 'Office Hours', value: 'officehours' },
                    { label: 'Server Rules', value: 'rules' },
                ])
        );
    message.reply({
        content: "> I'd be glad to help!\n> Type `/` to view a list of my commands, or ask me about any of these:"
                +"\n> - **Submission deadline**"
                +"\n> - **Submission requirements**"
                +"\n> - **Club meeting times (schedule)**"
                +"\n> - **Office hours**"
                +"\n> - **Server rules**",

        components: [dropdownRow]
    });
}




// EXTRA FUNCTIONS FOR FUN

// IS IT A HAIKU?!? (5-7-5)
function countSyllables(word) {
    word = word.toLowerCase().replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    let matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}
async function haikuBot(message,text) {
    // Split words and count syllables
    let words = text.split(/\s+/);
    let syllableCounts = words.map(countSyllables);
    let totalSyllables = syllableCounts.reduce((a, b) => a + b, 0);

    // Check if it's a haiku (must have exactly 17 syllables)
    if (totalSyllables !== 17) return;

    // Try to split into 5-7-5
    let lines = [[], [], []];
    let targetSyllables = [5, 7, 5];
    let lineIndex = 0, syllableSum = 0;

    for (let i = 0; i < words.length; i++) {
        lines[lineIndex].push(words[i]);
        syllableSum += syllableCounts[i];

        if (syllableSum === targetSyllables[lineIndex]) {
            lineIndex++;
            syllableSum = 0;
        } else if (syllableSum > targetSyllables[lineIndex]) {
            return; // Invalid haiku structure, exit early
        }
    }

    let formattedHaiku = lines.map(line => line.join(' ')).join('* \n\n*');

    // Create an embed with green color and heart
    const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green color
        .setDescription(`*${formattedHaiku}*\n\n💚 - ${message.author.displayName}`);

    message.channel.send("Is that a haiku I see :0");
    message.channel.send({ embeds: [embed] });
}

// QR CODE GENERATOR
async function QR(message,url,s,clr1,clr2,hide){
    try {
        // Generate QR code as a buffer
        const qrBuffer = await qrcode.toBuffer(url, { 
            scale: s||20,
            color: {
                dark: clr1||"#FFFFFF",
                light: clr2||"#FFFFFF00"
            }
        });

        // Create an attachment and send it
        const attachment = new AttachmentBuilder(qrBuffer, { name: 'qrcode.png' });
        message.reply({ content: "ur cabbage code is ready :)", ephemeral: hide, files: [attachment] });

    } catch (error) {
        console.error(`Error generating QR code ${url}: \n`+ error+"\n\n");
        message.reply("❌ Failed to generate the QR code :(\nPlease make sure the link is valid.");
    }
}





///////////////////
// CHAT COMMANDS //
///////////////////
client.on('messageCreate', async (message) => {

    
    
    
    // get link role, see if has link perms
    const linkRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes('link'));
    const hasLinkPerm = message.member.roles.cache.has(linkRole.id);
    const officerRole = message.guild.roles.cache.find(role => role.name==="Officer 👑");
    const isOfficer = message.member.roles.cache.has(officerRole.id);
    // break down message 
    let mssg = message.content.toLowerCase().trim();
    let words = mssg.replaceAll("?","").replaceAll(".","").replaceAll("-","").replaceAll(",","").split(" ");

    // check to see if message is a haiku
    haikuBot(message, mssg);
    

    // REACTIONS
    // don't mistake messages that mention everyone for a command
    if(message.mentions.everyone){
        if(message.channel.name.toLowerCase().includes("announce"))
            message.react("💚");
        else
            message.react("1334234382772207696");
    }
    // Normal reactions
    if(message.attachments.size>0) // has attachment, WOAH
        message.react(message.channel.name.toLowerCase().includes("share")?
        "1334234382772207696":"1334609229599739976"); // if in share channel? WOAH else LOOK UP
    if(mssg.includes("origami"))
        message.react("1334608848513798155");
    if(words.includes("boba"))
        message.react("1334609056421249186")
    if(mssg.includes("important")){
        message.react("1334609229599739976");
        message.react("‼️");
    }
    if(mssg.includes("oops")||words.includes("uhoh"))
        message.react("1334609780097945733");
    if(words.includes("love"))
        message.react("💚");
        
    if(message.mentions.everyone)
        return;

    // LINK PERM CHECK
    allowedLinks.forEach((a)=> mssg = mssg.replaceAll(a,""));
    if(!hasLinkPerm&&!isOfficer&&!message.author.bot&&mssg.includes("http")){
        try {
            // make sure to log the message in the console to be able to read later on
            console.warn(`Deleted message from ${message.author.tag}: ${message.content}`);
            // DELETE MESSAGE for including link
            message.author.send(`Hi ${message.author}, your message was removed because it contained a link.\nPlease ask for permission before posting links.`);
            await message.delete();
        } catch (error) {
            console.error(`Failed to delete message from ${message.author.tag}:`, error);
        }
        return;
    }

    // generating QR code
    if(words[0]=="qr"&&words.length>=2){
        // message.react("1334234679502569483");
        const url = message.content.split(" ")[1];//message.content.replace("qr ","");
        // QR(message,url,s,clr1,clr2,hide)
        QR(message,url,
            Number(message.content.split(" ")[2]) || null, // number scale
            message.content.split(" ")[3] || null, // hex for QR color
            message.content.split(" ")[4] || null // hex for BG color
        ); // generate qr code
        return;
    }
 
    // Ignore message if from bot, or doesn't ref or reply to bot
    if(message.author.bot || (!message.mentions.has(client.user)))
        return;
    // if message is aimed towards bot, then continue—
    console.log("Message: "+ message.content);

    // SUBMISSION DEADLINE
    // check if the user asks about deadline or for time about submission(s)
    if(words.includes("deadline") || ((words.includes("time")||words.includes("when"))&&mssg.includes("submission"))){
        sub_deadline(message);
        return;
    }
    // SUBMISSION REQUIREMENTS
    if(mssg.includes("submission")||words.includes("requirements")){
        sub_requirements(message);
        return; 
    }
    // SCHEDULE
    if(words.includes("schedule")||(mssg.includes("meet")&&mssg.includes("time"))||words.includes("when")||mssg.includes("where")){
        club_schedule(message);
        return;
    }
    // OFFICE HOURS
    if(mssg.replaceAll(" ","").includes("officehour")){
        office_hours(message);
        return;
    }
    // RULES
    if(mssg.includes("rules")){
        club_rules(message);
        return
    }
    // HELP
    if(words.includes("help")){
        help(message);
        return;
    }
    // UPDATE TO SPREADSHEET
    if(mssg.includes("update now")){
        readSpreadsheet();
        message.reply("Updating based on spreadsheet.\nRun `/deadline`, `/officerhours`, `/schedule` to check.");
        return;
    }
    // INSPIRE
    if(words.includes("inspire")||words.includes("inspiration")){
        getRandomInspiration(message);
        return;
    }
    // QUOTE
    if(mssg.includes("quote")){
        getRandomQuote(message);
        return;
    }
    // THANK (react to thank you message)
    if(mssg.includes("thank")){
        message.react("💚");
        return;
    }
    // COUNT SYLLABLES (of message being replied to)
    if(message.reference && words.includes("count") && mssg.includes("syllable")){
        let lines = await message.channel.messages.fetch(message.reference.messageId);
        lines = lines.content.replaceAll(">","").trim().split("\n");
        let count = [];
        for(line of lines){
            count.push("> **(");
            count.push(0);
            let words_ = line.trim().split(" ");
            for(var i = 0; i<words_.length;i++){
                count[count.length-1]+=countSyllables(words_[i]);
            }
            count.push(`)** ${line}\n`);
        }
        message.reply(count.join(""));
    }

    if(message.reference){//message.mentions.has(client.user))
    // message.reply(`Sorry ${message.author.displayName} but I don't quite know the topic you're asking about. Hopefully an officer has your answer.`);
    }else 
    message.reply(`Hello there ${message.author.displayName} :)\nLet me know if you need help with anything`);
    
});





////////////////////
// SLASH COMMANDS //
////////////////////
client.on('interactionCreate', async (interaction)=>{
    if(!interaction.isChatInputCommand()&&!interaction.isStringSelectMenu()&&!interaction.isButton()) return;

    // get the officer role in this server, see if user is officer
    const officerRole = interaction.guild.roles.cache.find(role => role.name==="Officer 👑");
    const isOfficer = interaction.member.roles.cache.has(officerRole.id);

    // treat dropdown & button interactions as slash command, kills 3 stones with one bird— i know i know im a genius for this haha
    if(interaction.customId=="help_dropdown")
        interaction.commandName = interaction.values[0];
    else if(interaction.isButton())
        interaction.commandName = interaction.customId;

    if(interaction.commandName == 'report'){
        try{
        // if user is an officer, then reject report
        // if sender is an officer then mute user
        // In either nor cases notify sender & send report
        // Include attachments with report

        const username = interaction.options.getMember('username');
        const userIsOfficer = username?.roles.cache.has(officerRole.id);

        if (!username) {
            return interaction.reply({ content: "User not found.", ephemeral: true });
        }

        if(isOfficer){ // reported BY an officer
            username.timeout(minToMS(10), 'Muted by command')
            .then(() => {
                interaction.reply({ content: `${username.displayName} has been muted for 10 minutes.`, ephemeral: true });
            })
            .catch(err => {
                console.error(err);
                interaction.reply({ content: "An error occurred while trying to mute the user.", ephemeral: true });
            });
        }else if(userIsOfficer){ // reporting an officer
            interaction.reply({content: "There seems to be a mistake— you cannot report an officer.\nMake sure you reported the right person.",ephemeral: true });
        }else{
            interaction.reply({content:`${username.displayName} has been reported`,ephemeral:true});
        }
        
        let attachment = interaction.options.getAttachment("attachment");
        const reportMessage = `## :exclamation: User Report\n**User:** ${username.displayName} (${username.id})\n**Reporter:** ${interaction.member.displayName} `
            +(isOfficer?"(officer)":"") // Reported & reporter, + is user an officer?
            +"\n**Reason:** "+ interaction.options.getString("reason");
        sendReport(interaction.guild, reportMessage, attachment);

    }catch(err){
        console.log(err);
        interaction.reply(`There seems to have been this error: ${err}`);
    }

    } // report [USERNAME, REASON, ATTACHMENTS (optional)] — DONE
    if(interaction.commandName == 'add-officer'){

        if(!isOfficer)
            return interaction.reply("Only officers are able to add new officers.");
        const username = interaction.options.getMember('username');

        // add officer role
        username.roles.add(officerRole)
        .then(() => {
            interaction.reply(`The officer role has been assigned to ${username.displayName}.`);
        })
        .catch(err => {
            console.error(err);
            interaction.reply({ content: `An error occurred while assigning the officer role.\n${err}`, ephemeral: true });
        });


    } // add-officer [USERNAME] — DONE
    if(interaction.commandName == 'deadline'){
        sub_deadline(interaction);
    } // deadline — DONE
    if(interaction.commandName == 'requirements'){
        sub_requirements(interaction);
    } // requirements — DONE
    if(interaction.commandName == 'submit'){

        let choices = [
            { name: "poetry", value: process.env.DRIVE_FOLDER_ID_1 }, // writing
            { name: "prose/ short story", value: process.env.DRIVE_FOLDER_ID_1 }, // writing
            { name: "short play/ film script", value: process.env.DRIVE_FOLDER_ID_1 }, // writing
            { name: "visual art (specify under info)", value: process.env.DRIVE_FOLDER_ID_2 }, // visual
            { name: "short film", value: process.env.DRIVE_FOLDER_ID_4 }, // video
            { name: "recorded performance", value: process.env.DRIVE_FOLDER_ID_4 }, // video
            { name: "recorded audio", value: process.env.DRIVE_FOLDER_ID_3 }, // audio
            { name: "other (specify under info)", value: process.env.DRIVE_FOLDER_ID_5 } // other
        ]; // writing, visual, video, audio, other
        let choice = choices[interaction.options.getString('type')];


        let opt = [interaction.options.getString('title'),interaction.options.getString('author'),choice.name,interaction.options.getString('info'),interaction.options.getString('email')]
        let submission = interaction.options.getAttachment('submission');
        submitToMagazine(
            interaction.guild, // guild
            interaction.member, // username
            opt[0], // title
            opt[1], // author
            opt[2].replaceAll("(specify under info)",""), // type
            opt[3], // info
            submission, // submission
            interaction.options.getString('link'), // link
            opt[4] // email address
        );

        interaction.reply({content:`## Thanks for submitting to our Magazine :)\nYour \`${opt[2]}\` piece, **${opt[0]}**, has been submitted under the name __${opt[1]}__ (${choice.name}).\n> email: \`${opt[4]}\`\n> **INFO:** ${opt[3]}\n\nIf you believe you've made a mistake then DM an officer.\nOtherwise, we'll DM you if we have any further questions regarding the submission.`,ephemeral: true})

        try {
            uploadToDrive(submission,choice,opt[0]);
        } catch (error) {
            console.error('Error uploading file to Google Drive: ', error);
            interaction.editReply({ content: `HEY!!!! ik wat im aboutta say may sound cray-z but i thnk i might be sick.\ndw, im sure we got ur submission, but ill need you to talk to one of the officers about this so they can fix me :(\n\nSend them this and it'll help them find the error:\n> ${error}`, ephemeral: true });
        }
    } // submit: [TITLE, AUTHOR, TYPE, SUBMISSION, LINK (optional), INFO] — DONE
    if(interaction.commandName == 'schedule'){
        club_schedule(interaction);
    } // schedule — DONE
    if(interaction.commandName == 'officehours'){
        office_hours(interaction);
    } // officehours — DONE
    if(interaction.commandName == 'appointment'){
        let m = Number(interaction.options.getString("month"))-1;
        let dpm = [31,29,31,30,31,30,30,31,30,31,30,31];
        let d = interaction.options.getInteger("date");
        let h = Number(interaction.options.getString("hour"));
        if(d>dpm[m]) // check to see if the date is valid
            interaction.reply({content: `${m+1}/${d} is an invalid date!\nThere are only ${dpm[m]} days in this month... did you make a mistake?\n> **Details:** ${interaction.options.getString("description")}`,ephemeral: true});
        else{
            // send appointment with reports to notify officers
            let currentDate = new Date();
            let appDate = new Date(currentDate.getFullYear()+(currentDate.getMonth()>m?1:0),m,d,h);
            let reportContent =  `${interaction.member} has requested an appointment with an officer on <t:${appDate/1e3}:f>, <t:${appDate/1e3}:R>\n> **Details:** ${interaction.options.getString("description")}\n-# If the time doesn't fall within regular office hours an officer will get back to you shortly, otherwise we now know to expect you :)\n-# **Hint:** you can use the \`/officehours\` command to see all available office hours.`;
            sendReport(interaction.guild,reportContent);
            interaction.reply({content: reportContent,ephemeral: true});
        }

    } // appointment: [MONTH, DATE, HOUR, DESCRIPTION] - DONE
    if(interaction.commandName == 'rules'){
        club_rules(interaction);
    } // rules – DONE
    if(interaction.commandName == 'linkperm'){
        
        const reportMessage = `## Link Permission Request\n**User** ${interaction.member} has requested approval for the following link:\n> `
            + interaction.options.getString("link")+"\n-# If the link looks alright, then assign link perm role to user";
        sendReport(interaction.guild, reportMessage);
        interaction.reply({content:"Mods may take a minute to approve your link, you'll be notified once they do :)",ephemeral: true});

    } // linkperm: [LINK] — DONE

    if(interaction.commandName == 'suggest'){
        const suggestMessage = `## :sparkles: Suggestion :sparkles:\n${interaction.member} suggested the activity **${interaction.options.getString('activity')}**`
            +`\n> **More Info:** ${interaction.options.getString("info")}`;
        sendReport(interaction.guild, suggestMessage);
        interaction.reply({content: suggestMessage+`\n\nOfficers have recieved your request :)`,ephemeral: true});
    } // suggest: [ACTIVITY, INFO] — DONE
    if(interaction.commandName == 'roll'){
        let mx = interaction.options.getInteger('max')||6;
        let RN = (Math.floor(Math.random() * mx))+1;
        interaction.reply(`## :game_die: \`You've rolled a ${mx} sided die, and got a ${RN}\` :game_die:`);
    } // roll: [MAX (optional)] — DONE
    if(interaction.commandName == 'inspire'){
        getRandomInspiration(interaction);
    } // inspire — DONE
    if(interaction.commandName == 'quote'){
        getRandomQuote(interaction);
    } // quote — DONE
    if(interaction.commandName == 'qr-code'){
        QR( // generating QR code
            interaction, 
            interaction.options.getString('url'),// URL (required)
            interaction.options.getInteger('scale'), // we'll default it to 20
            interaction.options.getString('color'), // QR code color (dark)
            interaction.options.getString('color-bg'), // QR code BG color (light)
            true // hide message since it's from slash command
        );
    } // qr-code 
})

client.login(process.env.TOKEN);
