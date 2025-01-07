const conversationService = require("./conversationService");
const audioService = require('./audioService')

let isProcessing = false;
const messageQueue = [];

module.exports = {
  addToQueue: (message) => messageQueue.push(message),

  processQueue: async () => {
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true;
    const { msg, userId } = messageQueue.shift();

    try {
      const conversationHistory = conversationService.getConversationHistory(userId);

      if (msg.type === "ptt" || msg._data.mimetype === "audio/ogg; codecs=opus") {
        const transcribedText = await audioService.processAudioMessage(msg, userId, conversationHistory);
        conversationService.addMessageToHistory(userId, transcribedText, "user", conversationHistory);
      } else {
        conversationService.addMessageToHistory(userId, msg.body, "user", conversationHistory);
      }

      const responseText = await conversationService.generateResponse(conversationHistory);
      conversationService.addMessageToHistory(userId, responseText, "model", conversationHistory);
      msg.reply(responseText);
    } catch (error) {
      console.error(error);
      msg.reply("Desculpa, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.");
    }

    isProcessing = false;
    module.exports.processQueue();
  },
};