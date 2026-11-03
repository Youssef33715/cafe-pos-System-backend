const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

const Table = require("../../models/tableModel");

exports.createTableValidator = [
  check("tableNumber")
    .notEmpty()
    .withMessage("Table number is required")
    .isInt({ min: 1 })
    .withMessage("Table number must be greater than 0")
    .custom(async (val) => {
      const table = await Table.findOne({ tableNumber: val });

      if (table) {
        throw new Error("Table number already exists");
      }

      return true;
    }),

  validatorMiddleware,
];

/////////////////////////////////////////////////////////

exports.getTableValidator = [
  check("id").isMongoId().withMessage("Invalid table id format"),

  validatorMiddleware,
];

/////////////////////////////////////////////////////////

exports.updateTableValidator = [
  check("id").isMongoId().withMessage("Invalid table id format"),

  check("tableNumber")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Table number must be greater than 0")
    .custom(async (val, { req }) => {
      const table = await Table.findOne({ tableNumber: val });

      if (table && table._id.toString() !== req.params.id) {
        throw new Error("Table number already exists");
      }

      return true;
    }),

  check("status")
    .optional()
    .isIn(["available", "occupied"])
    .withMessage("Invalid table status"),

  validatorMiddleware,
];

/////////////////////////////////////////////////////////

exports.deleteTableValidator = [
  check("id").isMongoId().withMessage("Invalid table id format"),

  validatorMiddleware,
];
