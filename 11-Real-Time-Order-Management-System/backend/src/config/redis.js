import Redis from "ioredis";

/*
  Cache Operations
*/
export const redis = new Redis({
  host: "localhost",
  port: 6379
});

/*
  Pub/Sub Publisher
*/
export const publisher = new Redis({
  host: "localhost",
  port: 6379
});

/*
  Pub/Sub Subscriber
*/
export const subscriber = new Redis({
  host: "localhost",
  port: 6379
});

redis.on("connect", () => {
  console.log("✅ Redis Cache Connected");
});

publisher.on("connect", () => {
  console.log("✅ Redis Publisher Connected");
});

subscriber.on("connect", () => {
  console.log("✅ Redis Subscriber Connected");
});

redis.on("error", err => {
  console.error("Redis Error:", err);
});