const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  let pic =
    "https://e7.pngegg.com/pngimages/81/570/png-clipart-profile-logo-computer-icons-user-user-blue-heroes-thumbnail.png";

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }
  if (req.file) {
    pic = req.file.path;
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).send({ status: "fail", message: "User already exists!!!" });
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });
  if (user) {
    res.status(201).send({
      status: "success",
      data: {
        _id: user?._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        pic: user.pic,
      },
      message: "Sign up successfully",
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).send({
      status: "success",
      data: {
        name: user?.name,
        email: user?.email,
        pic: user?.pic,
        token: generateToken(user._id),
        _id: user?._id,
      },
      message: "Sign in successfully",
    });
  } else {
    res
      .status(401)
      .send({ status: "fail", message: "incorrect email & password" });
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(200).send(users);
});

module.exports = { registerUser, loginUser, allUsers };
