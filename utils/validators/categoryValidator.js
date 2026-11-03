const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModel");

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required")
    .custom(async (val) => {
      const category = await Category.findOne({ name: val });
      if (category) {
        throw new Error("Category already exists");
      }
      return true;
    }),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),

  check("name")
    .optional()
    .notEmpty()
    .withMessage("Category name is required")
    .custom(async (val, { req }) => {
      const category = await Category.findOne({ name: val });

      if (category && category._id.toString() !== req.params.id) {
        throw new Error("Category already exists");
      }

      return true;
    }),

  validatorMiddleware,
];

/////////////////////////////////////////

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),

  validatorMiddleware,
];
