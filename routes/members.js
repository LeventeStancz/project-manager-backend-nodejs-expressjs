const express = require("express");
const router = express.Router();

const membersController = require("../controllers/membersController");

router.get("/:projectname", membersController.getMembersInProject);

module.exports = router;
