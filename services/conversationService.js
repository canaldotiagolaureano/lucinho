const model = require("./modelAI");

const conversationHistory = {}

module.exports = {
    getConversationHistory: (userId) => {
      if (!conversationHistory[userId]) {
        conversationHistory[userId] = [
          { role: "user", text: "Vamos iniciar um novo atendimento." },
        ];
      }
      return conversationHistory[userId];
    },
  
    addMessageToHistory: (userId, message, role) => {
        if (!conversationHistory[userId]) {
          conversationHistory[userId] = [];
        }
        conversationHistory[userId].push({ role, text: message });
    },
  
    generateResponse: async (history) => {
      const payload = history.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }],
      }));
      const chat = model.startChat({ history: payload });
      const modelResponse = await chat.sendMessage(payload[payload.length - 1].parts[0].text);
      return modelResponse.response.text();
    },
  };