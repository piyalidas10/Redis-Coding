import Redis from "ioredis";

const publisher = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

let count = 1;

setInterval(async () => {
  const data = {
    id: count,
    title: `Notification ${count}`,
    time: new Date().toISOString(),
  };

  await publisher.publish(
    "notifications",
    JSON.stringify(data)
  );

  console.log("Published:", data);

  count++;
}, 5000);