const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");
const Category = require("../models/categoryModel");

//@ desc Get list of categories
//@ route Get /api/v1/categories
// @acess piblic
exports.getCategories = factory.getAll(Category);
////////////////////////////////////////////
// @desc Get Specific Category by id
// @route Get /api/v1/ctategory/:id
// @access public
exports.getCategory = factory.getOne(Category);

//@desc Create Category
//@route POST /api/v1/categories
//@access Private

exports.createCategory = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.image = `/uploads/categories/${req.file.filename}`;
  }

  const category = await Category.create(req.body);

  res.status(201).json({
    data: category,
  });
});
////////////////////////////////////////////////

//@desc Update Category
//@route PUT /api/v1/categories/:id
//@access Private

exports.updateCategory = asyncHandler(async (req, res, next) => {
  if (req.file) {
    req.body.image = `/uploads/categories/${req.file.filename}`;
  }

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new ApiError("No category found for this id", 404));
  }

  res.status(200).json({
    data: category,
  });
});
////////////////////////////////////////////////
//@desc Delete specific Category
//@route Delete /api/v1/Category/:id
//@access private
exports.deleteCategory = factory.deleteOne(Category);
