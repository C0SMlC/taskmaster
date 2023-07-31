const mongoose = require('mongoose');

const User = require('../model/userModel');
const Task = require('../model/TaskModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({
    role: {
      $ne: 'admin',
    },
  }).populate({
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

exports.getOne = catchAsync(async (req, res, next) => {
  const UserID = req.params.userId;
  const user = await User.findById(UserID);

  if (!user) return next(new AppError('No user found with that User ID', 400));

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const reqBody = req.body;
  const user = await User.findByIdAndUpdate({
    email: reqBody.email,
  });
});

exports.getUserSummary = catchAsync(async (req, res, next) => {
  // const userStats = await Task.find({
  //   Assignee: { $in: [req.user.id] },
  // });
  //   console.log(req.user);
  //   console.log(req.user.id);
  //   console.log(await Task.find({ Assignee: req.user.id }));
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const userStats = await Task.aggregate([
    {
      $unwind: {
        path: '$Assignee',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        Assignee: userId,
      },
    },
    {
      $group: {
        _id: '$status',
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    results: userStats.length,
    data: {
      userStats,
    },
  });
});
