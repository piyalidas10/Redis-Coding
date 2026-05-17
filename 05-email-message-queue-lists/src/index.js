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

const QUEUE_KEY = 'queue:emails';

/**
 * Endpoint to add an email job to the queue. Expects a JSON body with 'to', 'subject', and 'body' fields.
 * lpush is used to add the job to the left of the list, and rpop will be used to process jobs from the right, ensuring FIFO order.
 */
app.post('/send-email', async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  } else {
    const emailJob = {
      to: req.body.to,
      subject: req.body.subject || 'No Subject',
      body: req.body.body || 'No Content',
      createdAt: new Date().toISOString(),
    };
    await redis.lpush(QUEUE_KEY, JSON.stringify(emailJob));
    res.status(201).json({message: 'Email job addeded to queue', emailJob });
  }
});

app.get('/queue-length', async (req, res) => {
  const length = await redis.llen(QUEUE_KEY);
  res.json({ queueLength: length });
});

app.get('/emails/process-one', async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY);
  if(!rawJob) {
    return res.json({ message: 'No email jobs in queue' });
  } else {
    const emailJob = JSON.parse(rawJob);
    console.log('Processing email job:', emailJob);
    res.json({ message: 'Email sent', emailJob });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});