const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Issue = require("./models/issue");

exports.checkValidObjectId = function (id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("cannot cast _id to ObjectId");
  } else {
    return true;
  }
};

exports.checkIdExists = asyncHandler(async function (id) {
  const doc = await Issue.findById(id).exec();
  if (!doc) {
    throw new Error("cannot find _id");
  } else {
    return true;
  }
});
