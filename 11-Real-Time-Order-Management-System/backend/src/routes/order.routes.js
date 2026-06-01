import express from "express";

import {
  getOrderById,
  updateOrderStatus
} from "../controllers/order.controller.js";

const router = express.Router();

/*
  GET ORDER
*/

router.get(
  "/:id",
  getOrderById
);

/*
  UPDATE ORDER
*/

router.put(
  "/:id",
  updateOrderStatus
);

export default router;