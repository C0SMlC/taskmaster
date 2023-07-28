const Task = require('../model/TaskModel');
const catchAsync = require('../utils/catchAsync');

exports.getTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find().populate({
    path: 'Assignee',
    select: 'username email',
  });
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    tasks,
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  req.body.Assignee.push(req.user.id);
  const task = await Task.create(req.body);
  res.status(201).json({
    status: 'success',
    task,
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('Assignee');
  res.status(200).json({
    status: 'success',
    data: task,
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: task,
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
