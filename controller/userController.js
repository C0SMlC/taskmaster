const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  res.status(201).json({
    status: 'success',
    user,
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate({
    path: 'tasks',
    select: 'title status dueDate -Assignee', // Exclude _id and Assignee fields, and only include title, status, and dueDate
  });
  res.status(200).json({
    status: 'success',
    users,
  });
});
