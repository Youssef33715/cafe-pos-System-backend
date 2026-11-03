const express = require("express");

const authService = require("../services/authService");

const {
  getDailyReport,
  getMonthlyReport,
  getBestSellingProducts,
} = require("../services/reportService");

const router = express.Router();

// Protect all routes
router.use(authService.protect);

// Admin only
router.use(authService.allowedTo("admin"));

router.get("/daily", getDailyReport);

router.get("/monthly", getMonthlyReport);

router.get("/best-products", getBestSellingProducts);

module.exports = router;
