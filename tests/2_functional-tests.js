/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { default: mongoose } = require("mongoose");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    let bookIds = [];

    suite(
      "POST /api/books with title => create book object/expect book object",

      function () {
        test("Test POST /api/books with title", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .type("form")
            .send({ title: "test book title" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.isObject(res.body, "response should be an object");
              assert.equal(
                res.body.title,
                "test book title",
                "title returned should be the same as supplied"
              );
              assert.isTrue(
                mongoose.isValidObjectId(res.body._id),
                "_id should be a valid ObjectId"
              );
              bookIds.push(res.body._id);
              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .type("form")
            .send({ invalidProp: "invalid value" })
            .end(function (err, res) {
              assert.equal(res.status, 400, "correct status code");
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books")
          .send()
          .end(function (err, res) {
            assert.equal(res.status, 200, "correct status code");
            assert.isArray(res.body, "response should be an array");
            assert.property(res.body[0], "title", "title property is present");
            assert.property(
              res.body[0],
              "_id",
              "_id property should be present"
            );
            assert.property(
              res.body[0],
              "commentcount",
              "comment count property should be present"
            );
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books/64c765af111a2e1897790a8b")
          .send()
          .end(function (err, res) {
            assert.equal(res.status, 400, "correct status code");
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get(`/api/books/${bookIds[0]}`)
          .send()
          .end(function (err, res) {
            assert.equal(res.status, 200, "correct status code");
            assert.isObject(res.body, "response should be an object");
            assert.property(res.body, "title", "title is present");
            assert.property(res.body, "_id", "_id is present");
            assert.property(res.body, "comments", "comments is present");
            assert.isArray(res.body.comments, "comments property is an array");
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post(`/api/books/${bookIds[0]}`)
            .type("form")
            .send({ comment: "this is a sample comment" })
            .end(function (err, res) {
              assert.equal(res.status, 200, "status code should be correct");
              assert.isObject(res.body, "response should be an object");
              assert.property(res.body, "title", "title is present");
              assert.property(res.body, "_id", "_id is present");
              assert.property(res.body, "comments", "comments is present");
              assert.isArray(
                res.body.comments,
                "comments property is an array"
              );
              assert.include(
                res.body.comments,
                "this is a sample comment",
                "new comment should be included"
              );
              done();
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post(`/api/books/${bookIds[0]}`)
            .type("form")
            .send()
            .end(function (err, res) {
              assert.equal(res.status, 400, "status code should be correct");
              assert.equal(res.text, "missing required field comment");
              done();
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .keepOpen()
            .post("/api/books/64c765af111a2e1897790a8b")
            .type("form")
            .send({
              comment: "this is another comment",
            })
            .end(function (err, res) {
              assert.equal(res.status, 400, "status code should be correct");
              assert.equal(res.text, "no book exists");
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete(`/api/books/${bookIds[0]}`)
          .send()
          .end(function (err, res) {
            assert.equal(res.status, 200, "status code should be correct");
            assert.equal(
              res.text,
              "delete book successful",
              "server should return correct text after deleting"
            );
            done();
          });
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete("/api/books/64c765af111a2e1897790a8b")
          .send()
          .end(function (err, res) {
            assert.equal(res.status, 400, "correct status code");
            assert.equal(
              res.text,
              "no book exists",
              "text returned should be correct"
            );
            done();
          });
      });
    });
  });
});
