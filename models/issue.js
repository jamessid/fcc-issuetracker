const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueSchema = new Schema(
  {
    project: { type: String, required: true },
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
    methods: {
      // on POST new issue, we return all but "project".
      getReturnFields() {
        return {
          _id: this._id,
          issue_title: this.issue_title,
          issue_text: this.issue_text,
          created_on: this.created_on,
          updated_on: this.updated_on,
          created_by: this.created_by,
          assigned_to: this.assigned_to,
          open: this.open,
          status_text: this.status_text,
        };
      },
    },
  },
);

module.exports = mongoose.model("Issue", IssueSchema);
