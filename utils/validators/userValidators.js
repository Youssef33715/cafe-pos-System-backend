const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("E-mail already in use");
      }
      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  check("role").optional(),

  validatorMiddleware,
];

////////////////////////////////////////

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

////////////////////////////////////////

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),

  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });

      if (user && user._id.toString() !== req.params.id) {
        throw new Error("E-mail already in use");
      }

      return true;
    }),

  check("role").optional(),

  validatorMiddleware,
];

////////////////////////////////////////

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),

  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),

  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id).select("+password");

      if (!user) {
        throw new Error("There is no user with this id");
      }

      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new Error("Current password is incorrect");
      }

      if (val !== req.body.passwordConfirm) {
        throw new Error("Password confirmation is incorrect");
      }

      return true;
    }),

  validatorMiddleware,
];

////////////////////////////////////////

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];
