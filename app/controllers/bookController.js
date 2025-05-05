const db = require("../models/bookModel");

// Show form page
exports.showForm = (req, res) => {
  res.render("uploadBook");
};

// Handle form submission
exports.submitBook = (req, res) => {
  const bookData = req.body;
  res.render("confirmBook", { bookData }); // Pass data to confirmation page
};

// Insert into database
exports.insertBook = (req, res) => {
  const {
    bookName,
    authorName,
    publishingCompany,
    isbn,
    yearOfPublication,
    numberOfPages,
    genre,
    copiesAvailable,
    bookDescription,
    authorDescription,
  } = req.body;

  const query =
    "INSERT INTO Book (bookName, authorName, publishingCompany, isbn, yearOfPublication, numberOfPages, genre, copiesAvailable, bookDescription, authorDescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      bookName,
      authorName,
      publishingCompany,
      isbn,
      yearOfPublication,
      numberOfPages,
      genre,
      copiesAvailable,
      bookDescription,
      authorDescription,
    ],
    (err) => {
      if (err) {
        console.error("Error inserting book:", err);
        res.status(500).send("Error uploading book");
      } else {
        res.render("success");
      }
    }
  );
};
