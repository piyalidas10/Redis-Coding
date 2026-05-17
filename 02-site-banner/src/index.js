import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

const BANNER_KEY = 'app:banner';

/**
 * Endpoint to test Redis connection and fetch a value.
 * It pings the Redis server to check connectivity and returns the response.
 * in Postman, you can test this endpoint by sending a POST request to http://localhost:3000/banner
 * Example Body for POST request:
 * {
 *   "message": "Hi ! Welcome to Site Banner API"
 * }
 * Example response:
 * {
 *   "success": true,
 *   "message": "Banner message set successfully"
 * }
 */
app.post('/banner', async (req, res) => {
  try {
    await redis.set(BANNER_KEY, req.body.message || 'Welcome to Site Banner API');
    res.json({ success: true, message: 'Banner message set successfully' });
  }  
  catch (err) {
    console.error('Error fetching from Redis:', err);
    res.status(500).send('Error fetching from Redis');
  }
});

/**
 * Endpoint to fetch the banner message from Redis. It retrieves the value associated with the BANNER_KEY and returns it in the response.
 * in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/banner
 * Example response:
 * {
 *   "success": true,
 *   "message": "Hi ! Welcome to Site Banner API"
 * }
 */
app.get('/banner', async (req, res) => {
  try {
    const bannerMessage = await redis.get(BANNER_KEY);
    res.json({ success: true, message: bannerMessage || 'No banner message set' });
  }  
  catch (err) {
    console.error('Error fetching from Redis:', err);
    res.status(500).send('Error fetching from Redis');
  }
});

/**
 * Endpoint to delete the banner message from Redis. It removes the value associated with the BANNER_KEY and returns a success message in the response.
 * in Postman, you can test this endpoint by sending a DELETE request to http://localhost:3000/banner
 * Example response:
 * {
 *   "success": true,
 *   "message": "Banner message deleted successfully"
 * }
 */
app.delete('/banner', async (req, res) => {
  try {
    await redis.del(BANNER_KEY);
    res.json({ success: true, message: 'Banner message deleted successfully' });
  }
  catch (err) {
    console.error('Error deleting from Redis:', err);
    res.status(500).send('Error deleting from Redis');
  }
});

/**
 * Endpoint to check if the banner message exists in Redis. It checks for the existence of the BANNER_KEY and returns a boolean value indicating whether it exists or not.
 * in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/banner/exists
 */
app.get('/banner/exists', async (req, res) => {
  try {
    const exists = await redis.exists(BANNER_KEY);
    res.json({ success: true, exists: Boolean(exists) });
  }
  catch (err) {
    console.error('Error checking existence in Redis:', err);
    res.status(500).send('Error checking existence in Redis');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

