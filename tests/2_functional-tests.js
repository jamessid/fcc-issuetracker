const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("POST: every field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/functionaltesting")
      .send({
        project: "Functional Testing Project",
        issue_title: "Functional testing",
        issue_text: "Functional testing text",
        created_by: "Test script",
        assigned_to: "T",
        status_text: "In progress",
      })
      .end(function (err, res) {
        assert.property(res.body, "_id");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.propertyVal(
          { issue_title: res.body.issue_title },
          "issue_title",
          "Functional testing",
        );
        assert.propertyVal(
          { issue_text: res.body.issue_text },
          "issue_text",
          "Functional testing text",
        );
        assert.propertyVal(
          { created_by: res.body.created_by },
          "created_by",
          "Test script",
        );
        assert.propertyVal(
          { assigned_to: res.body.assigned_to },
          "assigned_to",
          "T",
        );
        assert.propertyVal(
          { status_text: res.body.status_text },
          "status_text",
          "In progress",
        );
        done();
      });
  });
  test("POST: required fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Functional testing (required fields)",
        issue_text: "Functional testing text (required fields)",
        created_by: "Test script",
      })
      .end(function (err, res) {
        //console.log(res.body);
        assert.property(res.body, "_id");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.propertyVal(
          { issue_title: res.body.issue_title },
          "issue_title",
          "Functional testing (required fields)",
        );
        assert.propertyVal(
          { issue_text: res.body.issue_text },
          "issue_text",
          "Functional testing text (required fields)",
        );
        assert.propertyVal(
          { created_by: res.body.created_by },
          "created_by",
          "Test script",
        );
        assert.propertyVal(
          { assigned_to: res.body.assigned_to },
          "assigned_to",
          "",
        );
        assert.propertyVal(
          { status_text: res.body.status_text },
          "status_text",
          "",
        );
        done();
      });
  });
  test("POST: missing required fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        assigned_to: "T",
        status_text: "In progress",
      })
      .end(function (err, res) {
        assert.propertyVal(
          { error: res.body.error },
          "error",
          "required field(s) missing",
        );
        done();
      });
  });
  test("GET: get all issues on a project", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .end(function (err, res) {
        assert.isArray(res.body);
        const issues = res.body;
        // check that all issues have correct data
        for (const issue of issues) {
          assert.hasAllKeys(issue, [
            "_id",
            "issue_title",
            "issue_text",
            "created_by",
            "assigned_to",
            "open",
            "status_text",
            "created_on",
            "updated_on",
            "__v",
          ]);
        }
        done();
      });
  });
  test("GET: get all issues on a project (single filter)", function (done) {
    chai
      .request(server)
      .keepOpen()
      // Post an issue so we can retrieve at least one.
      .post("/api/issues/apitest")
      .send({
        issue_title: "Functional testing (single filter)",
        issue_text: "Functional testing text (single filter)",
        created_by: "Single filter test script",
      })
      .then(() => {
        chai
          .request(server)
          .keepOpen()
          .get("/api/issues/apitest?created_by=Test Script")
          .end(function (err, res) {
            const issues = res.body;
            for (const issue of issues) {
              assert.propertyVal(
                { created_by: issue.created_by },
                "created_by",
                "Single filter test script",
              );
            }
            done();
          });
      });
  });
  test("GET: get all issues on a project (multiple filters)", function (done) {
    chai
      .request(server)
      .keepOpen()
      // Post an issue so we can retrieve at least one.
      .post("/api/issues/apitest")
      .send({
        issue_title: "Functional testing (single filter)",
        issue_text: "Functional testing text (single filter)",
        created_by: "Multiple filter test script",
        status_text: "Multiple filter status",
      })
      .then(() => {
        chai
          .request(server)
          .keepOpen()
          .get(
            "/api/issues/apitest?created_by=Test Script&status_text=Multiple filter status",
          )
          .end(function (err, res) {
            const issues = res.body;
            for (const issue of issues) {
              assert.propertyVal(
                { created_by: issue.created_by },
                "created_by",
                "Multiple filter test script",
              );
              assert.propertyVal(
                { status_text: issue.status_text },
                "status_text",
                "Multiple filter status",
              );
            }
            done();
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });
  test("PUT: update one field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Functional testing (updating issue)",
        issue_text: "Updating a single field",
        created_by: "James",
        status_text: "In progress",
      })
      .then((res) => {
        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/apitest")
          .send({ _id: res.body._id, created_by: "Teddy" })
          .then((res) => {
            assert.propertyVal(
              { result: res.body.result },
              "result",
              "successfully updated",
            );
            assert.propertyVal({ _id: res.body._id }, "_id", res.body._id);
            done();
          });
      });
  });
  test("PUT: update multiple fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Functional testing (updating issue)",
        issue_text: "Updating multiple fields",
        created_by: "James",
        status_text: "In progress",
      })
      .then((res) => {
        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/apitest")
          .send({
            _id: res.body._id,
            created_by: "Teddy",
            assigned_to: "Jessie",
            open: false,
          })
          .then((res) => {
            assert.propertyVal(
              { result: res.body.result },
              "result",
              "successfully updated",
            );
            assert.propertyVal({ _id: res.body._id }, "_id", res.body._id);
            done();
          });
      });
  });
  test("PUT: missing _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({
        issue_title: "PUT with missing _id",
        issue_text: "Should return missing _id error",
        created_by: "Testing script",
        assigned_to: "Nobody",
        status_text: "In progress",
        open: true,
      })
      .end(function (err, res) {
        assert.propertyVal({ error: res.body.error }, "error", "missing _id");
        done();
      });
  });
  test("PUT: missing update field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Functional testing (missing update fields)",
        issue_text: "Missing update fields, but valid _id",
        created_by: "James",
        status_text: "In progress",
      })
      .then((res) => {
        chai
          .request(server)
          .keepOpen()
          .put("/api/issues/apitest")
          .send({
            _id: res.body._id,
          })
          .then((res) => {
            assert.propertyVal(
              { error: res.body.error },
              "error",
              "no update field(s) sent",
            );
            assert.propertyVal({ _id: res.body._id }, "_id", res.body._id);
            done();
          });
      });
  });
  test("PUT: invalid _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id: "Jessie" })
      .end(function (err, res) {
        assert.propertyVal(
          { error: res.body.error },
          "error",
          "could not update",
        );
        done();
      });
  });
  test("DELETE: valid _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "Functional testing (valid delete)",
        issue_text: "Issue created to test valid delete",
        created_by: "James",
        status_text: "In progress",
      })
      .then((res) => {
        chai
          .request(server)
          .keepOpen()
          .delete("/api/issues/apitest")
          .send({
            _id: res.body._id,
          })
          .then((res) => {
            assert.propertyVal(
              { result: res.body.result },
              "result",
              "successfully deleted",
            );
            done();
          });
      });
  });
  test("DELETE: invalid _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({
        _id: "invalid _id",
      })
      .end(function (err, res) {
        assert.propertyVal(
          { error: res.body.error },
          "error",
          "could not delete",
        );
        assert.propertyVal({ _id: res.body._id }, "_id", "invalid _id");
        done();
      });
  });
  test("DELETE: missing _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({})
      .end(function (err, res) {
        assert.propertyVal({ error: res.body.error }, "error", "missing _id");
        done();
      });
  });
});
