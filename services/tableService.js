const factory = require("./handlersFactory");
const Table = require("../models/tableModel");

// @desc Get list of tables
// @route GET /api/v1/tables
// @access Private
exports.getTables = factory.getAll(Table);

/////////////////////////////////////////////////////////

// @desc Get specific table
// @route GET /api/v1/tables/:id
// @access Private
exports.getTable = factory.getOne(Table);

/////////////////////////////////////////////////////////

// @desc Create table
// @route POST /api/v1/tables
// @access Private (Admin)
exports.createTable = factory.createOne(Table);

/////////////////////////////////////////////////////////

// @desc Update table
// @route PUT /api/v1/tables/:id
// @access Private (Admin)
exports.updateTable = factory.updateOne(Table);

/////////////////////////////////////////////////////////

// @desc Delete table
// @route DELETE /api/v1/tables/:id
// @access Private (Admin)
exports.deleteTable = factory.deleteOne(Table);
