const express = require("express");

const {
  createTableValidator,
  getTableValidator,
  updateTableValidator,
  deleteTableValidator,
} = require("../utils/validators/tableValidator");

const authService = require("../services/authService");

const {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
} = require("../services/tableService");

const router = express.Router();

router
  .route("/")
  .get(authService.protect, getTables)
  .post(
    authService.protect,
    authService.allowedTo("admin"),
    createTableValidator,
    createTable,
  );

router
  .route("/:id")
  .get(authService.protect, getTableValidator, getTable)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    updateTableValidator,
    updateTable,
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteTableValidator,
    deleteTable,
  );

module.exports = router;
