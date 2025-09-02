//*****************************************************************************
//*********************    JavaScript Source Code    **************************
//*****************************************************************************
//  DESIGNER NAME:  Hamzah Alani 
//        PROJECT:  Oyster Bot v0.1.07
//    GITHUB DOCS:  https://github.com/Alani25/OysterBot
//
//-----------------------------------------------------------------------------
//
// DESCRIPTION:
// Oyster-Bot is a Discord bot made specifically for the MCC Cabbages & Kings
// club online Discord server community. The purpose of this bot is to assist 
// in moderating the C&K discord server, while also answering common questions
// regarding the C&K magazine submissions, including submissions deadline, 
// requirements, and such.
//
// This bot's second purpose is to bring life to the club's mascot character,
// King Oyster, by making him a part of the community. In hopes of making
// Oyster-bot feel lively enough, the goal is to allow him to interact with 
// the community without needing to be commanded to.
// This could include things like reacting to messages or spotting haikus.
// 
// We've also added to King Oyster a few features that assist members of the 
// server with finding creativity, such as rolling a dice, reading a random 
// quote, or literally asking for inspiration.
// 
//*****************************************************************************
//*****************************************************************************

/////////////////////////////////
// NODE PACKAGES CONFIGURATION //
/////////////////////////////////

require('dotenv').config(); // env file

const { Client, GatewayIntentBits, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder, quote , AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas"); // for canvas actions
const { google } = require("googleapis");
const axios = require("axios");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const qrcode = require('qrcode');
// const syllable = require('syllable');
const cron = require("node-cron"); // for reminders
const { PDFDocument, rgb } = require("pdf-lib"); // for merging into PDF

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
        GatewayIntentBits.GuildMessages,  // For message events in guilds
        GatewayIntentBits.MessageContent, // To read the content of messages
        GatewayIntentBits.GuildMembers // Required to detect new members
    ]
});

// when client is first connected
client.on('ready', async (c)=>{
    console.log(` " ${c.user.tag} " is online now `); 
    client.user.setActivity({
        name: "Watching this epic video, check it out",
        type: ActivityType.Streaming,
        url: "https://www.youtube.com/watch?v=00WCEbKM_SE"
    })

    // console.log('Bot is ready!');

    // // IDs from the message link
    // const guildId = '888394800011825232';
    // const channelId = '1273314733620989973';
    // const messageId = '1356312334083293264';

    // try {
    //     const guild = await client.guilds.fetch(guildId);
    //     const channel = await guild.channels.fetch(channelId);
    //     const message = await channel.messages.fetch(messageId);

    //     await message.react("1334609780097945733");
    //     console.log('Reaction added!');
    // } catch (error) {
    //     console.error('Error reacting to the message:', error);
    // }
});





//////////////////////////
// ADJUSTABLE VARIABLES //
//////////////////////////

