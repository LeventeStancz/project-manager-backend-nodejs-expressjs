const mongoose = require("mongoose");
const { format } = require("date-fns");

const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const Task = require("../models/Task");

const getProjectsForUser = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user)) {
    return res.status(400).json({
      clientMsg: "No information about the projects",
      error:
        "No userid in the request body when trying to get projects for user.",
    });
  }

  try {
    const ownedProjects = await Project.find({ owner: req.user }).exec();
    let projectsWhereMember = await ProjectMember.find(
      { user: req.user },
      { project: 1, _id: 0 }
    )
      .populate("project")
      .exec();

    //format object
    projectsWhereMember = projectsWhereMember.map((project) => {
      return { ...project.project._doc };
    });

    const projects = [...ownedProjects, ...projectsWhereMember];

    const result = [];

    // Iterate over each project and fetch memberCount and taskCount
    for (const project of projects) {
      // Count the number of other users in the project
      const memberCount = await ProjectMember.countDocuments({
        project: project._id,
      }).exec();

      // Count the number of tasks assigned to the user in the project
      const taskCount = await Task.countDocuments({
        project: project._id,
        assignedTo: req.user,
      }).exec();

      // Add the project details along with member and task counts to the result
      result.push({
        _id: project._id,
        name: project.name,
        isOwner: project.owner === req.user,
        shortDescription: project.shortDescription,
        isActive: project.isActive,
        finished: format(new Date(project.finished), "yyyy.MM.dd"),
        memberCount: memberCount + 1, //+1 for the owner
        taskCount: taskCount,
        recentlyViewed: project.recentlyViewed,
      });
    }

    return res.status(200).json({ projects: result, clientMsg: "", error: "" });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

module.exports = {
  getProjectsForUser,
};
