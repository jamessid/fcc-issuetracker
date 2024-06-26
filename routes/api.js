"use strict";

const asyncHandler = require("express-async-handler");
const { body, validationResult, oneOf } = require("express-validator");
const mongoose = require("mongoose");
const { checkValidObjectId, checkIdExists } = require("../validators.js");

const Issue = require("../models/issue");

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(
      asyncHandler(async function (req, res) {
        // find all issues with query params defined as filter.
        // strictQuery is set to true, so invalid fields not cast
        // According to docs, passing user defined objects is bad. See https://mongoosejs.com/docs/guide.html#strictQuery
        // Should I use destructuring instead, and populate filter object if keys exist? TODO?
        const issues = await Issue.find(req.query)
          .setOptions({ sanitizeFilter: true })
          .exec();

        res.json(issues);
      }),
    )

    .post(
      // validation, to ensure required fields exist
      body("issue_title").exists(),
      body("issue_text").exists(),
      body("created_by").exists(),

      asyncHandler(async function (req, res) {
        // save validation result
        const result = validationResult(req);

        // Create new issue
        const issue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to ? req.body.assigned_to : "",
          status_text: req.body.status_text ? req.body.status_text : "",
        });

        if (!result.isEmpty()) {
          res.json({
            error: "required field(s) missing",
          });
          return;
        }

        await issue
          .save()
          .then((savedDoc) => {
            res.json(savedDoc);
          })
          .catch((err) => {
            res.json({
              error: "document not saved",
            });
          });
      }),
    )

    .put(
      body("_id").custom(checkValidObjectId).bail().custom(checkIdExists),
      oneOf(
        [
          body("issue_title").exists(),
          body("issue_text").exists(),
          body("created_by").exists(),
          body("assigned_to").exists(),
          body("status_text").exists(),
          body("open").exists(),
        ],
        {
          message: "At least one update field must be provided.",
        },
      ),

      asyncHandler(async function (req, res) {
        const result = validationResult(req);
        const errors = result.array();

        if (!req.body._id) {
          res.json({ error: "missing _id" });
          return;
        }

        for (const error of errors) {
          if (
            error.msg === "cannot cast _id to ObjectId" ||
            error.msg === "cannot find _id"
          ) {
            res.json({ error: "could not update", _id: req.body.id });
            return;
          }
        }

        for (const error of errors) {
          if (error.msg === "At least one update field must be provided.") {
            res.json({ error: "no update field(s) sent", _id: req.body._id });
            return;
          }
        }

        if (!result.isEmpty()) {
          res.json({ error: "could not update", _id: req.body._id });
          return;
        }

        // note, req.body will include _id. Should this be removed?
        // should I be creating a "fresh" object with only the schema keys?
        const doc = await Issue.findByIdAndUpdate(req.body._id, req.body)
          .then(() =>
            res.json({
              result: "successfully updated",
              _id: req.body._id,
            }),
          )
          .catch(() =>
            res.json({ error: "could not update", _id: req.body._id }),
          );
      }),
    )

    .delete(
      // validate _id
      body("_id").custom(checkValidObjectId).bail().custom(checkIdExists),
      asyncHandler(async function (req, res) {
        const errors = validationResult(req);

        // check that _id actually exists
        if (!req.body._id) {
          res.json({ error: "missing _id" });
          return;
        }

        // if issues with _id, return generic error
        if (!errors.isEmpty()) {
          res.json({ error: "could not delete", _id: req.body._id });
          return;
        }

        await Issue.findByIdAndDelete(req.body._id)
          .then(() =>
            res.json({
              result: "successfully deleted",
              _id: req.body._id,
            }),
          )
          .catch(() =>
            res.json({ error: "could not delete", _id: req.body._id }),
          );
      }),
    );
};
