const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasksController");

router.get("/:projectname", tasksController.getTasksInProject);
router.post("/create/:projectname", tasksController.createTask);

module.exports = router;
