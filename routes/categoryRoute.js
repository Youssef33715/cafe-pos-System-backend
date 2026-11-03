const express = require("express");
const { uploadSingleImage } = require("../middleware/uploadimageMiddleware");
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidator");

const authenService = require("../services/authService");

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../services/categoryService");

const router = express.Router();

// Routes
router
  .route("/")
  .get(getCategories)
  .post(
    authenService.protect,
    authenService.allowedTo("admin"),
    uploadSingleImage("categories", "image"),
    createCategoryValidator,
    createCategory,
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    authenService.protect,
    authenService.allowedTo("admin"),
    uploadSingleImage("categories", "image"),

    updateCategoryValidator,
    updateCategory,
  )
  .delete(
    authenService.protect,
    authenService.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory,
  );
module.exports = router;
