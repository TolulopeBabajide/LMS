// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("public")); // Add this line
// app.use("/static", express.static("public"));

// Set the view engine to pug
app.set("view engine", "pug");
app.set("views", "./app/views");

// Get the functions in the db.js file to use
const db = require("./services/db");

// Create a route for root - /
app.get("/", function (req, res) {
  res.send("Hello world!");
});

// Create a route for testing the db
app.get("/db_test", function (req, res) {
  // Assumes a table called test_table exists in your database
  sql = "select * from test_table";
  db.query(sql).then((results) => {
    console.log(results);
    res.send(results);
  });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function (req, res) {
  res.send("Goodbye frank!");
});

app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/dashBoard", function (req, res) {
  res.render("dashBoard");
});
app.get("/uploadBook", function (req, res) {
  res.render("uploadBook");
});
app.get("/uploadBookList", function (req, res) {
  res.render("uploadBookList");
});
app.get("/uploadSucessfull", function (req, res) {
  res.render("uploadSucessfull");
});
app.get("/overdueBook", function (req, res) {
  res.render("overdueBook");
});

app.get("/cover", function (req, res) {
  res.render("cover");
});
// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function (req, res) {
  // req.params contains any parameters in the request
  // We can examine it in the console for debugging purposes
  console.log(req.params);
  //  Retrieve the 'name' parameter and use it in a dynamically generated page
  res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000, function () {
  console.log(`Server running at http://127.0.0.1:3000/`);
});
