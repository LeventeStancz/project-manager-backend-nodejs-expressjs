const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasksController");

router.get("/:projectname", tasksController.getTasksInProject);

router.patch(
  "update/status/:projectname/:taskid",
  tasksController.updateStatus
);

module.exports = router;
