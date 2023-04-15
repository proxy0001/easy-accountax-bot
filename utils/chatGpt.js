const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const memory = {}
const memorySize = 100
const gptModel = 'gpt-3.5-turbo'
const gptMaxTokens = 500

const remember = chatId => dialogue => {
  memory[chatId] = memory[chatId] === undefined ? [] : memory[chatId]
  if (memory[chatId].length > memorySize) memory[chatId].shift()
  memory[chatId].push(dialogue)
  return memory
}

const talkWith = chatId => async text => {
  remember(chatId)({ role: 'user', content: text })
  try {
    const { data } = await openai.createChatCompletion({
      model: gptModel,
      messages: memory[chatId],
      max_tokens: gptMaxTokens,
    })
    console.log('chat response', data)
    const response = data.choices[0].message.content.trim()
    remember(chatId)({ role: 'system', content: response })
    return response
  } catch (error) {
    if (error.response) {
      return `${error.response.status} ${error.response.statusText}`
    } else {
      return error.message
    }
  }
}

module.exports = {
  talkWith,
}