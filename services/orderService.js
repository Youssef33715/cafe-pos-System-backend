const asyncHandler = require("express-async-handler");

const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const Product = require("../models/productModel");
const OrderItem = require("../models/orderItemModel");
const ApiError = require("../utils/apiError");

// @desc Create new Order
// @route POST /api/v1/orders
// @access Private (Cashier/Admin)

exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    table,
    orderType = "dineIn",
    customerName,
    customerPhone,
    deliveryAddress,
  } = req.body;

  let tableExists = null;

  // ==============================
  // Dine In Order
  // ==============================
  if (orderType === "dineIn") {
    tableExists = await Table.findById(table);

    if (!tableExists) {
      return next(new ApiError("Table not found", 404));
    }

    if (tableExists.status === "occupied") {
      return next(new ApiError("Table already occupied", 400));
    }
  }

  // ==============================
  // Delivery Order
  // ==============================
  if (orderType === "delivery") {
    if (!customerName || !customerPhone || !deliveryAddress) {
      return next(
        new ApiError(
          "Customer name, phone and delivery address are required",
          400,
        ),
      );
    }
  }

  // Generate order number
  const lastOrder = await Order.findOne().sort("-orderNumber");

  const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;

  // Create Order
  const order = await Order.create({
    orderNumber,
    orderType,

    table: orderType === "dineIn" ? table : null,

    customerName,
    customerPhone,
    deliveryAddress,

    cashier: req.user._id,
  });

  // Change table status (Only Dine In)
  if (tableExists) {
    tableExists.status = "occupied";
    await tableExists.save();
  }

  res.status(201).json({
    status: "success",
    data: order,
  });
});

//@ desc Get all orders
//@ route GET /api/v1/orders
//@ access Private

exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    status: "completed",
  })
    .populate("table", "tableNumber")
    .populate("cashier", "name email")
    .sort("-createdAt");

  res.status(200).json({
    results: orders.length,
    data: orders,
  });
});
//@ desc Get all delivery orders
//@ route GET /api/v1/orders/delivery
//@ access Private

exports.getDeliveryOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    orderType: "delivery",
  })
    .populate("cashier", "name")
    .sort("-createdAt");

  res.status(200).json({
    results: orders.length,
    data: orders,
  });
});
//@ desc Get specific order
//@ route GET /api/v1/orders/:id
//@ access Private

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("table", "tableNumber")
    .populate("cashier", "name email");

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  res.status(200).json({
    data: order,
  });
});
//@ desc Get delivery order details
//@ route GET /api/v1/orders/delivery/:id
//@ access Private

exports.getDeliveryOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    orderType: "delivery",
  })
    .populate("cashier", "name")
    .populate("table");

  if (!order) {
    return next(new ApiError("Delivery order not found", 404));
  }

  const items = await OrderItem.find({
    order: order._id,
  }).populate("product", "name price");

  res.status(200).json({
    data: {
      order,
      items,
    },
  });
});
//@ desc Update delivery status
//@ route PUT /api/v1/orders/:id/delivery-status
//@ access Private

exports.updateDeliveryStatus = asyncHandler(async (req, res, next) => {
  const { deliveryStatus } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    orderType: "delivery",
  });

  if (!order) {
    return next(new ApiError("Delivery order not found", 404));
  }

  if (order.status !== "active") {
    return next(new ApiError("Order is already closed", 400));
  }

  order.deliveryStatus = deliveryStatus;

  // لو تم التسليم
  if (deliveryStatus === "delivered") {
    order.status = "completed";
    order.paidAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    status: "success",
    data: order,
  });
});
//@ desc Get active order by table
//@ route GET /api/v1/orders/table/:tableId
//@ access Private

exports.getActiveOrderByTable = asyncHandler(async (req, res, next) => {
  const table = await Table.findById(req.params.tableId);

  if (!table) {
    return next(new ApiError("Table not found", 404));
  }

  const order = await Order.findOne({
    table: req.params.tableId,
    status: "active",
  })
    .populate("table", "tableNumber")
    .populate("cashier", "name");

  if (!order) {
    return res.status(200).json({
      data: null,
      message: "No active order for this table",
    });
  }

  res.status(200).json({
    data: order,
  });
});
// calculateOrderTotal
const calculateOrderTotal = async (orderId) => {
  // Get all order items
  const orderItems = await OrderItem.find({ order: orderId });

  // Calculate total price
  const totalPrice = orderItems.reduce((total, item) => {
    return total + item.totalPrice;
  }, 0);

  // Update order total
  await Order.findByIdAndUpdate(orderId, {
    totalPrice,
  });

  return totalPrice;
};
//@ desc Add product to order
//@ route POST /api/v1/orders/:orderId/items
//@ access Private

