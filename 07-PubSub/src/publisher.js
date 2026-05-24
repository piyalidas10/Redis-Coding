import express from "express";
import Redis from "ioredis";
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

publisher.on("error", (err) => {
  console.error("Redis error:", err);
});

/**
 * Endpoint to publish messages to a specific channel. Expects a JSON body with "channel" and "message" fields.
 * Example request body:
 * {
 *   "channel": "chat-room",
 *    "message": {
 *      "id": 1,
 *      "text": "Hello Subscriber 1",
 *      "timestamp": "2024-06-01T12:00:00Z"
 *     }
 * }
 */
app.post("/publish", async (req, res) => {
  const { channel, message } = req.body;
    try {
    await publisher.publish(channel, JSON.stringify(message));
    res.status(200).json({ message: `Message published to channel ${channel}` });
  } catch (err) {
    console.error("Failed to publish message: ", err?.message);
    res.status(500).json({ error: "Failed to publish message" });
  }
});

/**
 * Function to publish messages to the "chat-room" channel every 3 seconds, 
 * and also publish to pattern channels "user:created" and "user:deleted". 
 * This simulates a real-time message flow for testing purposes.
 */
async function publishMessages() {
  try {
    console.log("Publisher connected to Redis");

    let count = 1;

    setInterval(async () => {
      const message = JSON.stringify({
        id: count,
        text: `Hello Subscriber ${count}`,
        timestamp: new Date().toISOString(),
      });

      await publisher.publish("chat-room", message);      

      await publisher.publish("user:created", "New user");
      await publisher.publish("user:deleted", "User removed");

      console.log("Published:", message);

      count++;
    }, 3000);

  } catch (error) {
    console.error("Publisher error:", error);
  }
}

publishMessages();



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});