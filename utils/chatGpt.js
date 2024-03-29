const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const memory = {}
const memorySize = parseInt(process.env.CHAT_MEMORY_SIZE) || 20
const gptModel = 'gpt-3.5-turbo'
const gptMaxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 200

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
    const response = data.choices[0].message
    remember(chatId)(response)
    return response.content
  } catch (error) {
    if (error.response) {
      console.log(error.response.status, error.response.message)
      return `${error.response.status} ${error.response.statusText}\r\n${error.response.message}`
    } else {
      console.log(error)
      return error.message
    }
  }
}

module.exports = {
  talkWith,
}