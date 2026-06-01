import { publisher } from "../config/redis.js";

const ORDER_CREATED_CHANNEL = "order-created";
const ORDER_UPDATED_CHANNEL = "order-updated";

export async function publishOrderCreated(order) {
  try {

    await publisher.publish(
      ORDER_CREATED_CHANNEL,
      JSON.stringify(order)
    );

    console.log(
      `Published Order Created Event: ${order.id}`
    );

  } catch (error) {

    console.error(
      "Publish Error:",
      error
    );
  }
}

export async function publishOrderUpdated(order) {
  try {

    await publisher.publish(
      ORDER_UPDATED_CHANNEL,
      JSON.stringify(order)
    );

    console.log(
      `Published Order Updated Event: ${order.id}`
    );

  } catch (error) {

    console.error(
      "Publish Error:",
      error
    );
  }
}