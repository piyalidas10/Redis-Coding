import Redis from "ioredis";

const publisher = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

let count = 1;

setInterval(async () => {

  const notificationId = count;

  const data = {
    id: notificationId,
    title: `Notification ${notificationId}`,
    time: new Date().toISOString(),
  };

  // Cache notification
  await publisher.set(
    `notification:${notificationId}`,
    JSON.stringify(data),
    "EX",
    300
  );

  // Publish realtime event
  await publisher.publish(
    "notifications",
    JSON.stringify(data)
  );

  console.log("Published:", data);

  count++;

}, 5000);