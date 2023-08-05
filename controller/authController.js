const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('../model/userModel');
const AuthenticateEmail = require('../model/AuthenticationModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/Email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const sendConfirmationEmail = async (user, resetURL) => {
  const authEmail = await AuthenticateEmail.create({
    email: user.email,
  });

  const url = `${resetURL}/${authEmail.createEmailVerificationToken()}`;

  await authEmail.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: 'Confirm your email',
    message:
      'Please confirm your email, Click Here to confirm your email\n' + url,
  });

  return;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  // createSendToken(user, 200, res);

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/confirmEmail`;

  sendConfirmationEmail(user, resetURL);

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const { password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password +isActive');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Please confirm your account first!', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and check of it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }

  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }

  // 2. Verifying token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY,
  );

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to that token no longer exists', 401),
    );
  }

  //  4. Check if user changed password after the token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.'),
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      console.log(req.user.role);
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };

exports.confirmEmail = catchAsync(async (req, res, next) => {
  console.log(req.params.UID);
  const UID = crypto.createHash('sha256').update(req.params.UID).digest('hex');

  const authEmail = await AuthenticateEmail.findOne({
    UID,
  });

  const user = await User.findOneAndUpdate(
    {
      email: authEmail.email,
    },
    {
      isActive: true,
    },
  );

  await AuthenticateEmail.findByIdAndDelete(authEmail._id);

  res.status(200).json({
    status: 'success',
    user,
  });
});
