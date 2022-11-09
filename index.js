// create express server
const express = require("express");
const app = express();

// import linebot SDK
var linebot = require("linebot");

// identify line channel
var bot = linebot({
    channelId: process.env.channelId,
    channelSecret: process.env.channelSecret,
    channelAccessToken: process.env.channelAccessToken,
});

const linebotParser = bot.parser();

// when someone send msg to bot
bot.on("message", function (event) {
    // event.message.text is the msg typing from user
    console.log(event.message.text)
});

// send msg to line-bot
app.post("/", linebotParser);

// execute server
app.listen(process.env.PORT || 3000, () => {
    console.log("Express server start");
});