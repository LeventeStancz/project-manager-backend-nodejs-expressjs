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

const createProject = async (req, res) => {
  const { name, shortDescription, description, finished } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(req.user) ||
    typeof name === "undefined" ||
    typeof shortDescription === "undefined" ||
    typeof description === "undefined"
  ) {
    return res.status(400).json({
      clientMsg: "Not enough information provided.",
      error:
        "Not enough credentials in the request body when creating project.",
    });
  }

  try {
    //check for duplicate name in the database
    const foundDuplicate = await Project.findOne({ name: name }).exec();

    //if duplicate
    if (foundDuplicate)
      return res.status(409).json({
        clientMsg: "This project name is already in use.",
        error: "There was a duplicate for name when creating a project.",
      }); // Conflict

    const userProject = {
      owner: req.user,
      name,
      shortDescription,
      description,
      finished,
    };

    //remove finished if it is not given by the user
    if (typeof userProject[finished] === "undefined") {
      delete userProject[finished];
    }

    await Project.create(userProject);

    return res
      .status(201)
      .json({ clientMsg: "Successfully created project!", error: "" });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

const getRecentProjectName = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user)) {
    return res.status(400).json({
      clientMsg: "No information about the projects",
      error:
        "No userid in the request body when trying to get projects for user.",
    });
  }

  try {
    const project = await Project.findOne({}, { _id: -1, name: 1 })
      .sort({ recentlyViewed: -1 })
      .limit(1)
      .lean()
      .exec();

    return res
      .status(200)
      .json({ projectName: project.name, clientMsg: "", error: "" });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

module.exports = {
  getProjectsForUser,
  createProject,
  getRecentProjectName,
};
