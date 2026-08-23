const { google } = require('googleapis');

function buildCalendarClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

async function createCalendarEvent({ summary, description, startTime, endTime, email }) {
  const calendar = buildCalendarClient();
  if (!calendar) {
    return { status: 'mock', eventId: `mock-${Date.now()}` };
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary,
      description,
      start: { dateTime: startTime, timeZone: 'UTC' },
      end: { dateTime: endTime, timeZone: 'UTC' },
      attendees: email ? [{ email }] : [],
    },
  });

  return { status: 'synced', eventId: response.data.id };
}

async function deleteCalendarEvent(eventId) {
  const calendar = buildCalendarClient();
  if (!calendar || !eventId || eventId.startsWith('mock-')) {
    return { status: 'mock' };
  }

  await calendar.events.delete({ calendarId: 'primary', eventId });
  return { status: 'deleted' };
}

module.exports = { createCalendarEvent, deleteCalendarEvent };
