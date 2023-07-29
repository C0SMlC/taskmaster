const express = require('express');

const taskController = require('./../controller/taskController.js');
const authController = require('./../controller/authController.js');

const router = express.Router();

router.use(authController.protect);

router.patch('/:taskId/complete', taskController.markTaskComplete);

router.route('/').get(taskController.getTasks).post(taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTask)
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);

  
module.exports = router;
