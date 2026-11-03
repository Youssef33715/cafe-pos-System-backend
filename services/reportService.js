const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
// @desc Daily Sales Report
// @route GET /api/v1/reports/daily
// @access Private (Admin)

exports.getDailyReport = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    status: "completed",
    paidAt: {
      $gte: start,
      $lte: end,
    },
  });

  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  res.status(200).json({
    status: "success",
    data: {
      date: start.toISOString().split("T")[0],
      totalOrders: orders.length,
      totalSales,
      averageOrder:
        orders.length > 0 ? Number((totalSales / orders.length).toFixed(2)) : 0,
    },
  });
});
// @desc Monthly Sales Report
// @route GET /api/v1/reports/monthly
// @access Private (Admin)

exports.getMonthlyReport = asyncHandler(async (req, res) => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    status: "completed",
    paidAt: {
      $gte: start,
      $lte: end,
    },
  });

  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  res.status(200).json({
    status: "success",
    data: {
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      totalOrders: orders.length,
      totalSales,
      averageOrder:
        orders.length > 0 ? Number((totalSales / orders.length).toFixed(2)) : 0,
    },
  });
});
// @desc Best Selling Products
// @route GET /api/v1/reports/best-products
// @access Private (Admin)

exports.getBestSellingProducts = asyncHandler(async (req, res) => {
  const products = await OrderItem.aggregate([
    {
      $group: {
        _id: "$product",
        totalSold: { $sum: "$quantity" },
        revenue: { $sum: "$totalPrice" },
      },
    },
    {
      $sort: {
        totalSold: -1,
      },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        _id: 0,
        productId: "$product._id",
        name: "$product.name",
        price: "$product.price",
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    results: products.length,
    data: products,
  });
});
