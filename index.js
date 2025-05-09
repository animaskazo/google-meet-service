const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Decodifica las credenciales de Google desde la variable de entorno
const base64Credentials = process.env.GOOGLE_CREDENTIALS;

// Verifica que las credenciales estén disponibles
if (!base64Credentials) {
  throw new Error('Las credenciales de Google no están configuradas en las variables de entorno.');
}

// Decodificar las credenciales de Base64 a su formato original (JSON)
const credentialsJson = Buffer.from(base64Credentials, 'base64').toString('utf8');

// Parsear el JSON de las credenciales
const credentials = JSON.parse(credentialsJson);

// Configurar el cliente de autenticación con las credenciales decodificadas
const authClient = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/calendar'],  // Ajusta los scopes según lo que necesites
});

// Llamar a la API de Google Calendar
async function createGoogleEvent() {
  try {
    // Autenticarse y obtener el token de acceso
    await authClient.authorize();

    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Crear un evento de Google Calendar
    const event = {
      summary: 'Cita de ejemplo',
      location: 'Ubicación de la cita',
      description: 'Descripción de la cita',
      start: {
        dateTime: '2025-05-09T09:00:00-07:00', // Establece la fecha y hora de inicio
        timeZone: 'America/Los_Angeles', // Ajusta la zona horaria según sea necesario
      },
      end: {
        dateTime: '2025-05-09T09:30:00-07:00', // Establece la fecha y hora de fin
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: 'ejemplo@dominio.com' }, // Agrega un correo de ejemplo
      ],
    };

    // Crear el evento en Google Calendar
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('Evento creado:', res.data);
  } catch (error) {
    console.error('Error al crear evento:', error);
  }
}

createGoogleEvent();
