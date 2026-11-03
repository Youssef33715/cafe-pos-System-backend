const asyncHandler = require("express-async-handler");

const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Table = require("../models/tableModel");

// @desc Dashboard Statistics
// @route GET /api/v1/dashboard
// @access Private (Admin)

exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Orders
  const totalOrders = await Order.countDocuments();

  const activeOrders = await Order.countDocuments({
    status: "active",
  });

  const completedOrders = await Order.countDocuments({
    status: "completed",
  });

  // Tables
  const occupiedTables = await Table.countDocuments({
    status: "occupied",
  });

  const availableTables = await Table.countDocuments({
    status: "available",
  });

  // Products & Categories
  const totalProducts = await Product.countDocuments();

  const totalCategories = await Category.countDocuments();

  // Total Sales
  const salesResult = await Order.aggregate([
    {
      $match: {
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

  res.status(200).json({
    status: "success",
    data: {
      totalSales,
      totalOrders,
      activeOrders,
      completedOrders,
      occupiedTables,
      availableTables,
      totalProducts,
      totalCategories,
    },
  });
});
