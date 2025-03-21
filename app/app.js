// Import express.js
const express = require("express");
const session = require('express-session');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { ensureAuthenticated, ensureAdmin, ensureUser } = require('./middlewares/authMiddleware');


// Create express app
const app = express();

// Session setup
app.use(session({
  secret: process.env.SESSION_KEY, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 60 * 60 * 1000 }, // 1-hour expiry
}));

// Add static files location
app.use(express.static("public")); // Add this line
// app.use("/static", express.static("public"));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Set the view engine to pug
app.set("view engine", "pug");
app.set("views", "./app/views");

// Get the functions in the db.js file to use
const db = require("./services/db");



// Create a route for testing the db
app.get("/db_test", function (req, res) {
  // Assumes a table called test_table exists in your database
  sql = "select * from test_table";
  db.query(sql).then((results) => {
    console.log(results);
    res.send(results);
  });
});



// Routes
app.use('/auth', require('./routes/authRoutes'));

app.get('/admin/dashboard', ensureAuthenticated, ensureAdmin, (req, res) => {
  res.render('adminDashboard', { user: req.session.user });
});

app.get('/dashBoard', ensureAuthenticated, ensureUser, (req, res) => {
  res.render('dashBoard', { user: req.session.user });
});

app.get("/login", function (req, res) {
  res.render("login");
});
// app.get("/dashBoard", function (req, res) {
//   res.render("dashBoard");
// });
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


app.use(errorHandler);

// Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => cconsole.log(`Server running at http://127.0.0.1:${PORT}/`));


