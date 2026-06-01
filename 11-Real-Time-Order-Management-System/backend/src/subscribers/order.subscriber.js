import { subscriber }
from "../config/redis.js";

import { getIO }
from "../socket/socket.js";

export async function startSubscriber() {

  await subscriber.subscribe(
    "order-updated"
  );

  console.log(
    "📢 Listening to order-updated"
  );

  subscriber.on(
    "message",
    (channel, message) => {

      const order =
        JSON.parse(message);

      console.log(
        "Received Event:",
        order
      );

      getIO().emit(
        "order-updated",
        order
      );
    }
  );
}