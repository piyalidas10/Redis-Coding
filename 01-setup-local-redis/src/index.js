import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3000;
const redisClient = Redis.createClient();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

/**
 * Endpoint to test Redis connection and fetch a value.
 * It pings the Redis server to check connectivity and returns the response.
 * in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/redis
 */
app.get('/redis', async (req, res) => {
  try {
    const reply = await redis.ping();
    console.log('Redis ping response:', redis);
    // res.send(`Value from Redis: ${value}`);
    res.json({ message: `Successfully connected to Redis: ${reply}` });
  }  
  catch (err) {
    console.error('Error fetching from Redis:', err);
    res.status(500).send('Error fetching from Redis');
  }
});

/**
 * Endpoint to test MongoDB connection.
 * It attempts to connect to MongoDB using Mongoose and returns the connection status.
 * in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/mongodb
 */
app.get('/mongodb', async (req, res) => {
  try {
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/redis-coding-db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
    console.log('Connected to MongoDB');
    res.json({ mongo: "Connected", database: mongoose.connection.name });
  }
    catch (err) {
    console.error('Error connecting to MongoDB:', err);
    res.status(500).send('Error connecting to MongoDB');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

