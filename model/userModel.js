const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      validate: {
        validator: function (value) {
          return !/\s/.test(value); // Returns true if there are no spaces
        },
        message: 'Username must not contain any whitespaces',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email address',
      },
    },
    password: {
      type: String,
      minLength: 8,
      required: [true, 'Password is required'],
    },

    confirmPassword: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (ele) {
          return ele === this.password;
        },
        message: 'password does not match',
      },
    },

    created_date: {
      type: Date,
      default: Date.now(),
    },
    role: {
      type: String,
      default: 'user',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'Assignee',
  localField: '_id',
});

const User = mongoose.model('User', userSchema);

module.exports = User;
