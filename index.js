const dialogflow = require('@google-cloud/dialogflow');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = 3000;

const accountSid = '<TwilioAccountSid>';
const authToken = '<TwilioAuthToken>';
	
const client = require('twilio')(accountSid, authToken);

// Configuración de las credenciales
process.env.GOOGLE_APPLICATION_CREDENTIALS = './user-gcp-credential.json';

// Crear una instancia de cliente de Dialogflow
const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(projectId, sessionId, query, languageCode) {
  // Define el path de la sesión
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  // El request para la detección de intención
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  try {
    // Envía la solicitud de detección de intención a Dialogflow
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Muestra la respuesta de Dialogflow
    console.log(`  Mensaje: ${query}`);
    console.log('Respuesta de Dialogflow:');
    console.log(`  Intent: ${result.intent.displayName}`);
    console.log(`  Mensaje: ${result.fulfillmentText}`);

    const messageToSend = result.fulfillmentText;

    client.messages
		  .create({
			 body: messageToSend,
			 from: 'whatsapp:+' + fromPhoneNumber,
            to: 'whatsapp:+' + toPhoneNumber
		   })
		   
		  .then((message) => {
			  console.log(message.sid);
			 
		  });
  } catch (error) {
    console.error('Error al llamar a la API de Dialogflow:', error);
  }
}

// Configuración de los parámetros
const projectId = '<gcpProjectId>';
const sessionId = Math.floor(Math.random() * 37 ) ; 
const query = 'quiero agendar una presentacion';
const languageCode = 'es';

// Llama a la función detectIntent con los parámetros configurados
//detectIntent(projectId, sessionId, query, languageCode);

app.post('/reply', express.json(), (req, res) =>  {
    detectIntent(projectId, sessionId, req.body.Body, languageCode);
	res.send('send via callback');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
