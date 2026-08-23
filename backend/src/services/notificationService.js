const Notification = require('../models/Notification');
const { sendEmail } = require('./emailService');

async function queueNotification({ userId, appointmentId, type, payload }) {
  const notification = await Notification.create({
    userId,
    appointmentId,
    type,
    payload,
    status: 'pending',
    retryCount: 0,
  });

  return notification;
}

async function processNotification(notification) {
  try {
    const result = await sendEmail({
      to: notification.payload.email,
      subject: notification.payload.subject,
      text: notification.payload.text,
      html: notification.payload.html || undefined,
    });

    if (result.status === 'sent') {
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      return true;
    }

    notification.status = 'failed';
    notification.retryCount += 1;
    await notification.save();
    return false;
  } catch (error) {
    notification.status = 'failed';
    notification.retryCount += 1;
    await notification.save();
    return false;
  }
}

module.exports = { queueNotification, processNotification };
