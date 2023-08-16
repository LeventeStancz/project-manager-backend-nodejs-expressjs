const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const searchInUsers = async (req, res) => {
  const { search, onlyUsername } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(req.user) ||
    typeof search === "undefined" ||
    typeof onlyUsername === "undefined"
  ) {
    return res.status(400).json({
      clientMsg: "No information about the user.",
      error:
        "No userid/search/onlyUsername in the request body when trying to search for user.",
    });
  }

  try {
    let users;
    if (onlyUsername) {
      users = await User.find(
        { username: { $regex: `${search}` } },
        { _id: 1, username: 1 }
      )
        .sort({ username: 1 })
        .limit(10);
    } else {
      users = await User.find(
        {
          $or: [
            { username: { $regex: search } },
            { email: { $regex: search } },
          ],
        },
        { _id: 1, username: 1, email: 1 }
      )
        .sort({ username: 1 })
        .limit(10);
    }

    return res.status(200).json({ users: users, clientMsg: "", error: "" });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

const getUserData = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user)) {
    return res.status(400).json({
      clientMsg: "No information about the user.",
      error: "No userid in the request body when trying get data about user.",
    });
  }

  try {
    const user = await User.findOne({ _id: req.user }).lean().exec();
    return res.status(200).json({ user, clientMsg: "", error: "" });
  } catch (error) {
    return res.status(500).json({
      clientMsg: "Something went wrong. Try again later!",
      error: error.message,
    });
  }
};

module.exports = {
  searchInUsers,
  getUserData,
};
