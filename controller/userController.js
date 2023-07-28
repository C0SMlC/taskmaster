const User = require('../model/userModel');
const Task = require('../model/TaskModel');

const catchAsync = require('../utils/catchAsync');

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

exports.getTasks = catchAsync(async (req, res, next) => {
  const users = await Task.find({
    Assignee: req.user.id,
  });
  res.status(200).json({
    status: 'success',
    users,
  });
});
