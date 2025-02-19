// NOTE: run this in terminal after moving to new server
// node src/register-commands.js

// include env file for token
require('dotenv').config();

// import libraries
const { REST, Routes, ApplicationCommandOptionType, Application } = require("discord.js");

/*

    /deadline: Show how much time left until deadline
    /requirements: List requirements for submissions
    /submit: submit a project to the magazine
    /schedule: Club meeting times (Friday, 12 to 1 PM)
    /officehours: get a list of the office hours
    /apointment: set a meeting apointment in one of the office hours times
    /rules: quick overview of the rules, and link to rules channel
    /linkperm: request permission to post link

    /suggest (activity, info): suggest an activity
    /roll (max): roll a dice
    /inspire: get a random phrase to spark some inspiration
    
*/

// define the slash commands
const commands = [
    { // report: [USERNAME, REASON, ATTACHMENTS (optional)]
        name: "report",
        description: "Report a user for misbehavior",
        options: [
            {
                // USERNAME
                name: "username",
                description: "Username of user to report",
                type: ApplicationCommandOptionType.User,
                required: true
            },{
                // REASON
                name: "reason",
                description: "Reason for reporting user",
                type: ApplicationCommandOptionType.String,
                required: true
            },{
                // attachments (optional)
                name: "attachment",
                description: "Screenshot or proof (optional)",
                type: ApplicationCommandOptionType.Attachment
            }
        ]
    },{ // add-officer: [USERNAME]
        name: "add-officer",
        description: "Adds new members to our team of officers",
        options: [
            {
                // USERNAME
                name: "username",
                description: "Username of officer",
                type: ApplicationCommandOptionType.User,
                required: true // make this option a requirement
            }
        ]
    },{ // deadline: [] ... 
        name: "deadline",
        description: "See how much time left until the submissions deadline",
        options: []
    },{ // requirements: [] ... 
        name: "requirements",
        description: "Check requirements for submissions",
        options: []
    },{ // submit: [TITLE, AUTHOR, TYPE, INFO, SUBMISSION, LINK (optional)] ... 
        name: "submit",
        description: "Submit a piece to the magazine",
        options: [
            { // TITLE
                name: "title",
                description: "title of the piece submitted",
                type: ApplicationCommandOptionType.String,
                required: true // make this option a requirement
            },{ // AUTHOR
                name: "author",
                description: "name you would like to publish your work under",
                type: ApplicationCommandOptionType.String,
                required: true // make this option a requirement
            },{ // TYPE
                name: "type",
                description: "the type of piece being submitted (ex: writing, video, etc.)",
                type: ApplicationCommandOptionType.String,
                required: true, // make this option a requirement
                choices: [
                    { name: "poetry", value: "0" },
                    { name: "prose/ short story", value: "1" }, 
                    { name: "short play/ film script", value: "2" },
                    { name: "visual art (specify under info)", value: "3" },
                    { name: "short film", value: "4" },
                    { name: "recorded performance", value: "5" },
                    { name: "recorded audio", value: "6"},
                    { name: "other (specify under info)", value: "7"}
                ]
            },{ // INFO
                name: "info",
                description: "Additional information regarding submition",
                type: ApplicationCommandOptionType.String,
                required: true
            },{ // SUBMISSION
                name: "submission",
                description: "this is where you attach your submission",
                type: ApplicationCommandOptionType.Attachment,
                required: true // make this option a requirement
            },{ // EMAIL
                name: "email",
                description: "email address to contact you from",
                type: ApplicationCommandOptionType.String,
                required: true 
            },{ // LINK
                name: "link",
                description: "(optional) any links you'd like to add related to your submission",
                type: ApplicationCommandOptionType.String
            }
        ]
    },{ // schedule: [] ... 
        name: "schedule",
        description: "Check the club meeting time",
        options: []
    },{ // officehours: [] ... 
        name: "officehours",
        description: "Get a list of the office hours",
        options: []
    },{ // appointment: [MONTH, DATE, HOUR, DESCRIPTION (optional)] ... 
        name: "appointment",
        description: "Set a meeting time during one of the office hours",
        options: [{
            // MONTH
            name: "month",
            description: "Specify month number for meeting",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "1. January" , value: "1" },
                { name: "2. February" , value: "2" }, 
                { name: "3. March" , value: "3" },
                { name: "4. April" , value: "4" },
                { name: "5. May" , value: "5" },
                { name: "6. June" , value: "6" },
                { name: "7. July" , value: "7" },
                { name: "8. August" , value: "8" },
                { name: "9. September" , value: "9" },
                { name: "10. October" , value: "10"},
                { name: "11. November" , value: "11"},
                { name: "12. December" , value: "12"}
            ]
        },{
            // DATE
            name: "date",
            description: "Specify date number for meeting",
            type: ApplicationCommandOptionType.Integer,
            required: true
        },{
            // HOUR
            name: "hour",
            description: "Specify the hour for meeting",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [ // meeting time choices
                { name: "7 AM" , value:  "7" },
                { name: "8 AM" , value:  "8" },
                { name: "9 AM" , value:  "9" },
                { name: "10 AM", value: "10" },
                { name: "11 AM", value: "11" },
                { name: "12 PM", value: "12" },
                { name: "1 PM" , value: "13" },
                { name: "2 PM" , value: "14" },
                { name: "3 PM" , value: "15" },
                { name: "4 PM" , value: "16" },
                { name: "5 PM" , value: "17" },
                { name: "6 PM" , value: "18" },
                { name: "7 PM" , value: "19" }
            ]
        },{
            // DESCRIPTION
            name: "description",
            description: "Purpose of the meeting",
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    },{ // rules: [] ... 
        name: "rules",
        description: "Quick overview of the rules",
        options: []
    },{ // linkperm: [LINK] ... 
        name: "linkperm",
        description: "Request permission to post link",
        options: [{
            // LINK
            name: "link",
            description: "Paste link here",
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    },{ // suggest: [ACTIVITY, INFO] ... 
        name: "suggest",
        description: "Suggest an activity for our meetings",
        options: [{
            // ACTIVITY
            name: "activity",
            description: "Name of the activity you'd like to suggest",
            type: ApplicationCommandOptionType.String,
            required: true
        },{
            // INFO
            name: "info",
            description: "Extra info explaining the activity",
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    },{ // ROLL: [MAX (optional)] ...
        name: "roll",
        description: "Roll a dice and get a random number!",
        options: [{
            // MAX
            name: "max",
            description: "Maximum sides to the dice (defaults to 6)",
            type: ApplicationCommandOptionType.Integer
        }]
    },{ // INSPIRE: [] ...
        name: "inspire",
        description: "Get a random phrase to help spark some inspire!",
        options: []
    },{ // QUOTE: [] ...
        name: "quote",
        description: "Get a random quote",
        options: []
    },{ // QR-CODE: [URL, SCALE (optional), COLOR (optional), COLOR-BG (optional)] ...
        name: "qr-code",
        description: "Create a QR code quickly :)",
        options: [{
            // URL
            name: "url",
            description: "Paste in the QR code destination",
            type: ApplicationCommandOptionType.String,
            required: true
        },{
            // SCALE
            name: "scale",
            description: "How much would you like to scale the QR code? (default = 20)",
            type: ApplicationCommandOptionType.Integer,
            required: false
        },{
            // COLOR
            name: "color",
            description: "Color of the QR code (HEX is recommended)",
            type: ApplicationCommandOptionType.String,
            required: false
        },{
            // COLOR-BG
            name: "color-bg",
            description: "Color of the QR code background (HEX is recommended)",
            type: ApplicationCommandOptionType.String,
            required: false
        }]
    }
];


const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        // try to register the slash commands
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {
                body: commands
            }
        );

        // if we made it thus far then slash commands have been registered
        console.log("Slash commands were registered successfully");

    } catch (error) {
        console.log(`There was an error, register commands file:\n${error}`);
    }
})();