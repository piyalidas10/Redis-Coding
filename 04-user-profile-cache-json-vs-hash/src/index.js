import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import crypto from 'crypto';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

/**
 * Endpoints to store and retrieve user data in Redis using JSON and Hash formats.
 * - POST /user/:id/json: Stores user data as JSON string in Redis.
 * - GET /user/:id/json: Retrieves user data as JSON string from Redis.
 * - POST /user/:id/hash: Stores a hash of the user data in Redis.
 * - GET /user/:id/hash: Retrieves the hash of the user data from Redis.
 * 
 * json vs hash:
 * JSON allows for structured data storage, while hash is a more compact representation that can be used for quick lookups. 
 * The choice between them depends on the use case and performance requirements.
 *  
 * Note: In a production environment, consider adding validation, authentication, and error handling for robustness and security.
 */

app.post('/user/:id/json', async (req, res) => {
  await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
  res.json({ status: 'success' });
});

app.get('/user/:id/json', async (req, res) => {
  const data = await redis.get(`user:${req.params.id}:json`);
  if (data) {
    res.json({user: data? JSON.parse(data): null});
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/user/:id/hash', async (req, res) => {
  try {
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(req.body))
      .digest('hex');

    await redis.hset(
      `user:${req.params.id}`,
      {
        hash,
        createdAt: Date.now()
      }
    );

    res.json({
      status: 'success',
      hash
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('/user/:id/hash', async (req, res) => {
  const user = await redis.hgetall(
    `user:${req.params.id}`
  );

  if (Object.keys(user).length === 0) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});