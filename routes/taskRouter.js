const express = require('express');

const taskController = require('./../controller/taskController.js');

const router = express.Router();

router.route('/').get(taskController.getTasks).post(taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTask)
  .delete(taskController.deleteTask)
  .patch(taskController.updateTask);

module.exports = router;