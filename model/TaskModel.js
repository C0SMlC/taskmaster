const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      require: [true, 'Task must have a unique title'],
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
    completionStatus: {
      type: Map,
      of: String,
      default: {},
    },
    completedAssigneesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// taskSchema.pre(/^find/, function (next) {

// })

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
