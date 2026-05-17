import express from 'express';
import Redis from 'ioredis';
import {emailQueue, connection} from './queue.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

app.post('/welcome-email', async (req, res) => {
  const job = emailQueue.add(
    'welcome-email', 
    {
      to: req.body.to,
      name: req.body.name
    },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    }
  );
  res.status(200).json({ message: 'Welcome email job added to the queue', jobId: job.id });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});