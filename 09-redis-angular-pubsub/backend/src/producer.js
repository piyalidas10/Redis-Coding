const Redis = require("ioredis");

const redis = new Redis();

let count = 1;

async function publish() {

  const data = {
    title: `Order ${count}`,
    status: "CREATED",
    time: new Date().toISOString(),
  };

  // Add to stream
  await redis.xadd(
    "orders-stream",
    "*",
    "data",
    JSON.stringify(data)
  );

  console.log("Produced:", data);

  count++;
}

setInterval(publish, 5000);