const express = require('express');
const cookieParser = require('cookie-parser');

const errorController = require('./controller/errorController');

const taskRouter = require('./routes/taskRouter');
const userRouter = require('./routes/userRouter');

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

module.exports = app;
