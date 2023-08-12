const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");

router.get("/search/:search/:onlyUsername", usersController.searchInUsers);

module.exports = router;