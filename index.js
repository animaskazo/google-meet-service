// microservicio Google Meet en Node.js
const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// CONFIGURA ESTO
const calendarId = 'animaskazo@gmail.com'; // Calendario compartido con la cuenta de servicio
const keyFile = 'dr-plus-459218-c95000021324.json'; // Ruta a tu JSON descargado
const timeZone = 'America/Santiago';

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

app.post('/crear-evento', async (req, res) => {
  const { nombre, email, fecha, hora } = req.body;

  if (!nombre || !email || !fecha || !hora) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    const startDateTime = new Date(`${fecha}T${hora}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 minutos

    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Cita con ${nombre}`,
        start: { dateTime: startDateTime.toISOString(), timeZone },
        end: { dateTime: endDateTime.toISOString(), timeZone },
        attendees: [{ email }],
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(2),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = response.data.conferenceData.entryPoints?.find(
      (e) => e.entryPointType === 'video'
    )?.uri;

    res.json({ meetLink });
  } catch (err) {
    console.error('Error al crear evento:', err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Microservicio activo en http://localhost:${PORT}`);
});
