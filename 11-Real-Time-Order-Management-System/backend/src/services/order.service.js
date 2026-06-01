import {
    getCache,
    setCache,
    deleteCache
} from "./cache.service.js";

import {
    publishOrderCreated,
    publishOrderUpdated
} from "./publisher.service.js";

/*
  Fake Database
*/

const orders = [
    {
        id: 1,
        title: "Laptop",
        status: "CREATED",
        amount: 55000,
        time: new Date().toISOString()
    }
];

/*
  Cache Keys
*/

const getOrderCacheKey = (id) =>
    `order:${id}`;

/*
  GET ORDER
  Cache Aside Pattern
*/

export async function getOrder(id) {

    const cacheKey =
        getOrderCacheKey(id);

    /*
      Step 1
      Check Redis
    */

    const cachedOrder =
        await getCache(cacheKey);

    if (cachedOrder) {

        console.log(
            `CACHE HIT -> ${cacheKey}`
        );

        return cachedOrder;
    }

    /*
      Step 2
      Read From Database
    */

    console.log(
        `CACHE MISS -> ${cacheKey}`
    );

    const order = orders.find(
        order => order.id === Number(id)
    );

    if (!order) {
        return null;
    }

    /*
      Step 3
      Save Into Redis
    */

    await setCache(
        cacheKey,
        order
    );

    return order;
}

/*
  CREATE ORDER
*/

export async function createOrder(
    payload
) {

    const order = {
        id: Date.now(),
        title: payload.title,
        amount: payload.amount,
        status: "CREATED",
        time: new Date().toISOString()
    };

    orders.push(order);

    /*
      Publish Event
    */

    await publishOrderCreated(
        order
    );

    return order;
}

/*
  UPDATE ORDER
  Cache Invalidation
*/

export async function updateOrder(
    id,
    status
) {

    const order = orders.find(
        order => order.id === Number(id)
    );

    if (!order) {
        throw new Error(
            "Order not found"
        );
    }

    /*
      Update Database
    */

    order.status = status;

    order.time =
        new Date().toISOString();

    /*
      Cache Invalidation
    */

    await deleteCache(
        getOrderCacheKey(id)
    );

    /*
      Publish Event
    */

    await publishOrderUpdated(
        order
    );

    return order;
}

/*
  GET ALL ORDERS
*/

export async function getOrders() {

    const cacheKey =
        "orders:list";

    const cachedOrders =
        await getCache(cacheKey);

    if (cachedOrders) {

        console.log(
            "CACHE HIT -> orders:list"
        );

        return cachedOrders;
    }

    console.log(
        "CACHE MISS -> orders:list"
    );

    await setCache(
        cacheKey,
        orders
    );

    return orders;
}

/*
  DELETE ORDER
*/

export async function deleteOrder(
    id
) {

    const index = orders.findIndex(
        order => order.id === Number(id)
    );

    if (index === -1) {
        throw new Error(
            "Order not found"
        );
    }

    const deletedOrder =
        orders[index];

    orders.splice(index, 1);

    /*
      Cache Invalidation
    */

    await deleteCache(
        getOrderCacheKey(id)
    );

    await deleteCache(
        "orders:list"
    );

    /*
      Publish Event
    */

    await publishOrderUpdated({
        action: "DELETED",
        order: deletedOrder
    });

    return deletedOrder;
}