const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasksController");

router.get("/:projectname", tasksController.getTasksInProject);

module.exports = router;
