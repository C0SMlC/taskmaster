const cron = require('node-cron');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// const catchAsync = require('./utils/catchAsync');
const errorController = require('./controller/errorController');
const Email = require('./utils/Email');

const taskRouter = require('./routes/taskRouter');
const userRouter = require('./routes/userRouter');

const Task = require('./model/TaskModel');
const User = require('./model/userModel');
const authenticateEmail = require('./model/AuthenticationModel');

const app = express();

// body parser
app.use(
  express.json({
    limit: '10kb',
  }),
);

app.use(cookieParser());

app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);

app.use(errorController);

// Function to check tasks and send emails for tasks due within 24 hours
const checkTasksAndSendEmails = async () => {
  try {
    const now = new Date();
    const dueWithin24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours to the current time

    const dueTasks = await Task.find({
      status: { $in: ['to-do', 'in progress'] },
      dueDate: { $lte: now },
    });

    // Update the status of overdue tasks to "failed"
    await Promise.all(
      dueTasks.map(async (task) => {
        task.status = 'failed';
        await task.save();
      }),
    );

    const tasks = await Task.find({
      dueDate: { $lte: dueWithin24Hours },
    }).populate('Assignee');

    tasks.forEach(async (task) => {
      if (!task.hasSentEmail) {
        const emailContent = `The task "${task.title}" is due on ${task.dueDate}. Please complete it on time.`;
        task.Assignee.forEach((assignee) => {
          const options = {
            email: assignee.email,
            subject: 'Task due within 24 hours',
            message: emailContent,
          };
          Email(options);
        });
        await Task.findByIdAndUpdate(task.id, {
          hasSentEmail: true,
        });
      }
    });

    console.log('Emails sent for tasks due within 24 hours.');
  } catch (error) {
    console.error('Error checking tasks or sending emails:', error);
  }
};

// Schedule the task to run every hour
cron.schedule('* * * * *', async () => {
  try {
    await checkTasksAndSendEmails();
  } catch (error) {
    console.error('Error running the task checking and email sending:', error);
  }
});

module.exports = app;
