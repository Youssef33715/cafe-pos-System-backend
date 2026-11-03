const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/apiError");

const multerOptions = (folderName) => {
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${folderName}`);
    },

    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];

      const filename = `${folderName}-${uuidv4()}-${Date.now()}.${ext}`;

      cb(null, filename);
    },
  });

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only images are allowed", 400), false);
    }
  };

  return multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });
};

exports.uploadSingleImage = (folderName, fieldName) =>
  multerOptions(folderName).single(fieldName);

exports.uploadMixOfImages = (folderName, fields) =>
  multerOptions(folderName).fields(fields);
