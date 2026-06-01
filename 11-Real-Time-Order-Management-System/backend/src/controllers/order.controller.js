import {
  getOrder,
  updateOrder
} from "../services/order.service.js";

export async function getOrderById(
  req,
  res
) {

  const order = await getOrder(
    req.params.id
  );

  res.json(order);
}

export async function updateOrderStatus(
  req,
  res
) {

  const order = await updateOrder(
    req.params.id,
    req.body.status
  );

  res.json(order);
}