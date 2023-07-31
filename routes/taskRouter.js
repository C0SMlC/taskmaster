const express = require('express');

const authController = require('./../controller/authController.js');
const taskController = require('./../controller/taskController.js');

const router = express.Router();

router.use(authController.protect);

// ADMIN ACTIONS
router.get(
  '/getAllTasks',
  authController.restrictTo('admin'),
  taskController.getAllTasks,
);

router.route('/').get(taskController.getTasks).post(taskController.createTask);

router.patch('/:taskId/complete', taskController.markTaskComplete);

router
  .route('/:id')
  .get(taskController.getTask)
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);

module.exports = router;
