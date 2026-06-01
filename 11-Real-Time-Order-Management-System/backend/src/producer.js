import Redis from "ioredis";

const redis = new Redis();

let count = 1;

async function publish() {

  const orderId = count;

  const data = {
    id: orderId,
    title: `Order ${orderId}`,
    status: "CREATED",
    time: new Date().toISOString(),
  };

  // 1. Add event to Redis Stream
  await redis.xadd(
    "orders-stream",
    "*",
    "data",
    JSON.stringify(data)
  );

  // 2. Cache latest order (Cache-Aside)
  await redis.set(
    `order:${orderId}`,
    JSON.stringify(data),
    "EX",
    300 // TTL 5 minutes
  );

  console.log("Produced:", data);

  count++;
}

setInterval(publish, 5000);