const express = require("express");
const router = express.Router();

const projectsController = require("../controllers/projectsController");

router.get("/", projectsController.getProjectsForUser);
router.post("/create", projectsController.createProject);
router.get("/recent", projectsController.getRecentProjectName);
router.get("/:projectname", projectsController.getProjectDataByName);
router.put("/update/:projectname", projectsController.updateProject);

module.exports = router;
