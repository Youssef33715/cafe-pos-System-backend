const factory = require("./handlersFactory");
const asyncHandler = require("express-async-handler");

const Product = require("../models/productModel");
const ApiError = require("../utils/apiError");
// @desc Get list of products
// @route GET /api/v1/products
// @access Private
exports.getProducts = factory.getAll(Product, "Product");

//////////////////////////////////////////////////////

// @desc Get specific product
// @route GET /api/v1/products/:id
// @access Private
exports.getProduct = factory.getOne(Product, "category");

//////////////////////////////////////////////////////

// @desc Create product
// @route POST /api/v1/products
// @access Private (Admin)

exports.createProduct = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.image = `/uploads/products/${req.file.filename}`;
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    data: product,
  });
});

//////////////////////////////////////////////////////

// @desc Update product
// @route PUT /api/v1/products/:id
// @access Private (Admin)

exports.updateProduct = asyncHandler(async (req, res, next) => {
  if (req.file) {
    req.body.image = `/uploads/products/${req.file.filename}`;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new ApiError("No product found for this id", 404));
  }

  res.status(200).json({
    data: product,
  });
});

//////////////////////////////////////////////////////

// @desc Delete product
// @route DELETE /api/v1/products/:id
// @access Private (Admin)
exports.deleteProduct = factory.deleteOne(Product);
