const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');
const { startReminderJob } = require('./src/jobs/reminderJob');
const { startEmailRetryJob } = require('./src/jobs/emailRetryJob');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Healthcare Appointment API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    startReminderJob();
    startEmailRetryJob();
    app.listen(port, () => console.log(`Healthcare backend listening on http://localhost:${port}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
