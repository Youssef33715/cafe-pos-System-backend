const { check } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createOrderValidator = [
  check("orderType")
    .optional()
    .isIn(["dineIn", "delivery"])
    .withMessage("Order type must be dineIn or delivery"),

  check("table").custom((value, { req }) => {
    if ((req.body.orderType || "dineIn") === "dineIn") {
      if (!value) {
        throw new Error("Table is required");
      }
    }
    return true;
  }),

  check("table").optional().isMongoId().withMessage("Invalid table id format"),

  check("customerName").custom((value, { req }) => {
    if (req.body.orderType === "delivery" && !value) {
      throw new Error("Customer name is required");
    }
    return true;
  }),

  check("customerPhone").custom((value, { req }) => {
    if (req.body.orderType === "delivery" && !value) {
      throw new Error("Customer phone is required");
    }
    return true;
  }),

  check("deliveryAddress").custom((value, { req }) => {
    if (req.body.orderType === "delivery" && !value) {
      throw new Error("Delivery address is required");
    }
    return true;
  }),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.getOrderValidator = [
  check("id").isMongoId().withMessage("Invalid order id format"),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.addProductToOrderValidator = [
  check("orderId").isMongoId().withMessage("Invalid order id format"),

  check("product")
    .notEmpty()
    .withMessage("Product is required")
    .isMongoId()
    .withMessage("Invalid product id format"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.updateOrderItemValidator = [
  check("itemId").isMongoId().withMessage("Invalid order item id format"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.removeOrderItemValidator = [
  check("itemId").isMongoId().withMessage("Invalid order item id format"),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.checkoutOrderValidator = [
  check("orderId").isMongoId().withMessage("Invalid order id format"),

  check("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["cash", "card"])
    .withMessage("Payment method must be cash or card"),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.cancelOrderValidator = [
  check("orderId").isMongoId().withMessage("Invalid order id format"),

  validatorMiddleware,
];
////////////////
exports.updateDeliveryStatusValidator = [
  check("id").isMongoId().withMessage("Invalid order id format"),

  check("deliveryStatus")
    .notEmpty()
    .withMessage("Delivery status is required")
    .isIn(["preparing", "out_for_delivery", "delivered"])
    .withMessage("Invalid delivery status"),

  validatorMiddleware,
];
