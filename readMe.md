# King Oyster 
## Bot logs
Code logs are important things among developers. Since I'm not using github within my workspace this time around (bc I don't need it for hosting and I'm lazy), I'll be outlining the different versions of the bot with all changes made along the way here.

###  v0.1.05 
- 🐛 **Bug:** Bot doesn't reply to messages send in replies to others
- 📚 **Libraries:** Google authentication renewal
- ✨ **Feature:** Bot reacts to keywords, `@ everyone` messages (based on channel), attachments (also based on channel), and etc. 
- ✨ **Feature:** King oyster can now detect haikus (not perfect with syllable counting… it's just a bot afterall ;-; ). Just type a haiku and it'll jump at you if it detects it.

###  v0.1.06:
- ✨ **Feature:** Syllable counter (count syllables for any poem when prompted), to try out reply to a message and say `@King Oyster#0093 count syllables`
- ✨ **Feature:** Generate QR code, to try out use slash command or type `qr https://example.com SCALE COLOR-HEX BG-COLOR-HEX` (you can leave anything after the link out of it if you want to)
- ❌ ~~**Feature:** Add new creative resources to King Oyster~~ ***Bad Idea*** ❌ (would need constant updates)
- ✨ **Feature *Update:*** Improve the inspirator, figured there's no use for the adverb in there. Use through `/inspire` command or type `@King Oyster#0093 give me some inspiration` (keywords: `inspire`, `inspiration`)

### v0.1.07
- 🎩 **Hosting:** Improve memory & hosting
- ✨ **Feature:** Allow bot to welcome new members
- 🚔 **Modding:** Spam prevention features with bot. If the same user sends 10+ messages in the same minute, or sends a message that is detected as spam (15+ letters without a space will be detected as spam, ex: uhfkeskfksfnnksefnks), mute them for a minute. If they spam again, bot will mute again for double the time. Mute info will reset after every hour (meaning if they spam again the next hour, it'll be back to 1 minute mute and goes up from there)
- ✨ **Feature:** Creating reminders. Ask Oyster to remind you to do something at certain time, and it'll DM you or send a message inside the channel when the time comes.
- 🔧 **Improvement:** Allowed bot to notice poems in **share channel** (used to only react to posts with embeds)
- 🔧 **Improvement:** Allow user to view specific or next quote (extra parameter), and make it so that requesting new quote creates a new message rather than editing previous message (this is how it was at first but then I edited it to prevent spam and now I'm putting it back after watching recent user interactions)

___
## Code Documentations
These documentations are written as of version **`V0.1.06`** of King Oyster Bot, and are currently being updated with version **`V0.1.07`**.

TOC:
1. [Workspace](#workspace)
   - <kbd>[src/ index.js](#src-indexjs)</kbd>
   - <kbd>[src/ quotes.txt](#src-quotestxt)</kbd>
   - <kbd>[src/ register-commands.js](#src-register-commandsjs)</kbd>
   - <kbd>[.env](#env)</kbd>
   - <kbd>[package.json & package-lock.json files + node_modules directory](#packagejson--package-lockjson-files--node_modules-directory)</kbd>
   - <kbd>Setting up Workspace</kbd> TODO link section
2. [Node packages](#node-packages)
3. [Slash commands](#slash-commands)
   - [<kbd>/report</kbd><kbd>`USERNAME`, `REASON`, `ATTACHMENTS` (optional)</kbd>](#report-username-reason-attachments-optional-)
   - [<kbd>/add-officer</kbd><kbd>`USERNAME`</kbd>](#add-officer-username-)
   - [<kbd>/deadline</kbd><kbd>_</kbd>](#deadline-)
   - [<kbd>/requirements</kbd><kbd>_</kbd>](#requirements-)
   - [<kbd>/submit</kbd><kbd>`TITLE`</kbd><kbd>`AUTHOR`</kbd><kbd>`TYPE`</kbd><kbd>`INFO`</kbd><kbd>`SUBMISSION`</kbd><kbd>`LINK` (optional)</kbd>](#submit-title-author-type-info-submission-link-optional-)
   - [<kbd>/schedule</kbd><kbd>_</kbd>](#schedule-)
   - [<kbd>/officehours</kbd><kbd>_</kbd>](#officehours-)
   - [<kbd>/appointment</kbd><kbd>`MONTH`</kbd><kbd>`DATE`</kbd><kbd>`HOUR`</kbd><kbd>`DESCRIPTION` (optional)</kbd>](#appointment-month-date-hour-description-)
   - [<kbd>/rules</kbd><kbd>_</kbd>](#rules-)
   - [<kbd>/linkperm</kbd><kbd>`LINK`</kbd>](#linkperm-link-)
   - [<kbd>/suggest</kbd><kbd>`ACTIVITY`</kbd><kbd>`INFO`</kbd>](#suggest-activity-info-)
   - [<kbd>/roll</kbd><kbd>`MAX` (optional)</kbd>](#roll-max-optional-)
   - [<kbd>/INSPIRE</kbd><kbd>_</kbd>](#inspire-)
   - [<kbd>/QUOTE</kbd><kbd>_</kbd>](#quote-)
   - [<kbd>/QR-CODE</kbd><kbd>`URL`</kbd><kbd>`SCALE` (optional)</kbd><kbd>`COLOR` (optional)</kbd><kbd>`COLOR-BG` (optional)</kbd>](#qr-code-url-scale-optional-color-optional-color-bg-optional-)
4. [Non-Slash Commands](#non-slash-commands)
   - <kbd>[Haiku Detection](#haiku-detection)</kbd>
   - <kbd>[Count Syllables](#count-syllables)</kbd>
   - <kbd>[Reactions](#reactions)</kbd>
5. 

___

# Workspace
The directory is organized as follows:
<br><img width="187" alt="image" src="https://github.com/user-attachments/assets/af4a53b3-2484-40c8-a566-39e88b3f8862" />


## src/ index.js
The heart of King Oyster, the main breain— this file contains main code for bot. 
This file includes Google authentication, working with Google Drive & Spreadhseets, imports dependencies, sets bot status, connects to `quotes.txt` file, listens to interactions and created messages.
<br>TODO link google authentication site & .env
<br>TODO link Node Packages 

## src/ quotes.txt
Lists quotes to be used in `index.js`.
<br>See `/quote` slash command.
<br>TODO link command

## src/ register-commands.js
Registers slash commands.
<br>Run the following command _once_ to register commands with a server:
```curl
node src/register-commands.js
```
Make sure to adjust the server ID in `.env` file.
<br>See Slash Commands section for more info on slash commands.
<br>TODO link slash commands

## .env
Contains all secrets. 
<br>This file contains:
- `TOKEN`: The bot token, aka the Oyster's password.
- `GUILD_ID`: The Discord server ID. Useful when registering slash commands with a new server.
- `CLIENT_ID`: Oyster's user ID, not very important and I probably don't use.
- `DRIVE_API_KEY`: Google Authentication API key. 
- `DRIVE_CLIENT_ID`: Google authentication client ID. 
- `DRIVE_CLIENT_SECRET`: Google authentication secret, aka the password for the authentication process.
- `DRIVE_REDIRECT_URI`: Redirecting URI to authentication link for handling API request
- `DRIVE_REFRESH_TOKEN`: Authentication token. May need to refresh after updating bot. See [src/index.js](#src-indexjs)
- `DRIVE_FOLDER_ID`: ID for google drive folder. We don't use this one really in the code– but might be useful in later versions. ID derived from directory url.
- `DRIVE_FOLDER_ID_1`: **Writing** submissions folder ID; derived from directory url.
- `DRIVE_FOLDER_ID_2`: **Visual** submissions folder ID; derived from directory url.
- `DRIVE_FOLDER_ID_3`: **Audio** submissions folder ID; derived from directory url.
- `DRIVE_FOLDER_ID_4`: **Video** submissions folder ID; derived from directory url.
- `DRIVE_FOLDER_ID_5`: **Other** submissions folder ID; derived from directory url.
- `SPREADSHEET_ID`: Spreadsheet file ID, used for information on room number, meeting times, office hours, deadline, etc. Derived from spreadsheet url.

## package.json & package-lock.json files + node_modules directory
`package.json` contains version number of dependencies, while `package-lock.json` includes more info on packages used, connecting back to `node_modules` directory, which includes all the packages used in the project.
<br>TODO mention node commands here
<br>TODO link Node Packages section

## Setting up Workspace
See [Workspace](#workspace) to get an idea of how to setup the directory. This tutorial assumes that you have NPM v22+ and git installed on your device. 
<br>If not, you can [follow this quick guide to install git](https://github.com/git-guides/install-git) and clone this respitory with this command
```curl
git clone https://github.com/Alani25/OysterBot.git
```
or you can manually download the files from this respitory (which would be a better option if you don't have expierence with git).
<br><img width="481" alt="Screenshot 2025-02-25 at 11 46 48 AM" src="https://github.com/user-attachments/assets/47c3c8db-0c02-407f-9107-709574cfca3a" />

However, you will still _need_ to [install Node JS](https://nodejs.org/en/download) to use the [DiscordJS library](https://discord.js.org/) and other [required packages](#node-packages).

<br>An IDE (Integrated Development Environment, aka a code editor) would also be required to edit the code, in which case I would recommend [VS Code](https://code.visualstudio.com/). 

<br>After install the code, either using `git clone` or by manually installing the zip file and unzipping it, you should find these files inside of the version folder.
<br>Note that the version used in this tutorial is `v0.1.06`, but you might be working off of a different version. If there are any other files or versions outside of the directory feel free to remove them. 
<br><img width="903" alt="image" src="https://github.com/user-attachments/assets/8816e4ce-f60d-434d-a92a-89187f1c042b" />

Next step should be simple— first make sure your Node version is up to date by running
```curl
node --version
```
Node version v17+ is recommended. 
<br>Next, change directory into the version you would like to use. Would recommend doing a quick `ls` to view all version installed, in this tutorial we'll be going into `V0.1.06` but I would recommend working with the latest version of the bot available. Same steps would apply for all versions.
```
cd V0.1.06
npm install
```

Preview in terminal:
<img width="403" alt="image" src="https://github.com/user-attachments/assets/123ac481-23a8-4c8e-b88b-c392caed2788" />

Now if you've never touched a terminal before you might be confused. In which case, I would recommend you to install the VS Code IDE I mentioned earlier, and open the version folder there instead. After opening the bot folder there, you should find a terminal at the bottom. 
<img width="1019" alt="Screenshot 2025-02-25 at 12 04 05 PM" src="https://github.com/user-attachments/assets/82d415e4-922f-47da-b30a-555bda0b3819" />
If you don't see the terminal, move your cursor closer to the bottom of the editor, and try to drag up the terminal window.
<br>You should be able to run `npm install` inside of the terminal window, without needing to change directory with `cd V0.1.06` if you opened the version folder inside VS Code.

<br>Your main code should be inside of the [<kbd>index.js</kbd> file](TODO Link index.js file). You will also need to create a [<kbd>.env</kbd> file](TODO Link .env file), see the [<kbd>.env</kbd> file](TODO Link .env file) section for an idea on what to include inside of the file.

<br>**Note:** you will need to know how to aquire the different tokens that are used in the `.env` file in order to create your own.
<br>If you're planning on updating King Oyster's code… well, first off hey there future C&K officers, I can't believe you're actually reading this!! And second off… you can either contact me for the files or see if I've left it behind for you somewhere, unless if you have expierence programming bots and would like to get them on your own, in which case head over to the [Google authentication playground for developers](https://developers.google.com/oauthplayground), [Google Cloud Console](https://console.cloud.google.com/), both which I'll explain later on, Google Drive & Sheets (obviously) and the [Discord Developer Portal](https://discord.com/developers/applications).

<br>For the Google Spreasheet, make sure to also use [this Spreadsheet](https://docs.google.com/spreadsheets/d/1ppkEjOB4EYGmxIexfEBU_mMoCqp8vWpwRIgj6Cr9zjw/edit?usp=sharing) as reference. Most of everything else would rely on the code, and in which case if you are trying to update things I would hope that you understand some coding… if you don't, then god help you cause you'll sure be in for a lotta fun.

<br>Back on topic, once you're all set with everything, you should be able to start the bot by running the command
```curl
node src/index.js
```
Alternatively, I'd like to also recommend running the bot with either [nodemon](https://www.npmjs.com/package/nodemon) while testing, or [pm2](https://www.npmjs.com/package/pm2) if you'd like to keep the bot alive 24/7 in the background of your computer. There are additional steps to that in the case that you'd want to keep the bot alive while the computer is sleeping, in which for I'd recommend using [Amphetamine](https://apps.apple.com/us/app/amphetamine/id937984704?mt=12) or a real bot hosting service if you're not a psycho, such as [lunes](https://lunes.host/). I will give you a warning though, when using a bot hosting service, the service providers might be within a different time zone, which could mess up dates and such. This is not always the case, but do watch out for that.

### Renewing Authentication Token
<br>If you run the bot, and get something in the console that says
```curl
Error reading spreadsheet: invalid_grant
Google APIs won't work. In other words, google drive & spreadsheet connections won't happen…
plz visit https://developers.google.com/oauthplayground using approved google account and see codes inside of .env file
```
First thing you should do is thank me for the detailed warning. Next up, follow the steps given.
<br>Head over to the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground), and under step 1, search for and check `https://www.googleapis.com/auth/drive` for Google Drive authentication (under <kbd>Apps Script API V1</kbd> or <kbd>Drive API v3</kbd>), and `https://www.googleapis.com/auth/spreadsheets.readonly` for Speadsheets authentication (under <kbd>Area120 Tables API v1alpha1</kbd> or <kbd>Google Sheets API v4</kbd>).

<br>Second step, select the gear icon and make sure to add in your OAuth Client ID and Secret ID.
<img width="644" alt="Screenshot 2025-02-25 at 5 59 32 PM" src="https://github.com/user-attachments/assets/edec66ac-e2c4-45a7-8a76-1fb16cd0a029" />
I cannot show these tokens publicly as they can be misused, but you can obtain them from the [Google Cloud Console](https://console.cloud.google.com/), which if you're a part of C&K then I recommend logging in through the C&K Gmail to obtain these codes without much trouble. If you're not, then I would recommend following [this youtube tutorial](https://www.youtube.com/watch?v=1y0-IfRW114) to connect your bot to Google's APIs. 

<br>Lastly, select <kbd>Authorize APIs</kbd>
<img width="547" alt="Screenshot 2025-02-25 at 6 57 19 PM" src="https://github.com/user-attachments/assets/41bf3d6a-0e56-46e7-bc5e-7c2edc7c798a" />
You would be prompted to log into a google account, and allowing certain permissions.
<br>You should use the C&K google account, or an account that has been set up under [Google Cloud Console](https://console.cloud.google.com/).

<br>Once you complete the process, you should find yourself on step 2 of the OAuth 2.0 Playground (if it skips to step 3, then click step 2). 
<br>Click <kbd>Exchange authroization code for tokens</kbd>, and then copy the **refresh token**. This is the token that you will define inside the [.env](TODO Link env file) file, under the variable name `DRIVE_REFRESH_TOKEN`.

<br>And now, once you run the bot again, you should not see the `invalid_grant` error.

___

# Node Packages
Node Packages are outside libraries imported into our code to assist with specific tasks. The libraries have been installed through NPM. You may run `npm ls` to get a list of all current node packages, or `npm outdated` to search for any outdated packages. 

**DiscordBot**
<br><kbd>
<br>├── <kbd>axios@1.7.9</kbd> Creating HTTP requests 
<br>├── <kbd>discord.js@14.17.3</kbd> Main Discord bot library. 
<br>├── <kbd>dotenv@16.4.7</kbd> Working with environmental variables. 
<br>├── <kbd>fetch@1.1.0</kbd> Fetching url contents (UNUSED PACKAGE?) 
<br>├── <kbd>fs@0.0.1</kbd> Used for reading file within directory. 
<br>├── <kbd>googleapis@144.0.0</kbd> Used for Google authentication & connecting to Google tools. 
<br>├── <kbd>path@0.12.7</kbd> Assists with tracking file paths. 
<br>└── <kbd>qrcode@1.5.4</kbd> Generate & work with QR codes. 
</kbd>

___
# Slash Commands
Slash commands are a list of pre-defined commands that can be used to interact with the bot. <br> 
These commands can also come with different input parameters accordingly (see [src/register-commands.js](#src-register-commandsjs)).<br>

To start using commands, all you need to do is start typing a message with the character `/`, then you can select the command you wish to use.
<br><img width="795" alt="image" src="https://github.com/user-attachments/assets/aea8cd47-814b-452c-a80d-1ffdc8fb9291" />

The purpose of each command is listed below.

___
## <kbd>`/report` <kbd>USERNAME</kbd> <kbd>REASON</kbd> <kbd>ATTACHMENTS (optional)</kbd> </kbd>
Report <kbd>USERNAME</kbd> for <kbd>REASON</kbd>, and optionally attach <kbd>ATTACHMENTS</kbd> as proof.
<br>If the <kbd>USERNAME</kbd> (being reported) is an **officer**, then the bot will let the user know that they might've made a mistake.

<br><img width="499" alt="image" src="https://github.com/user-attachments/assets/16c13543-8bfa-49e6-98af-bc6e38d1a542" />

<br>Despite this, the report is _still send._ When a report is send, the bot will search for a channel with the name `bot-reports`. If this channel doesn't exist, the bot is smart enough to create it, while restricting access to it by regular members (allowing only officers to view it).
<br>The report will include the <kbd>USERNAME</kbd> display name and user ID, along with the user's username, their <kbd>REASON</kbd>, and an <kbd>ATTACHMENT</kbd> if provided.

<br>In the case that the user (sending the report) was an officer, then the <kbd>USERNAME</kbd> will be automatically muted for **10 minutes** after the report is send.

___
## <kbd>`/add-officer` <kbd>USERNAME</kbd> </kbd>
Command to give the officer role to a member. User must be an officer to be able to use this command.
<br>✅ If the user is an officer, then <kbd>USERNAME</kbd> will be assigned an officer role. 
<br>❌ If the user is NOT an officer, they will be notified that only officers are able to run this command.

___
## <kbd>`/deadline` </kbd>
This command will inform the user of the C&K magazine submissions deadline, along with a countdown.
<br>Button interactions can lead user to [submission requirements](#requirements-), or the submissions form.

<br><img width="789" alt="image" src="https://github.com/user-attachments/assets/30d5814a-7abb-4e22-8bc0-a0ecbf9eb721" />

> Can be activated through chat messages by replying to or mentioning `@King Oyster#0093`, using keywords: 
> <br><kbd>deadline</kbd> or <kbd>submission</kbd> AND EITHER <kbd>time</kbd> OR <kbd>when</kbd>

___
## <kbd>`/requirements` </kbd>
This command will inform the user of the C&K magazine submissions' requirements.
<br>Button interactions can lead user to [deadline](#deadline-), or the submissions form.

> Can be activated through chat messages by replying to or mentioning `@King Oyster#0093`, using keywords: 
> <br><kbd>submission</kbd> or <kbd>requirements</kbd>

___
## <kbd>`/submit` <kbd>TITLE</kbd> <kbd>AUTHOR</kbd> <kbd>TYPE</kbd> <kbd>INFO</kbd> <kbd>SUBMISSION</kbd> <kbd>LINK (optional)</kbd> </kbd>
Submit a piece to the magazine.
<br>The <kbd>SUBMISSION</kbd> file will be sent to Google drive, along with other submissions (see TODO link drive section).
<br>Before being send into the drive, the submission will be sorted into different folders based on the chosen <kbd>TYPE</kbd>:
1. Writing
2. Visual
3. Video
4. Audio
5. Other

The <kbd>SUBMISSION</kbd> file will also be renamed into the title of the piece, followed by an underscore and the default file name.
<br>Nevertheless, in case our bot faces issues submitting the piece to the drive, and as a backup, Oyster automatically sends all submissions in a separate, private channel, called "bot-submissions." This will include the user's username, the piece's <kbd>TITLE</kbd> and <kbd>AUTHOR</kbd> (name published under), all hidden behind spoilers, along with the submission <kbd>TYPE</kbd>, extra <kbd>INFO</kbd>, a <kbd>LINK</kbd> if included, and obviously the <kbd>SUBMISSION</kbd> if attached.

It's unlikely that the bot would ever have issues with uploading the <kbd>SUBMISSION</kbd>, unless if the <kbd>SUBMISSION</kbd> is very large in size. To prevent issues, we stop the bot from sending an attachment of the <kbd>SUBMISSION</kbd> in the **bot-submissions** channel if it's _**over 200 MB in size!**_ The bot would still attempt to upload the file to google drive, in which it should succeed but at a slower rate. This is a rare case in which we'd advise to use the <kbd>LINK</kbd> option to share your piece (and for <kbd>SUBMISSION</kbd> you can submit a simple thumbnail).

<sup>**Note:** If the **bot-submissions** channel doesn't exist, the bot is smart enough to create it and set permissions accordingly.</sup>

___
## <kbd>`/schedule` </kbd>
This command will inform the user of the meeting time and location of our regular C&K member meetings, along with the exact meeting time of the next meeting.

<br> > 🐛 TODO fix bug with time (hosting service & discord have different timezones which SUCKS btw bc I spend hours trying to fix this for the deadline and just now realized it's the same issue for this)

> Can be activated through chat messages by replying to or mentioning `@King Oyster#0093`, using keywords: 
> <br><kbd>schedule</kbd> or <kbd>meet</kbd> AND <kbd>time</kbd> or <kbd>when</kbd> or <kbd>where</kbd> 
   
___
## <kbd>`/officehours` </kbd>
Get the location and time of our office hours for the semester.
<br>This command connects to a Google spreadsheet, where officers can input their office hours times without needing to touch the code.
<br>Same case for infortmation included in the [deadline](#deadline-) and [schedule](#schedule-) commands.

> Can be activated through chat messages by replying to or mentioning `@King Oyster#0093`, using keywords: 
> <br><kbd>officehours</kbd> or <kbd>office hours</kbd> or <kbd>office-hours</kbd>

___
## <kbd>`/appointment` <kbd>MONTH</kbd> <kbd>DATE</kbd> <kbd>HOUR</kbd> <kbd>DESCRIPTION</kbd> </kbd>
Set an appointment to meet with an officer in <kbd>MONTH</kbd>, <kbd>DATE</kbd>, at <kbd>HOUR</kbd>. The appointment is then treated as a report, and will be send to the reports channel for an officer to check (see `/REPORT ...` command). Along with the user info and appointment time, the report will also include the <kbd>DESCRIPTION</kbd>. As a matter of fact, the bot response send privately to the user is identical to the report the officers recieve (see image below).

<br><img width="816" alt="image" src="https://github.com/user-attachments/assets/59d2295c-26e3-4485-a2a3-5e9efd792eb7" />


___
## <kbd>`/rules` </kbd>
Command will help the user find the server rules. 
<br>The bot will also give the user the option to navigate to the [Discord Guidelines]([url](https://discord.com/guidelines)) or view [MCC Policies]([url](https://www.monroecc.edu/depts/policy/)) with the click of a button.

<br><img width="651" alt="image" src="https://github.com/user-attachments/assets/3ac8424e-3ecc-405f-a791-b3ccb5b9bf81" />

> Can be activated through chat messages by replying to or mentioning `@King Oyster#0093`, using keywords: 
> <br><kbd>rules</kbd>

___
## <kbd>`/linkperm` <kbd>LINK</kbd> </kbd>
Request permission to post links.
<br>This will send a report to the same **bot-report** channel used by the `/report...` and `/appointment...` commands.
<br>The request will look as follows:

<br><img width="812" alt="image" src="https://github.com/user-attachments/assets/88226795-59b4-44fb-97bf-2a36932901ed" />

<br>To accept, after reviewing the link, a mod, aka officer, can give the user a __**@link perm**__ role. 
<br>This role will allow the user to post links without being stopped by the bot.

<br>Please note that certain links, such as youtube and tenor urls (GIFs) are allowed without needing link perms (see `allowedLinks` array in code).

___
## <kbd>`/suggest` <kbd>ACTIVITY</kbd> <kbd>INFO</kbd> </kbd>
Suggest an <kbd>ACTIVITY</kbd> for us to do during our weekly member meetings, along with extra <kbd>INFO</kbd> on how the activity works.
<br>Similar to `report...`, `/appointment ...`, and `/linkperm ...` commands, this command will send the suggestion as a report in the **bot-reports** channel in the format shown below.

<br><img width="817" alt="image" src="https://github.com/user-attachments/assets/d9ce1105-07a8-4d46-994f-d844714adaec" />


## <kbd>`/roll` <kbd>MAX (optional)</kbd> </kbd>
Roll a dice and get a random number. Optionally, you can adjust the range of possible values from the roll by adjusting the <kbd>MAX</kbd> sides of the die.

<br><img width="661" alt="image" src="https://github.com/user-attachments/assets/a0dc9e37-6766-4b1f-bc5d-065ec48004bc" />


___
## <kbd>`/inspire` </kbd>
Get a random adjective and noun to help spark some inspiration ✨
<br>Don't like what you see? With the click of a button you can spin the wheel once again.

<br><img width="309" alt="image" src="https://github.com/user-attachments/assets/473ea3be-864d-4848-b169-85113b43c9ca" />

<sup>**Note:** See `getRandomInspiration(...)` function in code, `noun` and `adjective` variables.</sup>

> Can be activated through chat messages by replying to or mentioning `@King Oyster#0093`, using keywords: 
> <br><kbd>inspire</kbd> or <kbd>inspiration</kbd>

___
## <kbd>`/quote` </kbd>
Wanna feel some wisdom? Then get a random quote from a set of 40+ pre-selected quotes (saved in [quotes.txt](TODO link quotes.txt) file).
<br>Don't like what you see? Worry not you ungrateful child, for I have an <kbd>Another Quote</kbd> only for you.

<br><img width="451" alt="image" src="https://github.com/user-attachments/assets/7ba96f4e-b587-4911-97e8-06c7003940c2" />

> Can be activated through chat messages by replying to or mentioning `@King Oyster#0093`, using keywords: 
> <br><kbd>quote</kbd>

___
## <kbd>`/qr-code` <kbd>URL</kbd> <kbd>SCALE (optional)</kbd> <kbd>COLOR (optional)</kbd> <kbd>COLOR-BG (optional)</kbd> </kbd>
Have Oyster generate you a QR code that redirects to <kbd>URL</kbd>, along with a few optional inputs, such as <kbd>SCALE</kbd> of the QR code image (default: 20), and the <kbd>COLOR</kbd> of the QR code (HEX code recommended), and <kbd>COLOR-BG</kbd> for the QR code background (transparent by default). 

<br>See image below for an example of how QR code can be generated WITHOUT using the slash command, but rather by sending a text message.

<br><img width="496" alt="image" src="https://github.com/user-attachments/assets/88cd37bb-86d2-4278-a34d-38d2ee4cc9c5" />

<sup>**Note:** In the image above, I could've also included the <kbd>COLOR-BG</kbd> at the end, but chose not to so the background defaulted to transparent. </sup>

The slash command works the same way as the text command, except if you generate a QR code with the slash commands, the message is hidden and can only be viewed by you.

> Can be activated through chat messages by sending a message that
> <br>STARTS WITH <kbd>`qr `</kbd>

___
## Non-Slash Commands
To make the bot feel more lively and noticed, we need it to react and interact with the community without being tasked to.
<br>For this reason, I have added a set of interactions for the bot. Some of these interactions might still be considered commands, but most could happen unexpectedly.

## Haiku Detection
King Oyster automatically checks all send messages in search of a 5-7-5 syllables haiku pattern. If it finds a message that meets this critera, it'll reply with the following message:

<img width="313" alt="image" src="https://github.com/user-attachments/assets/91232b0b-c548-45a7-a02a-ee32331e8ae0" />

> <sup>**Note:** You don't need to send a massage with multiple lines for Oyster to find the haiku

<br>Of course, the syllable counter method by King Oyster isn't perfect since it's only a bot. For us humans, it's as simple as counting how many times our chin drops when saying a word, but for a bot… well… it's more difficult to program the logic for that, so expect some flaws here and there. I'd say it's close to accurate but not fully there yet.

## Count Syllables
When asked to, King Oyster will count the syllables inside of a poem.
<br>See image below for usage.

<br><img width="800" alt="image" src="https://github.com/user-attachments/assets/e7b37c9a-d2b8-476f-8641-655ea2d98572" />

> **Keywords:** <kbd>count</kbd> AND <kbd>syllables</kbd>

## Reactions
I was considering making a whole new section for this part but figured might as well keep it a part of this. 
<br>King Oyster will react to different messages based on keywords, name of the channel they're send, mentions, and such.

For example, if you say **"important"** in your message then king oyster will try to emphasize your message
<img width="489" alt="image" src="https://github.com/user-attachments/assets/88085403-142d-4fa3-9141-e847f7b78bfc" />

Personally, I would advise against reading the rest of this section, as knowing when and what Oyster reacts to would ruin the magic, but I won't stop you if you're curious. 
<br>Enough blabber, here's a table—

| Emoji    | ID      | Keywords | CHANNEL KEYWORD | INCLUDES |
| -------- | ------- | -------- | --------------- | -------- |
| 💚       | X       | X        | "announce"      |`@everyone`|
| ![image](https://github.com/user-attachments/assets/2b34f20d-5fae-4442-9cfe-c69875ccfced) | 1334234382772207696 | X   | NOT "anounce"   |`@everyone`|
| ![image](https://github.com/user-attachments/assets/2b34f20d-5fae-4442-9cfe-c69875ccfced) | 1334234382772207696 | X   | "share"        | ATTACHMENT |
| ![image](https://github.com/user-attachments/assets/0583e696-fc09-40fa-9578-a5e7d098a9bd) | 1334609229599739976 | X   | NOT "share"    | ATTACHMENT |
| ![image](https://github.com/user-attachments/assets/17199945-c2f1-45d3-9876-ecb43e58c398) | 1334609056421249186 | "boba"     | X       | X          |
| <kbd>![image](https://github.com/user-attachments/assets/4e23e73d-c06f-467e-983b-b1f6957cd7e5)</kbd> | 1334608848513798155 | "origami"  | X       | X          |
| ![image](https://github.com/user-attachments/assets/56190408-0d15-41b2-930a-fbe7b5111e9a) | 1334609229599739976 | "important"| X       | X          |
| ‼️ | 1334609229599739976 | "important"| X      | X          |
| ![image](https://github.com/user-attachments/assets/78a53c5a-e309-42d0-9027-5811894dc1c9) | 1334609780097945733 | "oops" OR "uhoh"| X  | X          |
| 💚 | X                  | "love" or "thank"| X | X          |

> 🐛 **TODO:** Make sure Oyster can detect poems inside of the share channel and react to them with either a special scroll 📜 or the same thing it reacts to images there





