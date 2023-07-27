const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/').get(userController.getUsers);

router.route('/signup').post(authController.signUp);

module.exports = router;
