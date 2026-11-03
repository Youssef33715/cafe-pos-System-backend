const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
//////////////////////////////////////
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    //Trigger "deleteOne" event when delete document(reviewModel)
    document.deleteOne();
    res.status(204).send();
  });
//////////////////////////////////////
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new ApiError(`No Brand for this id ${req.params.id}`, 404));
    }
    //Trigger "Save" event when Update document(reviewModel)
    document.save();
    res.status(200).json({ data: document });
  });
///////////////////////////
exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });
////////////////////////
exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    //3- asyncHandler(async) => express error handler
    const { id } = req.params;
    //Build query
    let query = Model.findById(id); //form database
    if (populationOpt) {
      query = query.populate(populationOpt);
    }
    // 2) Execute query
    const document = await query;
    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });
/////////////////////////
exports.getAll = (Model, modelName) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    //build query
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search(modelName)
      .sort()
      .limitFields();
    const countDocuments = await Model.countDocuments(
      apiFeatures.mongooseQuery.getFilter(),
    );
    apiFeatures.paginate(countDocuments);

    //Excute Query
    const { mongooseQuery, paginationResult } = apiFeatures;
    console.log("FINAL_FILTER_OBJECT:", apiFeatures.mongooseQuery.getFilter());
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
