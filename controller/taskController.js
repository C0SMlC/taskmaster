const Task = require('../model/TaskModel');
const catchAsync = require('../utils/catchAsync');

exports.getTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find({
    Assignee: { $in: [req.user.id] },
  })
    .populate({
      path: 'Assignee',
      select: 'username email',
    })
    .select('-completionStatus -completedAssigneesCount');
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    tasks,
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  if (!req.body.Assignee) {
    req.body.Assignee = [req.user.id];
  } else if (!req.body.Assignee.includes(req.user.id)) {
    req.body.Assignee.push(req.user.id);
  }

  const task = await Task.create(req.body);
  res.status(201).json({
    status: 'success',
    task,
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.user.id).populate('Assignee');
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

exports.markTaskComplete = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  const task = await Task.findById(taskId);

  if (!task) {
    return res.status(404).json({ status: 'error', message: 'Task not found' });
  }

  if (!(task.status === 'completed')) {
    task.completionStatus.set(userId, 'complete');
    task.completedAssigneesCount++;
    if (task.completedAssigneesCount === task.Assignee.length) {
      task.status = 'completed';
    }
    await task.save();
    res.status(200).json({ status: 'success', task });
  } else {
    res
      .status(400)
      .json({ status: 'failed', message: 'Task already completed' });
  }
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.find();
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    tasks,
  });
});
