const cron = require('node-cron');
const Notification = require('../models/Notification');
const { processNotification } = require('../services/notificationService');

function startEmailRetryJob() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const notifications = await Notification.find({
        status: 'failed',
        retryCount: { $lt: 3 },
      }).sort({ createdAt: 1 });

      for (const notification of notifications) {
        notification.retryCount += 1;
        await processNotification(notification);
      }
    } catch (error) {
      console.error('Email retry job error:', error.message);
    }
  }, { noOverlap: true });

  console.log('Email retry job started');
}

module.exports = { startEmailRetryJob };
