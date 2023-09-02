const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");

router.get("/", usersController.getUserData);
router.get("/search/:search/:onlyUsername", usersController.searchInUsers);
router.patch("/update/username", usersController.updateUsername);

module.exports = router;
