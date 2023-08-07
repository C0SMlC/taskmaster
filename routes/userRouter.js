const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/confirmEmail/:UID').get(authController.confirmEmail);

router.route('/login').post(authController.login);

router.use(authController.protect);

router.patch('/').patch(userController.updateMe);

router.get('/summary', userController.getUserSummary);

// ADMIN ACTIONS
router.use(authController.restrictTo('admin'));

router.patch('/:userId', userController.update);

router.get('/:userId/tasks', userController.getTasks);

router.get('/getUser/:userId', userController.getOne);

router.route('/').get(userController.getUsers);

module.exports = router;
