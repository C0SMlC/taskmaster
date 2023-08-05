const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
    name: {
      type: String,
      required: [true, 'name is required'],
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

    photo: {
      type: String,
      default: 'default.jpg',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
      type: Boolean,
      default: false,
      select: false,
    },
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


userSchema.pre('save', function (next) {
  this.username = this.username.toLowerCase();
  this.email = this.email.toLowerCase();
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// INSTANCE METHOD - CAN BE CALLED ON DOCUMENT
userSchema.methods.correctPassword = async function (
  enteredPassword,
  savedPassword,
) {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
