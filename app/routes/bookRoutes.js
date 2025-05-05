const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

// Routes
router.get("/", bookController.showForm);
router.post("/submitBook", bookController.submitBook);
router.post("/insertBook", bookController.insertBook);

module.exports = router;
