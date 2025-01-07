const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");
const fs = require("fs");
const { v4 } = require('uuid');
const model = require("./modelAI");

const fileManager = new GoogleAIFileManager("AIzaSyAKJBzhgF_qGcaWYg5I2qRLCTBap2ISeOk");

module.exports = {
    processAudioMessage: async (msg) => {
      const media = await msg.downloadMedia();
      if (!media) throw new Error("Falha ao baixar o áudio.");
  
      const fileName = `audio_${v4()}.ogg`;
      fs.writeFileSync(fileName, media.data, { encoding: "base64" });
  
      const uploadResult = await fileManager.uploadFile(`./${fileName}`, {
        mimeType: "audio/ogg",
        displayName: "Audio sample",
      });
  
      let file = await fileManager.getFile(uploadResult.file.name);
      while (file.state === FileState.PROCESSING) {
        await new Promise((resolve) => setTimeout(resolve, 10_000));
        file = await fileManager.getFile(uploadResult.file.name);
      }
  
      if (file.state === FileState.FAILED) throw new Error("Falha no processamento do áudio.");
  
      fs.unlinkSync(fileName);
  
      const resultAudio = await model.generateContent([
        "Transcreva este áudio:",
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType,
          },
        },
      ]);
  
      return resultAudio.response.text();
    },
  };