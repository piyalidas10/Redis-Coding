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

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/otp-auth')
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

const otpAuditSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true
    },

    eventType: {
      type: String,
      enum: [
        'OTP_GENERATED',
        'OTP_VERIFIED',
        'OTP_FAILED',
        'OTP_LOCKED'
      ],
      required: true
    },

    success: {
      type: Boolean,
      default: false
    },

    attempts: {
      type: Number,
      default: 0
    },

    ipAddress: {
      type: String
    },

    userAgent: {
      type: String
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

const OtpAudit = mongoose.model(
  'OtpAudit',
  otpAuditSchema
);


const OTP_EXPIRY = 60; // 60 seconds
const MAX_ATTEMPTS = 3;
const LOCK_DURATION = 60; // 1 minute

const otpKey = (phone) => `otp:${phone}`;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/**
 * POST /generate-otp
 * Description: Generates a 6-digit OTP for the provided phone number and stores it in Redis with an expiration time. Also initializes attempt tracking for the OTP.
 * in Postman, you can test this endpoint by sending a POST request to http://localhost:3000/generate-otp with a JSON body like:
 * Body: { phoneNumber: string }
 * Response: { message: string, otp?: string }
 * Note: OTP is included in response for testing purposes. Remove it in production.
 */
app.post('/generate-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = crypto.randomInt(100000, 999999).toString();

    const otpData = {
      otp,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      createdAt: Date.now(),
      lastAttemptAt: null,
      lockedUntil: null
    };

    await redis.set(
      otpKey(phoneNumber),
      JSON.stringify(otpData),
      'EX',
      OTP_EXPIRY
    );

    await OtpAudit.create({
      phoneNumber,
      eventType: 'OTP_GENERATED',
      success: true,
      attempts: 0,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return res.json({
      message: 'OTP generated successfully',
      otp // REMOVE in production
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * POST /verify-otp
 * Description: Verifies the provided OTP against the stored value in Redis. It checks for OTP validity, tracks failed attempts, and implements lockout after exceeding maximum attempts.
 * in Postman, you can test this endpoint by sending a POST request to http://localhost:3000/verify-otp with a JSON body like:
 * Body: { phoneNumber: string, otp: string }
 * Response: { message: string } or { error: string, attemptsLeft?: number }
 * Note: Implements lockout after max attempts and checks for OTP expiration.
 */
app.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        error: 'Phone number and OTP are required'
      });
    }

    const data = await redis.get(otpKey(phoneNumber));

    if (!data) {
      return res.status(400).json({
        error: 'OTP expired or not found'
      });
    }

    const otpData = JSON.parse(data);

    // Check lock
    if (
      otpData.lockedUntil &&
      Date.now() < otpData.lockedUntil
    ) {
      return res.status(429).json({
        error: 'Too many failed attempts. Try again later.'
      });
    }

    // Correct OTP
    if (otpData.otp === otp) {
      await OtpAudit.create({
        phoneNumber,
        eventType: 'OTP_VERIFIED',
        success: true,
        attempts: otpData.attempts,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
      await redis.del(otpKey(phoneNumber));

      return res.json({
        message: 'OTP verified successfully'
      });
    }

    // Wrong OTP
    otpData.attempts += 1;
    otpData.lastAttemptAt = Date.now();
    await OtpAudit.create({
      phoneNumber,
      eventType: 'OTP_FAILED',
      success: false,
      attempts: otpData.attempts,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    

    // Lock after max attempts
    if (otpData.attempts >= otpData.maxAttempts) {
      otpData.lockedUntil =
        Date.now() + LOCK_DURATION * 1000;
        await OtpAudit.create({
          phoneNumber,
          eventType: 'OTP_LOCKED',
          success: false,
          attempts: otpData.attempts,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
    }

    // Preserve remaining TTL
    const ttl = await redis.ttl(otpKey(phoneNumber));

    await redis.set(
      otpKey(phoneNumber),
      JSON.stringify(otpData),
      'EX',
      ttl
    );

    return res.status(400).json({
      error: 'Invalid OTP',
      attemptsLeft:
        otpData.maxAttempts - otpData.attempts
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /otp/:phoneNumber/ttl
 * Description: Retrieves the remaining time-to-live (TTL) for the OTP associated with the provided phone number. This endpoint is useful for testing and monitoring OTP expiration.
 * in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/otp/{phoneNumber}/ttl (replace {phoneNumber} with the actual phone number you used to generate the OTP).
 * Response: { phoneNumber: string, ttl: number } or { error: string }
 * Note: TTL is returned in seconds. If the OTP has expired or does not exist, an appropriate error message is returned.
 */
app.get('/otp/:phoneNumber/ttl', async (req, res) => {
  const { phoneNumber } = req.params;
  const ttl = await redis.ttl(otpKey(phoneNumber));
  if (ttl === -2) {
    return res.status(404).json({ error: 'OTP expired or not found' });
  } else if (ttl === -1) {
    return res.status(200).json({ message: 'OTP exists but has no expiration' });
  } else {
    return res.json({ phoneNumber, ttl });
  }
});