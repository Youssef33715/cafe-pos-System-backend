const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");

exports.createProductValidator = [
  check("name")
    .notEmpty()
    .withMessage("Product name is required")
    .custom(async (val) => {
      const product = await Product.findOne({ name: val });

      if (product) {
        throw new Error("Product already exists");
      }

      return true;
    }),

  check("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0"),

  check("image").optional(),

  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category id format")
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new Error("Category not found");
      }

      return true;
    }),

  validatorMiddleware,
];

////////////////////////////////////////////////////

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),

  validatorMiddleware,
];

////////////////////////////////////////////////////

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),

  check("name")
    .optional()
    .custom(async (val, { req }) => {
      const product = await Product.findOne({ name: val });

      if (product && product._id.toString() !== req.params.id) {
        throw new Error("Product already exists");
      }

      return true;
    }),

  check("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  check("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0"),

  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id format")
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);

      if (!category) {
        throw new Error("Category not found");
      }

      return true;
    }),

  validatorMiddleware,
];

////////////////////////////////////////////////////

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),

  validatorMiddleware,
];