// Note to Self: Most of these adjustable values were placeholders, and could be deleted — TODO
// office hours
var officeHours = [
    { // monday
        name: "Alani",
        pos:  "VP",
        dotw: 1,
        time: ["3:30", "4:00", "PM"] // time start to end
    }
]
// allow officers to adjust the deadline
var submissionsDeadline = new Date("March 3, 2025 23:59:59");
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
// Arrays that reset every minute and hour
var spamTrack = [];
var muteHistory = [];
// every minute
cron.schedule("* * * * *", async () => {
    spamTrack = []; // Clear the array

    // check reminders every hour
    let currentReminders = allReminders().split("\n");
    for(var i=1; i<currentReminders.length;i++){
        let data = currentReminders[i].split("::");
        // check if reminder date passed
        if (new Date(data[0]) <= new Date()){
            console.log("reminder found");
            console.log(currentReminders[i]);

            messageContent = `> **Reminder:** ${data[3]}`
            if(data.length>5){
                // get guild from guild ID
                const guild = await client.guilds.fetch(data[1]);
                // get channel from channel ID
                const channel = await guild.channels.fetch(data[2]);
                if (channel) // check if channel exists
                    channel.send(messageContent); // Send the message
            }else{
                // get user from user ID
                const user = await client.users.fetch(data[4]);
                if(user) // check if user exists
                    user.send(messageContent);
            }

            currentReminders[i] = "";

        }
    }
    allReminders(currentReminders.join("\n"));
    // DATE :: GUILD ID :: CHANNEL ID :: REMINDER :: ::
    // if private:
    // DATE :: GUILD ID :: CHANNEL ID :: REMINDER :: USER ID
});
cron.schedule("0 * * * *", async () => {
    muteHistory = []; // Clear the array
    console.log("Been an HOUR - cron is working");

    // update spreadhsheet data
    readSpreadsheet();

    


});





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
            if(index>10&&row.length>0)
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
        console.error("Error reading spreadsheet: "+ error.message+"\nGoogle APIs won't work. In other words, google drive & spreadsheet connections won't happen…\nplz visit https://developers.google.com/oauthplayground using approved google account and see codes inside of .env file");
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
                .setCustomId('inspire').setLabel('Sprinkle More Inspiration').setStyle(ButtonStyle.Primary)
        );
        let mssgContent = {content: `> **Random Inspiration:**\n> \`${RP.join("` `")}\``,components: [row]}
        // V0.1.07: Don't edit the previous message, but rather create a new one to keep the previous message alive
        try{ // attempt to edit previous response
            await message.update({content: message.message.content+"\n"+mssgContent.content.split("\n")[1],components: [row]});
            console.log(message);
        }catch(err){
            console.error(err);
            await message.reply(mssgContent);
        }

    }else
        return RP.join(" ");
}
// random quote generator
function getRandomQuote(message,num) {
    try {
        // Resolve the path to quotes.txt
        const filePath = path.join(__dirname, 'quotes.txt');
        // Read the file content
        const data = fs.readFileSync(filePath, 'utf8');
        // Split the content into an array of quotes
        const quotes = data.split('\n\n\n');

        // Choose a random quote
        let RN = Math.max((num||(Math.floor(Math.random() * quotes.length)+1))-1,0);
        if(RN>quotes.length-1)
            RN = 0;

        if(message){
            // buttons
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder() // Left Quote
                    .setCustomId('quote||number:'+(RN||quotes.length)).setLabel('<').setStyle(RN?ButtonStyle.Primary:ButtonStyle.Secondary),
                new ButtonBuilder() // New Quote
                    .setCustomId('quote').setLabel('Random Quote').setStyle(ButtonStyle.Success),
                new ButtonBuilder() // Right Quote
                    .setCustomId('quote||number:'+(RN+2)).setLabel('>').setStyle(RN===quotes.length-1?ButtonStyle.Secondary:ButtonStyle.Primary) 
            );

            // prepare message to send, and either edit, reply, or send in channel
            let mssgContent = {content: `> **Quote #${RN+1}**\n> ${quotes[RN].replaceAll("\n","\n> ")}`,components: [row]}

            try{
                // check to see if a message is a button
                if(message.isButton()&&num>0)
                        message.update(mssgContent);
                else
                    message.reply(mssgContent);
            }catch(err){
                // if message is not a button then just simply respond
                message.reply(mssgContent);
            }
            
            return;
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




// MERGING PDFs
async function mergePDFs(pdfBuffers){
    const mergedPdf = await PDFDocument.create();

    for (const pdfBuffer of pdfBuffers) {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save(); // This returns ArrayBuffer, need to convert it to Buffer before using
}

// get file from drive
async function getFileMetadata(fileId) {
    try {
        const file = await drive.files.get({
            fileId: fileId,
            fields: "name, mimeType",
        });
        return file.data;
    } catch (error) {
        console.error(`Error fetching metadata for file ${fileId}:`, error.message);
        return null;
    }
}
async function convertImagesToPDF(imageDocs) {
    const mergedPdf = await PDFDocument.create(); // Create a new PDF document

    for (const imageDoc of imageDocs) {
        // Convert the image buffer to an actual image object using the `loadImage` method from 'canvas'
        const image = await loadImage(imageDoc); // `imageDoc` should be a buffer or a file path to the image

        // Add a new page to the PDF with the image dimensions
        const page = mergedPdf.addPage([image.width, image.height]);

        // Draw the image onto the page
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }

    // Return the merged PDF as a buffer (which is the expected return type)
    return await mergedPdf.save();
}

async function generateVideoQRs(videoLinks) {
    const mergedPdf = await PDFDocument.create(); // Create a new PDF document

    for (const videoLink of videoLinks) {
        // Generate QR code for the video link
        const qrCodeBuffer = await QRCode.toBuffer(videoLink); // Generates a QR code as a Buffer

        // Embed the generated QR code image into the PDF
        const qrImage = await mergedPdf.embedPng(qrCodeBuffer);

        // Add a new page to the PDF for the QR code
        const page = mergedPdf.addPage([200, 200]); // Set the page size (can be adjusted)
        
        // Draw the QR code on the page
        page.drawImage(qrImage, { x: 50, y: 50, width: 100, height: 100 }); // Adjust the positioning and size

    }

    // Return the merged PDF as a Buffer
    return await mergedPdf.save();
}

// MEET THE ALGO RYTHM BROTHERS
async function algo(rythm,message) {
    try {
        // send message early to avoid failed interaction
        message.reply("Loading...");
        // TODO: turn the spreadsheet reading process into a function that returns the 2D array of the specified cells, defined within the input parameters
        // spreadsheet range of info
        let range = "Form Responses 1!A1:K99";
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: rythm,
            range: range,
        });
        const rows = response.data.values;
        // make sure the spreadsheet isn't empty
        if (!rows || rows.length === 0){
            console.log("No data found in the spreadsheet.");
            return;
        }
        // console.log(rows);
        var unknown = [];
        
        // loop through all the submissions
        for(var i=1; i<rows.length;i++){
            // progress bar
            let progress = Math.floor(100*i/rows.length);
            await message.editReply(`${Math.min(100,progress*2)}%\n\`${"|".repeat(Math.min(progress,50))+" ".repeat(Math.max(50-progress,0))}\`\n${i} / ${rows.length} submissions read\n\nTrust in the Algo and Rythm bros`);
            
            // Sparrow Hazen,https://drive.google.com/open?id=1t6lTrvCgHGL09uhHwtZrU54vTMlxm60V4Yz-2cGibc4,Backrooms short story from my notes app?,Writing (prose/short story)
            if(rows.join("||").includes("open?id=")){
                // derive the drive link from the cells
                driveLink = rows.join("||").split("open?id=")[1];
            }else{
                // add to unknown if no file is provided
                unknown.push(`${title} by ${name}, email: ${email}`); 
            }
            var date = rows[i][0];
            var name = rows[i][3];
            var email = rows[i][2];
            var title = rows[i][5];
            var type = rows[i][6];
            var link = rows[i][4] || rows[i][8]; // drive link to submission
            
            // stop any submissions with invalid links
            if(!link||!link.includes("drive.google")){
                unknown.push(`${title} by ${name}, email: ${email}`); 
                continue;
            }
            fileId = link.split("?id=")[1];
            const fileMetadata = await getFileMetadata(fileId);
            if (!fileMetadata) {
                unknown.push(`${title} by ${name}, email: ${email}`); 
                continue;
            }

            var PDFDocs = [];
            var IMGDocs = [];
            var VIDDocs = [];
            // Categorize file based on MIME type
            const mimeType = fileMetadata.mimeType;
            if (mimeType === "application/pdf") {
                // categorizedFiles.pdf.push(fileMetadata);
                PDFDocs.push(fileMetadata);
                console.log(`📄 PDF: ${fileMetadata.name}`);
            } else if (mimeType.startsWith("image/")) {
                // categorizedFiles.image.push(fileMetadata);
                IMGDocs.push(fileMetadata); // Pass file metadata for images to be handled correctly
                console.log(`🖼️ Image: ${fileMetadata.name}`);
            } else if (mimeType.startsWith("video/")) {
                // categorizedFiles.video.push(fileMetadata);
                VIDDocs.push(link);
                console.log(`🎥 Video: ${fileMetadata.name}`);
            } else {
                unknown.push(`${title} by ${name}, email: ${email}`); 
                console.log(`⚠️ Unknown File Type: ${fileMetadata.name}`);
                continue;
            }

            console.log(`${i}: ${mimeType}`);
        }
        console.log(unknown);

        // Merge PDFs
        const pdfFiles = await mergePDFs(PDFDocs);
        const imageFiles = await convertImagesToPDF(IMGDocs);
        const qrFiles = await generateVideoQRs(VIDDocs);

        // Ensure each generated file is a Buffer before attaching
        const pdfBuffer = Buffer.from(pdfFiles); // Convert to Buffer
        const imageBuffer = Buffer.from(imageFiles); // Convert to Buffer
        const qrBuffer = Buffer.from(qrFiles); // Convert to Buffer

        // Create AttachmentBuilder objects
        const pdfAttachment = new AttachmentBuilder(pdfBuffer, { name: 'merged_pdfs.pdf' });
        const imageAttachment = new AttachmentBuilder(imageBuffer, { name: 'merged_images.pdf' });
        const qrAttachment = new AttachmentBuilder(qrBuffer, { name: 'merged_videos.pdf' });

        // Send the message with attachments
        await message.channel.send({
            content: unknown.length < 1 ? 
                "I can read all submissions clearly :D" : 
                `## Unknown Submissions: \n||${unknown.join("\n\n")}||\n\n-# plz note that these might have to be added manually bc the way they've been submitted doesn't grant the algo and rythm brothers enough info to work their magic. Also I cannot read docx files ;-;`,
            files: [pdfAttachment, imageAttachment, qrAttachment], // Attach the generated PDFs
        });
        
    } catch (error) {
        console.error("Error reading spreadsheet: "+ error.message);
        // submissionsDeadline = null; // if there's an error updating the date then set to null I guess
    }
}
// algo("19A2TK9LDvPFKWd6oEtQBaF0SXvt7R7lnlJhKFMbTOew");





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
    // Displaying the deadline (will display "To Be Decided..." if not available)
    let subDeadline = Math.floor(submissionsDeadline?.getTime() / 1e3);
    message.reply({content: `> The deadline for the Cabbages & Kings magazine submissions is `+
        (isNaN(subDeadline)?"\n> **To Be Decided...**":
        `on <t:${subDeadline}:D>, <t:${subDeadline}:R>\n-# You can submit through the submissions form or using the \`/submit\` command.`),
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
//// REMINDERS ///
function allReminders(content){
    // access reminders file
    const filePath = path.join(__dirname, 'reminders.txt');
    if(content) // write to file if there's any content
        fs.writeFileSync(filePath, content, 'utf8');
    // return content of file
    return fs.readFileSync(filePath, 'utf8');
}
// REMIND-ME: [REMINDER, MONTH, DAY, YEAR (optional), TIME (optional)]
async function createReminder(interaction, reminder, month, day = 1, year, time = 5, private) {
    const now = new Date(); // current time
    const currentYear = now.getFullYear(); // current year
    const currentMonth = now.getMonth() + 1; // current month number

    // Default year logic
    if(!year)
        year = (month>currentMonth||(month===currentMonth && day>=now.getDate()))?currentYear:currentYear+1;
    year = Math.max(year,currentYear);

    // Final reminder date
    const reminderDate = new Date(year, month - 1, day, time, 0, 0);

    // Check if the reminder time is in the past
    if (reminderDate <= now) {
        await interaction.reply({ content: `> **REMINDER:** ${interaction.user} ${reminder.replaceAll("\n"," ").replaceAll("::",": ")}\n-# **Time:** ${reminderDate}\n\nWhoops... I cannot remind you about something in the past… <:uhoh:1334609780097945733>`, ephemeral: true });
        return;
    }

    // update reminders.txt file to add in new reminder
    let currentReminders = allReminders();
    // DATE :: GUILD ID :: CHANNEL ID :: REMINDER :: ::
    // if private:
    // DATE :: GUILD ID :: CHANNEL ID :: REMINDER :: USER ID
    allReminders(`${currentReminders}\n${reminderDate}::${interaction.guild.id}::${interaction.channel.id}::${interaction.user} ${reminder.replaceAll("\n"," ")}::${private?interaction.user.id:"::"}`);
    await interaction.reply({ content: `> **REMINDER:** ${reminder.replaceAll("\n","\n>")}\n-# **Time:** ${reminderDate}\n\nGonna remind you <t:${Math.floor(reminderDate/1e3)}:R> ... \nenjoy some boba till then <:boba:1343793321436385301>`, ephemeral: true });
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
    let words = text.replaceAll("-"," ").split(/\s+/);
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

    if(message.author.bot) // ignore if message is from a bot
        return;
    
    // SPAM PREVENTION
    let aID = message.author.id;
    spamTrack.push(aID);
    if(spamTrack.join(",").split(aID).length>10 || 
      (!message.content.includes("https") && message.content.length>15 && message.content.split(" ").length<2)){
        muteHistory.push(aID); // add author ID to the mute history

        // get user 
        const member = message.guild.members.cache.get(aID);
        let minsMuted = muteHistory.join(",").split(aID).length-1;
        member.timeout(60000*minsMuted, "Spamming detected") // Timeout (60000 = 1 minute)
            .then(() => {
                const timeoutEnd = Date.now() + 60000*minsMuted; // Calculate the time when they can send messages again
                message.reply(`Plz don't spam :0\n${member.user.tag} has been muted for sending too many messages under a minute...\nYou will be able to send messages again <t:${Math.floor(timeoutEnd/1e3)}:R>`);

            })
            .catch(err => {
                console.error("Error applying timeout:", err);
            });

        // message.reply("Plz don't spam :0");
    }
    
    
    
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
    var isPoem = message.content.split("\n").length>4;
    var shareChannel = message.channel.name.toLowerCase().includes("share");
    if(message.attachments.size>0||(isPoem&&shareChannel)) // has attachment, WOAH
        message.react(shareChannel?
        "1334234382772207696":"1334609229599739976"); // if in share channel? WOAH else LOOK UP
    if(isPoem&&shareChannel)
        message.react("📜");
    if(mssg.includes("origami"))
        message.react("1334608848513798155");
    if(words.includes("boba"))
        message.react("1343793321436385301")
    if(mssg.includes("important")){
        // message.react("1334609229599739976");
        message.react("‼️");
    }
    if(mssg.includes("oops")||words.includes("uhoh")||words.includes("birthed"))
        message.react("1334609780097945733");
    if(words.includes("love")||(mssg.includes("thank")&&words.includes("oyster")))
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
            message.author.send(`Hi ${message.author}, your message was removed because it contained a link.\nPlease ask for permission before posting links.\n\nYou can ask for link permission using the \`/linkperm\` command`);
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
    // HELP
    if(words.includes("help")){
        help(message);
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
    let num = 0;
    let icID = interaction.customId;
    // 'quote||number:'+(RN+1)
    if(icID=="help_dropdown")
        interaction.commandName = interaction.values[0];
    else if(interaction.isButton()){
        interaction.commandName = icID;
        if(icID.includes("||")){
            interaction.commandName = icID.split("||")[0];
            num = icID.split(":")[1];
        }
    }
    console.warn(`Looking for quote number ${num}`);

    // 'quote||number:'+(RN+1)

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
        if(interaction.isButton()){
            // console.log(`Looking for quote number ${num} and yes this is a button`);
            getRandomQuote(interaction,num);
        }else{
            console.log(`this is not a button`);
            getRandomQuote(interaction,interaction.options.getInteger('number'));
        }
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
    } // qr-code — DONE
    if(interaction.commandName == 'remind-me'){
        // createReminder(channel, reminder, month, day, year, time)
        createReminder(
            interaction,
            interaction.options.getString('reminder'),
            interaction.options.getInteger('month'),
            interaction.options.getInteger('day'),
            interaction.options.getInteger('year'), // optional, default to most recent
            interaction.options.getInteger('time'), // default to early morning
            interaction.options.getBoolean('private') // private message
        );

    } // REMIND-ME: [REMINDER, MONTH, DAY, YEAR (optional), TIME (optional)]
    if(interaction.commandName == 'algo'){
        let vl = interaction.options.getString('rythm');
        algo(vl,interaction);
    }
})





//////////////////////
// New Members Join //
//////////////////////
client.on("guildMemberAdd", async (member) => {
    const welcomeChannel = member.guild.systemChannel; // Get the system channel
    if (!welcomeChannel) return;

    // Create a canvas to draw the image on
    const canvas = createCanvas(700, 700); // let's keep it square for now
    const ctx = canvas.getContext("2d");

    // Get the user's avatar
    const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 512 });
    // Fetch the image from the URL to convert to PNG
    const response = await fetch(avatarURL);
    const buffer = await response.buffer();
    console.log(buffer);
    console.log("Image url: "+avatarURL);
    // hope image automatically converts to png
    const avatar = await loadImage(avatarURL);

    // Draw the avatar on the canvas (positioning it at x: 50, y: 50, and resizing to 100x100)
    ctx.drawImage(avatar, 127, 138, 440, 440); // 700/2 - 300/2 = x = 200
    
    // Load the cover image, welcome.png
    console.log("Loading image from:", path.join(__dirname, "welcome.png"));
    // const fileBuffer = fs.readFileSync(path.join(__dirname, "welcome.png"));
    const cover_ = await loadImage("./src/welcome.png");
    ctx.drawImage(cover_, 0, 0, canvas.width, canvas.height);

    // Save the image as a file
    const finalImage = canvas.toBuffer();
    fs.writeFileSync("./welcome-image.png", finalImage);

    // Send the image as an attachment
    welcomeChannel.send({
        content: `Welcome to the server ${member.user}! 🎉`,
        files: ["./welcome-image.png"],
    });
});

client.login(process.env.TOKEN);