exports.addProductToOrder = asyncHandler(async (req, res, next) => {
  const { product: productId, quantity } = req.body;
  const { orderId } = req.params;

  // 1) Check if order exists
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // 2) Check if order is active
  if (order.status !== "active") {
    return next(new ApiError("Order is closed", 400));
  }

  // 3) Check if product exists
  const product = await Product.findById(productId);

  if (!product) {
    return next(new ApiError("Product not found", 404));
  }

  // 4) Check if product is available
  if (!product.isAvailable) {
    return next(new ApiError("Product is not available", 400));
  }

  // 5) Check if product already exists in order
  let orderItem = await OrderItem.findOne({
    order: orderId,
    product: productId,
  });

  if (orderItem) {
    // Increase quantity
    orderItem.quantity += quantity;
    await orderItem.save();
  } else {
    // Create new order item
    orderItem = await OrderItem.create({
      order: orderId,
      product: productId,
      quantity,
      unitPrice: product.price,
      totalPrice: quantity * product.price,
    });
  }

  // 6) Recalculate order total
  await calculateOrderTotal(orderId);

  res.status(200).json({
    status: "success",
    data: orderItem,
  });
});
//@ desc Update order item quantity
//@ route PUT /api/v1/orders/items/:itemId
//@ access Private

exports.updateOrderItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  // 1) Check if order item exists
  const orderItem = await OrderItem.findById(itemId);

  if (!orderItem) {
    return next(new ApiError("Order item not found", 404));
  }

  // 2) Update quantity
  if (quantity < 1) {
    return next(new ApiError("Quantity must be at least 1", 400));
  }

  orderItem.quantity = quantity;

  // 3) Save item
  await orderItem.save();

  // 4) Recalculate order total
  await calculateOrderTotal(orderItem.order);

  res.status(200).json({
    status: "success",
    data: orderItem,
  });
});
//@ desc Remove product from order
//@ route DELETE /api/v1/orders/items/:itemId
//@ access Private

exports.removeOrderItem = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;

  // 1) Check if order item exists
  const orderItem = await OrderItem.findById(itemId);

  if (!orderItem) {
    return next(new ApiError("Order item not found", 404));
  }

  // 2) Save order id
  const orderId = orderItem.order;

  // 3) Delete item
  await orderItem.deleteOne();

  // 4) Recalculate order total
  await calculateOrderTotal(orderId);

  res.status(200).json({
    status: "success",
    message: "Product removed from order",
  });
});
//@ desc Checkout Order
//@ route PUT /api/v1/orders/:orderId/checkout
//@ access Private

exports.checkoutOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { paymentMethod } = req.body;

  // 1) Check if order exists
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // 2) Check if order is active
  if (order.status !== "active") {
    return next(new ApiError("Order already completed", 400));
  }

  // 3) Check if order has items
  const orderItems = await OrderItem.find({ order: orderId });

  if (orderItems.length === 0) {
    return next(new ApiError("Order is empty", 400));
  }

  // 4) Recalculate total
  await calculateOrderTotal(orderId);

  // 5) Complete order
  order.status = "completed";
  order.paymentMethod = paymentMethod;
  order.paidAt = Date.now();

  await order.save();

  // 6) Free table
  const table = await Table.findById(order.table);

  table.status = "available";

  await table.save();

  res.status(200).json({
    status: "success",
    message: "Order checked out successfully",
    data: order,
  });
});
//@ desc Cancel Order
//@ route PUT /api/v1/orders/:orderId/cancel
//@ access Private

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  // 1) Check if order exists
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // 2) Check if order is active
  if (order.status !== "active") {
    return next(new ApiError("Order cannot be cancelled", 400));
  }

  // 3) Delete all order items
  await OrderItem.deleteMany({
    order: orderId,
  });

  // 4) Update order status
  order.status = "cancelled";
  await order.save();

  // 5) Free table
  await Table.findByIdAndUpdate(order.table, {
    status: "available",
  });

  res.status(200).json({
    status: "success",
    message: "Order cancelled successfully",
  });
});
////
//@ desc Get Order Receipt
//@ route GET /api/v1/orders/:orderId/receipt
//@ access Private

exports.getOrderReceipt = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  // 1) Check order exists
  const order = await Order.findById(orderId)
    .populate("table", "tableNumber")
    .populate("cashier", "name");

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // 2) Get order items
  const items = await OrderItem.find({
    order: orderId,
  }).populate("product", "name price");

  res.status(200).json({
    status: "success",
    data: {
      orderNumber: order.orderNumber,

      orderType: order.orderType,

      table: order.table,

      customerName: order.customerName,

      customerPhone: order.customerPhone,

      deliveryAddress: order.deliveryAddress,

      cashier: order.cashier,

      items,

      totalPrice: order.totalPrice,

      paymentMethod: order.paymentMethod,

      status: order.status,

      createdAt: order.createdAt,

      paidAt: order.paidAt,
    },
  });
});
//////////////////
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError("Order not found", 404));
  }

  // لو فيه ترابيزة رجعها available
  if (order.orderType === "dineIn" && order.table) {
    await Table.findByIdAndUpdate(order.table, {
      status: "available",
    });
  }

  // امسح الـ Order Items
  await OrderItem.deleteMany({
    order: order._id,
  });

  // امسح الأوردر
  await order.deleteOne();

  res.status(204).send();
});
