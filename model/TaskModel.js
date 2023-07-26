const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      require: [true, 'Task must have a title'],
    },
    description: {
      type: String,
      require: [true, 'Task must have a title'],
    },
    status: {
      type: String,
      enum: {
        values: ['to-do', 'in progress,', 'completed'],
        message: 'status is either: To-Do, In Progress, Completed.',
      },
      require: [true, 'Task must have a status'],
    },
    Assignee: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
      require: [true, 'Task must have a due date'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'priority is either: Low, Medium, High.',
      },
      default: 'Medium',
    },
    created_date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
