const mongoose = require("mongoose");
const { format } = require("date-fns");

const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const Task = require("../models/Task");
const User = require("../models/User");

const getMembersInProject = async (req, res) => {
  const { projectname } = req.params;

  if (
    typeof projectname === "undefined" ||
    !mongoose.Types.ObjectId.isValid(req.user)
  ) {
    return res.status(400).json({
      clientMsg: "No information about the members.",
      error:
        "No projectname/userid in the request body when trying to get all members in a project.",
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

    let result = await ProjectMember.find(
      { project: projectId },
      { user: 1, _id: 0 }
    )
      .populate("user", "_id username")
      .lean()
      .exec();

    const users = result.map((obj) => {
      return {
        ...obj.user,
      };
    });

    const { owner } = await Project.findOne(
      { owner: req.user },
      { _id: 0, owner: 1 }
    )
      .populate("owner", "_id username")
      .lean()
      .exec();

    owner.isOwner = true;

    users.push(owner);

    return res.status(200).json({
      users,
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

module.exports = {
  getMembersInProject,
};
