const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Para enviar respuestas a Chatwoot

const app = express();
const PORT = 3000;

// Middleware para procesar JSON
app.use(bodyParser.json());

// Ruta para recibir eventos de Chatwoot
app.post('/webhook', async (req, res) => {
  const event = req.body;

  if (!event) {
    return res.status(400).send('No se recibieron datos de evento.');
  }

  console.log('Evento recibido:', event);

  if (event.event === 'message_created') {
    const { conversation, message } = event.payload;

    // Comprueba si el mensaje es entrante
    if (message.message_type === 'incoming') {
      // Responder al mensaje usando la API de Chatwoot
      const responseMessage = {
        content: '¡Hola! Soy un bot automático. ¿En qué puedo ayudarte?',
        message_type: 'outgoing',
      };

      try {
        await axios.post(
          `https://app.chatwoot.com/app/accounts/107322/api/v1/accounts/${conversation.account_id}/conversations/${conversation.id}/messages`,
          responseMessage,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer 6XUX86BXErNrCvzSCaXfsDfM`,
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
