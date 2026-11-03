const express = require("express");

const authService = require("../services/authService");
const { getDashboardStats } = require("../services/dashboardService");

const router = express.Router();

// Protect all dashboard routes
router.use(authService.protect);

// Only Admin can access dashboard
router.get("/", authService.allowedTo("admin"), getDashboardStats);

module.exports = router;
