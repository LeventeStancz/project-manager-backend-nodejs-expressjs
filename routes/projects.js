const express = require("express");
const router = express.Router();

const projectsController = require("../controllers/projectsController");

router.get("/", projectsController.getProjectsForUser);
router.post("/create", projectsController.createProject);
router.get("/recent", projectsController.getRecentProjectName);
router.get("/:projectname", projectsController.getProjectDataByName);
router.get(
  "/detailed/:projectname",
  projectsController.getProjectDetailedDataByName
);
router.put("/update/:projectname", projectsController.updateProject);
router.get("/search/:search/:onlyName", projectsController.searchInProjects);
router.get("/owner/:projectname", projectsController.getProjectOwner);
router.put("/update/owner/:projectname", projectsController.updateOwner);

module.exports = router;
