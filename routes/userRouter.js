const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

router.use(authController.protect);

router.patch('/:userId', userController.update);

router.get('/summary', userController.getUserSummary)

// ADMIN ACTIONS
router.use(authController.restrictTo('admin'));

router.get('/:userId/tasks', userController.getTasks);

router.get('/getUser/:userId', userController.getOne);

router.route('/').get(userController.getUsers);

module.exports = router;
