const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const messageQueueService = require("./services/messageQueueService");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Configuração de eventos do cliente WhatsApp
client.on("ready", () => console.log("Client is ready!"));
client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

// Evento para receber mensagens
client.on("message", async (msg) => {
  const userId = msg.from;
  messageQueueService.addToQueue({ msg, userId });
  messageQueueService.processQueue();
});

// Inicializar cliente WhatsApp
client.initialize();