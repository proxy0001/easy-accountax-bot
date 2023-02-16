// create express server
const express = require("express");
// import linebot SDK
const linebot = require("linebot");
const CronJob = require('cron').CronJob;

// import utils
const parser = require("./utils/parser.js");
const { sheetHeader, initSheet, addRecord } = require("./utils/sheet.js");
const { recordInvoices } = require("./utils/invoice.js");
const app = express();

// load dotenv
require('dotenv').config();

// identify line channel
const bot = initLinebot();
const linebotParser = bot.parser();


const sync = async (text) => {
    const param = text.match(/^\/sync (\d)$/)
    const n = parseInt(param && param[1]) || undefined

    try {
        await recordInvoices(n)
    } catch {
        return `Sync invoice data ${n} day failed!`
    }
    return `Sync invoice data ${n} day successfully!`
}

const parseMsg = async (text) => {
    const data = parser(text);
    const sheet = await initSheet();
    const newRow = await addRecord(sheet, {
        [sheetHeader.store]: data[0],
        [sheetHeader.items]: data[1],
        [sheetHeader.amount]: data[2],
        [sheetHeader.date]: data[3],
    });
    const replyMsg = `Add a record successfully.
${data.join(', ')}`
    
    return replyMsg
}

// when someone send msg to bot
bot.on("message", async function (event) {
    // event.message.text is the msg typing from user
    console.log(event.message.text)
    const text = event.message.text
    
    let replyMsg = ''
    switch (true) {
        case /^\/sync.*$/.test(text):
            replyMsg = await sync(text)
            break
        default:
            replyMsg = await parseMsg(text)
    }
    event.reply(replyMsg);
});

// for line-bot
app.post("/", linebotParser);

// execute server
app.listen(process.env.PORT || 3000, () => {
    console.log("Express server start");
});

function initLinebot () {
    return linebot({
        channelId: process.env.LINE_CHANNEL_ID,
        channelSecret: process.env.LINE_CHANNEL_SECRET,
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    })   
};

const job = new CronJob('0 0 0 * * *', () => {
    recordInvoices();
});
job.start();