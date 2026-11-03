const express = require("express");
const { uploadSingleImage } = require("../middleware/uploadimageMiddleware");

const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const authService = require("../services/authService");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../services/productService");

const router = express.Router();

router.route("/").get(authService.protect, getProducts).post(
  authService.protect,
  authService.allowedTo("admin"),
  uploadSingleImage("products", "image"),

  createProductValidator,
  createProduct,
);

router
  .route("/:id")
  .get(authService.protect, getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo("admin"),
    uploadSingleImage("products", "image"),

    updateProductValidator,
    updateProduct,
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct,
  );

module.exports = router;
