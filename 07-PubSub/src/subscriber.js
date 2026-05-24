import express from 'express';
import Redis from 'ioredis';
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

subscriber.on('error', (err) => {
  console.error('Redis error:', err);
});

subscriber.on("connect", () => {
  console.log("Redis connected");
});

subscriber.on("close", () => {
  console.log("Connection closed");
});

/**
 * Subscribe to specific channels: "chat-room", "notifications", and "emails".
 * When a message is received on any of these channels, it will be logged to the console with a specific format based on the channel.
 * Additionally, subscribe to pattern channels matching "user:*)". When a message is received on any channel that matches this pattern, 
 * it will log the pattern, channel, and message to the console.
 */
subscriber.subscribe('chat-room', 'notifications', 'emails', (err, count) => {
  if (err) {
    console.error('Failed to subscribe: ', err?.message);
  } else {
    console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
  }
});

/**
 * Handle incoming messages for the subscribed channels. Depending on the channel, the message will be parsed and logged in a specific format.
 * For "chat-room", it will log the message as a chat message. For "notifications", it will log it as a notification. For "emails", it will log it as an email.
 */
subscriber.on("message", (channel, message) => {
  switch (channel) {
    case "chat-room":
      console.log("Chat:", JSON.parse(message));
      break;

    case "notifications":
      console.log("Notification:", JSON.parse(message));
      break;

    case "emails":
      console.log("Email:", JSON.parse(message));
      break;
  }
});

/**
 * Subscribe to pattern channels matching "user:*)". When a message is received on any channel that matches this pattern,
 * it will log the pattern, channel, and message to the console. This allows for dynamic subscription to channels that follow a specific naming convention.
 */
subscriber.psubscribe('user:*)', (err, count) => {
  if (err) {
    console.error('Failed to psubscribe: ', err?.message);
    } else {
    console.log(`Psubscribed successfully! This client is currently subscribed to ${count} patterns.`);
  }
});

subscriber.on("pmessage", (pattern, channel, message) => {
  console.log({
    pattern,
    channel,
    message,
  });
});