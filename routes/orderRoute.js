const express = require("express");

const authService = require("../services/authService");
const {
  createOrderValidator,
  getOrderValidator,
  addProductToOrderValidator,
  updateOrderItemValidator,
  removeOrderItemValidator,
  checkoutOrderValidator,
  cancelOrderValidator,
  updateDeliveryStatusValidator,
} = require("../utils/validators/orderValidator");

const {
  createOrder,
  getOrders,
  getOrder,
  getActiveOrderByTable,
  addProductToOrder,
  updateOrderItem,
  removeOrderItem,
  checkoutOrder,
  cancelOrder,
  getOrderReceipt,
  getDeliveryOrders,
  getDeliveryOrder,
  updateDeliveryStatus,
  deleteOrder,
} = require("../services/orderService");

const router = express.Router();
// Protect all order routes
router.use(authService.protect);

router
  .route("/")
  .get(authService.allowedTo("admin", "cashier"), getOrders)
  .post(
    authService.allowedTo("admin", "cashier"),
    createOrderValidator,
    createOrder,
  );
router.get(
  "/delivery",
  authService.allowedTo("admin", "cashier"),
  getDeliveryOrders,
);
router.get(
  "/table/:tableId",
  authService.allowedTo("admin", "cashier"),
  getActiveOrderByTable,
);

router.get(
  "/:orderId/receipt",
  authService.allowedTo("admin", "cashier"),
  getOrderReceipt,
);

router.post(
  "/:orderId/items",
  authService.allowedTo("admin", "cashier"),
  addProductToOrderValidator,
  addProductToOrder,
);

router.put(
  "/:orderId/checkout",
  authService.allowedTo("admin", "cashier"),
  checkoutOrderValidator,
  checkoutOrder,
);

router.put(
  "/:orderId/cancel",
  authService.allowedTo("admin", "cashier"),
  cancelOrderValidator,
  cancelOrder,
);

router.put(
  "/items/:itemId",
  authService.allowedTo("admin", "cashier"),
  updateOrderItemValidator,
  updateOrderItem,
);

router.delete(
  "/items/:itemId",
  authService.allowedTo("admin", "cashier"),
  removeOrderItemValidator,
  removeOrderItem,
);

router.get(
  "/delivery/:id",
  authService.allowedTo("admin", "cashier"),
  getDeliveryOrder,
);
router.put(
  "/:id/delivery-status",
  authService.allowedTo("admin", "cashier"),
  updateDeliveryStatusValidator,
  updateDeliveryStatus,
);
router.delete("/:id", authService.allowedTo("admin", "cashier"), deleteOrder);

router
  .route("/:id")
  .get(authService.allowedTo("admin", "cashier"), getOrderValidator, getOrder);
module.exports = router;
