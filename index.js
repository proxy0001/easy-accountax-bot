// create express server
const express = require("express");
// import linebot SDK
const linebot = require("linebot");
// import utils
const parser = require("./utils/parser.js");
const { initSheet, addRecord } = require("./utils/sheet.js");
const app = express();

// 載入 dotenv
require('dotenv').config();

// identify line channel
const bot = initLinebot();
const linebotParser = bot.parser();

// when someone send msg to bot
bot.on("message", async function (event) {
    // event.message.text is the msg typing from user
    console.log(event.message.text);
    const data = parser(event.message.text);
    const sheet = await initGoogleSheet();
    const newRow = await addRecord(sheet, {
        title: data[0],
        amount: data[1],
        createDate: data[2],
    });
    const replyMsg = `Add a record successfully.
${data.join(', ')}`
    event.reply(replyMsg);
});

// for line-bot
app.post("/", linebotParser);

// execute server
app.listen(process.env.PORT || 3000, () => {
    console.log("Express server start");
});


// initialize google sheet
async function initGoogleSheet () {
    const credentials = {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
    const docId = process.env.GOOGLE_DOC_ID;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    return await initSheet(credentials, docId, sheetId);
};

function initLinebot () {
    return linebot({
        channelId: process.env.LINE_CHANNEL_ID,
        channelSecret: process.env.LINE_CHANNEL_SECRET,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    })   
}