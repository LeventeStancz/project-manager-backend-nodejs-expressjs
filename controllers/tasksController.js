const mongoose = require("mongoose");
const { format } = require("date-fns");

const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const Task = require("../models/Task");
const User = require("../models/User");

const statuses = ["todo", "inprogress", "done"];
const priorities = ["low", "normal", "high"];

const createTask = async (req, res) => {
  const { projectname } = req.params;

  if (
    typeof projectname === "undefined" ||
    !mongoose.Types.ObjectId.isValid(req.user)
  ) {
    return res.status(400).json({
      clientMsg: "No information about the task.",
      error:
        "No projectname/userid in the request body when trying to create a task in a project.",
    });
  }

  const {
    title,
    shortDescription,
    description,
    deadline,
    assignedTo,
    status,
    priority,
  } = req.body;

  if (
    typeof title === "undefined" ||
    typeof shortDescription === "undefined" ||
    typeof description === "undefined" ||
    !mongoose.Types.ObjectId.isValid(assignedTo) ||
    typeof status === "undefined" ||
    typeof priority === "undefined"
  ) {
    return res.status(400).json({
      clientMsg: "Not enough credentials.",
      error:
        "Not enough credentials in the request body when trying to create task.",
    });
  }

  if (!statuses.includes(status)) {
    return res.status(400).json({
      clientMsg: "There is no status that you given.",
      error: "Status is not an accepted value.",
    });
  }

  if (!priorities.includes(priority)) {
    return res.status(400).json({
      clientMsg: "There is no priority that you given.",
      error: "Priority is not an accepted value.",
    });
  }

  try {
    const { isAdmin } = await User.findOne(
      { _id: req.user },
      { isAdmin: 1, _id: 0 }
    ).exec();

    //get the project id for easier searches
    const { _id: projectId } = await Project.findOne({
      name: projectname,
    }).exec();

    if (!isAdmin) {
      //check if owner if not an admin
      const isOwner = await Project.findOne({
        owner: req.user,
        _id: projectId,
      }).exec();

      if (!isOwner) {
        return res.status(401).json({
          clientMsg: "You can't get the members of this project.",
          error: "User is not the owner of the project.",
        });
      }

      //check if project is inactive
      const { isActive } = await Project.findOne(
        {
          _id: projectId,
        },
        {
          isActive: 1,
          _id: 0,
        }
      ).exec();
      if (!isActive) {
        return res.status(401).json({
          clientMsg: "This project is inactive.",
          error: "The project is inactive, the user can't get the members.",
        });
      }
    }

    let taskObj = {
      project: projectId,
      title,
      shortDescription,
      description,
      deadline,
      createdBy: req.user,
      assignedTo,
      status,
      priority,
    };

    //remove deadline if it is not given by the user
    if (taskObj.deadline == "undefined") {
      delete taskObj.deadline;
    }

    await Task.create(taskObj);

    return res
      .status(201)
      .json({ clientMsg: "Successfully created task!", error: "" });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

const getTasksInProject = async (req, res) => {
  const { projectname } = req.params;

  if (
    typeof projectname === "undefined" ||
    !mongoose.Types.ObjectId.isValid(req.user)
  ) {
    return res.status(400).json({
      clientMsg: "No information about the tasks.",
      error:
        "No projectname/userid in the request body when trying to get all task in project.",
    });
  }

  try {
    const { isAdmin } = await User.findOne(
      { _id: req.user },
      { isAdmin: 1, _id: 0 }
    ).exec();

    //get the project id for easier searches
    const { _id: projectId } = await Project.findOne({
      name: projectname,
    }).exec();

    if (!isAdmin) {
      //check if owner if not an admin
      const isOwner = await Project.findOne({
        owner: req.user,
        _id: projectId,
      }).exec();

      const isMember = await ProjectMember.findOne({
        user: req.user,
        project: projectId,
      }).exec();

      if (!isOwner && !isMember) {
        return res.status(401).json({
          clientMsg: "You don't have access to this project.",
          error: "User is not the owner nor a member of the project.",
        });
      }

      //check if project is inactive
      const { isActive } = await Project.findOne(
        {
          _id: projectId,
        },
        {
          isActive: 1,
          _id: 0,
        }
      ).exec();
      if (!isActive) {
        return res.status(401).json({
          clientMsg: "This project is inactive.",
          error: "The project is inactive, the user can't get the tasks.",
        });
      }
    }

    const result = await Task.find({
      project: projectId,
      assignedTo: req.user,
    });

    const tasks = result.map((task) => {
      return {
        ...task._doc,
        deadline: format(new Date(task.deadline), "yyyy-MM-dd"),
        createdAt: format(new Date(task.createdAt), "yyyy-MM-dd"),
      };
    });

    const todos = tasks.filter((task) => {
      return task.status === "todo";
    });
    const inprogs = tasks.filter((task) => {
      return task.status === "inprogress";
    });
    const dones = tasks.filter((task) => {
      return task.status === "done";
    });

    return res.status(200).json({
      todos,
      inprogs,
      dones,
      clientMsg: "",
      error: "",
    });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  const { projectname, taskid } = req.params;
  const { status } = req.body;

  if (
    typeof projectname === "undefined" ||
    !mongoose.Types.ObjectId.isValid(req.user) ||
    !mongoose.Types.ObjectId.isValid(taskid)
  ) {
    return res.status(400).json({
      clientMsg: "No information about the task.",
      error:
        "No projectname/userid/taskid in the request body when trying to update task status.",
    });
  }

  if (!statuses.includes(status)) {
    return res.status(400).json({
      clientMsg: "There is no status that you given.",
      error: "Status is not an accepted value.",
    });
  }

  try {
    const { isAdmin } = await User.findOne(
      { _id: req.user },
      { isAdmin: 1, _id: 0 }
    ).exec();

    //get the project id for easier searches
    const { _id: projectId } = await Project.findOne({
      name: projectname,
    }).exec();

    //if user is not an admin check if he is the owner or a member
    if (!isAdmin) {
      const isOwner = await Project.findOne({
        owner: req.user,
        _id: projectId,
      }).exec();

      if (!isOwner) {
        //if not the owner check if member
        const isProjectMember = await ProjectMember.findOne({
          user: req.user,
          project: projectId,
        }).exec();

        if (!isProjectMember) {
          return res.status(401).json({
            clientMsg: "You don't have access to this project.",
            error: "User is not a member of the project.",
          });
        }
      }

      //check if project is inactive
      const { isActive } = await Project.findOne(
        {
          _id: projectId,
        },
        {
          isActive: 1,
          _id: 0,
        }
      ).exec();

      if (!isActive) {
        return res.status(401).json({
          clientMsg: "This project is inactive.",
          error: "The project the user is trying to get is inactive.",
        });
      }
    }

    await Task.updateOne(
      { _id: taskid },
      {
        status,
      }
    );

    return res.status(200).json({
      clientMsg: "Successfully updated task status!",
      error: "",
    });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasksInProject,
  updateStatus,
};
