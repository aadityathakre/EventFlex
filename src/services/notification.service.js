import Notification from '../models/Notification.model.js';
import { io } from '../socket.js';

export const createNotification = async ({ recipient, type, message, reference }) => {
  try {
    const notification = new Notification({
      recipient,
      type,
      message,
      reference
    });

    await notification.save();

    // Emit real-time notification via socket.io
    io.to(recipient.toString()).emit('notification', {
      type,
      message,
      reference,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsSeen = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },
      {
        seen: true,
      },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, { page = 1, limit = 20, seen }) => {
  try {
    const query = { recipient: userId };
    if (typeof seen === 'boolean') {
      query.seen = seen;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};