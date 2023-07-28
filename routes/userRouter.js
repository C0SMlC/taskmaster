const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/').get(userController.getUsers);

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

router.get('/:userId/tasks', authController.protect, userController.getTasks);

module.exports = router;
