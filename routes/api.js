/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

let bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  comments: {
    type: [String],
    default: [],
  },
});

let Book = mongoose.model("Book", bookSchema);

class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputError";
  }
}

module.exports = function (app) {
  app
    .route("/api/books")
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(async function (req, res) {
      try {
        let title = req.body.title;
        //response will contain new book object including atleast _id and title
        if (!title) throw new InputError("missing required field title");

        let newBook = await new Book({
          title: title,
        });
        await newBook.save();
        res.status(200).json({
          title: newBook.title,
          _id: newBook._id,
        });
      } catch (e) {
        if (e instanceof InputError) {
          res.status(400).send(e.message);
        } else {
          console.log(e);
          res.status(500).send("something went wrong");
        }
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'
      try {
        let deleted = await Book.deleteMany({});
        console.log("Deleted: " + deleted.deletedCount + " books");
        res.status(200).send("complete delete successful");
      } catch (e) {
        res.status(500).send("something went wrong");
      }
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
    })

    .delete(async function (req, res) {
      try {
        let bookid = req.params.id;
        //if successful response will be 'delete successful'
        let bookDoc = await Book.findOneAndDelete({ _id: bookid });
        if (!bookDoc) throw new InputError("no book exists");
        res.status(200).send("delete book successful");
      } catch (e) {
        if (e instanceof InputError) {
          res.status(400).send(e.message);
        } else if (e.name == "CastError") {
          res.status(400).send("no book exists");
        }
      }
    });
};
