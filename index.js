// create express server
const express = require("express");
// import linebot SDK
const linebot = require("linebot");
const CronJob = require('cron').CronJob;

// import utils
const chatGpt = require("./utils/chatGpt.js")
const parser = require("./utils/parser.js");
const { sheetHeader, initSheet, addRecord } = require("./utils/sheet.js");
const { receiptMsg } = require("./utils/flexMessage.js");
const { recordInvoices } = require("./utils/invoice.js");
const app = express();

// load dotenv
require('dotenv').config();

// identify line channel
const bot = initLinebot();
const linebotParser = bot.parser();

const replyInvoices = (row) => {
    const sheetData = getRowData(row)
    const msg = receiptMsg(sheetData)
    const receivers = process.env.LINE_RECEIVERS.split(' ')
    bot.push(receivers, msg)
}

const syncInvoices = async (text) => {
    if (!/^\/sync.*$/.test(text)) return {
        hasResult: false,
        msg: `Illegal commands`,
    }
    const param = text.match(/^\/sync (\d)$/)
    const days = parseInt(param && param[1]) || undefined

    try {
        await recordInvoices({ days, callback: replyInvoices})
    } catch (error) {
        return {
            hasResult: false,
            msg: `Sync invoice data ${days} day failed!`,
        }
    }
    return {
        hasResult: true,
        msg: `Sync invoice data ${days} day successfully!`
    }
}

const parseAccounting = async (text) => {
    const data = parser(text);
    if (data.length === 0) return {
        hasResult: false,
        msg: 'Invalid Input',
    };
    const sheet = await initSheet();
    const sheetData = {
        [sheetHeader.store]: data[0],
        [sheetHeader.items]: data[1],
        [sheetHeader.amount]: data[2],
        [sheetHeader.date]: data[3],
    };
    const newRow = await addRecord(sheet, sheetData);
    const msg = receiptMsg({ ...sheetData, rowNumber: newRow.rowNumber })
    return {
        hasResult: true,
        msg: msg,
    }
}

const chat = (chatId) => async (text) => {
    const msg = await chatGpt.talkWith(chatId)(text)
    return {
        hasResult: true,
        msg: msg,
    }
}

const excutor = async (text, ...fns) => {
    for (fn of fns) {
        const { hasResult, result, msg } = await fn(text)
        if (hasResult) return msg
        else continue
    }
    return `Sorry, I can't answer your question.`
}

const chatId = (source) => {
    if (source?.type === 'group') return `group:${source.groupId}`
    if (source?.type === 'user') return `user:${source.userId}`
}

// when someone send msg to bot
bot.on("message", async function (event) {
    // event.message.text is the msg typing from user
    console.log(event.message.text)
    const replyMsg = await excutor(
        event.message.text,
        syncInvoices,
        parseAccounting,
        chat(chatId(event.source)),
    )
    event.reply(replyMsg)
});

const checkRow = (row, sheetData) => {
    const checkConditions = {
        [sheetHeader.date]: a => b => (new Date(a)).getTime() === (new Date(b)).getTime(),
        [sheetHeader.store]: a => b => a === b,
        [sheetHeader.amount]: a => b => a === b,
        [sheetHeader.invoiceId]: a => b => a === b,
    }
    for (const [key, fn] of Object.entries(checkConditions)) {
        const isOk = fn(sheetData[key])(row[key])
        if (!isOk) return false
    }
    return true
}

const getRow = async (sheet, rowNumber) => (await sheet.getRows({ offset: rowNumber - 2, limit: 1}))[0]

const updateRow = async (row, sheetData) => {
    row[sheetHeader.primaryCategory] = sheetData[sheetHeader.primaryCategory]
    row[sheetHeader.secondaryCategory] = sheetData[sheetHeader.secondaryCategory]
    await row.save()
    return row
}

const getRowData = (row) => ({
    ...Object.fromEntries(Object.entries(sheetHeader).map(([k, v]) => [v, row[v] ? row[v] : ''])),
    rowNumber: row.rowNumber,
})

bot.on("postback", async function (event) {
    const params = new URLSearchParams(event.postback.data)
    const sheetData = Object.fromEntries(params)
    const sheet = await initSheet()
    const row = await getRow(sheet, sheetData.rowNumber)
    if (!checkRow(row, sheetData)) event.reply('Udpate failed, data was not matched.')
    else {
        const updatedRow = await updateRow(row, sheetData)
        const updatedSheetData = getRowData(updatedRow)
        // const msg = receiptMsg(updatedSheetData)
        const msg = `${updatedSheetData[sheetHeader.store]} is classified as ${updatedSheetData[sheetHeader.primaryCategory]}${updatedSheetData[sheetHeader.secondaryCategory] !== '' ? '-' + updatedSheetData[sheetHeader.secondaryCategory] : ''}`
        event.reply(msg)
    }
});

// for line-bot
app.post("/", linebotParser);

// execute server
app.listen(process.env.PORT || 3001, () => {
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
    recordInvoices({ callback: replyInvoices}).catch(error => console.error(error));
});
job.start();