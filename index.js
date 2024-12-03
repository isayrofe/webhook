const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Para enviar respuestas a Chatwoot

const app = express();
const PORT = 3000;

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "AIzaSyAFAOG_zovFcenLwuSQWH179YBN9cFyQQI";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Middleware para procesar JSON
app.use(bodyParser.json());

// Ruta para recibir eventos de Chatwoot
app.post('/webhook', async (req, res) => {
  const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });


  const event = req.body;

  if (!event) {
    return res.status(400).send('No se recibieron datos de evento.');
  }

  console.log('Evento recibido:', event);

  if (event.event === 'message_created') {
    const { content, account, conversation, message_type } = event;
    console.log('Cuenta:', account);
    console.log('Conversación:', conversation);
    console.log('Tipo de mensaje:', message_type);
    // Comprueba si el mensaje es entrante
    if (message_type === 'incoming') {

      const result = await chatSession.sendMessage(content);
      // Responder al mensaje usando la API de Chatwoot
      const responseMessage = {
        content: result.response.text(),
        message_type: 'outgoing',
      };
      console.log('Enviando respuesta...');
      console.log(`https://app.chatwoot.com/api/v1/accounts/${account.id}/conversations/${conversation.id}/messages`);
      try {
        await axios.post(
          `https://app.chatwoot.com/api/v1/accounts/${account.id}/conversations/${conversation.id}/messages`,
          responseMessage,
          {
            headers: {
              'Content-Type': 'application/json',
              'api_access_token': `6XUX86BXErNrCvzSCaXfsDfM`,
            },
          }
        );
        console.log('Respuesta enviada con éxito.');
      } catch (error) {
        console.error('Error al enviar la respuesta:', error.message);
      }
    }
  }

  res.status(200).send('OK');
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
