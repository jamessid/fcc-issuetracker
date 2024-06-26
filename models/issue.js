const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueSchema = new Schema(
  {
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
    created_by: { type: String },
    assigned_to: { type: String },
    open: { type: Boolean, required: true, default: true },
    status_text: { type: String },
  },
  {
    strictQuery: true, // to stop invalid filters casting to query
  },
);

module.exports = mongoose.model("Issue", IssueSchema);
